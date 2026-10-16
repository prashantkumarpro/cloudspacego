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

export interface RenameDirectoryOptions {
    originalName?: string;
    parentDirId?: string | null;
    skipToast?: boolean;
    awaitCompletion?: boolean;
}

export interface RemoveDirectoryOptions {
    folder?: DirectoryItem;
    originalIndex?: number;
    parentDirId?: string | null;
    skipNotify?: boolean;
    skipToast?: boolean;
    awaitCompletion?: boolean;
}

export type DirectoryMutationType =
    | 'create-folder-optimistic'
    | 'create-folder-success'
    | 'create-folder-error'
    | 'rename-folder'
    | 'rename-folder-optimistic'
    | 'rename-folder-success'
    | 'rollback-rename-folder'
    | 'delete-folder'
    | 'delete-folder-optimistic'
    | 'delete-folder-success'
    | 'rollback-delete-folder'
    | 'restore-folder'
    | 'refresh';

export interface DirectoryMutationEvent {
    type: DirectoryMutationType | string;
    tempId?: string;
    folderId?: string;
    folder?: DirectoryItem;
    parentDirId?: string | null;
    originalIndex?: number;
    newName?: string;
    newDirName?: string;
    originalName?: string;
    version?: number;
    error?: unknown;
    [key: string]: unknown;
}

export type DirectoryEventListener = (event?: DirectoryMutationEvent | unknown) => void;
