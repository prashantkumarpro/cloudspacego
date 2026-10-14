"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import type { FileItem, RenameFileData, UploadFileData, FileMutationEvent, FileEventListener } from "../types";
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
    data: RenameFileData
  ) => Promise<void>;
  remove: (id: string, options?: { skipNotify?: boolean }) => Promise<void>;
  download: (
    id: string,
    filename?: string
  ) => Promise<void>;
  getBlob: (id: string) => Promise<Blob>;
  toggleStar: (id: string, isStarred?: boolean) => Promise<boolean>;
  recordAccess: (id: string) => Promise<void>;
  restore: (id: string, options?: { skipNotify?: boolean }) => Promise<any>;
  deletePermanently: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
}

export function useFiles(): UseFilesReturn {
  const uploadContext = useUpload();
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
          await uploadFile(data, parentDirId);
          notifyFilesChanged();
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
      data: RenameFileData
    ): Promise<void> => {
      try {
        setIsRenaming(true);
        setError(null);

        await renameFile(id, data);

        notifyFilesChanged();
      } catch (err) {
        console.error("Failed to rename file:", err);
        setError("Failed to rename file.");
        throw err;
      } finally {
        setIsRenaming(false);
      }
    },
    []
  );

  const remove = useCallback(
    async (id: string, options?: { skipNotify?: boolean }): Promise<void> => {
      try {
        setIsDeleting(true);
        setError(null);

        await deleteFile(id);

        if (!options?.skipNotify) {
          notifyFilesChanged({ type: 'delete', fileId: id });
        }
      } catch (err) {
        console.error("Failed to delete file:", err);
        setError("Failed to delete file.");
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    []
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
    restore: useCallback(async (id: string, options?: { skipNotify?: boolean }): Promise<any> => {
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

      // Fallback for upload, rename, etc.
      fetchInitial();
    };

    fileListeners.add(handleFileEvent);
    return () => {
      fileListeners.delete(handleFileEvent);
    };
  }, [enabled, fetchInitial, trash, starred, recent]);

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

