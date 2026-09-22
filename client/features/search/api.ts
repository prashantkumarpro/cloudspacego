import { apiClient } from "@/lib/api/client";
import { getDirectory } from "@/features/directory/api";
import type { Directory, DirectoryItem } from "@/features/directory/types";
import type { FileItem } from "@/features/files/types";
import type { UnifiedSearchResult } from "./types";

// Helper to determine file type category from name and extension
function getCategoryType(name: string, ext?: string): UnifiedSearchResult['type'] {
  const extension = (ext || name.split('.').pop() || '').replace('.', '').toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(extension)) return 'image';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension)) return 'video';
  if (['doc', 'docx', 'txt', 'md', 'pptx', 'xlsx', 'csv', 'rtf'].includes(extension)) return 'document';
  if (['js', 'ts', 'jsx', 'tsx', 'json', 'py', 'html', 'css', 'go', 'rs', 'java', 'c', 'cpp'].includes(extension)) return 'code';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(extension)) return 'audio';
  return 'other';
}

// In-memory directory cache to optimize multi-keystroke search speed
let cachedDirectoryTree: {
  timestamp: number;
  root: Directory;
  subdirectories: Map<string, Directory>;
} | null = null;

const CACHE_TTL_MS = 10000; // 10 seconds cache

export const invalidateSearchCache = () => {
  cachedDirectoryTree = null;
};

export async function searchBackend(query: string): Promise<UnifiedSearchResult[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // 1. Check if backend has a dedicated /search endpoint
  try {
    const response = await apiClient.get<any>("/search", {
      params: { q: query },
    });

    if (response.data) {
      const data = response.data;
      const rawFiles: FileItem[] = Array.isArray(data.files)
        ? data.files
        : Array.isArray(data.results)
        ? data.results.filter((item: any) => !item.isFolder && item.extension !== undefined)
        : [];
      const rawDirs: DirectoryItem[] = Array.isArray(data.directories)
        ? data.directories
        : Array.isArray(data.results)
        ? data.results.filter((item: any) => item.isFolder || item.type === 'folder')
        : [];

      const results: UnifiedSearchResult[] = [];

      rawDirs.forEach(dir => {
        results.push({
          id: dir.id,
          name: dir.name,
          type: 'folder',
          parentDirId: dir.parentDirId,
          locationName: 'My Files',
          createdAt: dir.createdAt,
          updatedAt: dir.updatedAt,
          userId: dir.userId,
        });
      });

      rawFiles.forEach(file => {
        results.push({
          id: file.id || file._id || '',
          _id: file._id || file.id,
          name: file.name,
          type: getCategoryType(file.name, file.extension),
          extension: file.extension,
          size: file.size,
          parentDirId: file.parentDirId,
          locationName: 'My Files',
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
          userId: file.userId,
        });
      });

      if (results.length > 0) {
        return results;
      }
    }
  } catch (err: unknown) {
    // Dedicated /search endpoint might not exist on backend (e.g. 404), continue with real directory tree
  }

  // 2. Fetch real data from backend directory endpoints (/directory and /directory/:id)
  const now = Date.now();
  let rootDir: Directory;
  const subDirsMap = new Map<string, Directory>();

  if (cachedDirectoryTree && now - cachedDirectoryTree.timestamp < CACHE_TTL_MS) {
    rootDir = cachedDirectoryTree.root;
    cachedDirectoryTree.subdirectories.forEach((v, k) => subDirsMap.set(k, v));
  } else {
    rootDir = await getDirectory();
    if (rootDir.directories && rootDir.directories.length > 0) {
      await Promise.all(
        rootDir.directories.map(async (dir) => {
          try {
            const subDir = await getDirectory(dir.id);
            subDirsMap.set(dir.id, subDir);
          } catch {
            // Ignore subfolder load errors
          }
        })
      );
    }
    cachedDirectoryTree = {
      timestamp: now,
      root: rootDir,
      subdirectories: subDirsMap,
    };
  }

  // Map folder IDs to readable names for breadcrumb path
  const folderNames = new Map<string, string>();
  if (rootDir.directories) {
    rootDir.directories.forEach(d => folderNames.set(d.id, d.name));
  }

  const results: UnifiedSearchResult[] = [];

  // Match root folders
  if (rootDir.directories) {
    rootDir.directories.forEach(dir => {
      if (dir.name.toLowerCase().includes(trimmed)) {
        results.push({
          id: dir.id,
          name: dir.name,
          type: 'folder',
          parentDirId: dir.parentDirId || null,
          locationName: 'My Files',
          createdAt: dir.createdAt,
          updatedAt: dir.updatedAt,
          userId: dir.userId,
        });
      }
    });
  }

  // Match root files
  if (rootDir.files) {
    rootDir.files.forEach(file => {
      const nameMatch = file.name.toLowerCase().includes(trimmed);
      const extMatch = file.extension?.toLowerCase().includes(trimmed);
      if (nameMatch || extMatch) {
        results.push({
          id: file.id || file._id || '',
          _id: file._id || file.id,
          name: file.name,
          type: getCategoryType(file.name, file.extension),
          extension: file.extension,
          size: file.size,
          parentDirId: file.parentDirId || null,
          locationName: 'My Files',
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
          userId: file.userId,
        });
      }
    });
  }

  // Match subfolder directories and files
  subDirsMap.forEach((subDir, folderId) => {
    const parentFolderLabel = folderNames.get(folderId) || subDir.name || 'Folder';
    const subLocation = `My Files / ${parentFolderLabel}`;

    if (subDir.directories) {
      subDir.directories.forEach(nestedDir => {
        if (nestedDir.name.toLowerCase().includes(trimmed)) {
          if (!results.some(r => r.id === nestedDir.id)) {
            results.push({
              id: nestedDir.id,
              name: nestedDir.name,
              type: 'folder',
              parentDirId: folderId,
              locationName: subLocation,
              createdAt: nestedDir.createdAt,
              updatedAt: nestedDir.updatedAt,
              userId: nestedDir.userId,
            });
          }
        }
      });
    }

    if (subDir.files) {
      subDir.files.forEach(file => {
        const nameMatch = file.name.toLowerCase().includes(trimmed);
        const extMatch = file.extension?.toLowerCase().includes(trimmed);
        if (nameMatch || extMatch) {
          const fId = file.id || file._id || '';
          if (!results.some(r => r.id === fId)) {
            results.push({
              id: fId,
              _id: file._id || file.id,
              name: file.name,
              type: getCategoryType(file.name, file.extension),
              extension: file.extension,
              size: file.size,
              parentDirId: folderId,
              locationName: subLocation,
              createdAt: file.createdAt,
              updatedAt: file.updatedAt,
              userId: file.userId,
            });
          }
        }
      });
    }
  });

  return results;
}
