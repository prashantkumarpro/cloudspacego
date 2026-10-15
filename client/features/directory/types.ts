export interface Directory {    
    id?: string;
    _id?: string;
    name: string;
    userId: string;
    parentDirId: string | null;
    createdAt: string;
    updatedAt: string;
    files: FileItem[];
    directories: DirectoryItem[];
}

export interface DirectoryItem {    
    id: string;
    _id?: string;
    name: string;
    userId: string;
    parentDirId: string;
    createdAt?: string;
    updatedAt?: string;
    isOptimistic?: boolean;
}

export interface FileItem { 
    id?: string;
    _id?: string;
    name: string;
    extension: string;
    userId: string;
    parentDirId: string;
    createdAt?: string;
    updatedAt?: string;
    size?: number;
}

export interface CreateDirectoryData {
    dirname: string;
}

export interface CreateDirectoryResponse {
    message?: string;
    error?: string;
    directory?: DirectoryItem;
}

export interface RenameDirectoryData {
    newDirName: string;
}

export type DirectoryMutationType =
    | 'create-folder-optimistic'
    | 'create-folder-success'
    | 'create-folder-error'
    | 'rename-folder'
    | 'delete-folder'
    | 'refresh';

export interface DirectoryMutationEvent {
    type: DirectoryMutationType | string;
    tempId?: string;
    folderId?: string;
    folder?: DirectoryItem;
    parentDirId?: string | null;
    originalIndex?: number;
    error?: unknown;
    [key: string]: unknown;
}

export type DirectoryEventListener = (event?: DirectoryMutationEvent | unknown) => void;