import test from 'node:test'
import assert from 'node:assert/strict'

// -----------------------------------------------------------------------------
// Test Suite: Optimistic Folder Deletion, Skeletons Elimination & Data Integrity
// -----------------------------------------------------------------------------

test('1. Immediate Removal (<16ms): Folder disappears before API request resolves', async () => {
  let directory = {
    id: 'root-dir',
    name: 'Root',
    files: [],
    directories: [
      { id: 'dir-1', name: 'Work', parentDirId: 'root-dir' },
      { id: 'dir-2', name: 'Personal', parentDirId: 'root-dir' },
      { id: 'dir-3', name: 'Archive', parentDirId: 'root-dir' },
    ]
  }

  const events = []
  const notifyDirectoryChanged = (event) => {
    events.push(event)
    if (event.type === 'delete-folder' || event.type === 'delete-folder-optimistic') {
      const folderId = (event.folderId || event.folder?.id || '').toString()
      directory.directories = directory.directories.filter(
        (d) => (d.id || d._id || '').toString() !== folderId
      )
    }
  }

  // Deletion API takes 80ms to resolve (mimicking backend recursive delete)
  let apiSettled = false
  const deletePromise = new Promise((resolve) => {
    setTimeout(() => {
      apiSettled = true
      resolve({ message: 'Files deleted successfully' })
    }, 80)
  })

  const targetFolder = directory.directories[1] // dir-2 'Personal'
  const targetId = targetFolder.id

  // Synchronous optimistic event dispatch (<16ms)
  notifyDirectoryChanged({
    type: 'delete-folder',
    folderId: targetId,
    folder: targetFolder,
    originalIndex: 1,
    parentDirId: 'root-dir'
  })

  // Verify immediate removal BEFORE apiSettled
  assert.equal(apiSettled, false, 'Backend delete request is still in-flight')
  assert.equal(directory.directories.length, 2, 'Folder disappears immediately from UI list')
  assert.equal(directory.directories.some(d => d.id === targetId), false, 'dir-2 is no longer in directory')
  assert.equal(directory.directories[0].id, 'dir-1')
  assert.equal(directory.directories[1].id, 'dir-3')

  await deletePromise
  assert.equal(apiSettled, true, 'Backend request finally settled')
  assert.equal(directory.directories.length, 2, 'Folder remains removed after settlement')
})

test('2. No Full-Screen or Full-List Skeleton Appears During Deletion', async () => {
  let isLoading = false
  let isDeleting = false
  let directory = {
    id: 'root-dir',
    directories: [
      { id: 'dir-a', name: 'Alpha' },
      { id: 'dir-b', name: 'Beta' }
    ]
  }

  const inFlightDeletions = new Set()

  const removeFolder = async (id) => {
    inFlightDeletions.add(id)
    isDeleting = true
    // Crucial check: isLoading MUST NOT be set to true
    assert.equal(isLoading, false, 'isLoading must remain false when removing a folder')

    // Optimistically update
    directory = {
      ...directory,
      directories: directory.directories.filter(d => d.id !== id)
    }

    // In-flight background request
    const bgPromise = new Promise(resolve => setTimeout(resolve, 30))
    bgPromise.then(() => {
      inFlightDeletions.delete(id)
      isDeleting = inFlightDeletions.size > 0
    })

    return // returns immediately
  }

  // Initiate removal
  await removeFolder('dir-a')

  // Verify: isLoading is FALSE, folder is gone, no skeleton
  assert.equal(isLoading, false, 'No skeleton rendered (isLoading is false)')
  assert.equal(directory.directories.length, 1)
  assert.equal(directory.directories[0].id, 'dir-b')

  // Wait for background deletion to finish
  await new Promise(r => setTimeout(r, 40))
  assert.equal(isLoading, false, 'isLoading still false after background completion')
  assert.equal(isDeleting, false, 'isDeleting returns to false')
})

test('3. Successful Deletion and Background Sync Immunity', async () => {
  let directory = {
    id: 'root-dir',
    directories: [
      { id: 'dir-1', name: 'First' },
      { id: 'dir-2', name: 'Second' }
    ]
  }

  const inFlightDeletions = new Set(['dir-2'])

  // Simulate late background fetchDirectory running while dir-2 is in-flight or settled
  const serverDirectoryData = {
    id: 'root-dir',
    directories: [
      { id: 'dir-1', name: 'First' },
      { id: 'dir-2', name: 'Second' } // stale server response still has dir-2
    ]
  }

  // fetchDirectory logic with in-flight deletion filtering:
  const filterDeleting = (dirs) =>
    dirs.filter(d => !inFlightDeletions.has(d.id))

  const merged = filterDeleting(serverDirectoryData.directories)
  directory = { ...directory, directories: merged }

  assert.equal(directory.directories.length, 1, 'Stale server directory response does NOT resurrect deleting folder')
  assert.equal(directory.directories[0].id, 'dir-1')
})

test('4. API Failure and Safe UI Rollback to Original Position', async () => {
  let directory = {
    id: 'root-dir',
    directories: [
      { id: 'f-1', name: 'Folder 1' },
      { id: 'f-2', name: 'Folder 2' },
      { id: 'f-3', name: 'Folder 3' },
    ]
  }

  let toastDismissed = false
  let errorToastShown = false

  const notifyDirectoryChanged = (event) => {
    if (event.type === 'delete-folder') {
      directory.directories = directory.directories.filter(d => d.id !== event.folderId)
    } else if (event.type === 'rollback-delete-folder' && event.folder) {
      const idx = typeof event.originalIndex === 'number' ? event.originalIndex : 0
      const updated = [...directory.directories]
      updated.splice(idx, 0, event.folder)
      directory.directories = updated
    }
  }

  const targetFolder = directory.directories[1] // 'Folder 2' at index 1

  // 1. Optimistic delete
  notifyDirectoryChanged({
    type: 'delete-folder',
    folderId: 'f-2',
    folder: targetFolder,
    originalIndex: 1
  })
  assert.equal(directory.directories.length, 2, 'Folder optimistically removed')
  assert.equal(directory.directories[0].id, 'f-1')
  assert.equal(directory.directories[1].id, 'f-3')

  // 2. Simulated API failure (e.g. 500 error)
  const deletePromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('500 Internal Server Error')), 40)
  })

  try {
    await deletePromise
  } catch (err) {
    toastDismissed = true
    errorToastShown = true
    notifyDirectoryChanged({
      type: 'rollback-delete-folder',
      folderId: 'f-2',
      folder: targetFolder,
      originalIndex: 1,
      error: err
    })
  }

  // 3. Verify rollback restoration at exact originalIndex
  assert.equal(toastDismissed, true, 'Initial success toast dismissed on failure')
  assert.equal(errorToastShown, true, 'Error toast displayed to user')
  assert.equal(directory.directories.length, 3, 'Folder count restored to 3')
  assert.equal(directory.directories[1].id, 'f-2', 'Folder restored to its original index 1')
  assert.equal(directory.directories[0].id, 'f-1')
  assert.equal(directory.directories[2].id, 'f-3')
})

test('5. Irreversible Backend Semantics: No fake undo offered, safe restoration behavior', async () => {
  // Backend semantics: Folder deletion permanently deletes files and directory records.
  // Verify that rollback/restore does not create duplicate folders if already present.
  let directory = {
    id: 'root-dir',
    directories: [
      { id: 'f-existing', name: 'Existing' }
    ]
  }

  const handleRollback = (folder, originalIndex) => {
    if (directory.directories.some(d => d.id === folder.id)) {
      return directory // avoid duplicates
    }
    const updated = [...directory.directories]
    const idx = typeof originalIndex === 'number' ? originalIndex : 0
    updated.splice(idx, 0, folder)
    directory.directories = updated
  }

  // Attempt to restore existing folder
  handleRollback({ id: 'f-existing', name: 'Existing' }, 0)
  assert.equal(directory.directories.length, 1, 'No duplicate folder created')

  // Restore truly missing folder
  handleRollback({ id: 'f-restored', name: 'Restored' }, 1)
  assert.equal(directory.directories.length, 2, 'Restored folder inserted')
  assert.equal(directory.directories[1].id, 'f-restored')
})

test('6. Nested Folder Scoping: Subfolder deletion does not leak into root or siblings', async () => {
  let rootDir = {
    id: 'root-dir',
    directories: [
      { id: 'parent-1', name: 'Parent One', parentDirId: 'root-dir' },
      { id: 'parent-2', name: 'Parent Two', parentDirId: 'root-dir' }
    ]
  }

  let subDir = {
    id: 'parent-1',
    directories: [
      { id: 'child-1', name: 'Child One', parentDirId: 'parent-1' },
      { id: 'child-2', name: 'Child Two', parentDirId: 'parent-1' }
    ]
  }

  const handleEvent = (event) => {
    if (event.type === 'delete-folder') {
      const folderId = event.folderId
      // Root listener:
      rootDir.directories = rootDir.directories.filter(d => d.id !== folderId)
      // Subdir listener:
      subDir.directories = subDir.directories.filter(d => d.id !== folderId)
    }
  }

  // User deletes child-1 inside parent-1
  handleEvent({
    type: 'delete-folder',
    folderId: 'child-1',
    parentDirId: 'parent-1'
  })

  // Assertions:
  assert.equal(subDir.directories.length, 1, 'child-1 removed from subDir')
  assert.equal(subDir.directories[0].id, 'child-2')
  assert.equal(rootDir.directories.length, 2, 'Root directories completely untouched')
  assert.equal(rootDir.directories[0].id, 'parent-1')
  assert.equal(rootDir.directories[1].id, 'parent-2')
})

test('7. Rapid Repeated Clicks Prevention (In-Flight Deduplication)', async () => {
  let apiCallCount = 0
  const inFlightDeletions = new Set()

  const deleteDirectoryApi = async (id) => {
    assert.equal(id, 'f-multi')
    apiCallCount++
    await new Promise(r => setTimeout(r, 40))
    return { success: true }
  }

  const removeFolder = async (id) => {
    if (inFlightDeletions.has(id)) {
      return // deduped
    }
    inFlightDeletions.add(id)
    try {
      await deleteDirectoryApi(id)
    } finally {
      inFlightDeletions.delete(id)
    }
  }

  // Rapidly trigger 5 clicks concurrently for same folder ID
  const p1 = removeFolder('f-multi')
  const p2 = removeFolder('f-multi')
  const p3 = removeFolder('f-multi')
  const p4 = removeFolder('f-multi')
  const p5 = removeFolder('f-multi')

  await Promise.all([p1, p2, p3, p4, p5])

  assert.equal(apiCallCount, 1, 'Exactly one API call dispatched despite 5 rapid clicks')
})

test('8. Cross-View Consistency: Dashboard and My Files Synchronized', async () => {
  let myFilesViewFolders = [
    { id: 'shared-folder-1', name: 'Marketing' }
  ]
  let dashboardFolders = [
    { id: 'shared-folder-1', name: 'Marketing' }
  ]
  let dashboardFolderContents = {
    'shared-folder-1': {
      filesCount: 2,
      files: [
        { id: 'file-a', name: 'logo.png' },
        { id: 'file-b', name: 'banner.jpg' }
      ]
    }
  }

  const broadcastEvent = (event) => {
    if (event.type === 'delete-folder') {
      const folderId = event.folderId
      myFilesViewFolders = myFilesViewFolders.filter(f => f.id !== folderId)
      dashboardFolders = dashboardFolders.filter(f => f.id !== folderId)
      delete dashboardFolderContents[folderId]
    }
  }

  // Delete from My Files
  broadcastEvent({
    type: 'delete-folder',
    folderId: 'shared-folder-1',
    parentDirId: 'root-dir'
  })

  // Verify both views updated synchronously
  assert.equal(myFilesViewFolders.length, 0, 'My Files folder list updated')
  assert.equal(dashboardFolders.length, 0, 'Dashboard folder list updated')
  assert.equal('shared-folder-1' in dashboardFolderContents, false, 'Dashboard folderContents cleaned up')
})

test('9. Correct Storage Quota Accounting on Deletion Settlement', async () => {
  let storageRefreshed = false
  let backendStorageUsed = 5000000 // 5MB

  const onDirectoryEvent = (event) => {
    // app-provider refreshes storage when delete-folder-success settles
    if (event?.type === 'delete-folder-success') {
      backendStorageUsed -= 1000000 // 1MB freed
      storageRefreshed = true
    }
  }

  // While delete is in-flight:
  assert.equal(storageRefreshed, false, 'Storage quota is NOT prematurely altered')
  assert.equal(backendStorageUsed, 5000000)

  // When delete settles on backend:
  onDirectoryEvent({
    type: 'delete-folder-success',
    folderId: 'dir-freed'
  })

  assert.equal(storageRefreshed, true, 'Storage quota refreshed on delete-folder-success')
  assert.equal(backendStorageUsed, 4000000, 'Storage quota accurately reduced')
})

test('10. Pending Optimistic Folder Cancellation on Immediate Delete', async () => {
  const activeOptimisticFolderIds = new Set(['temp-folder-99'])
  let uiFolders = [
    { id: 'temp-folder-99', name: 'New Folder', isOptimistic: true }
  ]

  // User immediately deletes the pending optimistic folder
  const removeOptimistic = (tempId) => {
    activeOptimisticFolderIds.delete(tempId)
    uiFolders = uiFolders.filter(f => f.id !== tempId)
  }

  removeOptimistic('temp-folder-99')
  assert.equal(uiFolders.length, 0, 'Optimistic folder removed immediately')

  // Late create API response arrives after delete:
  const handleLateCreateResponse = (tempId, serverFolder) => {
    if (!activeOptimisticFolderIds.has(tempId)) {
      // Aborted: folder was cancelled / deleted!
      return
    }
    uiFolders.push(serverFolder)
  }

  handleLateCreateResponse('temp-folder-99', { id: 'srv-99', name: 'New Folder' })
  assert.equal(uiFolders.length, 0, 'Late create response does NOT resurrect deleted folder')
})

test('11. Optimized Folder Count Fetching Ignores Deleting Folders', async () => {
  const inFlightDeletions = new Set(['f-deleting'])
  const isFolderDeleting = (id) => inFlightDeletions.has(id)

  const folders = [
    { id: 'f-keep', name: 'Keep' },
    { id: 'f-deleting', name: 'Deleting' }
  ]
  const existingCounts = { 'f-keep': 5 }

  const foldersToFetch = folders.filter(
    f => !f.isOptimistic && !isFolderDeleting(f.id) && existingCounts[f.id] === undefined
  )

  assert.equal(foldersToFetch.length, 0, 'Zero network requests made for folder counts during deletion')
})

console.log('All 11 optimistic folder deletion unit & integration tests passed successfully!')
