import 'dotenv/config';
import mongoose from 'mongoose';
import cookieSignature from 'cookie-signature';
import http from 'http';
import User from './models/user.model.js';
import Session from './models/sessionModel.js';
import Directory from './models/directory.model.js';
import File from './models/file.model.js';
import Share from './models/share.model.js';

const COOKIE_SECRET = 'My-cloudeStorage-123$#';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const data = postData !== undefined ? postData : options.body;
    const headers = { ...(options.headers || {}) };
    let payload = null;
    if (data !== undefined && data !== null) {
      if (typeof data === 'string' || Buffer.isBuffer(data)) {
        payload = data;
      } else {
        payload = JSON.stringify(data);
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      }
      if (!headers['Content-Length']) {
        headers['Content-Length'] = Buffer.byteLength(payload);
      }
    }

    const reqOptions = { ...options, headers };
    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: body ? JSON.parse(body) : null, rawBody: body });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, rawBody: body });
        }
      });
    });
    req.on('error', reject);
    if (payload !== null) {
      req.write(payload);
    }
    req.end();
  });
}

function createSignedCookie(sessionId) {
  const signed = 's:' + cookieSignature.sign(sessionId.toString(), COOKIE_SECRET);
  return `sid=${encodeURIComponent(signed)}`;
}

async function runTests() {
  console.log('=== Starting CloudSpaceGo Recent Feature Test Suite ===');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloudspacego', {
    dbName: 'cloudspacego'
  });
  console.log('Connected to MongoDB.');

  const timestamp = Date.now();

  // Create User A (Owner)
  const uARoot = new mongoose.Types.ObjectId();
  const uAId = new mongoose.Types.ObjectId();
  const userA = await User.create({
    _id: uAId,
    name: `User A ${timestamp}`,
    email: `usera_${timestamp}@example.com`,
    password: 'password123',
    rootDirId: uARoot,
    storageLimit: 200 * 1024 * 1024,
    storageUsed: 0
  });
  await Directory.create({
    _id: uARoot,
    name: 'root',
    userId: uAId,
    parentDirId: null
  });

  // Create User B (Non-owner / Recipient)
  const uBRoot = new mongoose.Types.ObjectId();
  const uBId = new mongoose.Types.ObjectId();
  const userB = await User.create({
    _id: uBId,
    name: `User B ${timestamp}`,
    email: `userb_${timestamp}@example.com`,
    password: 'password123',
    rootDirId: uBRoot,
    storageLimit: 200 * 1024 * 1024,
    storageUsed: 0
  });
  await Directory.create({
    _id: uBRoot,
    name: 'root',
    userId: uBId,
    parentDirId: null
  });

  // Create Sessions
  const sessionA = await Session.create({ userId: uAId });
  const sessionB = await Session.create({ userId: uBId });

  const cookieA = createSignedCookie(sessionA._id);
  const cookieB = createSignedCookie(sessionB._id);

  // Create 3 test files for User A
  const file1 = await File.create({
    name: 'document1.pdf',
    extension: '.pdf',
    size: 1024,
    parentDirId: uARoot,
    userId: uAId,
    storageKey: 'files/test1.pdf',
    lastAccessedAt: null
  });

  const file2 = await File.create({
    name: 'image2.png',
    extension: '.png',
    size: 2048,
    parentDirId: uARoot,
    userId: uAId,
    storageKey: 'files/test2.png',
    lastAccessedAt: null
  });

  const file3 = await File.create({
    name: 'code3.js',
    extension: '.js',
    size: 512,
    parentDirId: uARoot,
    userId: uAId,
    storageKey: 'files/test3.js',
    lastAccessedAt: null
  });

  // Create 1 file for User B
  const fileB = await File.create({
    name: 'user_b_file.txt',
    extension: '.txt',
    size: 256,
    parentDirId: uBRoot,
    userId: uBId,
    storageKey: 'files/testB.txt',
    lastAccessedAt: null
  });

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  try {
    // Test 1: GET /file/recent initially empty for User A
    const res1 = await makeRequest({
      hostname: '127.0.0.1',
      port: 4000,
      path: '/file/recent',
      method: 'GET',
      headers: { Cookie: cookieA }
    });
    assert(res1.status === 200, 'Test 1.1: GET /file/recent returns 200');
    assert(Array.isArray(res1.body.data) && res1.body.data.length === 0, 'Test 1.2: Unaccessed files do not appear in recent list');

    // Test 2: Unauthenticated GET /file/recent fails with 401
    const res2 = await makeRequest({
      hostname: '127.0.0.1',
      port: 4000,
      path: '/file/recent',
      method: 'GET'
    });
    assert(res2.status === 401, 'Test 2: Unauthenticated GET /file/recent returns 401');

    // Test 3: Record access for file 1
    const res3 = await makeRequest({
      hostname: '127.0.0.1',
      port: 4000,
      path: `/file/${file1._id}/access`,
      method: 'PATCH',
      headers: { Cookie: cookieA }
    });
    assert(res3.status === 200, 'Test 3.1: PATCH /file/:id/access returns 200 for owner');
    assert(res3.body.file && res3.body.file.lastAccessedAt, 'Test 3.2: PATCH returns updated lastAccessedAt');

    // Verify in DB
    const dbFile1 = await File.findById(file1._id);
    assert(dbFile1.lastAccessedAt !== null, 'Test 3.3: Database contains lastAccessedAt for file1');

    // Wait a brief moment to ensure distinct timestamps
    await new Promise(r => setTimeout(r, 100));

    // Test 4: Record access for file 2
    const res4 = await makeRequest({
      hostname: '127.0.0.1',
      port: 4000,
      path: `/file/${file2._id}/access`,
      method: 'PATCH',
      headers: { Cookie: cookieA }
    });
    assert(res4.status === 200, 'Test 4: PATCH /file/:id/access returns 200 for file 2');

    // Test 5: GET /file/recent returns file2 first, then file1 (newest first)
    const res5 = await makeRequest({
      hostname: '127.0.0.1',
      port: 4000,
      path: '/file/recent',
      method: 'GET',
      headers: { Cookie: cookieA }
    });
    assert(res5.status === 200 && res5.body.data.length === 2, 'Test 5.1: Recent contains exactly 2 accessed files');
    assert(res5.body.data[0]._id === file2._id.toString(), 'Test 5.2: Most recently accessed file2 is first');
    assert(res5.body.data[1]._id === file1._id.toString(), 'Test 5.3: Previously accessed file1 is second');

    // Test 6: Non-owner User B cannot record access on User A's file
    const res6 = await makeRequest({
      hostname: '127.0.0.1',
      port: 4000,
      path: `/file/${file1._id}/access`,
      method: 'PATCH',
      headers: { Cookie: cookieB }
    });
    assert(res6.status === 403, 'Test 6: User B cannot record access on User A file (403 Forbidden)');

    // Test 7: User B's recent list is completely isolated
    const res7 = await makeRequest({
      hostname: '127.0.0.1',
      port: 4000,
      path: '/file/recent',
      method: 'GET',
      headers: { Cookie: cookieB }
    });
    assert(res7.body.data.length === 0, 'Test 7: User B recent list is empty (strict user isolation)');

    // Test 8: Cursor pagination with limit=1
    const res8 = await makeRequest({
      hostname: '127.0.0.1',
      port: 4000,
      path: '/file/recent?limit=1',
      method: 'GET',
      headers: { Cookie: cookieA }
    });
    assert(res8.body.data.length === 1 && res8.body.data[0]._id === file2._id.toString(), 'Test 8.1: Page 1 returns file2');
    assert(res8.body.pagination.hasMore === true, 'Test 8.2: hasMore is true');
    assert(Boolean(res8.body.pagination.nextCursor), 'Test 8.3: nextCursor is provided');

    // Page 2 using nextCursor
    const nextCursor = res8.body.pagination.nextCursor;
    const res8b = await makeRequest({
      hostname: '127.0.0.1',
      port: 4000,
      path: `/file/recent?limit=1&cursor=${encodeURIComponent(nextCursor)}`,
      method: 'GET',
      headers: { Cookie: cookieA }
    });
    assert(res8b.body.data.length === 1 && res8b.body.data[0]._id === file1._id.toString(), 'Test 8.4: Page 2 returns file1 correctly');
    assert(res8b.body.pagination.hasMore === false, 'Test 8.5: Page 2 hasMore is false');

    // Test 9: Share file 1 with User B. When User B downloads file 1, User A's lastAccessedAt must NOT change!
    await Share.create({
      fileId: file1._id,
      ownerId: uAId,
      recipientId: uBId,
      role: 'viewer',
      status: 'active'
    });

    const accessBefore = (await File.findById(file1._id)).lastAccessedAt.getTime();

    // User B downloads the shared file
    await makeRequest({
      hostname: '127.0.0.1',
      port: 4000,
      path: `/file/${file1._id}?action=download`,
      method: 'GET',
      headers: { Cookie: cookieB }
    });

    const accessAfter = (await File.findById(file1._id)).lastAccessedAt.getTime();
    assert(accessBefore === accessAfter, 'Test 9: Recipient download does not modify owner lastAccessedAt');

    console.log(`\nAll ${passed}/${total} backend tests passed successfully!`);
  } finally {
    // Cleanup test data
    await File.deleteMany({ _id: { $in: [file1._id, file2._id, file3._id, fileB._id] } });
    await Share.deleteMany({ ownerId: uAId });
    await Directory.deleteMany({ _id: { $in: [uARoot, uBRoot] } });
    await Session.deleteMany({ _id: { $in: [sessionA._id, sessionB._id] } });
    await User.deleteMany({ _id: { $in: [uAId, uBId] } });
    await mongoose.disconnect();
    console.log('Cleaned up test data and disconnected from MongoDB.');
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
