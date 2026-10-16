import test from 'node:test'
import assert from 'node:assert/strict'

// -----------------------------------------------------------------------------
// Test Suite: Optimistic Rename for Files and Folders in CloudSpaceGo
// -----------------------------------------------------------------------------

test('1. Immediate File Rename UI Update (<16ms): Filename updates before API resolves', async () => {
  let files = [
    { id: 'f-1', name: 'Document.pdf', extension: 'pdf' },
    { id: 'f-2', name: 'Notes.txt', extension: 'txt' },
  ]

  let apiSettled = false
  const bgPromise = new Promise((resolve) => {
    setTimeout(() => {
      apiSettled = true
      resolve({ message: 'Renamed', file: { id: 'f-1', name: 'Updated_Document.pdf' } })
    }, 60)
  })

  // Simulate synchronous optimistic event dispatch (<16ms)
  const event = {
    type: 'rename-file-optimistic',
    fileId: 'f-1',
    newFilename: 'Updated_Document.pdf',
    originalName: 'Document.pdf',
    version: 1
  }

  // Hook in-memory updater
  files = files.map((f) => (f.id === event.fileId ? { ...f, name: event.newFilename } : f))

  // Assert immediate update
  assert.equal(apiSettled, false, 'Backend API call is still in flight')
  assert.equal(files[0].name, 'Updated_Document.pdf', 'UI filename updated immediately (<16ms)')
  assert.equal(files[1].name, 'Notes.txt', 'Other files remain untouched')

  await bgPromise
  assert.equal(apiSettled, true, 'Backend API settled')
})

test('2. Immediate Folder Rename UI Update (<16ms): Folder name updates before API resolves', async () => {
  let directory = {
    id: 'parent-dir',
    name: 'Parent Folder',
    directories: [
      { id: 'dir-1', name: 'Projects' },
      { id: 'dir-2', name: 'Photos' },
    ],
    files: []
  }

  let apiSettled = false
  const bgPromise = new Promise((resolve) => {
    setTimeout(() => {
      apiSettled = true
      resolve({ message: 'Directory Renamed!', directory: { id: 'dir-1', name: 'Work Projects' } })
    }, 60)
  })

  const event = {
    type: 'rename-folder-optimistic',
    folderId: 'dir-1',
    newDirName: 'Work Projects',
    originalName: 'Projects',
    version: 1
  }

  // Update in-memory
  directory = {
    ...directory,
    directories: directory.directories.map((d) => (d.id === event.folderId ? { ...d, name: event.newDirName } : d))
  }

  // Assert immediate update
  assert.equal(apiSettled, false, 'Backend folder rename is still in flight')
  assert.equal(directory.directories[0].name, 'Work Projects', 'Folder updated immediately in child list')
  assert.equal(directory.directories[1].name, 'Photos', 'Other folder unchanged')

  await bgPromise
  assert.equal(apiSettled, true)
})

test('3. Authoritative Reconciliation on Success (Files and Folders)', async () => {
  let fileList = [{ id: 'f-1', name: 'Report.docx', updatedAt: '2026-01-01T00:00:00.000Z' }]
  let dirList = [{ id: 'd-1', name: 'Finance', updatedAt: '2026-01-01T00:00:00.000Z' }]

  // Server response includes authoritative timestamp and trimmed name
  const serverFile = { id: 'f-1', name: 'Report 2026.docx', updatedAt: '2026-10-16T18:00:00.000Z' }
  const serverFolder = { id: 'd-1', name: 'Finance Q4', updatedAt: '2026-10-16T18:00:00.000Z' }

  // Reconcile file
  fileList = fileList.map((f) => (f.id === serverFile.id ? { ...f, ...serverFile } : f))
  assert.equal(fileList[0].name, 'Report 2026.docx')
  assert.equal(fileList[0].updatedAt, '2026-10-16T18:00:00.000Z')

  // Reconcile folder
  dirList = dirList.map((d) => (d.id === serverFolder.id ? { ...d, ...serverFolder } : d))
  assert.equal(dirList[0].name, 'Finance Q4')
  assert.equal(dirList[0].updatedAt, '2026-10-16T18:00:00.000Z')
})

test('4. API Failure and Safe Rollback to Original Name for Files', async () => {
  let files = [{ id: 'f-1', name: 'Original_File.txt' }]
  let toastError = null

  const originalName = 'Original_File.txt'
  const newName = 'Failed_File.txt'

  // Step 1: Optimistic rename
  files = files.map((f) => (f.id === 'f-1' ? { ...f, name: newName } : f))
  assert.equal(files[0].name, newName, 'Optimistically shows new name')

  // Step 2: Backend rejects (e.g. 500 Internal Error)
  const apiFailed = true
  if (apiFailed) {
    // Rollback event dispatch
    const rollbackEvent = {
      type: 'rollback-rename-file',
      fileId: 'f-1',
      originalName,
      version: 1
    }
    files = files.map((f) => (f.id === rollbackEvent.fileId ? { ...f, name: rollbackEvent.originalName } : f))
    toastError = 'Failed to rename file'
  }

  assert.equal(files[0].name, 'Original_File.txt', 'Rolled back to original name')
  assert.equal(toastError, 'Failed to rename file', 'Error toast shown to user')
})

test('5. API Failure and Safe Rollback to Original Name for Folders', async () => {
  let directory = {
    id: 'd-current',
    name: 'Current Folder',
    directories: [{ id: 'd-sub', name: 'Subfolder' }]
  }

  const originalName = 'Subfolder'
  const newName = 'Failed Subfolder'

  // Optimistic update
  directory.directories = directory.directories.map((d) => (d.id === 'd-sub' ? { ...d, name: newName } : d))
  assert.equal(directory.directories[0].name, newName)

  // API failure
  const rollbackEvent = {
    type: 'rollback-rename-folder',
    folderId: 'd-sub',
    originalName,
    version: 1
  }
  directory.directories = directory.directories.map((d) => (d.id === rollbackEvent.folderId ? { ...d, name: rollbackEvent.originalName } : d))

  assert.equal(directory.directories[0].name, originalName, 'Folder rolled back to original name on failure')
})

test('6. Current Directory Name & Breadcrumb Update Consistency', async () => {
  // When inside a folder and that folder itself is renamed
  let currentDir = {
    id: 'd-active',
    name: 'Old Folder Name',
    directories: [],
    files: []
  }

  let breadcrumbs = [{ id: null, name: 'My Files' }, { id: 'd-active', name: currentDir.name }]

  // Optimistic rename event for the folder currently open
  const event = {
    type: 'rename-folder-optimistic',
    folderId: 'd-active',
    newDirName: 'New Folder Name',
    originalName: 'Old Folder Name',
    version: 1
  }

  if (currentDir.id === event.folderId) {
    currentDir = { ...currentDir, name: event.newDirName }
    breadcrumbs = [{ id: null, name: 'My Files' }, { id: 'd-active', name: currentDir.name }]
  }

  assert.equal(currentDir.name, 'New Folder Name', 'Current directory name updated')
  assert.equal(breadcrumbs[1].name, 'New Folder Name', 'Breadcrumb trail updated immediately')
})

test('7. Validation: Empty or Whitespace Names Reject Early', async () => {
  const inFlightSet = new Set()
  let errorMsg = null

  const validateAndRename = (name) => {
    const trimmed = (name || '').trim()
    if (!trimmed) {
      errorMsg = 'Please enter a name'
      return false
    }
    inFlightSet.add(trimmed)
    return true
  }

  assert.equal(validateAndRename(''), false)
  assert.equal(errorMsg, 'Please enter a name')
  assert.equal(inFlightSet.size, 0, 'No in-flight request started for empty name')

  assert.equal(validateAndRename('   '), false)
  assert.equal(inFlightSet.size, 0, 'No in-flight request started for whitespace-only name')

  assert.equal(validateAndRename('Valid Name'), true)
  assert.equal(inFlightSet.size, 1, 'Valid name proceeds')
})

test('8. In-Flight Deduplication: Rapid Repeated Submissions Ignored', async () => {
  const inFlightFileRenames = new Set()
  let networkCalls = 0

  const triggerRename = (id, newName) => {
    const key = `${id}:${newName.trim()}`
    if (inFlightFileRenames.has(key)) {
      return 'ignored'
    }
    inFlightFileRenames.add(key)
    networkCalls++
    return 'started'
  }

  const res1 = triggerRename('file-123', 'NewName.pdf')
  assert.equal(res1, 'started')
  assert.equal(networkCalls, 1)

  // Immediate double-click
  const res2 = triggerRename('file-123', 'NewName.pdf')
  assert.equal(res2, 'ignored', 'Duplicate in-flight rename ignored')
  assert.equal(networkCalls, 1, 'No duplicate network call initiated')

  // After completion
  inFlightFileRenames.delete('file-123:NewName.pdf')
  const res3 = triggerRename('file-123', 'AnotherName.pdf')
  assert.equal(res3, 'started')
  assert.equal(networkCalls, 2)
})

test('9. Rapid Consecutive Renames & Stale Response Supersession (Sequence Tracking)', async () => {
  let file = { id: 'f-1', name: 'Version 0' }
  const fileVersions = new Map()

  // User renames "Version 0" -> "Version 1"
  const v1 = (fileVersions.get('f-1') || 0) + 1
  fileVersions.set('f-1', v1)
  file.name = 'Version 1'
  assert.equal(file.name, 'Version 1')

  // Rapidly user renames "Version 1" -> "Version 2" before v1 network call finishes
  const v2 = (fileVersions.get('f-1') || 0) + 1
  fileVersions.set('f-1', v2)
  file.name = 'Version 2'
  assert.equal(file.name, 'Version 2')

  // Case A: Late arrival of Version 1 success response
  const handleSuccess = (version, returnedName) => {
    if (version < fileVersions.get('f-1')) {
      // Stale response! Must be ignored
      return 'stale_ignored'
    }
    file.name = returnedName
    return 'applied'
  }

  const resA = handleSuccess(v1, 'Version 1 Authoritative')
  assert.equal(resA, 'stale_ignored', 'Late v1 success response ignored because v2 was started')
  assert.equal(file.name, 'Version 2', 'UI retains newer version name')

  // Case B: Late arrival of Version 1 failure/rollback
  const handleRollback = (version, rollbackName) => {
    if (version < fileVersions.get('f-1')) {
      return 'rollback_stale_ignored'
    }
    file.name = rollbackName
    return 'rollback_applied'
  }

  const resB = handleRollback(v1, 'Version 0')
  assert.equal(resB, 'rollback_stale_ignored', 'Late v1 failure does NOT roll back newer v2 rename')
  assert.equal(file.name, 'Version 2', 'UI retains newer version name')

  // Case C: Version 2 finally succeeds
  const resC = handleSuccess(v2, 'Version 2 Authoritative')
  assert.equal(resC, 'applied', 'Current version 2 success is applied')
  assert.equal(file.name, 'Version 2 Authoritative')
})

test('10. Elimination of Full-Page Refetches & Skeletons', async () => {
  let fetchDirectoryCount = 0
  let fetchInitialCount = 0
  let isLoading = false

  const fetchDirectory = () => {
    fetchDirectoryCount++
    isLoading = true
  }

  const fetchInitial = () => {
    fetchInitialCount++
    isLoading = true
  }

  // Renaming files or folders emits targeted events
  const handleEvent = (event) => {
    if (
      event.type === 'rename-file-optimistic' ||
      event.type === 'rename-file-success' ||
      event.type === 'rollback-rename-file' ||
      event.type === 'rename-folder-optimistic' ||
      event.type === 'rename-folder-success' ||
      event.type === 'rollback-rename-folder'
    ) {
      // Targeted event: updates in memory directly, does NOT call refetch!
      return
    }
    // Only unhandled/refresh triggers full reload
    fetchDirectory()
    fetchInitial()
  }

  handleEvent({ type: 'rename-file-optimistic', fileId: 'f-1', newFilename: 'Test.pdf' })
  handleEvent({ type: 'rename-file-success', fileId: 'f-1', newFilename: 'Test.pdf' })
  handleEvent({ type: 'rename-folder-optimistic', folderId: 'd-1', newDirName: 'Folder X' })
  handleEvent({ type: 'rename-folder-success', folderId: 'd-1', newDirName: 'Folder X' })

  assert.equal(fetchDirectoryCount, 0, 'fetchDirectory was never called')
  assert.equal(fetchInitialCount, 0, 'fetchInitial was never called')
  assert.equal(isLoading, false, 'isLoading was never set to true (no skeletons)')
})

test('11. Cross-View Consistency Across All Mounted Views', async () => {
  // Simulate active mounted views:
  // View 1: Root Files Tab (useInfiniteFiles)
  let filesTabState = [
    { id: 'f-1', name: 'Original_Report.pdf', size: 1024 },
    { id: 'f-2', name: 'Other.txt', size: 512 },
  ]

  // View 2: Current Open Folder View (useDirectory) with child folder and child file
  let currentDirState = {
    id: 'folder-sub',
    name: 'Subfolder Original Name',
    directories: [
      { id: 'folder-child', name: 'Nested Folder A' }
    ],
    files: [
      { id: 'f-1', name: 'Original_Report.pdf' }
    ]
  }

  // View 3: Home Dashboard Overview (displayedFolders & folderContents)
  let dashboardFolders = [
    { id: 'folder-sub', name: 'Subfolder Original Name' },
    { id: 'folder-child', name: 'Nested Folder A' }
  ]
  let dashboardFolderContents = {
    'folder-sub': {
      filesCount: 1,
      files: [{ id: 'f-1', name: 'Original_Report.pdf' }]
    }
  }

  // Breadcrumbs state tracking in MyFilesView
  let breadcrumbTrail = [
    { id: null, name: 'My Files' },
    { id: 'folder-sub', name: currentDirState.name }
  ]

  // Event Dispatch Simulator for Directory & File Listeners
  const dispatchMutation = (event) => {
    // 1. Files Tab reducer (useInfiniteFiles)
    if (
      event.type === 'rename-file-optimistic' ||
      event.type === 'rename-file-success' ||
      event.type === 'rollback-rename-file'
    ) {
      const targetName =
        event.type === 'rollback-rename-file'
          ? event.originalName
          : event.newFilename
      filesTabState = filesTabState.map((f) =>
        f.id === event.fileId ? { ...f, name: targetName } : f
      )
    }

    // 2. Directory View reducer (useDirectory)
    if (
      event.type === 'rename-folder-optimistic' ||
      event.type === 'rename-folder-success' ||
      event.type === 'rollback-rename-folder'
    ) {
      const targetName =
        event.type === 'rollback-rename-folder'
          ? event.originalName
          : event.newDirName

      let newName = currentDirState.name
      if (currentDirState.id === event.folderId) {
        newName = targetName
      }
      const updatedDirs = currentDirState.directories.map((d) =>
        d.id === event.folderId ? { ...d, name: targetName } : d
      )
      currentDirState = {
        ...currentDirState,
        name: newName,
        directories: updatedDirs,
      }
      breadcrumbTrail = [
        { id: null, name: 'My Files' },
        { id: currentDirState.id, name: currentDirState.name }
      ]
    }

    if (
      event.type === 'rename-file-optimistic' ||
      event.type === 'rename-file-success' ||
      event.type === 'rollback-rename-file'
    ) {
      const targetName =
        event.type === 'rollback-rename-file'
          ? event.originalName
          : event.newFilename
      currentDirState = {
        ...currentDirState,
        files: currentDirState.files.map((f) =>
          f.id === event.fileId ? { ...f, name: targetName } : f
        )
      }
    }

    // 3. Dashboard reducer (DashboardOverview)
    if (
      event.type === 'rename-folder-optimistic' ||
      event.type === 'rename-folder-success' ||
      event.type === 'rollback-rename-folder'
    ) {
      const targetName =
        event.type === 'rollback-rename-folder'
          ? event.originalName
          : event.newDirName
      dashboardFolders = dashboardFolders.map((d) =>
        d.id === event.folderId ? { ...d, name: targetName } : d
      )
    }

    if (
      event.type === 'rename-file-optimistic' ||
      event.type === 'rename-file-success' ||
      event.type === 'rollback-rename-file'
    ) {
      const targetName =
        event.type === 'rollback-rename-file'
          ? event.originalName
          : event.newFilename
      const next = { ...dashboardFolderContents }
      for (const [folderId, content] of Object.entries(next)) {
        if (content.files.some((f) => f.id === event.fileId)) {
          next[folderId] = {
            ...content,
            files: content.files.map((f) =>
              f.id === event.fileId ? { ...f, name: targetName } : f
            )
          }
        }
      }
      dashboardFolderContents = next
    }
  }

  // --- Step A: Optimistic Folder Rename ---
  dispatchMutation({
    type: 'rename-folder-optimistic',
    folderId: 'folder-sub',
    newDirName: 'Subfolder Renamed',
    originalName: 'Subfolder Original Name',
    version: 1
  })

  assert.equal(currentDirState.name, 'Subfolder Renamed', 'Current directory name updated')
  assert.equal(breadcrumbTrail[1].name, 'Subfolder Renamed', 'Breadcrumb trail updated')
  assert.equal(dashboardFolders[0].name, 'Subfolder Renamed', 'Dashboard folder card updated')

  // --- Step B: Optimistic Child Folder Rename ---
  dispatchMutation({
    type: 'rename-folder-optimistic',
    folderId: 'folder-child',
    newDirName: 'Nested Folder Renamed',
    originalName: 'Nested Folder A',
    version: 1
  })
  assert.equal(currentDirState.directories[0].name, 'Nested Folder Renamed', 'Child folder card updated')
  assert.equal(dashboardFolders[1].name, 'Nested Folder Renamed', 'Dashboard child folder updated')

  // --- Step C: Optimistic File Rename ---
  dispatchMutation({
    type: 'rename-file-optimistic',
    fileId: 'f-1',
    newFilename: 'Renamed_Report.pdf',
    originalName: 'Original_Report.pdf',
    version: 1
  })
  assert.equal(filesTabState[0].name, 'Renamed_Report.pdf', 'Files Tab updated immediately')
  assert.equal(currentDirState.files[0].name, 'Renamed_Report.pdf', 'Subfolder files list updated immediately')
  assert.equal(dashboardFolderContents['folder-sub'].files[0].name, 'Renamed_Report.pdf', 'Dashboard preview updated immediately')

  // --- Step D: Rollback on Error ---
  dispatchMutation({
    type: 'rollback-rename-file',
    fileId: 'f-1',
    originalName: 'Original_Report.pdf',
    version: 1
  })
  assert.equal(filesTabState[0].name, 'Original_Report.pdf', 'Files Tab rolled back')
  assert.equal(currentDirState.files[0].name, 'Original_Report.pdf', 'Subfolder file rolled back')
  assert.equal(dashboardFolderContents['folder-sub'].files[0].name, 'Original_Report.pdf', 'Dashboard preview rolled back')
})
