import { apiClient } from "@/lib/api/client";
import type {
    CreateDirectoryData,
    Directory,
    RenameDirectoryData,
} from "./types";

export const getDirectory = async (
    id?: string
): Promise<Directory> => {
    const response = await apiClient.get<Directory>(
        id ? `/directory/${id}` : "/directory"
    );

    return response.data;
};

export const createDirectory = async (
    data: CreateDirectoryData,
    parentDirId?: string
): Promise<void> => {
    const endpoint = parentDirId
        ? `/directory/${parentDirId}`
        : "/directory";

    await apiClient.post(endpoint, {}, {
        headers: {
            dirname: data.dirname,
        },
    });
};

export const renameDirectory = async (
    id: string,
    data: RenameDirectoryData
): Promise<void> => {
    await apiClient.patch(`/directory/${id}`, data);
};

export const deleteDirectory = async (
    id: string
): Promise<void> => {
    await apiClient.delete(`/directory/${id}`);
};