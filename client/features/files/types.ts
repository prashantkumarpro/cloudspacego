export interface FileItem {
    id: string;
    _id?: string;
    name: string;
    extension: string;
    parentDirId: string;
    userId: string;
    createdAt?: string;
    updatedAt?: string;
    size?: number;
}

export interface UploadFileData {
    file: File | Blob;
    filename?: string;
}

export interface RenameFileData {
    newFilename: string;
}

export interface FileApiResponse {
    message?: string;
    error?: string;
}