import { apiClient } from "@/lib/api/client";
import type {
    FileApiResponse,
    RenameFileData,
    UploadFileData,
} from "./types";

export const uploadFile = async (
    data: UploadFileData,
    parentDirId?: string
): Promise<FileApiResponse> => {
    const endpoint = parentDirId ? `/file/${parentDirId}` : "/file";
    const filename =
        data.filename || (data.file instanceof File ? data.file.name : "untitled");

    const response = await apiClient.post<FileApiResponse>(endpoint, data.file, {
        headers: {
            filename,
            "Content-Type": data.file.type || "application/octet-stream",
        },
    });

    return response.data;
};

export const getFileBlob = async (id: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`/file/${id}`, {
        responseType: "blob",
    });

    return response.data;
};

export const downloadFile = async (
    id: string,
    customFilename?: string
): Promise<void> => {
    const response = await apiClient.get<Blob>(`/file/${id}`, {
        params: { action: "download" },
        responseType: "blob",
    });

    let filename = customFilename;
    if (!filename) {
        const disposition = response.headers["content-disposition"];
        if (disposition && disposition.includes("filename=")) {
            const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }
    }

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "download");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const renameFile = async (
    id: string,
    data: RenameFileData
): Promise<FileApiResponse> => {
    const response = await apiClient.patch<FileApiResponse>(`/file/${id}`, {
        newFilename: data.newFilename,
    });

    return response.data;
};

export const deleteFile = async (id: string): Promise<FileApiResponse> => {
    const response = await apiClient.delete<FileApiResponse>(`/file/${id}`);

    return response.data;
};