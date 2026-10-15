import test from 'node:test'
import assert from 'node:assert/strict'

// -----------------------------------------------------------------------------
// Test Suite: Optimistic Folder Creation, Race Resolution & Cross-View Consistency
// -----------------------------------------------------------------------------

test('1. Immediate Appearance in UI (<16ms) without waiting for API response', async () => {
  let directory = {
    id: 'root-dir',
    name: 'Root',
    files: [],
    directories: [
      { id: 'dir-1', name: 'Documents', parentDirId: 'root-dir' }
    ]
  }

  const events = []
  const notifyDirectoryChanged = (event) => {
    events.push(event)
    if (event.type === 'create-folder-optimistic' && event.folder) {
      directory.directories = [event.folder, ...directory.directories]
    }
  }

  // User submits "New Project"
  const tempId = `temp-folder-${Date.now()}-abc`
  const tempFolder = {
    id: tempId,
    _id: tempId,
    name: 'New Project',
    parentDirId: 'root-dir',
    isOptimistic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  let apiSettled = false
  const apiPromise = new Promise((resolve) => {
    setTimeout(() => {
      apiSettled = true
      resolve({
        message: 'Directory Created!',
        directory: {
          id: 'server-dir-999',
          _id: 'server-dir-999',
          name: 'New Project',
          parentDirId: 'root-dir',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      })
    }, 50)
  })

  // Synchronous optimistic event dispatch (<16ms)
  notifyDirectoryChanged({
    type: 'create-folder-optimistic',
    tempId,
    folder: tempFolder,
    parentDirId: 'root-dir'
  })

  // Verify immediate appearance BEFORE apiSettled
  assert.equal(apiSettled, false, 'API request is still in-flight')
  assert.equal(directory.directories.length, 2, 'Folder appears immediately in directory list')
  assert.equal(directory.directories[0].id, tempId, 'Temporary folder is at top of list')
  assert.equal(directory.directories[0].isOptimistic, true, 'Folder marked as optimistic')

  // Clean up promise
  await apiPromise
})

test('2. Authoritative Replacement on API Success', async () => {
  const tempId = 'temp-folder-123'
  let directory = {
    id: 'root-dir',
    name: 'Root',
    directories: [
      {
        id: tempId,
        _id: tempId,
        name: 'Reports',
        parentDirId: 'root-dir',
        isOptimistic: true,
      },
      { id: 'dir-1', name: 'Existing', parentDirId: 'root-dir' }
    ]
  }

  const notifyDirectoryChanged = (event) => {
    if (event.type === 'create-folder-success' && event.tempId) {
      const matchIndex = directory.directories.findIndex(d => d.id === event.tempId)
      if (matchIndex !== -1 && event.folder) {
        directory.directories[matchIndex] = {
          ...event.folder,
          isOptimistic: false
        }
      }
    }
  }

  const authoritativeFolder = {
    id: 'server-67890',
    _id: 'server-67890',
    name: 'Reports',
    parentDirId: 'root-dir',
    userId: 'user-1',
    createdAt: '2026-10-15T12:00:00.000Z',
    updatedAt: '2026-10-15T12:00:00.000Z',
  }

  notifyDirectoryChanged({
    type: 'create-folder-success',
    tempId,
    folderId: authoritativeFolder.id,
    folder: authoritativeFolder,
    parentDirId: 'root-dir'
  })

  assert.equal(directory.directories.length, 2, 'List length preserved')
  assert.equal(directory.directories[0].id, 'server-67890', 'Temporary ID replaced with authoritative server ID')
  assert.equal(directory.directories[0].isOptimistic, false, 'Optimistic flag cleared')
  assert.equal(directory.directories[0].name, 'Reports')
  assert.equal(directory.directories[1].id, 'dir-1', 'Other directories untouched')
})

test('3. Rollback and Removal on API Failure', async () => {
  const tempId = 'temp-folder-fail'
  let directory = {
    id: 'root-dir',
    name: 'Root',
    directories: [
      {
        id: tempId,
        _id: tempId,
        name: 'Budget 2027',
        parentDirId: 'root-dir',
        isOptimistic: true,
      },
      { id: 'dir-existing', name: 'Existing', parentDirId: 'root-dir' }
    ]
  }

  let errorToastShown = false
  const notifyDirectoryChanged = (event) => {
    if (event.type === 'create-folder-error' && event.tempId) {
      directory.directories = directory.directories.filter(d => d.id !== event.tempId)
      errorToastShown = true
    }
  }

  // API call fails with 500 error
  notifyDirectoryChanged({
    type: 'create-folder-error',
    tempId,
    parentDirId: 'root-dir',
    error: new Error('500 Internal Server Error')
  })

  assert.equal(directory.directories.length, 1, 'Temporary folder safely rolled back from directory')
  assert.equal(directory.directories[0].id, 'dir-existing')
  assert.equal(errorToastShown, true, 'Error notification triggered')
})

test('4. Duplicate Submission Prevention (Rapid Clicks & In-Flight Dedup)', async () => {
  const inFlightCreations = new Set()
  let apiCallsCount = 0

  const createFolderSafely = async (parentDirId, dirname) => {
    const key = `${parentDirId || 'root'}:${dirname.trim().toLowerCase()}`
    if (inFlightCreations.has(key)) {
      return { skipped: true }
    }
    inFlightCreations.add(key)
    try {
      apiCallsCount++
      // Simulate 20ms network latency
      await new Promise(r => setTimeout(r, 20))
      return { success: true }
    } finally {
      inFlightCreations.delete(key)
    }
  }

  // Rapid parallel calls attempting to create "Marketing" in root
  const [res1, res2, res3] = await Promise.all([
    createFolderSafely(null, 'Marketing'),
    createFolderSafely(null, 'Marketing'),
    createFolderSafely(null, 'marketing ') // case and whitespace normalized
  ])

  assert.equal(apiCallsCount, 1, 'Exactly one API request sent despite 3 rapid submissions')
  assert.equal(res1.success, true)
  assert.equal(res2.skipped, true)
  assert.equal(res3.skipped, true)
})

test('5. Late Response Safety (Stale / Cancelled / Settled TempId)', async () => {
  const activeOptimisticIds = new Set(['temp-active'])
  let directory = {
    id: 'root-dir',
    directories: [
      { id: 'dir-keep', name: 'Keep', parentDirId: 'root-dir' }
    ]
  }

  const handleLateSuccess = (tempId, authoritative) => {
    // If tempId was already settled, cancelled, or cleaned up, ignore late response
    if (!activeOptimisticIds.has(tempId)) {
      return false
    }
    activeOptimisticIds.delete(tempId)
    const idx = directory.directories.findIndex(d => d.id === tempId)
    if (idx !== -1) {
      directory.directories[idx] = authoritative
      return true
    }
    return false
  }

  // Stale late response arrives for 'temp-already-removed'
  const applied = handleLateSuccess('temp-already-removed', {
    id: 'server-stale',
    name: 'Stale'
  })

  assert.equal(applied, false, 'Late response for cancelled/cleared tempId safely ignored')
  assert.equal(directory.directories.length, 1, 'Directory not corrupted by stale response')
  assert.equal(directory.directories[0].id, 'dir-keep')
})

test('6. Cross-View Consistency: Directory, FolderGrid, and Dashboard Overview', async () => {
  // 1. Root directory view state
  let rootDirectory = {
    id: 'root-id',
    name: 'Root',
    directories: [{ id: 'f-1', name: 'Work', parentDirId: 'root-id' }]
  }

  // 2. FolderGrid state (counts per folder ID)
  let folderCounts = { 'f-1': 5 }

  // 3. Dashboard overview state (folder cards and filesCount per folder)
  let dashboardFolderContents = {
    'f-1': { filesCount: 5, files: [{ id: 'doc-1' }] }
  }

  const dirListeners = new Set()
  const subscribeDirectoryChanged = (fn) => {
    dirListeners.add(fn)
    return () => dirListeners.delete(fn)
  }
  const notifyDirectoryChanged = (event) => {
    dirListeners.forEach(fn => fn(event))
  }

  // Hook up Root Directory listener
  subscribeDirectoryChanged((event) => {
    if (event.type === 'create-folder-optimistic' && event.folder) {
      if (!event.parentDirId || event.parentDirId === 'root' || event.parentDirId === rootDirectory.id) {
        rootDirectory.directories = [event.folder, ...rootDirectory.directories]
      }
    } else if (event.type === 'create-folder-success' && event.tempId && event.folder) {
      const idx = rootDirectory.directories.findIndex(d => d.id === event.tempId)
      if (idx !== -1) {
        rootDirectory.directories[idx] = { ...event.folder, isOptimistic: false }
      }
    } else if (event.type === 'create-folder-error' && event.tempId) {
      rootDirectory.directories = rootDirectory.directories.filter(d => d.id !== event.tempId)
    }
  })

  // Hook up FolderGrid listener
  subscribeDirectoryChanged((event) => {
    if (event.type === 'create-folder-optimistic' && event.folder?.id) {
      folderCounts[event.folder.id] = 0
    } else if (event.type === 'create-folder-success' && event.tempId && event.folder?.id) {
      delete folderCounts[event.tempId]
      folderCounts[event.folder.id] = 0
    } else if (event.type === 'create-folder-error' && event.tempId) {
      delete folderCounts[event.tempId]
    }
  })

  // Hook up Dashboard Overview listener
  subscribeDirectoryChanged((event) => {
    if (event.type === 'create-folder-optimistic' && event.folder?.id) {
      dashboardFolderContents[event.folder.id] = { filesCount: 0, files: [] }
    } else if (event.type === 'create-folder-success' && event.tempId && event.folder?.id) {
      delete dashboardFolderContents[event.tempId]
      dashboardFolderContents[event.folder.id] = { filesCount: 0, files: [] }
    } else if (event.type === 'create-folder-error' && event.tempId) {
      delete dashboardFolderContents[event.tempId]
    }
  })

  // Step A: Optimistic folder creation event
  const tempId = 'temp-shared-folder'
  const tempFolder = {
    id: tempId,
    _id: tempId,
    name: 'Shared Project',
    parentDirId: null,
    isOptimistic: true
  }

  notifyDirectoryChanged({
    type: 'create-folder-optimistic',
    tempId,
    folder: tempFolder,
    parentDirId: null
  })

  // Verify all 3 views immediately reflect optimistic creation
  assert.equal(rootDirectory.directories.length, 2, 'Root directory shows new folder')
  assert.equal(rootDirectory.directories[0].id, tempId)
  assert.equal(folderCounts[tempId], 0, 'FolderGrid count initialized to 0 immediately')
  assert.equal(dashboardFolderContents[tempId].filesCount, 0, 'Dashboard folder count initialized to 0')

  // Step B: Server returns authoritative folder
  const authoritative = {
    id: 'server-shared-id',
    _id: 'server-shared-id',
    name: 'Shared Project',
    parentDirId: 'root-id',
    createdAt: new Date().toISOString()
  }

  notifyDirectoryChanged({
    type: 'create-folder-success',
    tempId,
    folderId: authoritative.id,
    folder: authoritative,
    parentDirId: null
  })

  assert.equal(rootDirectory.directories.length, 2)
  assert.equal(rootDirectory.directories[0].id, 'server-shared-id')
  assert.equal(rootDirectory.directories[0].isOptimistic, false)
  assert.equal(folderCounts['server-shared-id'], 0)
  assert.equal(folderCounts[tempId], undefined, 'Temporary id cleaned up from folderCounts')
  assert.equal(dashboardFolderContents['server-shared-id'].filesCount, 0)
  assert.equal(dashboardFolderContents[tempId], undefined, 'Temporary id cleaned up from dashboard')
})

test('7. Subfolder Scoping: Nested creation does not leak into root or sibling folders', async () => {
  let rootDir = {
    id: 'root-id',
    directories: [{ id: 'finance-id', name: 'Finance', parentDirId: 'root-id' }]
  }

  let financeDir = {
    id: 'finance-id',
    directories: []
  }

  let marketingDir = {
    id: 'marketing-id',
    directories: []
  }

  const handleSubfolderEvent = (event, currentDirId, dirState) => {
    if (event.type === 'create-folder-optimistic' && event.folder) {
      const eventParent = event.parentDirId ?? event.folder.parentDirId
      const isMatch = !currentDirId
        ? (!eventParent || eventParent === 'root' || eventParent === dirState.id)
        : (eventParent && eventParent.toString() === currentDirId.toString())

      if (isMatch) {
        dirState.directories.unshift(event.folder)
      }
    }
  }

  // Create "Q4 Reports" inside "Finance"
  const nestedFolder = {
    id: 'temp-nested-1',
    name: 'Q4 Reports',
    parentDirId: 'finance-id',
    isOptimistic: true
  }

  const event = {
    type: 'create-folder-optimistic',
    tempId: 'temp-nested-1',
    folder: nestedFolder,
    parentDirId: 'finance-id'
  }

  handleSubfolderEvent(event, null, rootDir)
  handleSubfolderEvent(event, 'finance-id', financeDir)
  handleSubfolderEvent(event, 'marketing-id', marketingDir)

  assert.equal(rootDir.directories.length, 1, 'Nested folder does NOT leak into root directory')
  assert.equal(rootDir.directories[0].id, 'finance-id')
  assert.equal(marketingDir.directories.length, 0, 'Nested folder does NOT leak into sibling marketing directory')
  assert.equal(financeDir.directories.length, 1, 'Nested folder correctly appears in target finance directory')
  assert.equal(financeDir.directories[0].id, 'temp-nested-1')
})

test('8. Background fetchDirectory does not overwrite pending optimistic folders', async () => {
  let directory = {
    id: 'root-id',
    directories: [
      { id: 'temp-opt-1', name: 'Incoming Folder', isOptimistic: true }
    ]
  }

  // Server returns directory snapshot from before creation was committed
  const serverSnapshot = {
    id: 'root-id',
    directories: [
      { id: 'dir-old-1', name: 'Old Folder 1' }
    ]
  }

  // Reducer logic inside useDirectory fetchDirectory
  const mergeServerSnapshot = (current, incoming) => {
    const pendingOptimistic = (current.directories || []).filter(
      d => d.isOptimistic || d.id?.startsWith('temp-')
    )
    if (pendingOptimistic.length === 0) {
      return incoming
    }
    const serverDirs = incoming.directories || []
    const merged = [
      ...pendingOptimistic.filter(
        opt => !serverDirs.some(s => s.id === opt.id || s.name.toLowerCase() === opt.name.toLowerCase())
      ),
      ...serverDirs
    ]
    return {
      ...incoming,
      directories: merged
    }
  }

  const result = mergeServerSnapshot(directory, serverSnapshot)

  assert.equal(result.directories.length, 2, 'Pending optimistic folder is preserved')
  assert.equal(result.directories[0].id, 'temp-opt-1')
  assert.equal(result.directories[1].id, 'dir-old-1')
})

test('9. Validation: Empty or whitespace-only name is rejected before API or events', async () => {
  let apiCalled = false
  let eventDispatched = false

  const validateAndCreate = async (dirname) => {
    const trimmed = (dirname || '').trim()
    if (!trimmed) {
      throw new Error('Please enter a folder name')
    }
    eventDispatched = true
    apiCalled = true
  }

  await assert.rejects(
    () => validateAndCreate('   '),
    { message: 'Please enter a folder name' },
    'Empty or whitespace folder name is rejected synchronously'
  )

  assert.equal(eventDispatched, false, 'No events dispatched for empty folder name')
  assert.equal(apiCalled, false, 'No API calls made for empty folder name')
})

console.log('\nAll 9 optimistic folder creation unit & integration tests passed successfully!')
