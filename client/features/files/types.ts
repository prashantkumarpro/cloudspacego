export interface DirectoryReference {
    id: string;
    _id?: string;
    name: string;
}

export interface FileItem {
    id: string;
    _id?: string;
    name: string;
    extension: string;
    parentDirId?: string;
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
    size?: number;
    directory?: DirectoryReference;
}


export interface PaginationData {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
}

export interface GetFilesResponse {
    data: FileItem[];
    pagination: PaginationData;
}

export interface GetFilesParams {
    cursor?: string;
    limit?: number;
}

export type UploadStatus = 'uploading' | 'completed' | 'error';

export interface UploadTask {
    id: string;
    name: string;
    size: number;
    progress: number;
    status: UploadStatus;
    error?: string;
    parentDirId?: string;
    createdAt: number;
}

export interface UploadFileData {
    file: File | Blob;
    filename?: string;
    onProgress?: (progress: number) => void;
}

export interface RenameFileData {
    newFilename: string;
}

export interface FileApiResponse {
    message?: string;
    error?: string;
}