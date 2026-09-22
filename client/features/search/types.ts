import type { FileItem } from "@/features/files/types";
import type { DirectoryItem } from "@/features/directory/types";
import type { FileType } from "@/types";

export interface UnifiedSearchResult {
  id: string;
  _id?: string;
  name: string;
  type: FileType | 'folder';
  extension?: string;
  size?: number;
  parentDirId?: string | null;
  locationName: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface BackendSearchResponse {
  files?: FileItem[];
  directories?: DirectoryItem[];
  results?: (FileItem | DirectoryItem)[];
}
