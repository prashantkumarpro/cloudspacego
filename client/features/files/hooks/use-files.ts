"use client";

import { useCallback, useState } from "react";
import {
  deleteFile,
  downloadFile,
  getFileBlob,
  renameFile,
  uploadFile,
} from "../api";
import type { RenameFileData, UploadFileData } from "../types";
import { notifyDirectoryChanged } from "@/features/directory/hooks/use-directory";

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
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (
      data: UploadFileData,
      parentDirId?: string
    ): Promise<void> => {
      try {
        setIsUploading(true);
        setError(null);

        await uploadFile(data, parentDirId);

        notifyFilesChanged();
      } catch (err) {
        console.error("Failed to upload file:", err);
        setError("Failed to upload file.");
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
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
