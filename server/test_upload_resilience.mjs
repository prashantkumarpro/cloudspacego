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

async function runTests() {
  console.log('=== Starting CloudSpaceGo Upload Resilience & Security Test Suite ===\n')

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloudspacego', {
    dbName: 'cloudspacego'
  })
  console.log('Connected to MongoDB.\n')

  const timestamp = Date.now()

  // 1. Setup User A
  const uARoot = new mongoose.Types.ObjectId()
  const uAId = new mongoose.Types.ObjectId()
  const userA = await User.create({
    _id: uAId,
    name: `User A ${timestamp}`,
    email: `usera_${timestamp}@example.com`,
    password: 'password123',
    rootDirId: uARoot,
    storageLimit: 100 * 1024, // 100 KB limit for precise quota testing
    storageUsed: 0
  })

  await Directory.create({
    _id: uARoot,
    name: 'root',
    userId: uAId,
    parentDirId: null
  })

  const sessionA = await Session.create({
    userId: uAId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  })
  const cookieA = createSignedCookie(sessionA._id)

  // 2. Setup User B (Attacker / Unauthorized)
  const uBRoot = new mongoose.Types.ObjectId()
  const uBId = new mongoose.Types.ObjectId()
  await User.create({
    _id: uBId,
    name: `User B ${timestamp}`,
    email: `userb_${timestamp}@example.com`,
    password: 'password123',
    rootDirId: uBRoot,
    storageLimit: 100 * 1024,
    storageUsed: 0
  })

  await Directory.create({
    _id: uBRoot,
    name: 'root',
    userId: uBId,
    parentDirId: null
  })

  const sessionB = await Session.create({
    userId: uBId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  })
  const cookieB = createSignedCookie(sessionB._id)

  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`)
      passed++
    } else {
      console.error(`  ✗ FAIL: ${message}`)
      failed++
    }
  }

  // --- Test 1: Genuine upload progress & successful completion ---
  console.log('\n--- Test 1: Genuine Upload & Complete Response Structure ---')
  const content1 = 'Hello CloudSpaceGo Production File Uploads!'
  const buf1 = Buffer.from(content1)
  const res1 = await makeRequest(
    {
      method: 'POST',
      path: `/file/${uARoot}`,
      headers: {
        Cookie: cookieA,
        filename: 'report.txt',
        'Content-Type': 'text/plain',
        'Content-Length': buf1.length
      }
    },
    buf1
  )

  assert(res1.status === 201, `Status is 201 (got ${res1.status})`)
  assert(res1.body?.message === 'File Uploaded', 'Response message is File Uploaded')
  assert(res1.body?.file !== undefined, 'Response includes complete file object')
  assert(res1.body?.file?.name === 'report.txt', 'Returned file name is report.txt')
  assert(res1.body?.file?.size === buf1.length, `Returned file size is ${buf1.length}`)

  // Verify MongoDB file record
  const savedFile1 = await File.findOne({ _id: res1.body?.file?.id, userId: uAId })
  assert(Boolean(savedFile1), 'File record created in MongoDB')
  assert(savedFile1?.size === buf1.length, 'Saved file size matches uploaded bytes')

  // Verify User A quota
  const refreshedUserA1 = await User.findById(uAId)
  assert(refreshedUserA1.storageUsed === buf1.length, `User storageUsed updated to ${buf1.length} (got ${refreshedUserA1.storageUsed})`)

  // --- Test 2: Abort / Cancellation during upload streams & storage cleanup ---
  console.log('\n--- Test 2: Client Abort During Active Stream & Orphaned Storage Cleanup ---')
  const storageBefore = fs.existsSync('./storage/files') ? fs.readdirSync('./storage/files') : []
  const quotaBefore = refreshedUserA1.storageUsed

  await new Promise((resolve) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port: PORT,
        method: 'POST',
        path: `/file/${uARoot}`,
        headers: {
          Cookie: cookieA,
          filename: 'cancelled_stream.bin',
          'Content-Type': 'application/octet-stream',
          'Content-Length': 50000 // Tell server 50KB incoming
        }
      },
      (res) => {
        // Should not succeed
      }
    )

    req.on('error', () => {
      // Expected socket error on destroy
    })

    // Write partial bytes then immediately abort connection
    req.write(Buffer.alloc(2048, 'x'))
    setTimeout(() => {
      req.destroy() // Abort client request
      setTimeout(resolve, 300) // Wait for server to process close
    }, 20)
  })

  // Verify no new File document in MongoDB
  const cancelledFile = await File.findOne({ name: 'cancelled_stream.bin', userId: uAId })
  assert(!cancelledFile, 'No file record was created in MongoDB for aborted upload')

  // Verify storage quota was atomically rolled back
  const userAfterAbort = await User.findById(uAId)
  assert(userAfterAbort.storageUsed === quotaBefore, `Storage quota rolled back to ${quotaBefore} (got ${userAfterAbort.storageUsed})`)

  // Verify no orphaned files left in ./storage/files
  const storageAfter = fs.existsSync('./storage/files') ? fs.readdirSync('./storage/files') : []
  const newOrphans = storageAfter.filter(f => !storageBefore.includes(f) && f !== `${savedFile1?._id}.txt`)
  assert(newOrphans.length === 0, `No orphaned files left in storage (orphans: ${JSON.stringify(newOrphans)})`)

  // --- Test 3: Storage Quota Limit Enforcement ---
  console.log('\n--- Test 3: Storage Quota Limit Enforcement ---')
  const excessBuffer = Buffer.alloc(150 * 1024, 'a') // 150 KB > 100 KB limit
  const resQuota = await makeRequest(
    {
      method: 'POST',
      path: `/file/${uARoot}`,
      headers: {
        Cookie: cookieA,
        filename: 'too_large.bin',
        'Content-Type': 'application/octet-stream',
        'Content-Length': excessBuffer.length
      }
    },
    excessBuffer
  )

  assert(resQuota.status === 400, `Excess upload rejected with 400 (got ${resQuota.status})`)
  assert(resQuota.body?.error === 'Storage limit exceeded', 'Error is Storage limit exceeded')
  const userAfterExcess = await User.findById(uAId)
  assert(userAfterExcess.storageUsed === quotaBefore, `Storage used remains untouched (${userAfterExcess.storageUsed})`)

  // --- Test 4: Destination Permission & Ownership Validation ---
  console.log('\n--- Test 4: Permission & Ownership Verification ---')
  const resUnauthorized = await makeRequest(
    {
      method: 'POST',
      path: `/file/${uARoot}`, // User B trying to upload into User A's directory
      headers: {
        Cookie: cookieB,
        filename: 'hacked.txt',
        'Content-Type': 'text/plain',
        'Content-Length': 10
      }
    },
    'hacked1234'
  )

  assert(resUnauthorized.status === 404, `Cross-user upload rejected with 404 (got ${resUnauthorized.status})`)
  assert(resUnauthorized.body?.error === 'Parent directory not found!', 'Parent directory not found error returned')

  // --- Test 5: Filename Sanitization & Directory Traversal Protection ---
  console.log('\n--- Test 5: Filename Sanitization (Path Traversal Protection) ---')
  const resTraversal = await makeRequest(
    {
      method: 'POST',
      path: `/file/${uARoot}`,
      headers: {
        Cookie: cookieA,
        filename: '../../../../etc/passwd.txt',
        'Content-Type': 'text/plain',
        'Content-Length': 14
      }
    },
    'safe content!!'
  )

  assert(resTraversal.status === 201, `Upload succeeded with sanitized name (got ${resTraversal.status})`)
  assert(resTraversal.body?.file?.name === 'passwd.txt', `Name sanitized to passwd.txt (got ${resTraversal.body?.file?.name})`)

  // --- Test 6: Invalid / Negative Content-Length Rejection ---
  console.log('\n--- Test 6: Invalid / Negative Content-Length Header Validation ---')
  const resNegativeLength = await makeRequest({
    method: 'POST',
    path: `/file/${uARoot}`,
    headers: {
      Cookie: cookieA,
      filename: 'negative.txt',
      'Content-Type': 'text/plain',
      'Content-Length': '-100'
    }
  })

  assert(resNegativeLength.status === 400, `Negative Content-Length rejected with 400 (got ${resNegativeLength.status})`)
  assert(
    resNegativeLength.body?.error === 'Invalid Content-Length header' || resNegativeLength.status === 400,
    'Negative Content-Length safely blocked by server'
  )

  // --- Test 7: Multiple Concurrent Uploads & Quota Correctness ---
  console.log('\n--- Test 7: Multiple Concurrent Uploads & Quota Sum Correctness ---')
  const initialQuota = (await User.findById(uAId)).storageUsed
  const concurrentSizes = [100, 250, 400, 150]
  const uploadPromises = concurrentSizes.map((size, idx) => {
    const payload = Buffer.alloc(size, `c${idx}`)
    return makeRequest(
      {
        method: 'POST',
        path: `/file/${uARoot}`,
        headers: {
          Cookie: cookieA,
          filename: `concurrent_${idx}.txt`,
          'Content-Type': 'text/plain',
          'Content-Length': size
        }
      },
      payload
    )
  })

  const results = await Promise.all(uploadPromises)
  const allSucceeded = results.every(r => r.status === 201)
  assert(allSucceeded, 'All 4 concurrent uploads succeeded with status 201')

  const totalAdded = concurrentSizes.reduce((a, b) => a + b, 0)
  const finalUser = await User.findById(uAId)
  assert(
    finalUser.storageUsed === initialQuota + totalAdded,
    `Final storage quota exactly matches initial + sum of concurrent uploads (${finalUser.storageUsed} === ${initialQuota + totalAdded})`
  )

  console.log(`\n=== Test Results: ${passed} passed, ${failed} failed ===\n`)

  // Cleanup test database entries
  await File.deleteMany({ userId: { $in: [uAId, uBId] } })
  await Directory.deleteMany({ userId: { $in: [uAId, uBId] } })
  await Session.deleteMany({ userId: { $in: [uAId, uBId] } })
  await User.deleteMany({ _id: { $in: [uAId, uBId] } })
  await mongoose.disconnect()

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch(err => {
  console.error('Test suite uncaught error:', err)
  process.exit(1)
})
