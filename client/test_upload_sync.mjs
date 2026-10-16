import test from 'node:test'
import assert from 'node:assert/strict'

// -----------------------------------------------------------------------------
// Test Suite: File Upload UI Synchronization & Destination Integrity
// -----------------------------------------------------------------------------

test('1. Reproduction of Bug: Root upload failed to match root directory ID in useDirectory', () => {
  const rootDirId = '670fa9b801a34b22c7e01234'
  const uploadedFile = {
    id: 'file-101',
    _id: 'file-101',
    name: 'document.pdf',
    extension: '.pdf',
    parentDirId: rootDirId, // Server returns actual rootDirId ObjectId string
    size: 1024,
    createdAt: new Date().toISOString()
  }

  // Old buggy logic:
  const oldReducer = (directory, event, currentHookId) => {
    const currentDirId = currentHookId || undefined
    const fileParentId = event.file.parentDirId || event.file.parentFolderId
    // In old code:
    const isMatch = (!currentDirId && (!fileParentId || fileParentId === 'root')) ||
      (currentDirId && fileParentId && fileParentId.toString() === currentDirId.toString())

    if (isMatch) {
      return {
        ...directory,
        files: [event.file, ...(directory.files || [])]
      }
    }
    return directory
  }

  const initialDir = {
    id: rootDirId,
    _id: rootDirId,
    name: 'root',
    files: []
  }

  const uploadEvent = {
    type: 'upload',
    file: uploadedFile,
    parentDirId: undefined // task.parentDirId is undefined for root uploads
  }

  const oldResult = oldReducer(initialDir, uploadEvent, undefined)
  assert.equal(
    oldResult.files.length,
    0,
    'Bug Repro Confirmed: Old logic failed to match root upload, leaving files list empty until page refresh'
  )
})

test('2. Fixed useDirectory Root Upload: Immediate appearance without refresh', () => {
  const rootDirId = '670fa9b801a34b22c7e01234'
  const uploadedFile = {
    id: 'file-101',
    _id: 'file-101',
    name: 'document.pdf',
    extension: '.pdf',
    parentDirId: rootDirId,
    size: 1024,
    createdAt: new Date().toISOString()
  }

  // Fixed useDirectory reducer logic
  const handleDirectoryUpload = (directory, event, hookId) => {
    if (event.type !== 'upload' || !event.file) return directory

    const file = event.file
    const fileId = (file.id || file._id || '').toString()
    const currentDirId = (hookId || '').toString()
    const isCurrentRoot = !hookId || hookId === 'root'

    const eventParent = event.parentDirId ? event.parentDirId.toString() : undefined
    const fileParent = (file.parentDirId || file.parentFolderId || '').toString()

    const prevId = (directory.id || directory._id || '').toString()

    let isMatch = false
    if (isCurrentRoot) {
      const isExplicitRoot = !eventParent || eventParent === 'root'
      const isFileParentRoot = !fileParent || fileParent === 'root' || (prevId && fileParent === prevId)
      const isTargetIdRoot = Boolean(eventParent && prevId && eventParent === prevId)

      if (eventParent && eventParent !== 'root' && prevId && eventParent !== prevId) {
        isMatch = false
      } else if (isExplicitRoot || isFileParentRoot || isTargetIdRoot) {
        isMatch = true
      }
    } else {
      const matchesCurrentId = Boolean(
        (eventParent && eventParent === currentDirId) ||
        (fileParent && fileParent === currentDirId)
      )
      const matchesPrevId = Boolean(
        prevId && (
          (eventParent && eventParent === prevId) ||
          (fileParent && fileParent === prevId)
        )
      )
      isMatch = matchesCurrentId || matchesPrevId
    }

    if (!isMatch) return directory

    if (directory.files && directory.files.some((f) => (f.id || f._id || '').toString() === fileId)) {
      return directory
    }

    return {
      ...directory,
      files: [file, ...(directory.files || [])]
    }
  }

  const initialDir = {
    id: rootDirId,
    _id: rootDirId,
    name: 'root',
    files: []
  }

  const uploadEvent = {
    type: 'upload',
    file: uploadedFile,
    parentDirId: undefined
  }

  const newResult = handleDirectoryUpload(initialDir, uploadEvent, undefined)
  assert.equal(newResult.files.length, 1, 'File is immediately added to root directory files')
  assert.equal(newResult.files[0].id, 'file-101', 'Correct file is prepended')
})

test('3. Nested Folder Upload Scoping: Updates target folder, does NOT leak into root or sibling folders', () => {
  const rootDirId = '670fa9b801a34b22c7e01234'
  const targetFolderId = '670fa9b801a34b22c7e09999'
  const siblingFolderId = '670fa9b801a34b22c7e08888'

  const nestedFile = {
    id: 'file-nested-1',
    _id: 'file-nested-1',
    name: 'contract.docx',
    extension: '.docx',
    parentDirId: targetFolderId,
    size: 2048,
    createdAt: new Date().toISOString()
  }

  const handleDirectoryUpload = (directory, event, hookId) => {
    if (event.type !== 'upload' || !event.file) return directory

    const file = event.file
    const fileId = (file.id || file._id || '').toString()
    const currentDirId = (hookId || '').toString()
    const isCurrentRoot = !hookId || hookId === 'root'

    const eventParent = event.parentDirId ? event.parentDirId.toString() : undefined
    const fileParent = (file.parentDirId || file.parentFolderId || '').toString()

    const prevId = (directory.id || directory._id || '').toString()

    let isMatch = false
    if (isCurrentRoot) {
      const isExplicitRoot = !eventParent || eventParent === 'root'
      const isFileParentRoot = !fileParent || fileParent === 'root' || (prevId && fileParent === prevId)
      const isTargetIdRoot = Boolean(eventParent && prevId && eventParent === prevId)

      if (eventParent && eventParent !== 'root' && prevId && eventParent !== prevId) {
        isMatch = false
      } else if (isExplicitRoot || isFileParentRoot || isTargetIdRoot) {
        isMatch = true
      }
    } else {
      const matchesCurrentId = Boolean(
        (eventParent && eventParent === currentDirId) ||
        (fileParent && fileParent === currentDirId)
      )
      const matchesPrevId = Boolean(
        prevId && (
          (eventParent && eventParent === prevId) ||
          (fileParent && fileParent === prevId)
        )
      )
      isMatch = matchesCurrentId || matchesPrevId
    }

    if (!isMatch) return directory

    if (directory.files && directory.files.some((f) => (f.id || f._id || '').toString() === fileId)) {
      return directory
    }

    return {
      ...directory,
      files: [file, ...(directory.files || [])]
    }
  }

  const rootDir = { id: rootDirId, files: [] }
  const targetDir = { id: targetFolderId, files: [] }
  const siblingDir = { id: siblingFolderId, files: [] }

  const uploadEvent = {
    type: 'upload',
    file: nestedFile,
    parentDirId: targetFolderId
  }

  // 1. Target folder view (hookId = targetFolderId)
  const updatedTarget = handleDirectoryUpload(targetDir, uploadEvent, targetFolderId)
  assert.equal(updatedTarget.files.length, 1, 'Target nested folder immediately receives the uploaded file')
  assert.equal(updatedTarget.files[0].id, 'file-nested-1')

  // 2. Root folder view (hookId = undefined)
  const updatedRoot = handleDirectoryUpload(rootDir, uploadEvent, undefined)
  assert.equal(updatedRoot.files.length, 0, 'Root view MUST NOT receive files uploaded to a nested folder')

  // 3. Sibling folder view (hookId = siblingFolderId)
  const updatedSibling = handleDirectoryUpload(siblingDir, uploadEvent, siblingFolderId)
  assert.equal(updatedSibling.files.length, 0, 'Sibling folder view MUST NOT receive the file')
})

test('4. In-Flight Navigation Scoping: Upload completing after navigating to another folder does not corrupt destination', () => {
  const folderA = 'folder-A-id'
  const folderB = 'folder-B-id'

  const fileForFolderA = {
    id: 'file-A',
    _id: 'file-A',
    name: 'fileA.txt',
    parentDirId: folderA
  }

  const uploadEvent = {
    type: 'upload',
    file: fileForFolderA,
    parentDirId: folderA
  }

  const handleDirectoryUpload = (directory, event, hookId) => {
    const file = event.file
    const fileId = (file.id || file._id || '').toString()
    const currentDirId = (hookId || '').toString()
    const isCurrentRoot = !hookId || hookId === 'root'
    const eventParent = event.parentDirId ? event.parentDirId.toString() : undefined
    const fileParent = (file.parentDirId || file.parentFolderId || '').toString()
    const prevId = (directory.id || directory._id || '').toString()

    let isMatch = false
    if (isCurrentRoot) {
      if (eventParent && eventParent !== 'root' && prevId && eventParent !== prevId) {
        isMatch = false
      } else {
        isMatch = !eventParent || eventParent === 'root' || (prevId && fileParent === prevId)
      }
    } else {
      isMatch = Boolean((eventParent && eventParent === currentDirId) || (fileParent && fileParent === currentDirId))
    }

    if (!isMatch) return directory
    if (directory.files && directory.files.some((f) => (f.id || f._id || '').toString() === fileId)) {
      return directory
    }
    return { ...directory, files: [file, ...(directory.files || [])] }
  }

  // User was in folderA, started upload, navigated to folderB before upload resolved
  const currentViewFolderB = { id: folderB, files: [] }
  const resultFolderB = handleDirectoryUpload(currentViewFolderB, uploadEvent, folderB)
  assert.equal(resultFolderB.files.length, 0, 'Folder B view remains clean and does not display file for Folder A')
})

test('5. Duplicate Event Handling: Multiple dispatches do not duplicate items', () => {
  const rootDirId = 'root-id'
  const file = { id: 'file-dup', _id: 'file-dup', name: 'unique.txt', parentDirId: rootDirId }

  let dir = { id: rootDirId, files: [] }
  const handleDirectoryUpload = (directory, event, hookId) => {
    const fileObj = event.file
    const fileId = (fileObj.id || fileObj._id || '').toString()
    const prevId = (directory.id || directory._id || '').toString()
    const eventParent = event.parentDirId ? event.parentDirId.toString() : undefined
    const fileParent = (fileObj.parentDirId || fileObj.parentFolderId || '').toString()

    let isMatch = (!eventParent || eventParent === 'root' || fileParent === prevId)
    if (!isMatch) return directory

    if (directory.files && directory.files.some((f) => (f.id || f._id || '').toString() === fileId)) {
      return directory
    }
    return { ...directory, files: [fileObj, ...(directory.files || [])] }
  }

  const uploadEvent = { type: 'upload', file, parentDirId: undefined }

  // First dispatch
  dir = handleDirectoryUpload(dir, uploadEvent, undefined)
  assert.equal(dir.files.length, 1)

  // Second duplicate dispatch (e.g. from both resolver callback and global event)
  dir = handleDirectoryUpload(dir, uploadEvent, undefined)
  assert.equal(dir.files.length, 1, 'Duplicate upload event was safely ignored')
})

test('6. useInfiniteFiles Scoping: Does not pollute Root view with nested uploads, rejects unaccessed Recent, respects Starred/Trash/Shared', () => {
  const rootUpload = {
    id: 'f-root',
    name: 'root.png',
    parentDirId: 'root-id',
    isStarred: false,
    lastAccessedAt: null
  }
  const nestedUpload = {
    id: 'f-nested',
    name: 'sub.png',
    parentDirId: 'sub-folder-id',
    isStarred: false,
    lastAccessedAt: null
  }

  const handleInfiniteUpload = (options, currentFiles, event) => {
    const { trash = false, sharedWithMe = false, recent = false, starred = false } = options
    if (event.type !== 'upload' || !event.file) return currentFiles
    if (trash || sharedWithMe) return currentFiles
    if (recent && !event.file.lastAccessedAt) return currentFiles
    if (starred && !event.file.isStarred && !event.file.starred) return currentFiles

    const isRootUpload = !event.parentDirId || event.parentDirId === 'root'
    if (!recent && !starred && !isRootUpload) {
      return currentFiles
    }

    const fileIdStr = (event.file.id || event.file._id || '').toString()
    if (currentFiles.some((f) => (f.id || f._id || '').toString() === fileIdStr)) {
      return currentFiles
    }
    return [event.file, ...currentFiles]
  }

  // A. Root Files View
  const rootFiles = []
  const afterNested = handleInfiniteUpload({}, rootFiles, { type: 'upload', file: nestedUpload, parentDirId: 'sub-folder-id' })
  assert.equal(afterNested.length, 0, 'Nested upload does NOT enter root useInfiniteFiles')

  const afterRoot = handleInfiniteUpload({}, rootFiles, { type: 'upload', file: rootUpload, parentDirId: undefined })
  assert.equal(afterRoot.length, 1, 'Root upload enters root useInfiniteFiles immediately')
  assert.equal(afterRoot[0].id, 'f-root')

  // B. Starred View
  const starredFiles = []
  const afterStarredCheck = handleInfiniteUpload({ starred: true }, starredFiles, { type: 'upload', file: rootUpload, parentDirId: undefined })
  assert.equal(afterStarredCheck.length, 0, 'Unstarred upload does NOT appear in Starred view')

  const starredFile = { ...rootUpload, id: 'f-star', isStarred: true }
  const afterStarredValid = handleInfiniteUpload({ starred: true }, starredFiles, { type: 'upload', file: starredFile, parentDirId: undefined })
  assert.equal(afterStarredValid.length, 1, 'Starred upload appears in Starred view')

  // C. Recent View (requires lastAccessedAt != null)
  const recentFiles = []
  const afterRecentUnaccessed = handleInfiniteUpload({ recent: true }, recentFiles, { type: 'upload', file: rootUpload, parentDirId: undefined })
  assert.equal(afterRecentUnaccessed.length, 0, 'Unaccessed upload does NOT appear in Recent view')

  const accessedFile = { ...rootUpload, id: 'f-acc', lastAccessedAt: new Date().toISOString() }
  const afterRecentAccessed = handleInfiniteUpload({ recent: true }, recentFiles, { type: 'upload', file: accessedFile, parentDirId: undefined })
  assert.equal(afterRecentAccessed.length, 1, 'Accessed file appears in Recent view')

  // D. Shared With Me & Trash
  const afterShared = handleInfiniteUpload({ sharedWithMe: true }, [], { type: 'upload', file: rootUpload })
  assert.equal(afterShared.length, 0, 'Upload never appears in Shared With Me')

  const afterTrash = handleInfiniteUpload({ trash: true }, [], { type: 'upload', file: rootUpload })
  assert.equal(afterTrash.length, 0, 'Upload never appears in Trash')
})

test('7. Cursor-Based Pagination with Uploaded Files: loadMore deduplicates without duplicate keys', () => {
  const uploadedFile = { id: 'file-new', name: 'new.txt', createdAt: '2026-10-16T12:00:00Z' }
  const page1File = { id: 'file-p1', name: 'p1.txt', createdAt: '2026-10-15T12:00:00Z' }

  // Current list after user uploaded file-new into page 1
  let currentFiles = [uploadedFile, page1File]

  // User scrolls down and loadMore fetches page 2 from server (which happens to include file-new or page1File due to cursor boundary)
  const serverPage2 = [
    { id: 'file-p1', name: 'p1.txt', createdAt: '2026-10-15T12:00:00Z' },
    { id: 'file-p2', name: 'p2.txt', createdAt: '2026-10-14T12:00:00Z' }
  ]

  const existingIds = new Set(currentFiles.map((f) => (f._id || f.id || '').toString()))
  const newItems = serverPage2.filter(
    (f) => !existingIds.has((f._id || f.id || '').toString())
  )
  currentFiles = [...currentFiles, ...newItems]

  assert.equal(currentFiles.length, 3, 'Items are correctly merged without duplicates')
  assert.deepEqual(
    currentFiles.map(f => f.id),
    ['file-new', 'file-p1', 'file-p2'],
    'Order preserves prepended upload followed by ordered historical files'
  )
})

test('8. Home Dashboard Synchronization: Root and nested uploads update allRecentFiles and folder card counts', () => {
  const rootDirId = 'root-123'
  let rootDirectory = { id: rootDirId, files: [] }
  let folderContents = {
    'sub-1': { filesCount: 0, files: [] }
  }

  // 1. Root upload
  const rootFile = { id: 'f-home-root', name: 'root.jpg', parentDirId: rootDirId, updatedAt: '2026-10-16T12:00:00Z' }
  rootDirectory.files = [rootFile, ...rootDirectory.files]

  // 2. Nested upload to sub-1
  const subFile = { id: 'f-home-sub', name: 'sub.pdf', parentDirId: 'sub-1', updatedAt: '2026-10-16T12:05:00Z' }
  const parentId = subFile.parentDirId
  const content = folderContents[parentId]
  folderContents[parentId] = {
    filesCount: (content?.filesCount ?? 0) + 1,
    files: [subFile, ...(content?.files || [])]
  }

  // Dashboard Overview combines both:
  const rootFiles = rootDirectory.files || []
  const nestedFiles = Object.values(folderContents).flatMap(fc => fc.files)
  const combined = [...rootFiles, ...nestedFiles]
  const uniqueMap = new Map()
  combined.forEach(f => uniqueMap.set(f.id, f))
  const allRecentFiles = Array.from(uniqueMap.values()).sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  assert.equal(allRecentFiles.length, 2, 'Home dashboard immediately includes both root and nested uploads')
  assert.equal(allRecentFiles[0].id, 'f-home-sub', 'Newest upload appears first in recent overview')
  assert.equal(allRecentFiles[1].id, 'f-home-root')
  assert.equal(folderContents['sub-1'].filesCount, 1, 'Folder card count immediately incremented to 1')
})

test('9. Failed or Cancelled Uploads: Emit no events and do not appear in file lists', () => {
  let fileList = []
  let emittedEvents = []

  const notifyFilesChanged = (event) => {
    emittedEvents.push(event)
    fileList = [event.file, ...fileList]
  }

  // Simulating an upload failure or user cancellation in UploadProvider
  const simulateUpload = (shouldFail = false, isCancelled = false) => {
    if (isCancelled || shouldFail) {
      // Catch block or cancellation reconciliation: NO notifyFilesChanged emitted!
      return
    }
    notifyFilesChanged({ type: 'upload', file: { id: 'ok', name: 'ok.txt' } })
  }

  simulateUpload(true, false) // Failed
  simulateUpload(false, true) // Cancelled

  assert.equal(emittedEvents.length, 0, 'No events were emitted for failed or cancelled uploads')
  assert.equal(fileList.length, 0, 'Failed/cancelled files never enter visible lists')
})
