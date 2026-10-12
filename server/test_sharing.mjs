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

async function run() {
  console.log('Connecting to MongoDB for sharing test...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloudspacego', {
    dbName: 'cloudspacego'
  });
  console.log('Connected to MongoDB.');

  const timestamp = Date.now();

  // Create User 1 (Owner)
  const u1RootId = new mongoose.Types.ObjectId();
  const u1Id = new mongoose.Types.ObjectId();
  const u1 = await User.create({
    _id: u1Id,
    name: 'Owner User',
    email: `owner_${timestamp}@test.com`,
    password: 'Password123!',
    rootDirId: u1RootId,
    storageUsed: 0,
    storageLimit: 209715200,
    plan: 'free'
  });
  await Directory.create({ _id: u1RootId, name: `root-${u1.email}`, parentDirId: null, userId: u1Id });
  const session1 = await Session.create({ userId: u1Id });
  const cookie1 = createSignedCookie(session1._id);

  // Create User 2 (Recipient)
  const u2RootId = new mongoose.Types.ObjectId();
  const u2Id = new mongoose.Types.ObjectId();
  const u2 = await User.create({
    _id: u2Id,
    name: 'Recipient User',
    email: `recipient_${timestamp}@test.com`,
    password: 'Password123!',
    rootDirId: u2RootId,
    storageUsed: 0,
    storageLimit: 209715200,
    plan: 'free'
  });
  await Directory.create({ _id: u2RootId, name: `root-${u2.email}`, parentDirId: null, userId: u2Id });
  const session2 = await Session.create({ userId: u2Id });
  const cookie2 = createSignedCookie(session2._id);

  // Create User 3 (Unrelated third party)
  const u3RootId = new mongoose.Types.ObjectId();
  const u3Id = new mongoose.Types.ObjectId();
  const u3 = await User.create({
    _id: u3Id,
    name: 'Third User',
    email: `unrelated_${timestamp}@test.com`,
    password: 'Password123!',
    rootDirId: u3RootId,
    storageUsed: 0,
    storageLimit: 209715200,
    plan: 'free'
  });
  await Directory.create({ _id: u3RootId, name: `root-${u3.email}`, parentDirId: null, userId: u3Id });
  const session3 = await Session.create({ userId: u3Id });
  const cookie3 = createSignedCookie(session3._id);

  console.log('Test users created: Owner, Recipient, Unrelated.');

  // Step 1: Owner uploads a file
  console.log('\n--- 1. Upload file for Owner ---');
  const fileContent = Buffer.from('Confidential report to share');
  const uploadRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${u1RootId.toString()}`,
    method: 'POST',
    headers: {
      'Cookie': cookie1,
      'Content-Type': 'text/plain',
      'Content-Length': fileContent.length,
      'filename': 'q4-report.txt'
    }
  }, fileContent);
  console.log('Upload status:', uploadRes.status);

  const ownerFiles = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/file',
    method: 'GET',
    headers: { 'Cookie': cookie1 }
  });
  const file = ownerFiles.body?.data?.[0];
  if (!file) throw new Error('File upload verification failed');
  const fileId = file._id || file.id;
  console.log('Uploaded File ID:', fileId);

  // Step 2: Validate sharing with invalid email, invalid role, invalid file ID
  console.log('\n--- 2. Input validation tests on POST /file/:id/share ---');
  const badIdRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/file/not-valid-id/share',
    method: 'POST',
    headers: { 'Cookie': cookie1, 'Content-Type': 'application/json' }
  }, { recipientEmail: u2.email, role: 'viewer' });
  console.log('Invalid file ID status:', badIdRes.status);
  if (badIdRes.status !== 400) throw new Error('Expected 400 for invalid file ID');

  const badEmailRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share`,
    method: 'POST',
    headers: { 'Cookie': cookie1, 'Content-Type': 'application/json' }
  }, { recipientEmail: 'not-an-email', role: 'viewer' });
  console.log('Invalid email status:', badEmailRes.status);
  if (badEmailRes.status !== 400) throw new Error('Expected 400 for invalid email');

  const badRoleRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share`,
    method: 'POST',
    headers: { 'Cookie': cookie1, 'Content-Type': 'application/json' }
  }, { recipientEmail: u2.email, role: 'admin' });
  console.log('Invalid role status:', badRoleRes.status);
  if (badRoleRes.status !== 400) throw new Error('Expected 400 for invalid role');

  const selfShareRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share`,
    method: 'POST',
    headers: { 'Cookie': cookie1, 'Content-Type': 'application/json' }
  }, { recipientEmail: u1.email, role: 'viewer' });
  console.log('Self-share status:', selfShareRes.status);
  if (selfShareRes.status !== 400) throw new Error('Expected 400 for self-sharing');

  const notOwnerShareRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share`,
    method: 'POST',
    headers: { 'Cookie': cookie2, 'Content-Type': 'application/json' }
  }, { recipientEmail: u3.email, role: 'viewer' });
  console.log('Non-owner share attempt status:', notOwnerShareRes.status);
  if (notOwnerShareRes.status !== 403) throw new Error('Expected 403 for non-owner sharing');

  // Step 3: Successfully share file with Recipient as viewer
  console.log('\n--- 3. Successfully share file with Recipient as viewer ---');
  const shareRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share`,
    method: 'POST',
    headers: { 'Cookie': cookie1, 'Content-Type': 'application/json' }
  }, { recipientEmail: u2.email, role: 'viewer' });
  console.log('Share status:', shareRes.status, 'Message:', shareRes.body?.message, 'Role:', shareRes.body?.share?.role);
  if (shareRes.status !== 201 && shareRes.status !== 200) throw new Error('Expected 200/201 on share');

  // Step 4: Duplicate active share with same role
  console.log('\n--- 4. Duplicate share with same role ---');
  const dupShareRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share`,
    method: 'POST',
    headers: { 'Cookie': cookie1, 'Content-Type': 'application/json' }
  }, { recipientEmail: u2.email, role: 'viewer' });
  console.log('Duplicate share status:', dupShareRes.status);
  if (dupShareRes.status !== 409) throw new Error('Expected 409 for duplicate share with same role');

  // Step 5: Recipient fetches GET /file/shared-with-me
  console.log('\n--- 5. Recipient fetches GET /file/shared-with-me ---');
  const sharedWithMeRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/file/shared-with-me',
    method: 'GET',
    headers: { 'Cookie': cookie2 }
  });
  console.log('Shared with me count:', sharedWithMeRes.body?.data?.length);
  if (sharedWithMeRes.status !== 200 || sharedWithMeRes.body?.data?.length !== 1) {
    throw new Error('Expected recipient to have 1 shared file');
  }
  const sharedItem = sharedWithMeRes.body.data[0];
  console.log('Shared item name:', sharedItem.name, 'role:', sharedItem.role, 'owner:', sharedItem.owner);
  if (sharedItem.role !== 'viewer' || sharedItem.owner?.email !== u1.email) {
    throw new Error('Shared file metadata incorrect');
  }

  // Step 6: Unrelated user fetches GET /file/shared-with-me (must be 0)
  console.log('\n--- 6. Unrelated user fetches GET /file/shared-with-me ---');
  const unrelatedRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/file/shared-with-me',
    method: 'GET',
    headers: { 'Cookie': cookie3 }
  });
  console.log('Unrelated user shared count:', unrelatedRes.body?.data?.length);
  if (unrelatedRes.body?.data?.length !== 0) throw new Error('Unrelated user must not see shares');

  // Step 7: Permission check - Recipient (viewer) downloads/previews file (allowed)
  console.log('\n--- 7. Recipient (viewer) downloads/previews file ---');
  const previewRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}`,
    method: 'GET',
    headers: { 'Cookie': cookie2 }
  });
  console.log('Recipient preview status:', previewRes.status, 'Content length:', previewRes.headers['content-length']);
  if (previewRes.status !== 200) throw new Error('Recipient should be allowed to view file');

  // Step 8: Permission check - Unrelated user tries to view file (forbidden)
  console.log('\n--- 8. Unrelated user tries to preview file ---');
  const unrelatedViewRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}`,
    method: 'GET',
    headers: { 'Cookie': cookie3 }
  });
  console.log('Unrelated preview status:', unrelatedViewRes.status);
  if (unrelatedViewRes.status !== 403) throw new Error('Expected 403 for unrelated user');

  // Step 9: Permission check - Recipient (viewer) tries to rename file (forbidden for viewer)
  console.log('\n--- 9. Recipient (viewer) tries to rename file (must be 403) ---');
  const viewerRenameRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}`,
    method: 'PATCH',
    headers: { 'Cookie': cookie2, 'Content-Type': 'application/json' }
  }, { newFilename: 'hacked.txt' });
  console.log('Viewer rename status:', viewerRenameRes.status);
  if (viewerRenameRes.status !== 403) throw new Error('Viewer should not be allowed to rename');

  // Step 10: Owner upgrades share to editor
  console.log('\n--- 10. Owner updates share to editor ---');
  const upgradeRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share`,
    method: 'POST',
    headers: { 'Cookie': cookie1, 'Content-Type': 'application/json' }
  }, { recipientEmail: u2.email, role: 'editor' });
  console.log('Upgrade status:', upgradeRes.status, 'New role:', upgradeRes.body?.share?.role);
  if (upgradeRes.body?.share?.role !== 'editor') throw new Error('Role should be updated to editor');

  // Step 11: Recipient (editor) renames file (allowed for editor)
  console.log('\n--- 11. Recipient (editor) renames file ---');
  const editorRenameRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}`,
    method: 'PATCH',
    headers: { 'Cookie': cookie2, 'Content-Type': 'application/json' }
  }, { newFilename: 'q4-report-v2.txt' });
  console.log('Editor rename status:', editorRenameRes.status);
  if (editorRenameRes.status !== 200) throw new Error('Editor should be allowed to rename');

  // Step 12: Recipient (editor) tries to delete file (forbidden: only owner can delete)
  console.log('\n--- 12. Recipient (editor) tries to delete file (must be 403) ---');
  const editorDeleteRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}`,
    method: 'DELETE',
    headers: { 'Cookie': cookie2 }
  });
  console.log('Editor delete status:', editorDeleteRes.status);
  if (editorDeleteRes.status !== 403) throw new Error('Only owner can delete file');

  // Step 13: Owner inspects existing shares GET /file/:id/shares
  console.log('\n--- 13. Owner inspects existing shares ---');
  const getSharesRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/shares`,
    method: 'GET',
    headers: { 'Cookie': cookie1 }
  });
  console.log('Active shares count for file:', getSharesRes.body?.shares?.length);
  if (getSharesRes.body?.shares?.length !== 1 || getSharesRes.body?.shares?.[0]?.recipient?.email !== u2.email) {
    throw new Error('Owner inspect shares failed');
  }

  // Step 14: Owner revokes share DELETE /file/:id/share/:recipientId
  console.log('\n--- 14. Owner revokes share ---');
  const revokeRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share/${u2Id.toString()}`,
    method: 'DELETE',
    headers: { 'Cookie': cookie1 }
  });
  console.log('Revoke status:', revokeRes.status, 'Message:', revokeRes.body?.message);
  if (revokeRes.status !== 200) throw new Error('Expected 200 on revoke');

  // Step 15: Recipient checks GET /file/shared-with-me after revocation (must be 0)
  console.log('\n--- 15. Recipient checks GET /file/shared-with-me after revoke ---');
  const sharedAfterRevoke = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/file/shared-with-me',
    method: 'GET',
    headers: { 'Cookie': cookie2 }
  });
  console.log('Shared count after revoke:', sharedAfterRevoke.body?.data?.length);
  if (sharedAfterRevoke.body?.data?.length !== 0) throw new Error('File must not appear in shared-with-me after revoke');

  // Step 16: Revoked recipient tries to view file (now 403 Forbidden)
  console.log('\n--- 16. Revoked recipient tries to view file (must be 403) ---');
  const revokedViewRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}`,
    method: 'GET',
    headers: { 'Cookie': cookie2 }
  });
  console.log('Revoked view status:', revokedViewRes.status);
  if (revokedViewRes.status !== 403) throw new Error('Revoked user must be denied access');

  // Step 17: Verify original file remains intact in MongoDB
  console.log('\n--- 17. Verify original file remains intact ---');
  const checkFile = await File.findById(fileId);
  if (!checkFile) throw new Error('Original file was unexpectedly deleted');
  console.log('Original file exists:', checkFile.name);

  // Step 18: Verify existing file listing, starred files, and cursor pagination
  console.log('\n--- 18. Verify existing file listing, starred files, and cursor pagination ---');
  // Upload second file for Owner and star it
  const upload2 = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/file',
    method: 'POST',
    headers: {
      'Cookie': cookie1,
      'filename': 'starred-notes.txt',
      'Content-Type': 'text/plain'
    },
    body: 'Some important starred notes'
  });
  const file2Doc = await File.findOne({ name: 'starred-notes.txt', userId: u1Id });
  const fileId2 = file2Doc._id;
  await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId2}/star`,
    method: 'PATCH',
    headers: { 'Cookie': cookie1 },
    body: { isStarred: true }
  });

  // Upload third file for Owner
  const upload3 = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/file',
    method: 'POST',
    headers: {
      'Cookie': cookie1,
      'filename': 'third-document.txt',
      'Content-Type': 'text/plain'
    },
    body: 'Third document content'
  });
  const file3Doc = await File.findOne({ name: 'third-document.txt', userId: u1Id });
  const fileId3 = file3Doc._id;

  // Verify GET /file pagination
  const page1 = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/file?limit=2',
    method: 'GET',
    headers: { 'Cookie': cookie1 }
  });
  if (page1.body?.data?.length !== 2 || !page1.body?.pagination?.hasMore || !page1.body?.pagination?.nextCursor) {
    throw new Error('GET /file pagination page 1 failed');
  }
  const page2 = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file?cursor=${page1.body.pagination.nextCursor}&limit=2`,
    method: 'GET',
    headers: { 'Cookie': cookie1 }
  });
  if (page2.body?.data?.length < 1) {
    throw new Error('GET /file pagination page 2 failed');
  }
  console.log('GET /file pagination verified (page 1:', page1.body.data.length, 'page 2:', page2.body.data.length, ')');

  // Verify GET /file/starred
  const starredRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/file/starred',
    method: 'GET',
    headers: { 'Cookie': cookie1 }
  });
  if (!starredRes.body?.data?.some(f => (f._id || f.id).toString() === fileId2.toString())) {
    throw new Error('GET /file/starred did not include starred file');
  }
  console.log('GET /file/starred verified (count:', starredRes.body.data.length, ')');

  // Share fileId2 and fileId3 with Recipient to test shared-with-me pagination
  await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId2}/share`,
    method: 'POST',
    headers: { 'Cookie': cookie1 },
    body: { recipientEmail: u2.email, role: 'viewer' }
  });
  await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId3}/share`,
    method: 'POST',
    headers: { 'Cookie': cookie1 },
    body: { recipientEmail: u2.email, role: 'editor' }
  });

  const sharedPage1 = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/file/shared-with-me?limit=1',
    method: 'GET',
    headers: { 'Cookie': cookie2 }
  });
  if (sharedPage1.body?.data?.length !== 1 || !sharedPage1.body?.pagination?.hasMore || !sharedPage1.body?.pagination?.nextCursor) {
    throw new Error('GET /file/shared-with-me pagination page 1 failed');
  }
  const sharedPage2 = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/shared-with-me?cursor=${sharedPage1.body.pagination.nextCursor}&limit=1`,
    method: 'GET',
    headers: { 'Cookie': cookie2 }
  });
  if (sharedPage2.body?.data?.length !== 1) {
    throw new Error('GET /file/shared-with-me pagination page 2 failed');
  }
  console.log('GET /file/shared-with-me pagination verified successfully');

  // Cleanup
  console.log('\nCleaning up test data...');
  await Share.deleteMany({ fileId: { $in: [fileId, fileId2, fileId3] } });
  await File.deleteMany({ userId: { $in: [u1Id, u2Id, u3Id] } });
  await Directory.deleteMany({ userId: { $in: [u1Id, u2Id, u3Id] } });
  await Session.deleteMany({ userId: { $in: [u1Id, u2Id, u3Id] } });
  await User.deleteMany({ _id: { $in: [u1Id, u2Id, u3Id] } });
  await mongoose.disconnect();

  console.log('\n=======================================');
  console.log('🎉 ALL 18 SHARING & PAGINATION TESTS PASSED! 🎉');
  console.log('=======================================');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
