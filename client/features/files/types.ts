export interface DirectoryReference {
    id: string;
    _id?: string;
    name: string;
}

export interface ShareOwnerInfo {
    id: string;
    _id?: string;
    name: string;
    email: string;
}

export interface ShareRecipientInfo {
    id: string;
    name: string;
    email: string;
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
    lastAccessedAt?: string;
    size?: number;
    directory?: DirectoryReference;
    isStarred?: boolean;
    starred?: boolean;
    isTrash?: boolean;
    trashedAt?: string;
    role?: 'viewer' | 'editor';
    sharedAt?: string;
    shareId?: string;
    owner?: ShareOwnerInfo | string;
}

export interface EmptyTrashResponse extends FileApiResponse {
    success: boolean;
    deletedCount: number;
    failedCount: number;
    failedItems?: Array<{
        id: string;
        name: string;
        error?: string;
    }>;
}

export interface RecordFileAccessResponse extends FileApiResponse {
    success?: boolean;
    file?: {
        id?: string;
        _id?: string;
        name?: string;
        lastAccessedAt?: string;
    };
}

export interface ToggleStarResponse extends FileApiResponse {
    success?: boolean;
    file?: FileItem;
}

export interface FileShareItem {
    id: string;
    role: 'viewer' | 'editor';
    status: 'active' | 'revoked';
    sharedAt: string;
    notificationStatus?: 'pending' | 'sent' | 'failed';
    recipient: ShareRecipientInfo;
}

export interface GetFileSharesResponse {
    shares: FileShareItem[];
}

export interface ShareFilePayload {
    recipientEmail: string;
    role: 'viewer' | 'editor';
}

export interface ShareFileResponse {
    success: boolean;
    message: string;
    share: {
        id: string;
        role: 'viewer' | 'editor';
        status: string;
        sharedAt: string;
        notificationStatus?: 'pending' | 'sent' | 'failed';
        recipient: ShareRecipientInfo;
    };
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

export type UploadStatus = 'queued' | 'uploading' | 'completed' | 'error' | 'cancelled';

export interface UploadTask {
    id: string;
    name: string;
    size: number;
    progress: number;
    status: UploadStatus;
    error?: string;
    parentDirId?: string;
    createdAt: number;
    file?: File | Blob;
    abortController?: AbortController;
}

export interface UploadFileData {
    file: File | Blob;
    filename?: string;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
}

export interface RenameFileData {
    newFilename: string;
}

export interface FileApiResponse {
    message?: string;
    error?: string;
    file?: FileItem | any;
}

export type FileMutationType =
    | 'delete'
    | 'rollback-delete'
    | 'restore'
    | 'permanent-delete'
    | 'empty-trash'
    | 'upload'
    | 'rename'
    | 'star'
    | 'refresh';

export interface FileMutationEvent {
    type: FileMutationType;
    fileId?: string;
    file?: FileItem | any;
    originalIndex?: number;
    parentDirId?: string | null;
    [key: string]: any;
}

export type FileEventListener = (event?: FileMutationEvent) => void;