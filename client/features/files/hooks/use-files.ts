"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteFile,
  downloadFile,
  getFileBlob,
  getFiles,
  renameFile,
  uploadFile,
} from "../api";
import type { FileItem, RenameFileData, UploadFileData } from "../types";
import { notifyDirectoryChanged } from "@/features/directory/hooks/use-directory";
import { useUpload } from "@/providers/upload-provider";


// Global listener set to synchronize active file hook consumers if needed
const fileListeners = new Set<() => void>();

export const notifyFilesChanged = () => {
  fileListeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error("Error in file listener:", error);
    }
  });
  // Also notify directory listeners since files live within directories
  notifyDirectoryChanged();
};

interface UseFilesReturn {
  isUploading: boolean;
  isRenaming: boolean;
  isDeleting: boolean;
  isDownloading: boolean;
  error: string | null;
  upload: (
    data: UploadFileData,
    parentDirId?: string
  ) => Promise<void>;
  rename: (
    id: string,
    data: RenameFileData
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
  download: (
    id: string,
    filename?: string
  ) => Promise<void>;
  getBlob: (id: string) => Promise<Blob>;
}

export function useFiles(): UseFilesReturn {
  const uploadContext = useUpload();
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    async (id: string): Promise<void> => {
      try {
        setIsDeleting(true);
        setError(null);

        await deleteFile(id);

        notifyFilesChanged();
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

  return {
    isUploading,
    isRenaming,
    isDeleting,
    isDownloading,
    error,
    upload,
    rename,
    remove,
    download,
    getBlob,
  };
}

export interface UseInfiniteFilesOptions {
  limit?: number;
  enabled?: boolean;
}

export interface UseInfiniteFilesReturn {
  files: FileItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useInfiniteFiles(
  options: UseInfiniteFilesOptions = {}
): UseInfiniteFilesReturn {
  const { limit = 20, enabled = true } = options;

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const nextCursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);

  const fetchInitial = useCallback(async () => {
    if (!enabled) return;

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      const response = await getFiles({ limit });

      setFiles(response.data);
      nextCursorRef.current = response.pagination.nextCursor;
      hasMoreRef.current = response.pagination.hasMore;
      setHasMore(response.pagination.hasMore);
    } catch (err) {
      console.error("Failed to fetch initial files:", err);
      setError("Failed to load files.");
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [enabled, limit]);

  const loadMore = useCallback(async () => {
    if (
      !enabled ||
      isFetchingRef.current ||
      !hasMoreRef.current ||
      !nextCursorRef.current
    ) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoadingMore(true);
      setError(null);

      const response = await getFiles({
        cursor: nextCursorRef.current,
        limit,
      });

      setFiles((prev) => {
        const existingIds = new Set(prev.map((f) => f._id || f.id));
        const newItems = response.data.filter(
          (f) => !existingIds.has(f._id || f.id)
        );
        return [...prev, ...newItems];
      });

      nextCursorRef.current = response.pagination.nextCursor;
      hasMoreRef.current = response.pagination.hasMore;
      setHasMore(response.pagination.hasMore);
    } catch (err) {
      console.error("Failed to load more files:", err);
      setError("Failed to load more files.");
    } finally {
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [enabled, limit]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  useEffect(() => {
    if (!enabled) return;

    fileListeners.add(fetchInitial);
    return () => {
      fileListeners.delete(fetchInitial);
    };
  }, [enabled, fetchInitial]);

  return {
    files,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh: fetchInitial,
  };
}

