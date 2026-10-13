import 'dotenv/config'
import mongoose from 'mongoose'
import cookieSignature from 'cookie-signature'
import http from 'http'
import fs from 'fs'
import path from 'path'
import User from './models/user.model.js'
import Session from './models/sessionModel.js'
import Directory from './models/directory.model.js'
import File from './models/file.model.js'
import Share from './models/share.model.js'

const COOKIE_SECRET = 'My-cloudeStorage-123$#'
const PORT = process.env.PORT || 4000

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const data = postData !== undefined ? postData : options.body
    const headers = { ...(options.headers || {}) }
    let payload = null

    if (data !== undefined && data !== null) {
      if (typeof data === 'string' || Buffer.isBuffer(data)) {
        payload = data
      } else {
        payload = JSON.stringify(data)
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json'
        }
      }
      if (!headers['Content-Length']) {
        headers['Content-Length'] = Buffer.byteLength(payload)
      }
    }

    const reqOptions = { ...options, port: PORT, host: '127.0.0.1', headers }
    const req = http.request(reqOptions, res => {
      let body = ''
      res.on('data', chunk => (body += chunk))
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
            rawBody: body
          })
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, rawBody: body })
        }
      })
    })

    req.on('error', reject)
    if (payload !== null) {
      req.write(payload)
    }
    req.end()
  })
}

function createSignedCookie(sessionId) {
  const signed = 's:' + cookieSignature.sign(sessionId.toString(), COOKIE_SECRET)
  return `sid=${encodeURIComponent(signed)}`
}

async function uploadFileViaApi({ cookie, parentDirId, filename, content }) {
  const buf = Buffer.from(content)
  const endpoint = parentDirId ? `/file/${parentDirId}` : '/file'

  return makeRequest(
    {
      method: 'POST',
      path: endpoint,
      headers: {
        Cookie: cookie,
        filename,
        'Content-Type': 'text/plain',
        'Content-Length': buf.length
      }
    },
    buf
  )
}

async function runTests() {
  console.log('=== Starting CloudSpaceGo Trash Feature Test Suite ===\n')

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloudspacego', {
    dbName: 'cloudspacego'
  })
  console.log('Connected to MongoDB.\n')

  const timestamp = Date.now()

  // 1. Create User A (Owner)
  const uARoot = new mongoose.Types.ObjectId()
  const uAId = new mongoose.Types.ObjectId()
  const userA = await User.create({
    _id: uAId,
    name: `User A ${timestamp}`,
    email: `usera_${timestamp}@example.com`,
    password: 'password123',
    rootDirId: uARoot,
    storageLimit: 200 * 1024 * 1024,
    storageUsed: 0
  })
  await Directory.create({
    _id: uARoot,
    name: 'root',
    userId: uAId,
    parentDirId: null
  })

  // 2. Create User B (Collaborator / Other User)
  const uBRoot = new mongoose.Types.ObjectId()
  const uBId = new mongoose.Types.ObjectId()
  const userB = await User.create({
    _id: uBId,
    name: `User B ${timestamp}`,
    email: `userb_${timestamp}@example.com`,
    password: 'password123',
    rootDirId: uBRoot,
    storageLimit: 200 * 1024 * 1024,
    storageUsed: 0
  })
  await Directory.create({
    _id: uBRoot,
    name: 'root',
    userId: uBId,
    parentDirId: null
  })

  // 3. Create active sessions
  const sAId = new mongoose.Types.ObjectId()
  await Session.create({
    _id: sAId,
    userId: uAId,
    expiresAt: new Date(Date.now() + 86400000)
  })
  const cookieA = createSignedCookie(sAId)

  const sBId = new mongoose.Types.ObjectId()
  await Session.create({
    _id: sBId,
    userId: uBId,
    expiresAt: new Date(Date.now() + 86400000)
  })
  const cookieB = createSignedCookie(sBId)

  let passedTests = 0
  let failedTests = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`)
      passedTests++
    } else {
      console.error(`  ✗ FAIL: ${message}`)
      failedTests++
    }
  }

  try {
    // ---------------------------------------------------------
    // TEST 1: Initial upload and quota accounting
    // ---------------------------------------------------------
    console.log('[Test 1] Upload files and verify initial storage quota')
    const uploadRes1 = await uploadFileViaApi({
      cookie: cookieA,
      filename: 'file1.txt',
      content: 'Hello World 1 - initial file for trash tests'
    })
    assert(uploadRes1.status === 201, `Uploaded file1.txt (status 201)`)

    const f1Doc = await File.findOne({ name: 'file1.txt', userId: uAId })
    assert(f1Doc !== null, 'file1.txt exists in MongoDB')
    assert(f1Doc.isTrash === false, 'file1.txt has isTrash === false by default')
    assert(f1Doc.trashedAt === null, 'file1.txt has trashedAt === null by default')

    let userADoc = await User.findById(uAId)
    const initialQuota = userADoc.storageUsed
    assert(initialQuota === f1Doc.size, `User A storageUsed is ${initialQuota} bytes (matches file size)`)

    // ---------------------------------------------------------
    // TEST 2: Soft deletion (Move to Trash)
    // ---------------------------------------------------------
    console.log('\n[Test 2] Soft-delete file1.txt to Trash without touching quota or storage')
    const trashRes1 = await makeRequest({
      method: 'DELETE',
      path: `/file/${f1Doc._id}`,
      headers: { Cookie: cookieA }
    })
    assert(trashRes1.status === 200, 'DELETE /file/:id returns 200')
    assert(trashRes1.body?.success === true, 'Response indicates success')
    assert(trashRes1.body?.message === 'File moved to trash', 'Message confirms moved to trash')

    const f1AfterTrash = await File.findById(f1Doc._id)
    assert(f1AfterTrash.isTrash === true, 'file1.txt is marked isTrash === true')
    assert(f1AfterTrash.trashedAt instanceof Date, 'file1.txt trashedAt timestamp is set')

    userADoc = await User.findById(uAId)
    assert(userADoc.storageUsed === initialQuota, 'Storage quota is NOT changed upon soft-deletion')

    // Verify storage file still physically exists
    if (process.env.STORAGE_DRIVER === 'local') {
      const localFilePath = path.resolve('./storage', f1Doc.storageKey)
      assert(fs.existsSync(localFilePath), 'Local storage file still exists in storage directory')
    }

    // ---------------------------------------------------------
    // TEST 3: Exclusion from ordinary listings, recent, starred, and directory
    // ---------------------------------------------------------
    console.log('\n[Test 3] Exclude trashed files from ordinary file listings')
    const listRes = await makeRequest({
      method: 'GET',
      path: '/file',
      headers: { Cookie: cookieA }
    })
    const file1InList = (listRes.body?.data || []).some(f => (f._id || f.id) === f1Doc._id.toString())
    assert(!file1InList, 'file1.txt is NOT returned in GET /file')

    const recentRes = await makeRequest({
      method: 'GET',
      path: '/file/recent',
      headers: { Cookie: cookieA }
    })
    const file1InRecent = (recentRes.body?.data || []).some(f => (f._id || f.id) === f1Doc._id.toString())
    assert(!file1InRecent, 'file1.txt is NOT returned in GET /file/recent')

    const starredRes = await makeRequest({
      method: 'GET',
      path: '/file/starred',
      headers: { Cookie: cookieA }
    })
    const file1InStarred = (starredRes.body?.data || []).some(f => (f._id || f.id) === f1Doc._id.toString())
    assert(!file1InStarred, 'file1.txt is NOT returned in GET /file/starred')

    const dirRes = await makeRequest({
      method: 'GET',
      path: `/directory/${uARoot}`,
      headers: { Cookie: cookieA }
    })
    const file1InDir = (dirRes.body?.files || []).some(f => (f._id || f.id) === f1Doc._id.toString())
    assert(!file1InDir, 'file1.txt is NOT returned in GET /directory/:id')

    // ---------------------------------------------------------
    // TEST 4: Blocked operations on trashed file
    // ---------------------------------------------------------
    console.log('\n[Test 4] Block preview, download, rename, star, access, and share on trashed file')
    const getFileRes = await makeRequest({
      method: 'GET',
      path: `/file/${f1Doc._id}`,
      headers: { Cookie: cookieA }
    })
    assert(getFileRes.status === 404, 'GET /file/:id returns 404 for trashed file (preview blocked)')

    const downloadRes = await makeRequest({
      method: 'GET',
      path: `/file/${f1Doc._id}?action=download`,
      headers: { Cookie: cookieA }
    })
    assert(downloadRes.status === 404, 'GET /file/:id?action=download returns 404 for trashed file')

    const renameRes = await makeRequest(
      {
        method: 'PATCH',
        path: `/file/${f1Doc._id}`,
        headers: { Cookie: cookieA }
      },
      { newFilename: 'renamed.txt' }
    )
    assert(renameRes.status === 404, 'PATCH /file/:id (rename) returns 404 for trashed file')

    const starRes = await makeRequest(
      {
        method: 'PATCH',
        path: `/file/${f1Doc._id}/star`,
        headers: { Cookie: cookieA }
      },
      { isStarred: true }
    )
    assert(starRes.status === 404, 'PATCH /file/:id/star returns 404 for trashed file')

    const accessRes = await makeRequest({
      method: 'PATCH',
      path: `/file/${f1Doc._id}/access`,
      headers: { Cookie: cookieA }
    })
    assert(accessRes.status === 404, 'PATCH /file/:id/access returns 404 for trashed file')

    const shareRes = await makeRequest(
      {
        method: 'POST',
        path: `/file/${f1Doc._id}/share`,
        headers: { Cookie: cookieA }
      },
      { recipientEmail: userB.email, role: 'viewer' }
    )
    assert(shareRes.status === 404, 'POST /file/:id/share returns 404 for trashed file')

    // ---------------------------------------------------------
    // TEST 5: Active share protection & collaborator restrictions
    // ---------------------------------------------------------
    console.log('\n[Test 5] Active share access is blocked while trashed, and restored after un-trashing')
    // Upload file2.txt for User A
    await uploadFileViaApi({
      cookie: cookieA,
      filename: 'file2_shared.txt',
      content: 'Shared File content between User A and User B'
    })
    const f2Doc = await File.findOne({ name: 'file2_shared.txt', userId: uAId })

    // User A shares file2 with User B
    const shareCreateRes = await makeRequest(
      {
        method: 'POST',
        path: `/file/${f2Doc._id}/share`,
        headers: { Cookie: cookieA }
      },
      { recipientEmail: userB.email, role: 'viewer' }
    )
    assert(shareCreateRes.status === 201 || shareCreateRes.status === 200, 'User A shared file2 with User B')

    // Verify User B can see it in shared-with-me
    let sharedWithMeRes = await makeRequest({
      method: 'GET',
      path: '/file/shared-with-me',
      headers: { Cookie: cookieB }
    })
    let file2InShared = (sharedWithMeRes.body?.data || []).some(f => (f._id || f.id) === f2Doc._id.toString())
    assert(file2InShared, 'User B sees file2 in GET /file/shared-with-me')

    // User A soft-deletes file2
    await makeRequest({
      method: 'DELETE',
      path: `/file/${f2Doc._id}`,
      headers: { Cookie: cookieA }
    })

    // Verify User B cannot see or access file2 while it is trashed
    sharedWithMeRes = await makeRequest({
      method: 'GET',
      path: '/file/shared-with-me',
      headers: { Cookie: cookieB }
    })
    file2InShared = (sharedWithMeRes.body?.data || []).some(f => (f._id || f.id) === f2Doc._id.toString())
    assert(!file2InShared, 'User B CANNOT see trashed file2 in GET /file/shared-with-me')

    const userBGetTrashed = await makeRequest({
      method: 'GET',
      path: `/file/${f2Doc._id}`,
      headers: { Cookie: cookieB }
    })
    assert(userBGetTrashed.status === 404, 'User B GET /file/:id returns 404 for trashed shared file')

    // User B tries to restore User A's file -> 403 Forbidden
    const userBRestoreRes = await makeRequest({
      method: 'PATCH',
      path: `/file/${f2Doc._id}/restore`,
      headers: { Cookie: cookieB }
    })
    assert(userBRestoreRes.status === 403, 'User B cannot restore User A file (403 Unauthorized)')

    // User B tries to permanently delete User A's file -> 403 Forbidden
    const userBPermanentRes = await makeRequest({
      method: 'DELETE',
      path: `/file/${f2Doc._id}/permanent`,
      headers: { Cookie: cookieB }
    })
    assert(userBPermanentRes.status === 403, 'User B cannot permanently delete User A file (403 Unauthorized)')

    // ---------------------------------------------------------
    // TEST 6: Trash listing with cursor pagination & user isolation
    // ---------------------------------------------------------
    console.log('\n[Test 6] GET /file/trash listing, cursor pagination, and user isolation')
    // Upload file3 and file4, then trash them with spaced timestamps
    await uploadFileViaApi({
      cookie: cookieA,
      filename: 'file3.txt',
      content: 'file3 content'
    })
    await uploadFileViaApi({
      cookie: cookieA,
      filename: 'file4.txt',
      content: 'file4 content'
    })
    const f3Doc = await File.findOne({ name: 'file3.txt', userId: uAId })
    const f4Doc = await File.findOne({ name: 'file4.txt', userId: uAId })

    await makeRequest({ method: 'DELETE', path: `/file/${f3Doc._id}`, headers: { Cookie: cookieA } })
    await makeRequest({ method: 'DELETE', path: `/file/${f4Doc._id}`, headers: { Cookie: cookieA } })

    // User A fetches first page of trash (limit 2)
    const trashPage1 = await makeRequest({
      method: 'GET',
      path: '/file/trash?limit=2',
      headers: { Cookie: cookieA }
    })
    assert(trashPage1.status === 200, 'GET /file/trash?limit=2 returns 200')
    assert(trashPage1.body?.data?.length === 2, 'Page 1 has 2 items')
    assert(trashPage1.body?.pagination?.hasMore === true, 'Page 1 hasMore === true')
    assert(Boolean(trashPage1.body?.pagination?.nextCursor), 'Page 1 returns nextCursor')

    // User A fetches second page
    const nextCursor = trashPage1.body.pagination.nextCursor
    const trashPage2 = await makeRequest({
      method: 'GET',
      path: `/file/trash?limit=2&cursor=${encodeURIComponent(nextCursor)}`,
      headers: { Cookie: cookieA }
    })
    assert(trashPage2.status === 200, 'GET /file/trash with cursor returns 200')
    assert(trashPage2.body?.data?.length >= 1, 'Page 2 returns remaining trashed items')

    // Verify User isolation: User B has empty trash
    const userBTrashRes = await makeRequest({
      method: 'GET',
      path: '/file/trash',
      headers: { Cookie: cookieB }
    })
    assert(userBTrashRes.body?.data?.length === 0, 'User B sees 0 items in trash (user isolation verified)')

    // ---------------------------------------------------------
    // TEST 7: Restoration (Normal & Missing Parent Folder Fallback)
    // ---------------------------------------------------------
    console.log('\n[Test 7] Restore file to original folder, and verify missing folder fallback')
    // 7A: Restore file2_shared.txt
    const restoreF2Res = await makeRequest({
      method: 'PATCH',
      path: `/file/${f2Doc._id}/restore`,
      headers: { Cookie: cookieA }
    })
    assert(restoreF2Res.status === 200, 'PATCH /file/:id/restore returns 200')
    assert(restoreF2Res.body?.success === true, 'Restore response indicates success')

    const f2Restored = await File.findById(f2Doc._id)
    assert(f2Restored.isTrash === false, 'file2 is marked isTrash === false')
    assert(f2Restored.trashedAt === null, 'file2 trashedAt is reset to null')

    // Verify User B collaborator access is seamlessly restored
    sharedWithMeRes = await makeRequest({
      method: 'GET',
      path: '/file/shared-with-me',
      headers: { Cookie: cookieB }
    })
    file2InShared = (sharedWithMeRes.body?.data || []).some(f => (f._id || f.id) === f2Doc._id.toString())
    assert(file2InShared, 'Collaborator User B can access file2 in Shared With Me again after restore')

    // 7B: Test fallback to rootDirId when original parent folder was deleted
    const tempFolder = await Directory.create({
      name: 'Temp Folder',
      userId: uAId,
      parentDirId: uARoot
    })
    await uploadFileViaApi({
      cookie: cookieA,
      parentDirId: tempFolder._id.toString(),
      filename: 'file_in_temp_folder.txt',
      content: 'nested content'
    })
    const nestedFileDoc = await File.findOne({ name: 'file_in_temp_folder.txt', userId: uAId })

    // Soft delete file
    await makeRequest({ method: 'DELETE', path: `/file/${nestedFileDoc._id}`, headers: { Cookie: cookieA } })

    // Now delete the temp folder directly from DB (simulating folder deletion)
    await Directory.deleteOne({ _id: tempFolder._id })

    // Restore the file whose parent folder is gone
    const restoreNestedRes = await makeRequest({
      method: 'PATCH',
      path: `/file/${nestedFileDoc._id}/restore`,
      headers: { Cookie: cookieA }
    })
    assert(restoreNestedRes.status === 200, 'Restore succeeds even if parent folder was deleted')

    const nestedRestored = await File.findById(nestedFileDoc._id)
    assert(
      nestedRestored.parentDirId.toString() === uARoot.toString(),
      'ParentDirId safely fell back to user rootDirId to prevent orphaned file'
    )

    // ---------------------------------------------------------
    // TEST 8: Permanent deletion and exact storage quota accounting
    // ---------------------------------------------------------
    console.log('\n[Test 8] Permanent deletion, R2 deletion, and exact storage quota decrement')
    const userABeforePermanent = await User.findById(uAId)
    const quotaBeforePermanent = userABeforePermanent.storageUsed
    const f3Size = f3Doc.size

    const permDeleteRes = await makeRequest({
      method: 'DELETE',
      path: `/file/${f3Doc._id}/permanent`,
      headers: { Cookie: cookieA }
    })
    assert(permDeleteRes.status === 200, 'DELETE /file/:id/permanent returns 200')
    assert(permDeleteRes.body?.success === true, 'Permanent deletion response indicates success')

    const f3InDb = await File.findById(f3Doc._id)
    assert(f3InDb === null, 'file3 is completely removed from MongoDB')

    if (process.env.STORAGE_DRIVER === 'local') {
      const f3Path = path.resolve('./storage', f3Doc.storageKey)
      assert(!fs.existsSync(f3Path), 'Storage file was physically removed')
    }

    const userAAfterPermanent = await User.findById(uAId)
    const expectedQuota = quotaBeforePermanent - f3Size
    assert(
      userAAfterPermanent.storageUsed === expectedQuota,
      `User A storageUsed decremented exactly by file size (${quotaBeforePermanent} -> ${userAAfterPermanent.storageUsed})`
    )

    // Retry permanent delete: must 404 and NOT decrement quota again
    const retryPermRes = await makeRequest({
      method: 'DELETE',
      path: `/file/${f3Doc._id}/permanent`,
      headers: { Cookie: cookieA }
    })
    assert(retryPermRes.status === 404, 'Retrying DELETE /file/:id/permanent returns 404')
    const userAAfterRetry = await User.findById(uAId)
    assert(
      userAAfterRetry.storageUsed === expectedQuota,
      'Retry does NOT decrement quota a second time (idempotent / safe)'
    )

    // ---------------------------------------------------------
    // TEST 9: Empty Trash and bulk cleanup
    // ---------------------------------------------------------
    console.log('\n[Test 9] Empty Trash: bulk delete R2 objects, DB records, and update quota')
    const userABeforeEmpty = await User.findById(uAId)
    const trashedBeforeEmpty = await File.find({ userId: uAId, isTrash: true })
    const totalTrashedBytes = trashedBeforeEmpty.reduce((sum, f) => sum + f.size, 0)

    const emptyTrashRes = await makeRequest({
      method: 'DELETE',
      path: '/file/trash/empty',
      headers: { Cookie: cookieA }
    })
    assert(emptyTrashRes.status === 200, 'DELETE /file/trash/empty returns 200')
    assert(emptyTrashRes.body?.success === true, 'Empty Trash response indicates success')
    assert(emptyTrashRes.body?.deletedCount === trashedBeforeEmpty.length, `Deleted all ${trashedBeforeEmpty.length} items`)
    assert(emptyTrashRes.body?.failedCount === 0, 'No failed items reported')

    const trashedAfterEmpty = await File.find({ userId: uAId, isTrash: true })
    assert(trashedAfterEmpty.length === 0, '0 trashed files remain in DB for User A')

    const userAAfterEmpty = await User.findById(uAId)
    assert(
      userAAfterEmpty.storageUsed === userABeforeEmpty.storageUsed - totalTrashedBytes,
      `User A storageUsed accurately decremented by total deleted bytes (${totalTrashedBytes} bytes released)`
    )

    // Calling Empty Trash again when empty
    const emptyTrashAgain = await makeRequest({
      method: 'DELETE',
      path: '/file/trash/empty',
      headers: { Cookie: cookieA }
    })
    assert(emptyTrashAgain.status === 200, 'Empty Trash when already empty returns 200')
    assert(emptyTrashAgain.body?.deletedCount === 0, 'Reported deletedCount === 0')

    console.log('\n=== TEST SUITE SUMMARY ===')
    console.log(`Passed: ${passedTests}`)
    console.log(`Failed: ${failedTests}`)
  } finally {
    // Cleanup test users and test artifacts
    await User.deleteMany({ _id: { $in: [uAId, uBId] } })
    await Directory.deleteMany({ userId: { $in: [uAId, uBId] } })
    await File.deleteMany({ userId: { $in: [uAId, uBId] } })
    await Share.deleteMany({ ownerId: { $in: [uAId, uBId] } })
    await Session.deleteMany({ userId: { $in: [uAId, uBId] } })
    await mongoose.disconnect()
    console.log('Cleaned up test data and disconnected from MongoDB.')
  }

  if (failedTests > 0) {
    process.exit(1)
  }
}

runTests().catch(err => {
  console.error('Test runner encountered unexpected error:', err)
  process.exit(1)
})
