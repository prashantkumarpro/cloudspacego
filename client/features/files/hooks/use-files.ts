"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ToastContext } from "@/providers/toast-provider";
import {
  deleteFile,
  deleteFilePermanently,
  downloadFile,
  emptyTrash as apiEmptyTrash,
  getFileBlob,
  getFiles,
  getRecentFiles,
  getSharedWithMeFiles,
  getStarredFiles,
  getTrashFiles,
  recordFileAccess,
  renameFile,
  restoreFile as apiRestoreFile,
  toggleStarFile,
  uploadFile,
} from "../api";
import type {
  FileItem,
  RenameFileData,
  RenameFileOptions,
  UploadFileData,
  FileMutationEvent,
  FileEventListener,
} from "../types";
import { invalidateSearchCache } from "@/features/search/api";
import { notifyDirectoryChanged } from "@/features/directory/hooks/use-directory";
import { useUpload } from "@/providers/upload-provider";


// Global listener set to synchronize active file hook consumers if needed
const fileListeners = new Set<FileEventListener>();

export const subscribeFilesChanged = (listener: FileEventListener) => {
  fileListeners.add(listener);
  return () => {
    fileListeners.delete(listener);
  };
};

export const notifyFilesChanged = (event?: FileMutationEvent) => {
  fileListeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
      console.error("Error in file listener:", error);
    }
  });
  // Also notify directory listeners since files live within directories
  notifyDirectoryChanged(event);
};

export interface RemoveFileOptions {
  skipNotify?: boolean;
  skipToast?: boolean;
  file?: FileItem | Record<string, unknown>;
  originalIndex?: number;
  parentDirId?: string | null;
}

// Global sets to track in-flight file operations across all hook instances
const inFlightFileDeletions = new Set<string>();
const inFlightFileRestorations = new Set<string>();
const inFlightFileRenames = new Set<string>();
const fileRenameVersions = new Map<string, number>();

export const isFileDeleting = (id?: string | null): boolean => {
  if (!id) return false;
  return inFlightFileDeletions.has(id.toString());
};

export const isFileRestoring = (id?: string | null): boolean => {
  if (!id) return false;
  return inFlightFileRestorations.has(id.toString());
};

export const isFileRenaming = (id?: string | null): boolean => {
  if (!id) return false;
  const idStr = id.toString();
  for (const key of inFlightFileRenames) {
    if (key.startsWith(`${idStr}:`)) return true;
  }
  return false;
};

interface UseFilesReturn {
  isUploading: boolean;
  isRenaming: boolean;
  isDeleting: boolean;
  isDownloading: boolean;
  isStarring: boolean;
  error: string | null;
  upload: (
    data: UploadFileData,
    parentDirId?: string
  ) => Promise<void>;
  rename: (
    id: string,
    data: RenameFileData,
    options?: RenameFileOptions
  ) => Promise<void>;
  remove: (id: string, options?: RemoveFileOptions) => Promise<void>;
  download: (
    id: string,
    filename?: string
  ) => Promise<void>;
  getBlob: (id: string) => Promise<Blob>;
  toggleStar: (id: string, isStarred?: boolean) => Promise<boolean>;
  recordAccess: (id: string) => Promise<void>;
  restore: (id: string, options?: { skipNotify?: boolean }) => Promise<unknown>;
  deletePermanently: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
}

export function useFiles(): UseFilesReturn {
  const uploadContext = useUpload();
  const toast = useContext(ToastContext);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isStarring, setIsStarring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const starringIdsRef = useRef<Set<string>>(new Set());
  const isUploading = uploadContext ? uploadContext.isUploading : false;

  const upload = useCallback(
    async (
      data: UploadFileData,
      parentDirId?: string
    ): Promise<void> => {
      try {
        setError(null);
        if (uploadContext) {
          await uploadContext.upload(data, parentDirId);
        } else {
          const res = await uploadFile(data, parentDirId);
          notifyFilesChanged({ type: 'upload', file: res.file, parentDirId });
        }
      } catch (err) {
        console.error("Failed to upload file:", err);
        setError("Failed to upload file.");
        throw err;
      }
    },
    [uploadContext]
  );

  const rename = useCallback(
    async (
      id: string,
      data: RenameFileData,
      options?: RenameFileOptions
    ): Promise<void> => {
      if (!id) return;
      const fileIdStr = id.toString();
      const trimmedName = (data?.newFilename || "").trim();

      if (!trimmedName) {
        const msg = "Please enter a file name";
        setError(msg);
        if (!options?.skipToast && toast) {
          toast.error("Rename failed", msg);
        }
        throw new Error(msg);
      }

      // If name is unchanged, no-op
      if (options?.originalName && trimmedName === options.originalName.trim()) {
        return;
      }

      // Prevent duplicate in-flight requests for same file and name
      const inFlightKey = `${fileIdStr}:${trimmedName}`;
      if (inFlightFileRenames.has(inFlightKey)) {
        return;
      }

      inFlightFileRenames.add(inFlightKey);
      setIsRenaming(true);
      setError(null);

      // Sequence versioning to reject stale or out-of-order network responses
      const version = (fileRenameVersions.get(fileIdStr) || 0) + 1;
      fileRenameVersions.set(fileIdStr, version);

      // 1. Immediately update UI optimistically (<16ms)
      notifyFilesChanged({
        type: "rename-file-optimistic",
        fileId: fileIdStr,
        newFilename: trimmedName,
        newName: trimmedName,
        originalName: options?.originalName,
        parentDirId: options?.parentDirId,
        version,
      });

      try {
        invalidateSearchCache();
      } catch {}

      // 2. Perform backend request in background
      const handleSettlement = async () => {
        try {
          const res = await renameFile(fileIdStr, { newFilename: trimmedName });
          inFlightFileRenames.delete(inFlightKey);
          setIsRenaming(inFlightFileRenames.size > 0);

          // Check if superseded by a newer rename attempt
          if (fileRenameVersions.get(fileIdStr) !== version) {
            return;
          }

          // Authoritative reconciliation
          const authoritative = res?.file;
          notifyFilesChanged({
            type: "rename-file-success",
            fileId: fileIdStr,
            newFilename: authoritative?.name || trimmedName,
            newName: authoritative?.name || trimmedName,
            file: authoritative,
            version,
          });

          try {
            invalidateSearchCache();
          } catch {}
        } catch (err: unknown) {
          inFlightFileRenames.delete(inFlightKey);
          setIsRenaming(inFlightFileRenames.size > 0);

          // Check if superseded by a newer rename attempt
          if (fileRenameVersions.get(fileIdStr) !== version) {
            return;
          }

          // Safe rollback to original filename
          const originalName = options?.originalName;
          if (originalName) {
            notifyFilesChanged({
              type: "rollback-rename-file",
              fileId: fileIdStr,
              originalName,
              newFilename: originalName,
              newName: originalName,
              version,
            });
          }

          let errMsg = "Failed to rename file. Please try again.";
          if (err && typeof err === "object") {
            const errObj = err as { response?: { data?: { error?: string } }; message?: string };
            if (errObj.response?.data?.error) {
              errMsg = errObj.response.data.error;
            } else if (typeof errObj.message === "string") {
              errMsg = errObj.message;
            }
          }

          setError(errMsg);
          if (!options?.skipToast && toast) {
            toast.error("Rename failed", errMsg);
          }

          if (options?.awaitCompletion) {
            throw err;
          }
        }
      };

      if (options?.awaitCompletion) {
        await handleSettlement();
      } else {
        handleSettlement();
      }
    },
    [toast]
  );

  const remove = useCallback(
    async (id: string, options?: RemoveFileOptions): Promise<void> => {
      if (!id) return;
      const fileIdStr = id.toString();

      // 1. Prevent duplicate clicks for the same file while deleting or restoring
      if (inFlightFileDeletions.has(fileIdStr) || inFlightFileRestorations.has(fileIdStr)) {
        return;
      }
      setIsDeleting(true);
      inFlightFileDeletions.add(fileIdStr);

      const fileSnapshot = options?.file;
      const snap = fileSnapshot as (FileItem & { parentFolderId?: string | null }) | undefined;
      const rawIndex = options?.originalIndex;
      const validOriginalIndex = typeof rawIndex === "number" && rawIndex >= 0 ? rawIndex : undefined;
      const effectiveParentDirId =
        options?.parentDirId ?? snap?.parentDirId ?? snap?.parentFolderId ?? null;

      // 2. Immediately remove optimistically from all active views (<16ms)
      if (!options?.skipNotify) {
        notifyFilesChanged({
          type: 'delete',
          fileId: fileIdStr,
          file: fileSnapshot,
          originalIndex: validOriginalIndex,
          parentDirId: effectiveParentDirId,
        });
      }

      // Track operation lifecycle state
      let status: 'deleting' | 'undone' | 'restoring' = 'deleting';
      let deleteError: unknown = null;
      let toastId: string | undefined;

      // 3. Start backend DELETE request in background
      const deletePromise = deleteFile(fileIdStr)
        .catch((err) => {
          deleteError = err;
          throw err;
        });

      // 4. Define immediate Undo handler
      const handleUndo = async () => {
        // Prevent duplicate clicks on Undo
        if (status !== 'deleting') return;
        status = 'undone';
        inFlightFileRestorations.add(fileIdStr);

        // Dismiss the original delete toast
        if (toastId && toast) {
          toast.dismiss(toastId);
        }

        // CRITICAL UX FIX: Immediately restore the item in the UI without waiting for server (<16ms)
        notifyFilesChanged({
          type: 'rollback-delete',
          fileId: fileIdStr,
          file: fileSnapshot,
          originalIndex: validOriginalIndex,
          parentDirId: effectiveParentDirId,
        });

        // Immediately show restored confirmation toast
        if (toast) {
          const fileName = fileSnapshot?.name || 'File';
          toast.success('Restored', `"${fileName}" was restored from Trash.`);
        }

        try {
          // Await in-flight delete to settle
          await deletePromise.catch(() => {});

          if (deleteError) {
            // The DELETE request failed on the server.
            // The backend database never trashed the file (isTrash: false).
            // The client was just restored (isTrash: false).
            // Both are already in agreement! Do not send unnecessary restore request.
            return;
          }

          // DELETE succeeded on backend, so backend marked it isTrash: true.
          // Now invoke restore API to bring backend back to isTrash: false.
          status = 'restoring';
          const res = await apiRestoreFile(fileIdStr);

          const restoredParentId =
            res?.file?.parentDirId || snap?.parentFolderId || snap?.parentDirId || null;
          const originalParentId = snap?.parentFolderId || snap?.parentDirId || null;

          // Check if backend restored to root because original folder was deleted
          if (
            restoredParentId &&
            originalParentId &&
            restoredParentId.toString() !== originalParentId.toString()
          ) {
            notifyFilesChanged({
              type: 'restore',
              fileId: fileIdStr,
              file: {
                ...fileSnapshot,
                parentDirId: restoredParentId,
                parentFolderId: restoredParentId,
                isTrash: false,
                trashedAt: null,
              },
              originalIndex: validOriginalIndex,
              parentDirId: restoredParentId,
            });
            if (toast) {
              const fileName = fileSnapshot?.name || 'File';
              toast.info(
                'Restored to Root',
                `"${fileName}" was restored to My Files because its original folder was deleted.`
              );
            }
          } else {
            // Confirm restore state across views (e.g. ensures removal from Trash if open)
            notifyFilesChanged({
              type: 'restore',
              fileId: fileIdStr,
              file: {
                ...fileSnapshot,
                isTrash: false,
                trashedAt: null,
              },
              originalIndex: validOriginalIndex,
              parentDirId: restoredParentId,
            });
          }
        } catch (err) {
          console.error('Failed to restore file on backend:', err);
          if (toast) {
            const fileName = fileSnapshot?.name || 'File';
            toast.error('Failed to restore', `Could not restore "${fileName}".`);
          }
          // Safe rollback: since server restore failed, re-evict item from visible UI
          notifyFilesChanged({
            type: 'delete',
            fileId: fileIdStr,
          });
        } finally {
          inFlightFileDeletions.delete(fileIdStr);
          inFlightFileRestorations.delete(fileIdStr);
          setIsDeleting(inFlightFileDeletions.size > 0);
        }
      };

      // 5. Show immediate success toast with Undo
      if (!options?.skipToast && toast) {
        const fileName = fileSnapshot?.name || 'File';
        toastId = toast.success(
          'Moved to Trash',
          `"${fileName}" was moved to Trash.`,
          {
            label: 'Undo',
            onClick: handleUndo,
          }
        );
      }

      // 6. Handle DELETE promise settlement if Undo was NOT clicked
      deletePromise
        .then(() => {
          if (status === 'deleting') {
            inFlightFileDeletions.delete(fileIdStr);
            setIsDeleting(inFlightFileDeletions.size > 0);
          }
        })
        .catch(() => {
          // If Undo was already clicked by user, suppress delete error handling
          if (status !== 'deleting') {
            return;
          }

          inFlightFileDeletions.delete(fileIdStr);
          setIsDeleting(inFlightFileDeletions.size > 0);

          // Dismiss the success toast
          if (toastId && toast) {
            toast.dismiss(toastId);
          }

          // Roll back the optimistic delete to restore the file
          notifyFilesChanged({
            type: 'rollback-delete',
            fileId: fileIdStr,
            file: fileSnapshot,
            originalIndex: validOriginalIndex,
            parentDirId: effectiveParentDirId,
          });

          // Show clear error toast
          if (toast) {
            const fileName = fileSnapshot?.name || 'File';
            toast.error(
              'Failed to delete',
              `Could not move "${fileName}" to Trash. It has been restored.`
            );
          }
        });

      return;
    },
    [toast]
  );

  const download = useCallback(
    async (id: string, filename?: string): Promise<void> => {
      try {
        setIsDownloading(true);
        setError(null);

        await downloadFile(id, filename);
      } catch (err) {
        console.error("Failed to download file:", err);
        setError("Failed to download file.");
        throw err;
      } finally {
        setIsDownloading(false);
      }
    },
    []
  );

  const getBlob = useCallback(async (id: string): Promise<Blob> => {
    try {
      setError(null);
      return await getFileBlob(id);
    } catch (err) {
      console.error("Failed to fetch file content:", err);
      setError("Failed to fetch file content.");
      throw err;
    }
  }, []);

  const toggleStar = useCallback(
    async (id: string, isStarred?: boolean): Promise<boolean> => {
      if (starringIdsRef.current.has(id)) {
        return false;
      }
      try {
        starringIdsRef.current.add(id);
        setIsStarring(true);
        setError(null);

        const res = await toggleStarFile(id, isStarred);
        notifyFilesChanged();
        return res.file?.isStarred ?? true;
      } catch (err) {
        console.error("Failed to toggle star file:", err);
        setError("Failed to update star status.");
        throw err;
      } finally {
        starringIdsRef.current.delete(id);
        setIsStarring(starringIdsRef.current.size > 0);
      }
    },
    []
  );

  return {
    isUploading,
    isRenaming,
    isDeleting,
    isDownloading,
    isStarring,
    error,
    upload,
    rename,
    remove,
    download,
    getBlob,
    toggleStar,
    recordAccess: useCallback(async (id: string): Promise<void> => {
      try {
        await recordFileAccess(id);
      } catch (err) {
        console.warn("Failed to record file access:", err);
      }
    }, []),
    restore: useCallback(async (id: string, options?: { skipNotify?: boolean }): Promise<unknown> => {
      try {
        setError(null);
        const res = await apiRestoreFile(id);
        if (!options?.skipNotify) {
          notifyFilesChanged({ type: 'restore', fileId: id, file: res?.file });
        }
        return res;
      } catch (err) {
        console.error("Failed to restore file:", err);
        setError("Failed to restore file.");
        throw err;
      }
    }, []),
    deletePermanently: useCallback(async (id: string): Promise<void> => {
      try {
        setError(null);
        await deleteFilePermanently(id);
        notifyFilesChanged({ type: 'permanent-delete', fileId: id });
      } catch (err) {
        console.error("Failed to permanently delete file:", err);
        setError("Failed to permanently delete file.");
        throw err;
      }
    }, []),
    emptyTrash: useCallback(async (): Promise<void> => {
      try {
        setError(null);
        await apiEmptyTrash();
        notifyFilesChanged({ type: 'empty-trash' });
      } catch (err) {
        console.error("Failed to empty trash:", err);
        setError("Failed to empty trash.");
        throw err;
      }
    }, []),
  };
}

export interface UseInfiniteFilesOptions {
  limit?: number;
  enabled?: boolean;
  starred?: boolean;
  sharedWithMe?: boolean;
  recent?: boolean;
  trash?: boolean;
}

export interface UseInfiniteFilesReturn {
  files: FileItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

export function useInfiniteFiles(
  options: UseInfiniteFilesOptions = {}
): UseInfiniteFilesReturn {
  const {
    limit = 20,
    enabled = true,
    starred = false,
    sharedWithMe = false,
    recent = false,
    trash = false
  } = options;

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const nextCursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);
  const inFlightCursorRef = useRef<string | null>(null);

  const fetchInitial = useCallback(async () => {
    if (!enabled) return;

    try {
      isFetchingRef.current = true;
      inFlightCursorRef.current = null;
      setError(null);

      const fetchFn = trash
        ? getTrashFiles
        : recent
        ? getRecentFiles
        : sharedWithMe
        ? getSharedWithMeFiles
        : starred
        ? getStarredFiles
        : getFiles;
      const response = await fetchFn({ limit });

      setFiles(response.data);
      nextCursorRef.current = response.pagination.nextCursor;
      hasMoreRef.current = Boolean(response.pagination.hasMore && response.pagination.nextCursor);
      setHasMore(hasMoreRef.current);
    } catch (err) {
      console.error("Failed to fetch initial files:", err);
      setError("Failed to load files.");
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [enabled, limit, starred, sharedWithMe, recent, trash]);

  const loadMore = useCallback(async () => {
    const cursor = nextCursorRef.current;
    if (
      !enabled ||
      isFetchingRef.current ||
      !hasMoreRef.current ||
      !cursor ||
      inFlightCursorRef.current === cursor
    ) {
      return;
    }

    try {
      isFetchingRef.current = true;
      inFlightCursorRef.current = cursor;
      setIsLoadingMore(true);
      setError(null);

      const fetchFn = trash
        ? getTrashFiles
        : recent
        ? getRecentFiles
        : sharedWithMe
        ? getSharedWithMeFiles
        : starred
        ? getStarredFiles
        : getFiles;
      const response = await fetchFn({
        cursor,
        limit,
      });

      setFiles((prev) => {
        const existingIds = new Set(prev.map((f) => (f._id || f.id || "").toString()));
        const newItems = response.data.filter(
          (f) => !existingIds.has((f._id || f.id || "").toString())
        );
        return [...prev, ...newItems];
      });

      nextCursorRef.current = response.pagination.nextCursor;
      hasMoreRef.current = Boolean(response.pagination.hasMore && response.pagination.nextCursor);
      setHasMore(hasMoreRef.current);
    } catch (err) {
      console.error("Failed to load more files:", err);
      setError("Failed to load more files.");
    } finally {
      setIsLoadingMore(false);
      isFetchingRef.current = false;
      inFlightCursorRef.current = null;
    }
  }, [enabled, limit, starred, sharedWithMe, recent, trash]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInitial();
  }, [fetchInitial]);

  useEffect(() => {
    if (!enabled) return;

    const handleFileEvent: FileEventListener = (event) => {
      if (!event || !event.type || event.type === 'refresh') {
        fetchInitial();
        return;
      }

      // 0. Upload event: Prepend new file into view directly without loading skeleton
      if (event.type === 'upload' && event.file) {
        if (trash || sharedWithMe) return;
        if (recent && !event.file.lastAccessedAt) return;
        if (starred && !event.file.isStarred && !event.file.starred) return;

        // If this is default Files view (not trash/shared/recent/starred), only show root uploads
        const isRootUpload = !event.parentDirId || event.parentDirId === 'root';
        if (!recent && !starred && !isRootUpload) {
          return;
        }

        const fileIdStr = (event.file.id || event.file._id || '').toString();
        setFiles((prev) => {
          if (prev.some((f) => (f.id || f._id || '').toString() === fileIdStr)) {
            return prev;
          }
          return [event.file, ...prev];
        });
        return;
      }

      // 1. Delete event: Optimistically evict file from all non-trash views
      if (event.type === 'delete' && event.fileId) {
        if (trash) {
          // Do not blindly add the file to Trash before server-confirmed trashedAt and pagination position are known.
          return;
        }
        setFiles((prev) => {
          const fileIdStr = event.fileId!.toString();
          if (!prev.some((f) => (f.id || f._id || '').toString() === fileIdStr)) {
            return prev;
          }
          return prev.filter((f) => (f.id || f._id || '').toString() !== fileIdStr);
        });
        return;
      }

      // 2. Rollback delete event: Re-insert file at original position
      if (event.type === 'rollback-delete' && event.file) {
        if (trash) {
          const fileIdStr = (event.file.id || event.file._id || event.fileId || '').toString();
          setFiles((prev) =>
            prev.filter((f) => (f.id || f._id || '').toString() !== fileIdStr)
          );
          return;
        }
        const fileIdStr = (event.file.id || event.file._id || '').toString();
        setFiles((prev) => {
          if (prev.some((f) => (f.id || f._id || '').toString() === fileIdStr)) {
            return prev;
          }
          if (starred && !event.file.isStarred && !event.file.starred) {
            return prev;
          }
          if (recent && !event.file.lastAccessedAt) {
            return prev;
          }
          if (sharedWithMe && !event.file.role && (!event.file.sharedWith || event.file.sharedWith.length === 0)) {
            return prev;
          }
          const index =
            typeof event.originalIndex === 'number' &&
            event.originalIndex >= 0 &&
            event.originalIndex <= prev.length
              ? event.originalIndex
              : 0;
          const next = [...prev];
          next.splice(index, 0, event.file);
          return next;
        });
        return;
      }

      // 3. Restore event: Remove from Trash; put back into source views if appropriate
      if (event.type === 'restore' && event.fileId) {
        if (trash) {
          setFiles((prev) =>
            prev.filter((f) => (f.id || f._id || '').toString() !== event.fileId!.toString())
          );
          return;
        }

        if (event.file) {
          const fileIdStr = (event.file.id || event.file._id || '').toString();
          setFiles((prev) => {
            if (prev.some((f) => (f.id || f._id || '').toString() === fileIdStr)) {
              return prev;
            }
            if (starred && !event.file.isStarred && !event.file.starred) {
              return prev;
            }
            if (recent && !event.file.lastAccessedAt) {
              return prev;
            }
            if (sharedWithMe && !event.file.role && (!event.file.sharedWith || event.file.sharedWith.length === 0)) {
              return prev;
            }
            const index =
              typeof event.originalIndex === 'number' &&
              event.originalIndex >= 0 &&
              event.originalIndex <= prev.length
                ? event.originalIndex
                : 0;
            const next = [...prev];
            next.splice(index, 0, event.file);
            return next;
          });
          return;
        }
      }

      // 4. Permanent delete & Empty trash events: update Trash view immediately
      if (event.type === 'permanent-delete' && event.fileId) {
        if (trash) {
          setFiles((prev) =>
            prev.filter((f) => (f.id || f._id || '').toString() !== event.fileId!.toString())
          );
          return;
        }
      }

      if (event.type === 'empty-trash') {
        if (trash) {
          setFiles([]);
          return;
        }
      }

      // 5. File Rename events: update file name in-memory immediately without network refetch
      if (
        (event.type === 'rename-file-optimistic' ||
          event.type === 'rename-file-success' ||
          event.type === 'rollback-rename-file' ||
          event.type === 'rename') &&
        event.fileId
      ) {
        const fileIdStr = event.fileId.toString();
        const targetName =
          event.type === 'rollback-rename-file'
            ? (event.originalName || event.newName || event.newFilename || event.file?.name)
            : (event.newFilename || event.newName || event.file?.name);

        if (targetName) {
          setFiles((prev) => {
            if (!prev.some((f) => (f.id || f._id || '').toString() === fileIdStr)) {
              return prev;
            }
            return prev.map((f) => {
              if ((f.id || f._id || '').toString() === fileIdStr) {
                return {
                  ...f,
                  name: targetName,
                  ...(event.file ? { ...event.file, name: targetName } : {}),
                };
              }
              return f;
            });
          });
          return;
        }
      }

      // Fallback for upload, refresh, etc.
      fetchInitial();
    };

    fileListeners.add(handleFileEvent);
    return () => {
      fileListeners.delete(handleFileEvent);
    };
  }, [enabled, fetchInitial, trash, starred, recent, sharedWithMe]);

  return {
    files,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh: fetchInitial,
    setFiles,
  };
}

