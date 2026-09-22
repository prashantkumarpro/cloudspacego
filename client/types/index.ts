export type FileType = 'pdf' | 'image' | 'document' | 'video' | 'folder' | 'audio' | 'code' | 'other';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: number; // in bytes
  parentFolderId: string | null; // null means root of "My Files"
  starred: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  owner: string;
  sharedWith?: string[]; // list of email addresses shared with
}

export interface ActivityItem {
  id: string;
  type: 'upload' | 'create_folder' | 'share' | 'star' | 'delete' | 'restore';
  details: string;
  timestamp: string;
  user: string;
  assetName: string;
}

export interface StorageStats {
  documents: number; // size in bytes
  images: number; // size in bytes
  videos: number; // size in bytes
  other: number; // size in bytes
  totalUsed: number; // size in bytes
  totalCapacity: number; // size in bytes (e.g. 100 GB)
}

export type SidebarSection = 'Dashboard' | 'My Files' | 'Shared' | 'Recent' | 'Starred' | 'Trash' | 'Settings';

export interface AppState {
  currentSection: SidebarSection;
  activeFolderId: string | null; // null means root folder
  files: FileItem[];
  activities: ActivityItem[];
  searchQuery: string;
  storageStats: StorageStats;
}
