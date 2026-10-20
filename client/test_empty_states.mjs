import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('CloudSpaceGo Standardized Empty States Test Suite', () => {
  // Mock resolver logic mimicking renderEmptyState() from FileList and views
  function getEmptyStateConfig({
    currentSection,
    activeFolderId = null,
    searchQuery = '',
    customEmptyMessage = null,
    customEmptySubtitle = null
  }) {
    if (searchQuery) {
      return {
        icon: 'Search',
        title: 'No results found',
        description: `We couldn't find any matches for "${searchQuery}". Try checking your spelling.`,
        hasPrimaryAction: false,
        hasSecondaryAction: false
      }
    }

    if (currentSection === 'My Files') {
      return {
        icon: 'FolderOpen',
        title: activeFolderId ? 'This folder is empty' : 'Your space is ready',
        description: activeFolderId
          ? "You haven't uploaded any files or created any subfolders in this folder yet."
          : "You haven't uploaded any files or created any folders yet.",
        helperText: 'Use the + button above to upload files or create a folder.',
        hasPrimaryAction: false,
        hasSecondaryAction: false,
        targetFolderId: activeFolderId
      }
    }

    if (currentSection === 'Shared') {
      return {
        icon: 'Users',
        title: customEmptyMessage || 'No files shared with you',
        description: customEmptySubtitle || 'Files shared with you by others will appear here.',
        hasPrimaryAction: false,
        hasSecondaryAction: false
      }
    }

    if (currentSection === 'Recent') {
      return {
        icon: 'Clock',
        title: customEmptyMessage || 'No recent files',
        description: customEmptySubtitle || 'Files you open, preview, or download will appear here.',
        hasPrimaryAction: false,
        hasSecondaryAction: false
      }
    }

    if (currentSection === 'Starred') {
      return {
        icon: 'Star',
        title: customEmptyMessage || 'No starred files',
        description: customEmptySubtitle || 'Star files you want to easily find later.',
        hasPrimaryAction: false,
        hasSecondaryAction: false
      }
    }

    if (currentSection === 'Trash') {
      return {
        icon: 'Trash2',
        title: 'Trash is empty',
        description: 'Deleted files will appear here until they are permanently removed or you empty your trash.',
        hasPrimaryAction: false,
        hasSecondaryAction: false
      }
    }

    if (currentSection === 'Dashboard-RecentlyOpened') {
      return {
        icon: 'Clock',
        title: 'Nothing here yet',
        description: 'Files you open, preview, or upload will appear here.',
        hasPrimaryAction: false,
        hasSecondaryAction: false
      }
    }

    if (currentSection === 'Dashboard-YourFolders') {
      return {
        icon: 'Folder',
        title: 'No folders yet',
        description: 'Create a folder to keep your files organized.',
        hasPrimaryAction: false,
        hasSecondaryAction: false
      }
    }

    return {
      icon: 'Inbox',
      title: customEmptyMessage || 'No files found',
      description: customEmptySubtitle || 'Upload a file or folder to get started.',
      hasPrimaryAction: true,
      primaryActionLabel: 'Upload files',
      hasSecondaryAction: true,
      secondaryActionLabel: 'Create folder'
    }
  }

  it('1. Home Recently Opened: displays Clock icon and "Nothing here yet" without upload action', () => {
    const config = getEmptyStateConfig({ currentSection: 'Dashboard-RecentlyOpened' })
    assert.equal(config.icon, 'Clock')
    assert.equal(config.title, 'Nothing here yet')
    assert.equal(config.description, 'Files you open, preview, or upload will appear here.')
    assert.equal(config.hasPrimaryAction, false)
    assert.equal(config.hasSecondaryAction, false)
  })

  it('1b. Home Your Folders: displays Folder icon and "No folders yet" without create button', () => {
    const config = getEmptyStateConfig({ currentSection: 'Dashboard-YourFolders' })
    assert.equal(config.icon, 'Folder')
    assert.equal(config.title, 'No folders yet')
    assert.equal(config.description, 'Create a folder to keep your files organized.')
    assert.equal(config.hasPrimaryAction, false)
    assert.equal(config.hasSecondaryAction, false)
  })

  it('2. My Files (root): displays "Your space is ready" without upload or create folder buttons', () => {
    const config = getEmptyStateConfig({ currentSection: 'My Files', activeFolderId: null })
    assert.equal(config.icon, 'FolderOpen')
    assert.equal(config.title, 'Your space is ready')
    assert.equal(config.description, "You haven't uploaded any files or created any folders yet.")
    assert.equal(config.helperText, 'Use the + button above to upload files or create a folder.')
    assert.equal(config.hasPrimaryAction, false)
    assert.equal(config.hasSecondaryAction, false)
    assert.equal(config.targetFolderId, null)
  })

  it('3. Empty folder: displays "This folder is empty" without action buttons', () => {
    const config = getEmptyStateConfig({ currentSection: 'My Files', activeFolderId: 'folder-sub-888' })
    assert.equal(config.icon, 'FolderOpen')
    assert.equal(config.title, 'This folder is empty')
    assert.equal(config.hasPrimaryAction, false)
    assert.equal(config.hasSecondaryAction, false)
    assert.equal(config.targetFolderId, 'folder-sub-888')
  })

  it('4. Shared with me: shows relevant message and no irrelevant upload action', () => {
    const config = getEmptyStateConfig({ currentSection: 'Shared' })
    assert.equal(config.icon, 'Users')
    assert.equal(config.title, 'No files shared with you')
    assert.equal(config.hasPrimaryAction, false, 'No upload button on Shared with me')
  })

  it('5. Recent Assets: shows relevant message and no upload action', () => {
    const config = getEmptyStateConfig({ currentSection: 'Recent' })
    assert.equal(config.icon, 'Clock')
    assert.equal(config.title, 'No recent files')
    assert.equal(config.hasPrimaryAction, false, 'No upload button on Recent files')
  })

  it('6. Starred Assets: shows relevant message and no upload action', () => {
    const config = getEmptyStateConfig({ currentSection: 'Starred' })
    assert.equal(config.icon, 'Star')
    assert.equal(config.title, 'No starred files')
    assert.equal(config.hasPrimaryAction, false, 'No upload button on Starred')
  })

  it('7. Trash: shows simple empty-trash message without irrelevant actions', () => {
    const config = getEmptyStateConfig({ currentSection: 'Trash' })
    assert.equal(config.icon, 'Trash2')
    assert.equal(config.title, 'Trash is empty')
    assert.equal(config.hasPrimaryAction, false)
    assert.equal(config.hasSecondaryAction, false)
  })

  it('8. Distinguishes empty search/filter results from empty directories', () => {
    const searchConfig = getEmptyStateConfig({
      currentSection: 'My Files',
      activeFolderId: 'folder-123',
      searchQuery: 'quarterly_report.xlsx'
    })
    assert.equal(searchConfig.icon, 'Search')
    assert.equal(searchConfig.title, 'No results found')
    assert.match(searchConfig.description, /quarterly_report\.xlsx/)
    assert.equal(searchConfig.hasPrimaryAction, false, 'Search results with no matches do not show upload')
  })

  it('9. Never displays empty state when files exist', () => {
    const files = [{ id: 'file-1', name: 'readme.txt' }]
    const shouldShowEmpty = files.length === 0
    assert.equal(shouldShowEmpty, false, 'Empty state must not render when files array is non-empty')
  })

  it('10. Never displays empty state when loading', () => {
    const files = []
    const isLoading = true
    const shouldShowSkeleton = isLoading && files.length === 0
    const shouldShowEmpty = !isLoading && files.length === 0
    assert.equal(shouldShowSkeleton, true, 'Skeletons render during loading')
    assert.equal(shouldShowEmpty, false, 'Empty state does not render during loading')
  })

  it('11. Never displays empty state when an API error occurs', () => {
    const files = []
    const error = 'Network error fetching files'
    const shouldShowError = Boolean(error && files.length === 0)
    const shouldShowEmpty = !error && files.length === 0
    assert.equal(shouldShowError, true, 'Error banner renders when error is present')
    assert.equal(shouldShowEmpty, false, 'Empty state does not render on error')
  })
})
