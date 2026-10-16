"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  createDirectory,
  deleteDirectory,
  getDirectory,
  renameDirectory,
} from "../api";
import type {
  CreateDirectoryData,
  Directory,
  DirectoryItem,
  FileItem,
  DirectoryMutationEvent,
  RemoveDirectoryOptions,
  RenameDirectoryData,
  RenameDirectoryOptions,
} from "../types";
import type { FileMutationEvent } from "@/features/files/types";
import { invalidateSearchCache } from "@/features/search/api";
import { ToastContext } from "@/providers/toast-provider";

// Global listener set to synchronize all active useDirectory hook instances on mutation
export type DirectoryEventListener = (
  event?: DirectoryMutationEvent | FileMutationEvent
) => void;
const directoryListeners = new Set<DirectoryEventListener>();

// Set to track in-flight folder creations to prevent duplicate submissions
const inFlightCreations = new Set<string>();

// Set to track active optimistic folder temporary IDs to handle late responses safely
const activeOptimisticFolderIds = new Set<string>();

// Set to track in-flight folder deletions to prevent duplicate submissions
const inFlightDeletions = new Set<string>();

// Set to track in-flight folder renames to prevent duplicate submissions
const inFlightFolderRenames = new Set<string>();

// Map to track sequence versioning per folder to reject stale or out-of-order network responses
const folderRenameVersions = new Map<string, number>();

export const isFolderDeleting = (id?: string | null): boolean => {
  if (!id) return false;
  return inFlightDeletions.has(id.toString());
};

export const isFolderRenaming = (id?: string | null): boolean => {
  if (!id) return false;
  const idStr = id.toString();
  for (const key of inFlightFolderRenames) {
    if (key.startsWith(`${idStr}:`)) return true;
  }
  return false;
};

export const getInFlightCreationKey = (
  parentDirId?: string | null,
  dirname?: string
): string => {
  const normParent = parentDirId ? parentDirId.toString() : "root";
  const normName = (dirname || "").trim().toLowerCase();
  return `${normParent}:${normName}`;
};

export const isFolderCreating = (
  parentDirId?: string | null,
  dirname?: string
): boolean => {
  return inFlightCreations.has(getInFlightCreationKey(parentDirId, dirname));
};

export const subscribeDirectoryChanged = (listener: DirectoryEventListener) => {
  directoryListeners.add(listener);
  return () => {
    directoryListeners.delete(listener);
  };
};

export const notifyDirectoryChanged = (
  event?: DirectoryMutationEvent | FileMutationEvent
) => {
  directoryListeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
      console.error("Error in directory listener:", error);
    }
  });
};

interface UseDirectoryReturn {
  directory: Directory | null;
  isLoading: boolean;
  isCreating: boolean;
  isRenaming: boolean;
  isDeleting: boolean;
  error: string | null;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  create: (
    data: CreateDirectoryData,
    parentDirId?: string
  ) => Promise<DirectoryItem | void>;
  rename: (
    id: string,
    data: RenameDirectoryData,
    options?: RenameDirectoryOptions
  ) => Promise<void>;
  remove: (id: string, options?: RemoveDirectoryOptions) => Promise<void>;
}

export function useDirectory(id?: string): UseDirectoryReturn {
  const [directory, setDirectory] = useState<Directory | null>(null);
  const toast = useContext(ToastContext);
  const directoryRef = useRef<Directory | null>(null);
  useEffect(() => {
    directoryRef.current = directory;
  }, [directory]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const fetchDirectory = useCallback(
    async (options?: { silent?: boolean }) => {
      try {
        // Avoid resetting an already-rendered view into a loading skeleton on background refetch
        if (!options?.silent && !directoryRef.current) {
          setIsLoading(true);
        }
        setError(null);

        const data = await getDirectory(id);

        // Preserve any active optimistic folders that have not yet settled,
        // and filter out any folders currently in-flight deleting
        setDirectory((prev) => {
          const filterDeleting = (dirs: DirectoryItem[]) =>
            dirs.filter(
              (d) => !inFlightDeletions.has((d.id || d._id || "").toString())
            );

          if (!prev) {
            return {
              ...data,
              directories: filterDeleting(data.directories || []),
            };
          }
          const pendingOptimistic = (prev.directories || []).filter(
            (d) =>
              (d.isOptimistic || d.id?.startsWith("temp-")) &&
              !inFlightDeletions.has((d.id || d._id || "").toString())
          );
          const serverDirs = filterDeleting(data.directories || []);

          if (pendingOptimistic.length === 0) {
            return {
              ...data,
              directories: serverDirs,
            };
          }
          const merged = [
            ...pendingOptimistic.filter(
              (opt) =>
                !serverDirs.some(
                  (s) =>
                    s.id === opt.id ||
                    s.name.toLowerCase() === opt.name.toLowerCase()
                )
            ),
            ...serverDirs,
          ];
          return {
            ...data,
            directories: merged,
          };
        });
      } catch (error) {
        console.error("Failed to fetch directory:", error);
        setError("Failed to load directory.");
      } finally {
        setIsLoading(false);
      }
    },
    [id]
  );

  const create = useCallback(
    async (
      data: CreateDirectoryData,
      parentDirId?: string
    ): Promise<DirectoryItem | void> => {
      const trimmedName = data.dirname?.trim();
      if (!trimmedName) {
        throw new Error("Folder name cannot be empty");
      }

      const effectiveParentDirId =
        parentDirId !== undefined ? parentDirId : (id ?? null);
      const inFlightKey = getInFlightCreationKey(
        effectiveParentDirId,
        trimmedName
      );

      // Prevent duplicate in-flight submissions
      if (inFlightCreations.has(inFlightKey)) {
        console.warn(
          `Folder creation already in progress for "${trimmedName}" in "${effectiveParentDirId || "root"}"`
        );
        return;
      }

      inFlightCreations.add(inFlightKey);
      setIsCreating(true);
      setError(null);

      // 1. Generate unique temporary folder ID
      const tempId = `temp-folder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      activeOptimisticFolderIds.add(tempId);

      const tempFolder: DirectoryItem = {
        id: tempId,
        _id: tempId,
        name: trimmedName,
        userId: directory?.userId || "",
        parentDirId: effectiveParentDirId || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOptimistic: true,
      };

      // 2. Immediately notify listeners synchronously to show temporary folder (<16ms)
      notifyDirectoryChanged({
        type: "create-folder-optimistic",
        tempId,
        folder: tempFolder,
        parentDirId: effectiveParentDirId,
      });

      try {
        // 3. Send create-folder API request in the background
        const res = await createDirectory(
          { dirname: trimmedName },
          effectiveParentDirId ?? undefined
        );

        // Late response safety check: if operation was cancelled or already settled
        if (!activeOptimisticFolderIds.has(tempId)) {
          return;
        }
        activeOptimisticFolderIds.delete(tempId);

        // 4. Construct authoritative folder from server response
        const serverDir = res?.directory;
        const authoritativeFolder: DirectoryItem = {
          id: (serverDir?.id || serverDir?._id || tempId).toString(),
          _id: (serverDir?._id || serverDir?.id || tempId).toString(),
          name: serverDir?.name || trimmedName,
          userId: (serverDir?.userId || directory?.userId || "").toString(),
          parentDirId: (
            serverDir?.parentDirId ||
            effectiveParentDirId ||
            ""
          ).toString(),
          createdAt: serverDir?.createdAt || tempFolder.createdAt,
          updatedAt: serverDir?.updatedAt || new Date().toISOString(),
          isOptimistic: false,
        };

        // 5. Replace temporary folder with authoritative folder
        notifyDirectoryChanged({
          type: "create-folder-success",
          tempId,
          folderId: authoritativeFolder.id,
          folder: authoritativeFolder,
          parentDirId: effectiveParentDirId,
        });

        try {
          invalidateSearchCache();
        } catch {}

        return authoritativeFolder;
      } catch (err: unknown) {
        console.error("Failed to create directory:", err);
        activeOptimisticFolderIds.delete(tempId);

        // 6. Remove temporary folder on failure
        notifyDirectoryChanged({
          type: "create-folder-error",
          tempId,
          parentDirId: effectiveParentDirId,
          error: err,
        });

        setError("Failed to create directory.");
        throw err;
      } finally {
        inFlightCreations.delete(inFlightKey);
        setIsCreating(inFlightCreations.size > 0);
      }
    },
    [id, directory]
  );

  const rename = useCallback(
    async (
      directoryId: string,
      data: RenameDirectoryData,
      options?: RenameDirectoryOptions
    ): Promise<void> => {
      if (!directoryId) return;
      const folderIdStr = directoryId.toString();
      const trimmedName = (data?.newDirName || "").trim();

      if (!trimmedName) {
        const msg = "Please enter a folder name";
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

      // Prevent duplicate in-flight requests for same folder and name
      const inFlightKey = `${folderIdStr}:${trimmedName}`;
      if (inFlightFolderRenames.has(inFlightKey)) {
        return;
      }

      inFlightFolderRenames.add(inFlightKey);
      setIsRenaming(true);
      setError(null);

      // Sequence versioning to reject stale or out-of-order network responses
      const version = (folderRenameVersions.get(folderIdStr) || 0) + 1;
      folderRenameVersions.set(folderIdStr, version);

      // 1. Immediately update UI optimistically (<16ms)
      notifyDirectoryChanged({
        type: "rename-folder-optimistic",
        folderId: folderIdStr,
        newDirName: trimmedName,
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
          const res = await renameDirectory(folderIdStr, { newDirName: trimmedName });
          inFlightFolderRenames.delete(inFlightKey);
          setIsRenaming(inFlightFolderRenames.size > 0);

          // Check if superseded by a newer rename attempt
          if (folderRenameVersions.get(folderIdStr) !== version) {
            return;
          }

          // Authoritative reconciliation
          const authoritative = res?.directory;
          notifyDirectoryChanged({
            type: "rename-folder-success",
            folderId: folderIdStr,
            newDirName: authoritative?.name || trimmedName,
            newName: authoritative?.name || trimmedName,
            folder: authoritative,
            version,
          });

          try {
            invalidateSearchCache();
          } catch {}
        } catch (err: unknown) {
          inFlightFolderRenames.delete(inFlightKey);
          setIsRenaming(inFlightFolderRenames.size > 0);

          // Check if superseded by a newer rename attempt
          if (folderRenameVersions.get(folderIdStr) !== version) {
            return;
          }

          // Safe rollback to original folder name
          const originalName = options?.originalName;
          if (originalName) {
            notifyDirectoryChanged({
              type: "rollback-rename-folder",
              folderId: folderIdStr,
              originalName,
              newDirName: originalName,
              newName: originalName,
              version,
            });
          }

          let errMsg = "Failed to rename folder. Please try again.";
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
    async (
      directoryId: string,
      options?: RemoveDirectoryOptions
    ): Promise<void> => {
      if (!directoryId) return;
      const folderIdStr = directoryId.toString();

      // 1. Prevent duplicate in-flight submissions / rapid repeated clicks
      if (inFlightDeletions.has(folderIdStr)) {
        return;
      }

      inFlightDeletions.add(folderIdStr);
      setIsDeleting(true);
      setError(null);

      // 2. Identify folder snapshot, original index, and effective parent ID
      const folderSnapshot =
        options?.folder ||
        directory?.directories?.find(
          (d) => (d.id || d._id || "").toString() === folderIdStr
        );
      const folderName = folderSnapshot?.name || "Folder";

      const rawIndex = options?.originalIndex;
      const calculatedIndex =
        typeof rawIndex === "number" && rawIndex >= 0
          ? rawIndex
          : directory?.directories?.findIndex(
              (d) => (d.id || d._id || "").toString() === folderIdStr
            );
      const validOriginalIndex =
        typeof calculatedIndex === "number" && calculatedIndex >= 0
          ? calculatedIndex
          : undefined;

      const effectiveParentDirId =
        options?.parentDirId !== undefined
          ? options.parentDirId
          : folderSnapshot?.parentDirId ?? (id ? id.toString() : null);

      // If this folder was an active optimistic creation, cancel its settlement
      if (activeOptimisticFolderIds.has(folderIdStr)) {
        activeOptimisticFolderIds.delete(folderIdStr);
      }

      // 3. Immediately notify listeners synchronously to remove folder (<16ms)
      if (!options?.skipNotify) {
        notifyDirectoryChanged({
          type: "delete-folder",
          folderId: folderIdStr,
          folder: folderSnapshot,
          originalIndex: validOriginalIndex,
          parentDirId: effectiveParentDirId,
        });
      }

      // 4. Show immediate success toast (unless skipToast)
      let toastId: string | undefined;
      if (!options?.skipToast && toast) {
        toastId = toast.success(
          "Folder deleted",
          `"${folderName}" was deleted.`
        );
      }

      // 5. Send deleteDirectory API request in the background
      const deletePromise = deleteDirectory(folderIdStr);

      const handleSettlement = async () => {
        try {
          await deletePromise;

          inFlightDeletions.delete(folderIdStr);
          setIsDeleting(inFlightDeletions.size > 0);

          notifyDirectoryChanged({
            type: "delete-folder-success",
            folderId: folderIdStr,
            parentDirId: effectiveParentDirId,
          });

          try {
            invalidateSearchCache();
          } catch {}
        } catch (err: unknown) {
          console.error("Failed to delete directory:", err);
          inFlightDeletions.delete(folderIdStr);
          setIsDeleting(inFlightDeletions.size > 0);

          // Dismiss the original success toast
          if (toastId && toast) {
            toast.dismiss(toastId);
          }

          // Safe rollback: restore folder to its original position
          notifyDirectoryChanged({
            type: "rollback-delete-folder",
            folderId: folderIdStr,
            folder: folderSnapshot,
            originalIndex: validOriginalIndex,
            parentDirId: effectiveParentDirId,
            error: err,
          });

          if (toast) {
            toast.error(
              "Failed to delete folder",
              `Could not delete "${folderName}". It has been restored.`
            );
          }

          setError("Failed to delete directory.");
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
    [id, directory, toast]
  );

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  useEffect(() => {
    const handleDirectoryEvent: DirectoryEventListener = (event) => {
      if (!event || !event.type || event.type === "refresh") {
        fetchDirectory();
        return;
      }

      // Optimistic Folder Creation: Add temporary folder immediately
      if (event.type === "create-folder-optimistic" && event.folder) {
        const folder = event.folder as DirectoryItem;
        const currentDirId = id || undefined;
        const eventParentId = event.parentDirId ?? folder.parentDirId;

        const isRootMatch =
          !currentDirId && (!eventParentId || eventParentId === "root");
        const isSubDirMatch =
          currentDirId &&
          eventParentId &&
          eventParentId.toString() === currentDirId.toString();

        if (isRootMatch || isSubDirMatch) {
          setDirectory((prev) => {
            if (!prev) {
              return {
                id: currentDirId || "",
                name: "",
                userId: "",
                parentDirId: eventParentId || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                files: [],
                directories: [folder],
              };
            }
            const existing = prev.directories || [];
            if (existing.some((d) => d.id === folder.id)) {
              return prev;
            }
            return {
              ...prev,
              directories: [folder, ...existing],
            };
          });
        }
        return;
      }

      // Authoritative Folder Replacement: Replace temporary folder with server folder
      if (event.type === "create-folder-success" && event.tempId) {
        const tempId = event.tempId;
        const authoritative = event.folder as DirectoryItem | undefined;
        setDirectory((prev) => {
          if (!prev || !prev.directories) return prev;
          const matchIndex = prev.directories.findIndex(
            (d) => d.id === tempId
          );
          if (matchIndex === -1) {
            return prev;
          }
          const updatedDirs = [...prev.directories];
          if (authoritative) {
            updatedDirs[matchIndex] = {
              ...authoritative,
              id: (
                authoritative.id ||
                authoritative._id ||
                tempId
              ).toString(),
              isOptimistic: false,
            };
          } else {
            updatedDirs[matchIndex] = {
              ...updatedDirs[matchIndex],
              isOptimistic: false,
            };
          }
          return {
            ...prev,
            directories: updatedDirs,
          };
        });
        return;
      }

      // Folder Creation Failure Rollback: Remove temporary folder
      if (event.type === "create-folder-error" && event.tempId) {
        const tempId = event.tempId;
        setDirectory((prev) => {
          if (!prev || !prev.directories) return prev;
          const exists = prev.directories.some((d) => d.id === tempId);
          if (!exists) return prev;
          return {
            ...prev,
            directories: prev.directories.filter((d) => d.id !== tempId),
          };
        });
        return;
      }

      // Optimistic Folder Deletion: Immediately remove folder from UI (<16ms)
      if (
        (event.type === "delete-folder" ||
          event.type === "delete-folder-optimistic") &&
        (event.folderId || event.folder?.id)
      ) {
        const folderId = (event.folderId || event.folder?.id || "").toString();
        setDirectory((prev) => {
          if (!prev || !prev.directories) return prev;
          const exists = prev.directories.some(
            (d) => (d.id || d._id || "").toString() === folderId
          );
          if (!exists) return prev;
          return {
            ...prev,
            directories: prev.directories.filter(
              (d) => (d.id || d._id || "").toString() !== folderId
            ),
          };
        });
        return;
      }

      // Settled Folder Deletion
      if (event.type === "delete-folder-success") {
        return;
      }

      // Rollback Folder Deletion / Folder Restore: restore folder to its original position
      if (
        (event.type === "rollback-delete-folder" ||
          event.type === "restore-folder") &&
        event.folder
      ) {
        const folder = event.folder as DirectoryItem;
        const folderId = (folder.id || folder._id || "").toString();
        const currentDirId = id || undefined;
        const eventParentId = event.parentDirId ?? folder.parentDirId;

        const isRootMatch =
          !currentDirId && (!eventParentId || eventParentId === "root");
        const isSubDirMatch =
          currentDirId &&
          eventParentId &&
          eventParentId.toString() === currentDirId.toString();

        if (isRootMatch || isSubDirMatch || (!currentDirId && !eventParentId)) {
          setDirectory((prev) => {
            if (!prev) {
              return {
                id: currentDirId || "",
                name: "",
                userId: folder.userId || "",
                parentDirId: eventParentId || null,
                createdAt: folder.createdAt || new Date().toISOString(),
                updatedAt: folder.updatedAt || new Date().toISOString(),
                files: [],
                directories: [folder],
              };
            }
            const existing = prev.directories || [];
            if (
              existing.some((d) => (d.id || d._id || "").toString() === folderId)
            ) {
              return prev;
            }
            const index =
              typeof event.originalIndex === "number" &&
              event.originalIndex >= 0 &&
              event.originalIndex <= existing.length
                ? event.originalIndex
                : 0;
            const updatedDirs = [...existing];
            updatedDirs.splice(index, 0, folder);
            return {
              ...prev,
              directories: updatedDirs,
            };
          });
        }
        return;
      }

      // File Upload: Add file directly into current directory without loading skeleton
      if (event.type === "upload" && event.file) {
        const file = event.file;
        const fileId = (file.id || file._id || "").toString();
        const currentDirId = (id || "").toString();
        const isCurrentRoot = !id || id === "root";

        const eventParent = event.parentDirId ? event.parentDirId.toString() : undefined;
        const fileParent = (file.parentDirId || file.parentFolderId || "").toString();

        setDirectory((prev) => {
          if (!prev) return prev;
          const prevId = (prev.id || prev._id || "").toString();

          let isMatch = false;
          if (isCurrentRoot) {
            // Upload matches root if:
            // 1. Explicitly designated for root (!eventParent or 'root')
            // 2. Or file parent matches this root directory's MongoDB ID
            const isExplicitRoot = !eventParent || eventParent === "root";
            const isFileParentRoot = !fileParent || fileParent === "root" || (prevId && fileParent === prevId);
            const isTargetIdRoot = Boolean(eventParent && prevId && eventParent === prevId);

            // Must NOT match root if eventParent is explicitly set to a different subfolder ID
            if (eventParent && eventParent !== "root" && prevId && eventParent !== prevId) {
              isMatch = false;
            } else if (isExplicitRoot || isFileParentRoot || isTargetIdRoot) {
              isMatch = true;
            }
          } else {
            // Nested folder matches if currentDirId or prevId equals eventParent or fileParent
            const matchesCurrentId = Boolean(
              (eventParent && eventParent === currentDirId) ||
              (fileParent && fileParent === currentDirId)
            );
            const matchesPrevId = Boolean(
              prevId && (
                (eventParent && eventParent === prevId) ||
                (fileParent && fileParent === prevId)
              )
            );
            isMatch = matchesCurrentId || matchesPrevId;
          }

          if (!isMatch) return prev;

          // Prevent duplicates if already present
          if (prev.files && prev.files.some((f) => (f.id || f._id || "").toString() === fileId)) {
            return prev;
          }

          return {
            ...prev,
            files: [file, ...(prev.files || [])],
          };
        });
        return;
      }

      // File Deletion
      if (event.type === "delete" && event.fileId) {
        setDirectory((prev) => {
          if (!prev || !prev.files) return prev;
          const match = prev.files.some(
            (f) => (f.id || f._id || "").toString() === event.fileId!.toString()
          );
          if (!match) return prev;
          return {
            ...prev,
            files: prev.files.filter(
              (f) =>
                (f.id || f._id || "").toString() !== event.fileId!.toString()
            ),
          };
        });
        return;
      }

      // File Rollback-Delete
      if (event.type === "rollback-delete" && event.file) {
        const file = event.file;
        const fileId = (file.id || file._id || "").toString();
        setDirectory((prev) => {
          if (!prev || !prev.files) return prev;
          const currentDirId = id || undefined;
          const fileParentId = file.parentDirId || file.parentFolderId;
          if (
            currentDirId &&
            fileParentId &&
            fileParentId.toString() !== currentDirId.toString()
          ) {
            return prev;
          }
          if (
            prev.files.some((f) => (f.id || f._id || "").toString() === fileId)
          ) {
            return prev;
          }
          const index =
            typeof event.originalIndex === "number" &&
            event.originalIndex >= 0 &&
            event.originalIndex <= prev.files.length
              ? event.originalIndex
              : 0;
          const newFiles = [...prev.files];
          newFiles.splice(index, 0, file);
          return {
            ...prev,
            files: newFiles,
          };
        });
        return;
      }

      // File Restore
      if (event.type === "restore" && event.file) {
        const file = event.file;
        const fileId = (file.id || file._id || "").toString();
        setDirectory((prev) => {
          if (!prev || !prev.files) return prev;
          const currentDirId = id || undefined;
          const fileParentId = file.parentDirId || file.parentFolderId;
          if (
            currentDirId &&
            fileParentId &&
            fileParentId.toString() !== currentDirId.toString()
          ) {
            return prev;
          }
          if (
            prev.files.some((f) => (f.id || f._id || "").toString() === fileId)
          ) {
            return prev;
          }
          const index =
            typeof event.originalIndex === "number" &&
            event.originalIndex >= 0 &&
            event.originalIndex <= prev.files.length
              ? event.originalIndex
              : 0;
          const newFiles = [...prev.files];
          newFiles.splice(index, 0, file);
          return {
            ...prev,
            files: newFiles,
          };
        });
        return;
      }

      // Folder Rename / Reconciliation / Rollback: update in-memory without network refetch
      if (
        event.type === "rename-folder-optimistic" ||
        event.type === "rename-folder-success" ||
        event.type === "rollback-rename-folder" ||
        event.type === "rename-folder"
      ) {
        const dirEvt = event as DirectoryMutationEvent;
        const folderId = (dirEvt.folderId || dirEvt.folder?.id || "").toString();
        const targetName =
          dirEvt.type === "rollback-rename-folder"
            ? (dirEvt.originalName || dirEvt.newName || dirEvt.newDirName || dirEvt.folder?.name)
            : (dirEvt.newName || dirEvt.newDirName || dirEvt.folder?.name);

        if (folderId && targetName) {
          const authoritative = dirEvt.folder;
          setDirectory((prev) => {
            if (!prev) return prev;
            let changed = false;

            // 1. If this directory itself is the renamed folder (e.g. current view / breadcrumbs)
            const currentDirId = (prev.id || prev._id || id || "").toString();
            let newName = prev.name;
            if (currentDirId && currentDirId === folderId) {
              newName = targetName;
              changed = true;
            }

            // 2. If one of child folders matches
            const dirs = prev.directories || [];
            let updatedDirs = dirs;
            if (dirs.some((d) => (d.id || d._id || "").toString() === folderId)) {
              changed = true;
              updatedDirs = dirs.map((d) => {
                if ((d.id || d._id || "").toString() === folderId) {
                  return {
                    ...d,
                    name: targetName,
                    ...(authoritative ? { ...authoritative, name: targetName } : {}),
                  };
                }
                return d;
              });
            }

            if (!changed) return prev;
            return {
              ...prev,
              name: newName,
              directories: updatedDirs,
            };
          });
          return;
        }
      }

      // File Rename / Reconciliation / Rollback inside directory: update in-memory without network refetch
      if (
        event.type === "rename-file-optimistic" ||
        event.type === "rename-file-success" ||
        event.type === "rollback-rename-file" ||
        event.type === "rename"
      ) {
        const fileEvt = event as FileMutationEvent;
        const fileId = (fileEvt.fileId || fileEvt.file?.id || fileEvt.file?._id || "").toString();
        const targetName =
          fileEvt.type === "rollback-rename-file"
            ? (fileEvt.originalName || fileEvt.newName || fileEvt.newFilename || fileEvt.file?.name)
            : (fileEvt.newFilename || fileEvt.newName || fileEvt.file?.name);

        if (fileId && targetName) {
          const authoritative = fileEvt.file as FileItem | undefined;
          setDirectory((prev) => {
            if (!prev || !prev.files) return prev;
            if (!prev.files.some((f) => (f.id || f._id || "").toString() === fileId)) {
              return prev;
            }
            return {
              ...prev,
              files: prev.files.map((f) => {
                if ((f.id || f._id || "").toString() === fileId) {
                  return {
                    ...f,
                    name: targetName,
                    ...(authoritative ? { ...authoritative, name: targetName } : {}),
                  };
                }
                return f;
              }),
            };
          });
          return;
        }
      }

      fetchDirectory();
    };

    directoryListeners.add(handleDirectoryEvent);
    return () => {
      directoryListeners.delete(handleDirectoryEvent);
    };
  }, [fetchDirectory, id]);

  return {
    directory,
    isLoading,
    isCreating,
    isRenaming,
    isDeleting,
    error,
    refresh: fetchDirectory,
    create,
    rename,
    remove,
  };
}