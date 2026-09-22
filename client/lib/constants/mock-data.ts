import { FileItem, ActivityItem, StorageStats } from '../../types';

export const INITIAL_FILES: FileItem[] = [];

export const INITIAL_ACTIVITIES: ActivityItem[] = [];

export const INITIAL_STORAGE: StorageStats = {
  documents: 0,
  images: 0,
  videos: 0,
  other: 0,
  totalUsed: 0,
  totalCapacity: 15 * 1024 * 1024 * 1024, // 15 GB
};
