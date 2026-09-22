export interface Directory {    
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
    name: string;
    userId: string;
    parentDirId: string;
    createdAt?: string;
    updatedAt?: string;
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

export interface RenameDirectoryData {
    newDirName: string;
}