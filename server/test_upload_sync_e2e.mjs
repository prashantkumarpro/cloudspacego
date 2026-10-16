import 'dotenv/config'
import mongoose from 'mongoose'
import cookieSignature from 'cookie-signature'
import http from 'http'
import assert from 'node:assert/strict'
import User from './models/user.model.js'
import Session from './models/sessionModel.js'
import Directory from './models/directory.model.js'
import File from './models/file.model.js'

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

    const req = http.request(
      {
        hostname: options.hostname || '127.0.0.1',
        port: options.port || PORT,
        path: options.path,
        method: options.method || 'GET',
        headers
      },
      (res) => {
        let body = ''
        res.on('data', (chunk) => {
          body += chunk
        })
        res.on('end', () => {
          let parsed = null
          try {
            parsed = JSON.parse(body)
          } catch {
            parsed = body
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          })
        })
      }
    )

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

async function runE2ETests() {
  console.log('=== Starting CloudSpaceGo Live Upload Sync E2E Test Suite ===\n')

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloudspacego', {
    dbName: 'cloudspacego'
  })
  console.log('Connected to MongoDB.\n')

  const timestamp = Date.now()

  // 1. Setup Test User
  const userRootId = new mongoose.Types.ObjectId()
  const userId = new mongoose.Types.ObjectId()
  const user = await User.create({
    _id: userId,
    name: `Upload Tester ${timestamp}`,
    email: `tester_${timestamp}@example.com`,
    password: 'password123',
    rootDirId: userRootId,
    storageLimit: 10 * 1024 * 1024,
    storageUsed: 0
  })

  const rootDirDoc = await Directory.create({
    _id: userRootId,
    name: 'root',
    userId,
    parentDirId: null
  })

  const session = await Session.create({
    userId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  })
  const authCookie = createSignedCookie(session._id)

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Live Upload to Root Directory (POST /file)
    // -------------------------------------------------------------------------
    console.log('--- Test 1: Real Upload to Root Directory ---')
    const rootUploadPayload = Buffer.from('Hello Root File Content!')
    const rootUploadRes = await makeRequest({
      path: '/file',
      method: 'POST',
      headers: {
        Cookie: authCookie,
        filename: 'root-doc.txt',
        'Content-Type': 'text/plain',
        'Content-Length': rootUploadPayload.length
      }
    }, rootUploadPayload)

    assert.equal(rootUploadRes.status, 201, 'Upload to root returns status 201')
    assert.ok(rootUploadRes.body.file, 'Response contains file object')
    assert.equal(rootUploadRes.body.file.name, 'root-doc.txt', 'Filename is correct')
    assert.equal(rootUploadRes.body.file.parentDirId, userRootId.toString(), 'parentDirId matches user rootDirId')
    assert.ok(rootUploadRes.body.file.directory, 'file.directory is populated')
    assert.equal(rootUploadRes.body.file.directory.name, 'root', 'Directory name is root')
    console.log('  ✓ Root upload response returned authoritative metadata with parentDirId')

    // Verify Root Directory in DB
    const rootDirCheck = await makeRequest({
      path: '/directory',
      method: 'GET',
      headers: { Cookie: authCookie }
    })
    assert.equal(rootDirCheck.status, 200)
    assert.ok(rootDirCheck.body.files.some(f => f.name === 'root-doc.txt'), 'Root directory contains uploaded file')
    console.log('  ✓ Server GET /directory confirmed root file in DB')

    // -------------------------------------------------------------------------
    // TEST 2: Create Nested Folder & Live Upload (POST /file/:parentDirId)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2: Real Upload to Nested Folder ---')
    const createFolderRes = await makeRequest({
      path: '/directory',
      method: 'POST',
      headers: {
        Cookie: authCookie,
        dirname: 'Projects'
      }
    })
    assert.equal(createFolderRes.status, 200)
    const nestedFolderId = createFolderRes.body.directory.id
    assert.ok(nestedFolderId, 'Nested folder created')

    const nestedPayload = Buffer.from('Project specifications document')
    const nestedUploadRes = await makeRequest({
      path: `/file/${nestedFolderId}`,
      method: 'POST',
      headers: {
        Cookie: authCookie,
        filename: 'project-specs.pdf',
        'Content-Type': 'application/pdf',
        'Content-Length': nestedPayload.length
      }
    }, nestedPayload)

    assert.equal(nestedUploadRes.status, 201)
    assert.equal(nestedUploadRes.body.file.parentDirId, nestedFolderId, 'parentDirId is nestedFolderId')
    assert.equal(nestedUploadRes.body.file.directory.name, 'Projects', 'Directory name is Projects')
    console.log('  ✓ Nested upload response returned authoritative metadata with parentDirId')

    // Verify GET /directory/:id returns nested file
    const nestedDirCheck = await makeRequest({
      path: `/directory/${nestedFolderId}`,
      method: 'GET',
      headers: { Cookie: authCookie }
    })
    assert.equal(nestedDirCheck.status, 200)
    assert.ok(nestedDirCheck.body.files.some(f => f.name === 'project-specs.pdf'), 'Nested folder contains uploaded file')

    // Verify GET /directory (root) does NOT return the nested file in files
    const rootDirCheck2 = await makeRequest({
      path: '/directory',
      method: 'GET',
      headers: { Cookie: authCookie }
    })
    assert.ok(!rootDirCheck2.body.files.some(f => f.name === 'project-specs.pdf'), 'Root directory does NOT contain nested file')
    console.log('  ✓ Server DB scoping verified: Root files and nested files are strictly separated')

    // -------------------------------------------------------------------------
    // TEST 3: Client State Synchronization Simulation with Server Responses
    // -------------------------------------------------------------------------
    console.log('\n--- Test 3: Client useDirectory & useInfiniteFiles Synchronization ---')

    // Client state simulation for Root useDirectory
    let rootClientDir = {
      id: userRootId.toString(),
      _id: userRootId.toString(),
      name: 'root',
      files: []
    }

    // Client state simulation for Nested useDirectory
    let nestedClientDir = {
      id: nestedFolderId,
      _id: nestedFolderId,
      name: 'Projects',
      files: []
    }

    // Client state for Root useInfiniteFiles
    let rootInfiniteFiles = []

    const dispatchUploadToClient = (hookId, directory, event) => {
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
        isMatch = Boolean((eventParent && eventParent === currentDirId) || (fileParent && fileParent === currentDirId))
      }

      if (!isMatch) return directory
      if (directory.files.some(f => (f.id || f._id || '').toString() === fileId)) return directory
      return { ...directory, files: [file, ...directory.files] }
    }

    const dispatchUploadToInfinite = (currentFiles, event) => {
      const isRootUpload = !event.parentDirId || event.parentDirId === 'root'
      if (!isRootUpload) return currentFiles
      const fileIdStr = (event.file.id || event.file._id || '').toString()
      if (currentFiles.some(f => (f.id || f._id || '').toString() === fileIdStr)) return currentFiles
      return [event.file, ...currentFiles]
    }

    // Dispatch Root upload event
    const rootEvent = {
      type: 'upload',
      file: rootUploadRes.body.file,
      parentDirId: undefined
    }
    rootClientDir = dispatchUploadToClient(undefined, rootClientDir, rootEvent)
    rootInfiniteFiles = dispatchUploadToInfinite(rootInfiniteFiles, rootEvent)

    assert.equal(rootClientDir.files.length, 1, 'Root directory state received root file immediately')
    assert.equal(rootInfiniteFiles.length, 1, 'Root infinite files state received root file immediately')

    // Dispatch Nested upload event
    const nestedEvent = {
      type: 'upload',
      file: nestedUploadRes.body.file,
      parentDirId: nestedFolderId
    }
    nestedClientDir = dispatchUploadToClient(nestedFolderId, nestedClientDir, nestedEvent)
    rootClientDir = dispatchUploadToClient(undefined, rootClientDir, nestedEvent)
    rootInfiniteFiles = dispatchUploadToInfinite(rootInfiniteFiles, nestedEvent)

    assert.equal(nestedClientDir.files.length, 1, 'Nested folder state received nested file immediately')
    assert.equal(rootClientDir.files.length, 1, 'Root directory state did NOT receive nested file')
    assert.equal(rootInfiniteFiles.length, 1, 'Root infinite files state did NOT receive nested file')

    console.log('  ✓ Client views synchronized with authoritative API responses without refresh!')

    console.log('\n=== All E2E Integration Tests Passed Successfully! ===\n')
  } finally {
    // Cleanup
    await File.deleteMany({ userId })
    await Directory.deleteMany({ userId })
    await Session.deleteMany({ userId })
    await User.deleteOne({ _id: userId })
    await mongoose.disconnect()
  }
}

runE2ETests().catch(err => {
  console.error('E2E Test Failure:', err)
  process.exit(1)
})
