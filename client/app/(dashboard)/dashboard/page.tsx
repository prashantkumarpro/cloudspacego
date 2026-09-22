'use client'

import React from 'react'
import { useApp } from '@/providers/app-provider'
import { FileList } from '@/features/files/components/file-list'
import { TrashView } from '@/features/trash/components/trash-view'
import { UploadModal } from '@/features/files/components/upload-modal'
import { CreateFolderModal } from '@/features/directory/components/create-folder-modal'
import { ShareModal } from '@/features/sharing/components/share-modal'
import { GetLinkModal } from '@/features/sharing/components/get-link-modal'
import { SearchModal } from '@/features/search/components/search-modal'
import { StorageUpgradeModal } from '@/features/storage/components/storage-upgrade-modal'
import DashboardOverview from '@/features/dashboard/components/dashboard-overview'
import MyFilesView from '@/features/files/components/my-files-view'
import SettingsView from '@/features/settings/components/settings-view'

export default function DashboardPage () {
  const { currentSection, activeModal, setActiveModal } = useApp()

  return (
    <>
      {/* VIEW: Dashboard */}
      {currentSection === 'Dashboard' && <DashboardOverview />}

      {/* VIEW: My Files */}
      {currentSection === 'My Files' && <MyFilesView />}

      {/* VIEW: Shared */}
      {currentSection === 'Shared' && <FileList title='Shared Assets' />}

      {/* VIEW: Recent */}
      {currentSection === 'Recent' && <FileList title='Recent Assets' />}

      {/* VIEW: Starred */}
      {currentSection === 'Starred' && <FileList title='Starred Assets' />}

      {/* VIEW: Trash */}
      {currentSection === 'Trash' && <TrashView />}

      {/* VIEW: Settings */}
      {currentSection === 'Settings' && <SettingsView />}

      {/* Global Dialog Overlays */}
      <UploadModal />
      <CreateFolderModal />
      <ShareModal />
      <GetLinkModal />
      <SearchModal />
      <StorageUpgradeModal
        isOpen={activeModal === 'storage-upgrade'}
        onClose={() => setActiveModal(null)}
      />
    </>
  )
}
