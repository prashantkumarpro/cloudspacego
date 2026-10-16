import 'dotenv/config'
import mongoose from 'mongoose'
import cookieSignature from 'cookie-signature'
import http from 'http'
import assert from 'node:assert/strict'
import test from 'node:test'

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
    if (payload) req.write(payload)
    req.end()
  })
}

test('Live Server Rename Endpoints (File & Folder)', async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloudspacego')

  try {
    const user = await mongoose.connection.db.collection('users').findOne({})
    assert.ok(user, 'User exists in test database')

    const session = await mongoose.connection.db.collection('sessions').findOne({ userId: user._id })
    const sessionId = session ? session._id.toString() : new mongoose.Types.ObjectId().toString()
    if (!session) {
      await mongoose.connection.db.collection('sessions').insertOne({
        _id: new mongoose.Types.ObjectId(sessionId),
        userId: user._id,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000)
      })
    }

    const signedCookie = 's:' + cookieSignature.sign(sessionId.toString(), COOKIE_SECRET)
    const authHeaders = {
      Cookie: `sid=${encodeURIComponent(signedCookie)}`,
      'Content-Type': 'application/json'
    }

    // --- Directory Rename Tests ---
    console.log('\n--- 1. Testing Directory Rename ---')
    // 1. Create a directory to rename
    const createDirRes = await makeRequest({
      path: '/directory',
      method: 'POST',
      headers: { ...authHeaders, dirname: 'Test Folder Original' }
    })
    assert.equal(createDirRes.status, 200, 'Directory creation should succeed')
    const dirId = createDirRes.body.directory.id || createDirRes.body.directory._id
    assert.ok(dirId, 'Directory ID must exist')

    // 2. Successful directory rename
    const renameDirRes = await makeRequest({
      path: `/directory/${dirId}`,
      method: 'PATCH',
      headers: authHeaders,
      body: { newDirName: 'Test Folder Renamed' }
    })
    assert.equal(renameDirRes.status, 200, 'Directory rename should return 200')
    assert.equal(renameDirRes.body.message, 'Directory Renamed!')
    assert.equal(renameDirRes.body.directory.name, 'Test Folder Renamed', 'Authoritative response must have new name')
    assert.equal(renameDirRes.body.directory.id, dirId.toString())

    // 3. Blank directory rename -> 400
    const blankDirRes = await makeRequest({
      path: `/directory/${dirId}`,
      method: 'PATCH',
      headers: authHeaders,
      body: { newDirName: '   ' }
    })
    assert.equal(blankDirRes.status, 400, 'Blank directory rename should return 400')
    assert.equal(blankDirRes.body.error, 'newDirName is required')

    // Clean up directory
    await makeRequest({
      path: `/directory/${dirId}`,
      method: 'DELETE',
      headers: authHeaders
    })

    // --- File Rename Tests ---
    console.log('\n--- 2. Testing File Rename ---')
    const fileDoc = await mongoose.connection.db.collection('files').findOne({ userId: user._id, isTrash: { $ne: true } })
    if (fileDoc) {
      const fileId = fileDoc._id.toString()
      const originalFilename = fileDoc.name

      // 4. Successful file rename
      const renameFileRes = await makeRequest({
        path: `/file/${fileId}`,
        method: 'PATCH',
        headers: authHeaders,
        body: { newFilename: 'Test_Live_Renamed.txt' }
      })
      assert.equal(renameFileRes.status, 200, 'File rename should return 200')
      assert.equal(renameFileRes.body.message, 'Renamed')
      assert.equal(renameFileRes.body.file.name, 'Test_Live_Renamed.txt', 'Authoritative response must have new name')
      assert.equal(renameFileRes.body.file.id, fileId)

      // 5. Blank file rename -> 400
      const blankFileRes = await makeRequest({
        path: `/file/${fileId}`,
        method: 'PATCH',
        headers: authHeaders,
        body: { newFilename: '' }
      })
      assert.equal(blankFileRes.status, 400, 'Blank file rename should return 400')
      assert.equal(blankFileRes.body.error, 'newFilename is required')

      // Revert filename back to original
      await makeRequest({
        path: `/file/${fileId}`,
        method: 'PATCH',
        headers: authHeaders,
        body: { newFilename: originalFilename }
      })
    }

    // 6. Non-existent directory rename returns 404
    const fakeDirId = new mongoose.Types.ObjectId().toString()
    const nonExistentDirRes = await makeRequest({
      path: `/directory/${fakeDirId}`,
      method: 'PATCH',
      headers: authHeaders,
      body: { newDirName: 'Fake Directory' }
    })
    assert.equal(nonExistentDirRes.status, 404, 'Non-existent directory rename should return 404')

    // 7. Non-existent file rename returns 404
    const fakeFileId = new mongoose.Types.ObjectId().toString()
    const nonExistentFileRes = await makeRequest({
      path: `/file/${fakeFileId}`,
      method: 'PATCH',
      headers: authHeaders,
      body: { newFilename: 'Fake File.txt' }
    })
    assert.equal(nonExistentFileRes.status, 404, 'Non-existent file rename should return 404')

    console.log('Live Server Rename tests passed successfully!\n')
  } finally {
    await mongoose.disconnect()
  }
})
