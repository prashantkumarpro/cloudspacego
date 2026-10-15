"use client";

import { useCallback, useEffect, useState } from "react";
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
  DirectoryMutationEvent,
  RenameDirectoryData,
} from "../types";
import type { FileMutationEvent } from "@/features/files/types";
import { invalidateSearchCache } from "@/features/search/api";

// Global listener set to synchronize all active useDirectory hook instances on mutation
export type DirectoryEventListener = (
  event?: DirectoryMutationEvent | FileMutationEvent
) => void;
const directoryListeners = new Set<DirectoryEventListener>();

// Set to track in-flight folder creations to prevent duplicate submissions
const inFlightCreations = new Set<string>();

// Set to track active optimistic folder temporary IDs to handle late responses safely
const activeOptimisticFolderIds = new Set<string>();

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
  refresh: () => Promise<void>;
  create: (
    data: CreateDirectoryData,
    parentDirId?: string
  ) => Promise<DirectoryItem | void>;
  rename: (
    id: string,
    data: RenameDirectoryData
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useDirectory(id?: string): UseDirectoryReturn {
  const [directory, setDirectory] = useState<Directory | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const fetchDirectory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getDirectory(id);

      // Preserve any active optimistic folders that have not yet settled
      setDirectory((prev) => {
        if (!prev) return data;
        const pendingOptimistic = (prev.directories || []).filter(
          (d) => d.isOptimistic || d.id?.startsWith("temp-")
        );
        if (pendingOptimistic.length === 0) {
          return data;
        }
        const serverDirs = data.directories || [];
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
  }, [id]);

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
      data: RenameDirectoryData
    ): Promise<void> => {
      try {
        setIsRenaming(true);
        setError(null);

        await renameDirectory(directoryId, data);

        notifyDirectoryChanged({
          type: "refresh",
        });
      } catch (error) {
        console.error("Failed to rename directory:", error);
        setError("Failed to rename directory.");
        throw error;
      } finally {
        setIsRenaming(false);
      }
    },
    []
  );

  const remove = useCallback(
    async (directoryId: string): Promise<void> => {
      try {
        setIsDeleting(true);
        setError(null);

        await deleteDirectory(directoryId);

        notifyDirectoryChanged({
          type: "refresh",
        });
      } catch (error) {
        console.error("Failed to delete directory:", error);
        setError("Failed to delete directory.");
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    []
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