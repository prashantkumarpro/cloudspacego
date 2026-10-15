import { apiClient } from "@/lib/api/client";
import type {
    CreateDirectoryData,
    CreateDirectoryResponse,
    Directory,
    DirectoryItem,
    RenameDirectoryData,
} from "./types";

export const getDirectory = async (
    id?: string
): Promise<Directory> => {
    const response = await apiClient.get<Record<string, unknown>>(
        id ? `/directory/${id}` : "/directory"
    );

    const raw = (response.data || {}) as Record<string, unknown>;
    const doc = (raw._doc || raw) as Record<string, unknown>;
    const dirId = ((doc.id || doc._id || raw.id || raw._id || '') as string).toString();

    const rawFiles = Array.isArray(raw.files) ? (raw.files as Array<Record<string, unknown>>) : [];
    const rawDirs = Array.isArray(raw.directories) ? (raw.directories as Array<Record<string, unknown>>) : [];

    return {
        id: dirId,
        _id: dirId,
        name: (doc.name || raw.name || "") as string,
        userId: ((doc.userId || raw.userId || "") as string).toString(),
        parentDirId: doc.parentDirId !== undefined ? (doc.parentDirId as string | null) : ((raw.parentDirId ?? null) as string | null),
        createdAt: (doc.createdAt || raw.createdAt || "") as string,
        updatedAt: (doc.updatedAt || raw.updatedAt || "") as string,
        files: rawFiles.map((f) => ({
            ...f,
            name: (f.name || '') as string,
            extension: (f.extension || '') as string,
            userId: (f.userId || '') as string,
            parentDirId: (f.parentDirId || '') as string,
            id: (f.id || f._id || '').toString(),
            size: typeof f.size === 'number' ? f.size : (typeof f.size === 'string' && !isNaN(Number(f.size)) ? Number(f.size) : undefined),
        })),
        directories: rawDirs.map((d) => ({
            id: (d.id || d._id || '').toString(),
            _id: (d._id || d.id || '').toString(),
            name: (d.name || '') as string,
            userId: (d.userId || '') as string,
            parentDirId: (d.parentDirId || '') as string,
        })),
    };
};


export const createDirectory = async (
    data: CreateDirectoryData,
    parentDirId?: string
): Promise<CreateDirectoryResponse> => {
    const endpoint = parentDirId
        ? `/directory/${parentDirId}`
        : "/directory";

    const response = await apiClient.post(endpoint, {}, {
        headers: {
            dirname: data.dirname,
        },
    });

    const raw = response.data || {};
    let createdDirectory: DirectoryItem | undefined;
    if (raw.directory) {
        const d = raw.directory;
        const dId = (d.id || d._id || '').toString();
        createdDirectory = {
            id: dId,
            _id: dId,
            name: d.name || data.dirname,
            userId: (d.userId || '').toString(),
            parentDirId: (d.parentDirId || parentDirId || '').toString(),
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
            isOptimistic: false,
        };
    }

    return {
        message: raw.message,
        directory: createdDirectory,
    };
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