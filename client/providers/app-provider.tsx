'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { FileItem, ActivityItem, StorageStats, SidebarSection, FileType } from '../types';
import { INITIAL_FILES, INITIAL_ACTIVITIES, INITIAL_STORAGE } from '../lib/constants/mock-data';
import { ToastProvider } from './toast-provider';
import { UploadProvider } from './upload-provider';
import { getStorageQuota, type StorageQuotaResponse } from '@/features/storage/api';
import { subscribeFilesChanged } from '@/features/files/hooks/use-files';

interface AppContextType {
  currentSection: SidebarSection;
  setCurrentSection: (section: SidebarSection) => void;
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
  files: FileItem[];
  activities: ActivityItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  storageStats: StorageStats;

  // Actions
  uploadFile: (name: string, size: number, type: FileType, folderId?: string | null) => void;
  createFolder: (name: string, parentId?: string | null) => string;
  toggleStar: (id: string) => void;
  deleteFile: (id: string) => void;
  restoreFile: (id: string) => void;
  deletePermanently: (id: string) => void;
  shareFile: (id: string, emails: string[]) => void;
  moveFile: (id: string, targetFolderId: string | null) => void;

  // Modal State Management
  activeModal: 'upload-file' | 'upload-folder' | 'create-folder' | 'share' | 'get-link' | 'search' | 'storage-upgrade' | null;
  setActiveModal: (modal: 'upload-file' | 'upload-folder' | 'create-folder' | 'share' | 'get-link' | 'search' | 'storage-upgrade' | null) => void;
  selectedFileId: string | null;
  setSelectedFileId: (id: string | null) => void;

  // Theme & Sidebar States
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;

  // Helpers
  currentFolderBreadcrumbs: { id: string | null; name: string }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentSection, setCurrentSectionState] = useState<SidebarSection>('Dashboard');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Theme & Sidebar states - Dark theme by default
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize theme from localStorage on client mount if available
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('cloudspacego_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      } else {
        setTheme('dark');
      }
    } catch {
      // Ignore if localStorage is unavailable
    }
  }, []);

  // Set initial collapse state based on viewport size on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSmall = window.innerWidth < 1024;
      requestAnimationFrame(() => {
        setIsSidebarCollapsed(isSmall);
      });
    }
  }, []);

  // Modal disclosures
  const [activeModal, setActiveModal] = useState<'upload-file' | 'upload-folder' | 'create-folder' | 'share' | 'get-link' | 'search' | 'storage-upgrade' | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Sync theme to DOM root and localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('cloudspacego_theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  // Wrapper to reset search and folder id when switching section
  const setCurrentSection = useCallback((section: SidebarSection) => {
    setCurrentSectionState(section);
    setActiveFolderId(null);
    setSearchQuery('');
  }, []);

  // Backend storage quota state (source of truth)
  const [backendQuota, setBackendQuota] = useState<StorageQuotaResponse>({
    used: 0,
    limit: INITIAL_STORAGE.totalCapacity,
    remaining: INITIAL_STORAGE.totalCapacity,
    percentage: 0,
    plan: 'free',
  });

  const refreshStorageQuota = useCallback(async () => {
    try {
      const quota = await getStorageQuota();
      if (quota && typeof quota.used === 'number') {
        setBackendQuota(quota);
      }
    } catch {
      // Keep default / current stats if unauthenticated or network error
    }
  }, []);

  useEffect(() => {
    refreshStorageQuota();
    const unsubscribe = subscribeFilesChanged(refreshStorageQuota);
    return () => {
      unsubscribe();
    };
  }, [refreshStorageQuota]);

  // Storage stats combining backend source of truth with local categorization
  const storageStats: StorageStats = useMemo(() => {
    const activeFiles = files.filter(f => !f.deleted && f.type !== 'folder');

    let docs = 0;
    let imgs = 0;
    let vids = 0;
    let other = 0;

    activeFiles.forEach(f => {
      if (f.type === 'pdf' || f.type === 'document') {
        docs += f.size;
      } else if (f.type === 'image') {
        imgs += f.size;
      } else if (f.type === 'video') {
        vids += f.size;
      } else {
        other += f.size;
      }
    });

    const localTotal = docs + imgs + vids + other;
    const totalUsed = backendQuota.used > 0 ? backendQuota.used : localTotal;
    const totalCapacity = backendQuota.limit || INITIAL_STORAGE.totalCapacity;
    const remaining =
      backendQuota.remaining !== undefined
        ? backendQuota.remaining
        : Math.max(0, totalCapacity - totalUsed);
    const percentage =
      totalCapacity > 0
        ? Math.min(100, Math.round((totalUsed / totalCapacity) * 100))
        : 0;

    return {
      documents: docs,
      images: imgs,
      videos: vids,
      other,
      totalUsed,
      totalCapacity,
      remaining,
      percentage,
      plan: backendQuota.plan,
    };
  }, [files, backendQuota]);

  // Actions
  const addActivity = useCallback((type: ActivityItem['type'], assetName: string, details: string, user = 'Prashant') => {
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type,
      details,
      timestamp: new Date().toISOString(),
      user,
      assetName,
    };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  const uploadFile = useCallback((name: string, size: number, type: FileType, folderId: string | null = activeFolderId) => {
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name,
      type,
      size,
      parentFolderId: folderId,
      starred: false,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: 'Prashant',
    };

    setFiles(prev => [newFile, ...prev]);
    addActivity('upload', name, `You uploaded a file: ${name}`);
  }, [activeFolderId, addActivity]);

  const createFolder = useCallback((name: string, parentId: string | null = activeFolderId) => {
    const folderId = `folder-${Date.now()}`;
    const newFolder: FileItem = {
      id: folderId,
      name,
      type: 'folder',
      size: -1,
      parentFolderId: parentId,
      starred: false,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: 'Prashant',
    };

    setFiles(prev => [newFolder, ...prev]);
    addActivity('create_folder', name, `You created folder: ${name}`);
    return folderId;
  }, [activeFolderId, addActivity]);

  const toggleStar = useCallback((id: string) => {
    setFiles(prev =>
      prev.map(f => {
        if (f.id === id) {
          const newStarredState = !f.starred;
          addActivity('star', f.name, newStarredState ? `You starred: ${f.name}` : `You unstarred: ${f.name}`);
          return { ...f, starred: newStarredState, updatedAt: new Date().toISOString() };
        }
        return f;
      })
    );
  }, [addActivity]);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev =>
      prev.map(f => {
        if (f.id === id) {
          addActivity('delete', f.name, `You deleted: ${f.name}`);
          return { ...f, deleted: true, updatedAt: new Date().toISOString() };
        }
        return f;
      })
    );
  }, [addActivity]);

  const restoreFile = useCallback((id: string) => {
    setFiles(prev =>
      prev.map(f => {
        if (f.id === id) {
          addActivity('restore', f.name, `You restored: ${f.name}`);
          return { ...f, deleted: false, updatedAt: new Date().toISOString() };
        }
        return f;
      })
    );
  }, [addActivity]);

  const deletePermanently = useCallback((id: string) => {
    setFiles(prev => {
      const fileToDelete = prev.find(f => f.id === id);
      if (fileToDelete) {
        addActivity('delete', fileToDelete.name, `Permanently deleted: ${fileToDelete.name}`);
      }
      return prev.filter(f => f.id !== id);
    });
  }, [addActivity]);

  const shareFile = useCallback((id: string, emails: string[]) => {
    setFiles(prev =>
      prev.map(f => {
        if (f.id === id) {
          addActivity('share', f.name, `Shared ${f.name} with ${emails.join(', ')}`);
          return {
            ...f,
            sharedWith: Array.from(new Set([...(f.sharedWith || []), ...emails])),
            updatedAt: new Date().toISOString(),
          };
        }
        return f;
      })
    );
  }, [addActivity]);

  const moveFile = useCallback((id: string, targetFolderId: string | null) => {
    setFiles(prev =>
      prev.map(f => {
        if (f.id === id) {
          addActivity('upload', f.name, `Moved ${f.name} to new location`);
          return {
            ...f,
            parentFolderId: targetFolderId,
            updatedAt: new Date().toISOString(),
          };
        }
        return f;
      })
    );
  }, [addActivity]);

  // Breadcrumbs calculation
  const currentFolderBreadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'My Files' }];
    if (!activeFolderId) return crumbs;

    const path: { id: string | null; name: string }[] = [];
    let currentId: string | null = activeFolderId;
    let safetyCounter = 0; // prevent infinite loop

    while (currentId && safetyCounter < 10) {
      safetyCounter++;
      const folder = files.find(f => f.id === currentId && f.type === 'folder');
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentFolderId;
      } else {
        break;
      }
    }

    return [...crumbs, ...path];
  }, [activeFolderId, files]);

  const contextValue = useMemo(() => ({
    currentSection,
    setCurrentSection,
    activeFolderId,
    setActiveFolderId,
    files,
    activities,
    searchQuery,
    setSearchQuery,
    storageStats,
    uploadFile,
    createFolder,
    toggleStar,
    deleteFile,
    restoreFile,
    deletePermanently,
    shareFile,
    moveFile,
    activeModal,
    setActiveModal,
    selectedFileId,
    setSelectedFileId,
    theme,
    toggleTheme,
    isSidebarCollapsed,
    toggleSidebar,
    viewMode,
    setViewMode,
    currentFolderBreadcrumbs,
  }), [
    currentSection,
    setCurrentSection,
    activeFolderId,
    setActiveFolderId,
    files,
    activities,
    searchQuery,
    setSearchQuery,
    storageStats,
    uploadFile,
    createFolder,
    toggleStar,
    deleteFile,
    restoreFile,
    deletePermanently,
    shareFile,
    moveFile,
    activeModal,
    setActiveModal,
    selectedFileId,
    setSelectedFileId,
    theme,
    toggleTheme,
    isSidebarCollapsed,
    toggleSidebar,
    viewMode,
    setViewMode,
    currentFolderBreadcrumbs,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      <ToastProvider>
        <UploadProvider>
          {children}
        </UploadProvider>
      </ToastProvider>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
