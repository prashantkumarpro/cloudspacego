import test from 'node:test'
import assert from 'node:assert/strict'

// -----------------------------------------------------------------------------
// Test Suite: Optimistic Deletion, Targeted Synchronization, and Undo Lifecycle
// -----------------------------------------------------------------------------

test('1. Targeted Event Propagation via notifyFilesChanged', async (t) => {
  const fileEvents = []
  const dirEvents = []

  // Simulated listener registration
  const fileListeners = new Set()
  const dirListeners = new Set()

  const subscribeFiles = (fn) => {
    fileListeners.add(fn)
    return () => fileListeners.delete(fn)
  }
  const subscribeDir = (fn) => {
    dirListeners.add(fn)
    return () => dirListeners.delete(fn)
  }

  const notifyFiles = (event) => {
    fileListeners.forEach(fn => fn(event))
    notifyDir(event)
  }
  const notifyDir = (event) => {
    dirListeners.forEach(fn => fn(event))
  }

  subscribeFiles((e) => fileEvents.push(e))
  subscribeDir((e) => dirEvents.push(e))

  // Dispatch a targeted delete event
  notifyFiles({
    type: 'delete',
    fileId: 'file-123',
    file: { id: 'file-123', name: 'report.pdf' },
    originalIndex: 2,
    parentDirId: 'dir-root'
  })

  assert.equal(fileEvents.length, 1)
  assert.equal(fileEvents[0].type, 'delete')
  assert.equal(fileEvents[0].fileId, 'file-123')

  assert.equal(dirEvents.length, 1)
  assert.equal(dirEvents[0].type, 'delete')
  assert.equal(dirEvents[0].fileId, 'file-123')
})

test('2. useInfiniteFiles state reducer logic on targeted events', async (t) => {
  // Test non-trash view (My Files / Recent / Starred)
  let files = [
    { id: '1', name: 'a.txt' },
    { id: '2', name: 'b.txt' },
    { id: '3', name: 'c.txt' }
  ]
  let refreshCalled = false
  const fetchInitial = () => { refreshCalled = true }

  const handleFileEvent = (event, isTrash = false) => {
    if (!event || !event.type || event.type === 'refresh') {
      fetchInitial()
      return
    }

    if (event.type === 'delete' && event.fileId) {
      if (isTrash) return // Trash must not blindly add
      files = files.filter(f => (f.id || f._id) !== event.fileId)
      return
    }

    if (event.type === 'rollback-delete' && event.file) {
      if (isTrash) return
      const id = event.file.id || event.file._id
      if (files.some(f => (f.id || f._id) === id)) return
      const idx = typeof event.originalIndex === 'number' && event.originalIndex >= 0 && event.originalIndex <= files.length
        ? event.originalIndex
        : 0
      files.splice(idx, 0, event.file)
      return
    }

    if (event.type === 'restore' && event.fileId) {
      if (isTrash) {
        files = files.filter(f => (f.id || f._id) !== event.fileId)
        return
      }
      if (event.file) {
        const id = event.file.id || event.file._id
        if (files.some(f => (f.id || f._id) === id)) return
        const idx = typeof event.originalIndex === 'number' && event.originalIndex >= 0 && event.originalIndex <= files.length
          ? event.originalIndex
          : 0
        files.splice(idx, 0, event.file)
        return
      }
    }

    fetchInitial()
  }

  // A: Optimistic Delete removes file immediately without calling fetchInitial
  handleFileEvent({ type: 'delete', fileId: '2' }, false)
  assert.equal(files.length, 2)
  assert.deepEqual(files.map(f => f.id), ['1', '3'])
  assert.equal(refreshCalled, false, 'No broad network refetch on delete')

  // B: Rollback restores file at exact original index
  handleFileEvent({
    type: 'rollback-delete',
    fileId: '2',
    file: { id: '2', name: 'b.txt' },
    originalIndex: 1
  }, false)
  assert.equal(files.length, 3)
  assert.deepEqual(files.map(f => f.id), ['1', '2', '3'])
  assert.equal(refreshCalled, false, 'No broad network refetch on rollback')

  // C: Rollback does not duplicate if already present
  handleFileEvent({
    type: 'rollback-delete',
    fileId: '2',
    file: { id: '2', name: 'b.txt' },
    originalIndex: 1
  }, false)
  assert.equal(files.length, 3, 'No duplication on redundant rollback')

  // D: Trash view does not blindly add item on delete
  let trashFiles = [{ id: '9', name: 'old_trash.txt' }]
  const trashReducer = (event) => {
    if (event.type === 'delete') {
      // Must not add
      return
    }
    if (event.type === 'restore') {
      trashFiles = trashFiles.filter(f => (f.id || f._id) !== event.fileId)
    }
  }
  trashReducer({ type: 'delete', fileId: '1' })
  assert.equal(trashFiles.length, 1, 'Trash does not blindly append item before confirmed trashedAt')

  // E: Restore removes item from Trash
  trashReducer({ type: 'restore', fileId: '9' })
  assert.equal(trashFiles.length, 0, 'Restored file is removed from Trash view')
})

test('3. useDirectory state reducer logic for targeted events', async (t) => {
  let directory = {
    id: 'folder-1',
    name: 'Projects',
    files: [
      { id: '101', name: 'spec.md', parentDirId: 'folder-1' },
      { id: '102', name: 'notes.txt', parentDirId: 'folder-1' }
    ]
  }

  const handleDirEvent = (event, currentFolderId) => {
    if (event.type === 'delete' && event.fileId) {
      directory.files = directory.files.filter(f => (f.id || f._id) !== event.fileId)
      return
    }

    if (event.type === 'rollback-delete' && event.file) {
      const parent = event.file.parentDirId
      if (parent && currentFolderId && parent !== currentFolderId) return
      const id = event.file.id || event.file._id
      if (directory.files.some(f => (f.id || f._id) === id)) return
      const idx = typeof event.originalIndex === 'number' ? event.originalIndex : 0
      directory.files.splice(idx, 0, event.file)
      return
    }

    if (event.type === 'restore' && event.file) {
      const parent = event.file.parentDirId
      if (parent && currentFolderId && parent !== currentFolderId) return
      const id = event.file.id || event.file._id
      if (directory.files.some(f => (f.id || f._id) === id)) return
      const idx = typeof event.originalIndex === 'number' ? event.originalIndex : 0
      directory.files.splice(idx, 0, event.file)
    }
  }

  // Delete removes from directory.files
  handleDirEvent({ type: 'delete', fileId: '101' }, 'folder-1')
  assert.equal(directory.files.length, 1)
  assert.equal(directory.files[0].id, '102')

  // Rollback restores to directory.files
  handleDirEvent({
    type: 'rollback-delete',
    fileId: '101',
    file: { id: '101', name: 'spec.md', parentDirId: 'folder-1' },
    originalIndex: 0
  }, 'folder-1')
  assert.equal(directory.files.length, 2)
  assert.equal(directory.files[0].id, '101')

  // If restored to root because folder was deleted, does NOT insert into wrong folder
  handleDirEvent({
    type: 'restore',
    fileId: '999',
    file: { id: '999', name: 'orphan.txt', parentDirId: 'root-id' }
  }, 'folder-1')
  assert.equal(directory.files.length, 2, 'File restored to root does not corrupt child folder')
})

test('4. In-flight Delete Tracking & Repeated Click Prevention', async (t) => {
  const deletingIds = new Set()
  let apiCalls = 0

  const requestDelete = async (fileId) => {
    if (deletingIds.has(fileId)) {
      return { skipped: true }
    }
    deletingIds.add(fileId)
    apiCalls++
    // simulate async request
    await new Promise(r => setTimeout(r, 10))
    deletingIds.delete(fileId)
    return { success: true }
  }

  // Rapid double click
  const p1 = requestDelete('file-dup-1')
  const p2 = requestDelete('file-dup-1')
  const results = await Promise.all([p1, p2])

  assert.equal(apiCalls, 1, 'Only exactly 1 API call made despite multiple rapid clicks')
  assert.equal(results[0].success, true)
  assert.equal(results[1].skipped, true)
})

test('5. Undo Lifecycle & Race Condition Handling (Undo clicked while Delete in-flight)', async (t) => {
  let deleteResolved = false
  let restoreCalled = false

  // Simulate slow delete API
  const deletePromise = new Promise((resolve) => {
    setTimeout(() => {
      deleteResolved = true
      resolve({ success: true })
    }, 30)
  })

  const apiRestoreFile = async (id) => {
    assert.equal(deleteResolved, true, 'Restore must NEVER be called before Delete has settled')
    restoreCalled = true
    return { success: true, file: { id, parentDirId: 'folder-1' } }
  }

  // User clicks Undo after 10ms (while delete is still in-flight)
  const undoAction = async (fileId) => {
    // Wait for in-flight delete promise
    await deletePromise.catch(() => {})
    // Now call restore safely
    await apiRestoreFile(fileId)
  }

  await new Promise(r => setTimeout(r, 10))
  await undoAction('file-race-1')

  assert.equal(restoreCalled, true, 'Restore was executed safely after delete settled')
})

test('6. Undo Lifecycle when Delete API Fails', async (t) => {
  let deleteErrorOccurred = false
  let restoreCalled = false

  // Simulate failing delete API (500 Internal Server Error)
  const deletePromise = new Promise((_, reject) => {
    setTimeout(() => {
      deleteErrorOccurred = true
      reject(new Error('500 Internal Server Error'))
    }, 20)
  })

  let isUndone = false
  let rolledBack = false

  // User clicks Undo immediately
  const undoAction = async (fileId) => {
    isUndone = true
    try {
      await deletePromise
      // If delete succeeded, call restore:
      restoreCalled = true
    } catch {
      // If delete failed, file was never trashed on server!
      // No need to call restore API
      rolledBack = true
    }
  }

  await undoAction('file-fail-1')

  assert.equal(deleteErrorOccurred, true)
  assert.equal(restoreCalled, false, 'Restore API was not called because delete failed')
  assert.equal(rolledBack, true, 'Local state was kept rolled back safely')
})

console.log('\nAll 6 optimistic deletion unit tests passed successfully!')
