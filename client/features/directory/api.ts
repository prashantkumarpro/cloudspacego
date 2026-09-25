import { apiClient } from "@/lib/api/client";
import type {
    CreateDirectoryData,
    Directory,
    RenameDirectoryData,
} from "./types";

export const getDirectory = async (
    id?: string
): Promise<Directory> => {
    const response = await apiClient.get<any>(
        id ? `/directory/${id}` : "/directory"
    );

    const raw = response.data || {};
    const doc = raw._doc || raw;

    return {
        name: doc.name || raw.name || "",
        userId: doc.userId || raw.userId || "",
        parentDirId: doc.parentDirId !== undefined ? doc.parentDirId : (raw.parentDirId ?? null),
        createdAt: doc.createdAt || raw.createdAt || "",
        updatedAt: doc.updatedAt || raw.updatedAt || "",
        files: (raw.files || []).map((f: any) => ({
            ...f,
            id: f.id || f._id,
            size: typeof f.size === 'number' ? f.size : (typeof f.size === 'string' && !isNaN(Number(f.size)) ? Number(f.size) : f.size),
        })),
        directories: (raw.directories || []).map((d: any) => ({
            ...d,
            id: d.id || d._id,
        })),
    };
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