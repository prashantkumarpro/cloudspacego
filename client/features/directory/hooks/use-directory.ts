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
  RenameDirectoryData,
} from "../types";
import type { FileMutationEvent } from "@/features/files/types";

// Global listener set to synchronize all active useDirectory hook instances on mutation
export type DirectoryEventListener = (event?: FileMutationEvent) => void;
const directoryListeners = new Set<DirectoryEventListener>();

export const subscribeDirectoryChanged = (listener: DirectoryEventListener) => {
  directoryListeners.add(listener);
  return () => {
    directoryListeners.delete(listener);
  };
};

export const notifyDirectoryChanged = (event?: FileMutationEvent) => {
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
  ) => Promise<void>;
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

      setDirectory(data);
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
    ): Promise<void> => {
      try {
        setIsCreating(true);
        setError(null);

        await createDirectory(data, parentDirId);

        notifyDirectoryChanged();
      } catch (error) {
        console.error("Failed to create directory:", error);
        setError("Failed to create directory.");
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    []
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

        notifyDirectoryChanged();
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

        notifyDirectoryChanged();
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
      if (!event || !event.type || event.type === 'refresh') {
        fetchDirectory();
        return;
      }

      if (event.type === 'delete' && event.fileId) {
        setDirectory((prev) => {
          if (!prev || !prev.files) return prev;
          const match = prev.files.some(
            (f) => (f.id || f._id || '').toString() === event.fileId!.toString()
          );
          if (!match) return prev;
          return {
            ...prev,
            files: prev.files.filter(
              (f) => (f.id || f._id || '').toString() !== event.fileId!.toString()
            ),
          };
        });
        return;
      }

      if (event.type === 'rollback-delete' && event.file) {
        const file = event.file;
        const fileId = (file.id || file._id || '').toString();
        setDirectory((prev) => {
          if (!prev || !prev.files) return prev;
          const currentDirId = id || undefined;
          const fileParentId = file.parentDirId || file.parentFolderId;
          if (currentDirId && fileParentId && fileParentId.toString() !== currentDirId.toString()) {
            return prev;
          }
          if (prev.files.some((f) => (f.id || f._id || '').toString() === fileId)) {
            return prev;
          }
          const index =
            typeof event.originalIndex === 'number' &&
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

      if (event.type === 'restore' && event.file) {
        const file = event.file;
        const fileId = (file.id || file._id || '').toString();
        setDirectory((prev) => {
          if (!prev || !prev.files) return prev;
          const currentDirId = id || undefined;
          const fileParentId = file.parentDirId || file.parentFolderId;
          if (currentDirId && fileParentId && fileParentId.toString() !== currentDirId.toString()) {
            return prev;
          }
          if (prev.files.some((f) => (f.id || f._id || '').toString() === fileId)) {
            return prev;
          }
          const index =
            typeof event.originalIndex === 'number' &&
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