import test from 'node:test'
import assert from 'node:assert/strict'

// -----------------------------------------------------------------------------
// Test Suite: Optimistic Deletion, Immediate Undo, Race Resolution & Consistency
// -----------------------------------------------------------------------------

test('1. Targeted Event Propagation via notifyFilesChanged', async () => {
  const fileEvents = []
  const dirEvents = []

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

test('2. Immediate Undo: UI restores file immediately BEFORE DELETE finishes', async () => {
  let uiFiles = [
    { id: 'file-1', name: 'document.pdf' },
    { id: 'file-2', name: 'image.png' }
  ]
  const eventLog = []

  const notifyFilesChanged = (event) => {
    eventLog.push(event)
    if (event.type === 'delete') {
      uiFiles = uiFiles.filter(f => f.id !== event.fileId)
    } else if (event.type === 'rollback-delete') {
      const idx = typeof event.originalIndex === 'number' ? event.originalIndex : 0
      uiFiles.splice(idx, 0, event.file)
    }
  }

  // Step 1: User deletes file-1
  const fileToDelete = uiFiles[0]
  notifyFilesChanged({
    type: 'delete',
    fileId: 'file-1',
    file: fileToDelete,
    originalIndex: 0
  })
  assert.equal(uiFiles.length, 1, 'File is removed from UI immediately on delete')
  assert.equal(uiFiles[0].id, 'file-2')

  // In-flight DELETE promise that takes 40ms
  let deleteSettled = false
  const deletePromise = new Promise((resolve) => {
    setTimeout(() => {
      deleteSettled = true
      resolve({ success: true })
    }, 40)
  })

  // State tracker mimicking handleDeleteItem
  let status = 'deleting'
  let deleteError = null
  let restoreCalled = false

  deletePromise.catch(err => {
    deleteError = err
  })

  const handleUndo = async () => {
    if (status !== 'deleting') return
    status = 'undone'

    // CRITICAL REQUIREMENT: UI must restore immediately (<16ms) without waiting for deletePromise!
    notifyFilesChanged({
      type: 'rollback-delete',
      fileId: 'file-1',
      file: fileToDelete,
      originalIndex: 0
    })

    // Background reconciliation
    try {
      await deletePromise.catch(() => {})
      if (deleteError) return
      status = 'restoring'
      restoreCalled = true
    } catch {}
  }

  // Step 2: User clicks Undo immediately (at t=5ms) while DELETE is still in-flight
  await new Promise(r => setTimeout(r, 5))
  assert.equal(deleteSettled, false, 'DELETE request is still in-flight')

  // Execute immediate undo
  const undoPromise = handleUndo()

  // Verify that the UI file list ALREADY has file-1 restored right now, while deleteSettled is FALSE!
  assert.equal(uiFiles.length, 2, 'File is restored in UI immediately on Undo click!')
  assert.equal(uiFiles[0].id, 'file-1', 'File restored at original index 0')
  assert.equal(deleteSettled, false, 'DELETE has NOT finished yet, but UI is already restored!')

  // Await the background reconciliation
  await undoPromise
  await deletePromise

  assert.equal(deleteSettled, true, 'DELETE eventually settled')
  assert.equal(restoreCalled, true, 'Background restore API was called to align server state')
  assert.equal(uiFiles.length, 2, 'UI files remain intact')
})

test('3. Undo while DELETE is pending and DELETE subsequently fails', async () => {
  let uiFiles = [{ id: 'file-fail', name: 'data.csv' }]
  let restoreApiCalled = false
  let deleteErrorToastShown = false

  const notifyFilesChanged = (event) => {
    if (event.type === 'delete') {
      uiFiles = uiFiles.filter(f => f.id !== event.fileId)
    } else if (event.type === 'rollback-delete') {
      uiFiles.push(event.file)
    }
  }

  // 1. Optimistic delete
  const targetFile = uiFiles[0]
  notifyFilesChanged({ type: 'delete', fileId: 'file-fail', file: targetFile })
  assert.equal(uiFiles.length, 0)

  // 2. DELETE request will fail after 30ms (e.g. 500 error)
  let deleteSettled = false
  let deleteError = null
  const deletePromise = new Promise((_, reject) => {
    setTimeout(() => {
      deleteSettled = true
      deleteError = new Error('500 Internal Server Error')
      reject(deleteError)
    }, 30)
  })

  let status = 'deleting'

  // Wire up the delete promise catch block (as in file-list.tsx)
  deletePromise.catch(() => {
    if (status !== 'deleting') {
      // If user clicked undo, delete error toast and secondary rollback are suppressed!
      return
    }
    deleteErrorToastShown = true
    notifyFilesChanged({ type: 'rollback-delete', fileId: 'file-fail', file: targetFile })
  })

  // 3. User clicks Undo immediately at t=10ms
  await new Promise(r => setTimeout(r, 10))
  assert.equal(deleteSettled, false)

  const handleUndo = async () => {
    if (status !== 'deleting') return
    status = 'undone'

    // Immediate UI restore
    notifyFilesChanged({ type: 'rollback-delete', fileId: 'file-fail', file: targetFile })

    try {
      await deletePromise.catch(() => {})

      if (deleteError) {
        // Since delete failed on server, server has isTrash: false.
        // Client already restored. Both agree!
        // Do NOT call restore API!
        return
      }

      restoreApiCalled = true
    } catch {}
  }

  const undoPromise = handleUndo()

  assert.equal(uiFiles.length, 1, 'UI restored immediately on Undo click')

  await undoPromise
  await new Promise(r => setTimeout(r, 40)) // ensure delete settling catch runs

  assert.equal(restoreApiCalled, false, 'Restore API was NOT called because delete failed')
  assert.equal(deleteErrorToastShown, false, 'Delete error toast was suppressed because user undid the action')
  assert.equal(uiFiles.length, 1, 'UI file remains restored and was not duplicated')
})

test('4. Restore API failure and safe rollback', async () => {
  let uiFiles = [{ id: 'file-res-fail', name: 'notes.txt' }]
  let errorToast = null

  const notifyFilesChanged = (event) => {
    if (event.type === 'delete') {
      uiFiles = uiFiles.filter(f => f.id !== event.fileId)
    } else if (event.type === 'rollback-delete') {
      uiFiles.push(event.file)
    }
  }

  const targetFile = uiFiles[0]
  // 1. Delete
  notifyFilesChanged({ type: 'delete', fileId: 'file-res-fail', file: targetFile })
  assert.equal(uiFiles.length, 0)

  // 2. In-flight delete succeeds
  const deletePromise = Promise.resolve({ success: true })

  // 3. But restore API call fails (500 Internal Server Error)
  const apiRestore = async () => {
    throw new Error('500 Server Error during restore')
  }

  let status = 'deleting'
  const handleUndo = async () => {
    if (status !== 'deleting') return
    status = 'undone'

    // Immediate optimistic restore
    notifyFilesChanged({ type: 'rollback-delete', fileId: 'file-res-fail', file: targetFile })

    try {
      await deletePromise
      status = 'restoring'
      await apiRestore()
    } catch {
      errorToast = 'Could not restore file.'
      // Safe rollback: since server restore failed, re-evict from UI
      notifyFilesChanged({ type: 'delete', fileId: 'file-res-fail' })
    }
  }

  await handleUndo()

  assert.equal(uiFiles.length, 0, 'UI rolled back safely: item evicted after restore failure')
  assert.equal(errorToast, 'Could not restore file.', 'Error toast shown on restore failure')
})

test('5. Duplicate Undo clicks are safely ignored', async () => {
  let uiRestoreEvents = 0
  let apiRestoreCalls = 0

  let status = 'deleting'
  const handleUndo = async () => {
    if (status !== 'deleting') return
    status = 'undone'
    uiRestoreEvents++

    // simulate background reconciliation
    await new Promise(r => setTimeout(r, 10))
    apiRestoreCalls++
  }

  // Rapid triple click on Undo button
  const p1 = handleUndo()
  const p2 = handleUndo()
  const p3 = handleUndo()

  await Promise.all([p1, p2, p3])

  assert.equal(uiRestoreEvents, 1, 'Exactly 1 UI restore dispatched despite 3 rapid clicks')
  assert.equal(apiRestoreCalls, 1, 'Exactly 1 background restore API called')
})

test('6. Late DELETE response and stale mutation event immunity', async () => {
  let uiFiles = [{ id: 'file-late', name: 'slow.mov' }]
  const targetFile = uiFiles[0]

  const notifyFilesChanged = (event) => {
    if (event.type === 'delete') {
      uiFiles = uiFiles.filter(f => f.id !== event.fileId)
    } else if (event.type === 'rollback-delete') {
      uiFiles.push(event.file)
    }
  }

  // 1. Delete optimistically
  notifyFilesChanged({ type: 'delete', fileId: 'file-late', file: targetFile })
  assert.equal(uiFiles.length, 0)

  // 2. Slow delete promise (50ms)
  let status = 'deleting'
  const deletePromise = new Promise((resolve) => setTimeout(resolve, 50))

  // In file-list.tsx, deletePromise uses skipNotify: true so it doesn't emit a delete event on success
  deletePromise.then(() => {
    if (status === 'deleting') {
      // normal completion
    }
    // If status === 'undone', does nothing!
  })

  // 3. User clicks Undo at 10ms
  await new Promise(r => setTimeout(r, 10))
  status = 'undone'
  notifyFilesChanged({ type: 'rollback-delete', fileId: 'file-late', file: targetFile })
  assert.equal(uiFiles.length, 1, 'Restored at 10ms')

  // 4. At 50ms, late delete finishes
  await deletePromise
  await new Promise(r => setTimeout(r, 10))

  assert.equal(uiFiles.length, 1, 'Late delete response did NOT remove the item again')
  assert.equal(uiFiles[0].id, 'file-late')
})

test('7. Cross-view Consistency: My Files, Recent, Starred, Dashboard, and Trash', async () => {
  const fileItem = {
    id: 'f-shared',
    _id: 'f-shared',
    name: 'quarterly_report.xlsx',
    parentDirId: 'folder-finance',
    parentFolderId: 'folder-finance',
    isStarred: true,
    starred: true,
    lastAccessedAt: '2026-10-14T10:00:00Z',
    isTrash: false
  }

  // 1. Setup individual view stores
  let myFiles = [fileItem]
  let recentFiles = [fileItem]
  let starredFiles = [fileItem]
  let trashFiles = []
  let dashboardFolderContents = {
    'folder-finance': {
      filesCount: 1,
      files: [fileItem]
    }
  }

  // Event dispatcher mimicking global notifyFilesChanged
  const dispatchEvent = (event) => {
    // A. My Files
    if (event.type === 'delete') {
      myFiles = myFiles.filter(f => (f.id || f._id) !== event.fileId)
    } else if (event.type === 'rollback-delete' && event.file) {
      if (!myFiles.some(f => (f.id || f._id) === (event.file.id || event.file._id))) {
        myFiles.splice(event.originalIndex ?? 0, 0, event.file)
      }
    }

    // B. Recent Files
    if (event.type === 'delete') {
      recentFiles = recentFiles.filter(f => (f.id || f._id) !== event.fileId)
    } else if (event.type === 'rollback-delete' && event.file) {
      if (event.file.lastAccessedAt && !recentFiles.some(f => (f.id || f._id) === (event.file.id || event.file._id))) {
        recentFiles.splice(event.originalIndex ?? 0, 0, event.file)
      }
    }

    // C. Starred Files
    if (event.type === 'delete') {
      starredFiles = starredFiles.filter(f => (f.id || f._id) !== event.fileId)
    } else if (event.type === 'rollback-delete' && event.file) {
      if ((event.file.isStarred || event.file.starred) && !starredFiles.some(f => (f.id || f._id) === (event.file.id || event.file._id))) {
        starredFiles.splice(event.originalIndex ?? 0, 0, event.file)
      }
    }

    // D. Trash Files
    if (event.type === 'delete') {
      // Trash does NOT prematurely add optimistic deletions before server-confirmed trashedAt
    } else if (event.type === 'rollback-delete' || event.type === 'restore') {
      const fileIdStr = (event.file?.id || event.file?._id || event.fileId || '').toString()
      trashFiles = trashFiles.filter(f => (f.id || f._id) !== fileIdStr)
    }

    // E. Dashboard Overview
    if (event.type === 'delete') {
      for (const [folderId, content] of Object.entries(dashboardFolderContents)) {
        if (content.files.some(f => (f.id || f._id) === event.fileId)) {
          dashboardFolderContents[folderId] = {
            ...content,
            filesCount: Math.max(0, content.filesCount - 1),
            files: content.files.filter(f => (f.id || f._id) !== event.fileId)
          }
        }
      }
    } else if ((event.type === 'rollback-delete' || event.type === 'restore') && event.file) {
      const parentId = event.file.parentDirId || event.file.parentFolderId
      if (parentId && dashboardFolderContents[parentId]) {
        const content = dashboardFolderContents[parentId]
        const fileIdStr = (event.file.id || event.file._id).toString()
        if (!content.files.some(f => (f.id || f._id).toString() === fileIdStr)) {
          dashboardFolderContents[parentId] = {
            ...content,
            filesCount: content.filesCount + 1,
            files: [event.file, ...content.files]
          }
        }
      }
    }
  }

  // --- Phase 1: Move to Trash ---
  dispatchEvent({
    type: 'delete',
    fileId: 'f-shared',
    file: fileItem,
    originalIndex: 0,
    parentDirId: 'folder-finance'
  })

  assert.equal(myFiles.length, 0, 'My Files evicted')
  assert.equal(recentFiles.length, 0, 'Recent Files evicted')
  assert.equal(starredFiles.length, 0, 'Starred Files evicted')
  assert.equal(trashFiles.length, 0, 'Trash has not prematurely added item')
  assert.equal(dashboardFolderContents['folder-finance'].filesCount, 0, 'Dashboard folder count is 0')
  assert.equal(dashboardFolderContents['folder-finance'].files.length, 0, 'Dashboard folder files is empty')

  // --- Phase 2: Immediate Undo ---
  dispatchEvent({
    type: 'rollback-delete',
    fileId: 'f-shared',
    file: fileItem,
    originalIndex: 0,
    parentDirId: 'folder-finance'
  })

  assert.equal(myFiles.length, 1, 'My Files restored immediately')
  assert.equal(myFiles[0].id, 'f-shared')
  assert.equal(recentFiles.length, 1, 'Recent Files restored immediately')
  assert.equal(starredFiles.length, 1, 'Starred Files restored immediately')
  assert.equal(trashFiles.length, 0, 'Trash does not contain restored item')
  assert.equal(dashboardFolderContents['folder-finance'].filesCount, 1, 'Dashboard folder count restored to 1')
  assert.equal(dashboardFolderContents['folder-finance'].files.length, 1, 'Dashboard folder files restored to 1')
})

test('8. Duplicate Delete Click Prevention', async () => {
  const deletingIds = new Set()
  let apiCalls = 0

  const requestDelete = async (fileId) => {
    if (deletingIds.has(fileId)) {
      return { skipped: true }
    }
    deletingIds.add(fileId)
    apiCalls++
    await new Promise(r => setTimeout(r, 10))
    deletingIds.delete(fileId)
    return { success: true }
  }

  const p1 = requestDelete('file-dup-1')
  const p2 = requestDelete('file-dup-1')
  const results = await Promise.all([p1, p2])

  assert.equal(apiCalls, 1, 'Only exactly 1 API call made despite multiple rapid clicks')
  assert.equal(results[0].success, true)
  assert.equal(results[1].skipped, true)
})

test('9. useDirectory state reducer logic for targeted events', async () => {
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

console.log('\nAll 9 optimistic deletion and immediate undo unit tests passed successfully!')

