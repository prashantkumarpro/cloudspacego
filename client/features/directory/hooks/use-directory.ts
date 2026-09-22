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

// Global listener set to synchronize all active useDirectory hook instances on mutation
const directoryListeners = new Set<() => void>();

export const notifyDirectoryChanged = () => {
  directoryListeners.forEach((listener) => {
    try {
      listener();
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
    directoryListeners.add(fetchDirectory);
    return () => {
      directoryListeners.delete(fetchDirectory);
    };
  }, [fetchDirectory]);

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