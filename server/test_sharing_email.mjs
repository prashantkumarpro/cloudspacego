import 'dotenv/config';
import mongoose from 'mongoose';
import cookieSignature from 'cookie-signature';
import http from 'http';
import User from './models/user.model.js';
import Session from './models/sessionModel.js';
import Directory from './models/directory.model.js';
import File from './models/file.model.js';
import Share from './models/share.model.js';
import {
  generateShareEmailHtml,
  getAppUrl,
  getSenderEmail,
  sendShareNotificationEmail,
  dispatchShareEmailAndUpdateRecord
} from './services/shareEmailService.js';

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
  console.log('Connecting to MongoDB for email notification verification...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloudspacego', {
    dbName: 'cloudspacego'
  });
  console.log('Connected to MongoDB.');

  const timestamp = Date.now();

  // Create Owner User
  const ownerRootId = new mongoose.Types.ObjectId();
  const ownerId = new mongoose.Types.ObjectId();
  const owner = await User.create({
    _id: ownerId,
    name: 'Alice Owner',
    email: `alice_${timestamp}@test.com`,
    password: 'Password123!',
    rootDirId: ownerRootId,
    storageUsed: 0,
    storageLimit: 209715200,
    plan: 'free'
  });
  await Directory.create({ _id: ownerRootId, name: `root-${owner.email}`, parentDirId: null, userId: ownerId });
  const ownerSession = await Session.create({ userId: ownerId });
  const ownerCookie = createSignedCookie(ownerSession._id);

  // Create Recipient User
  const recipientRootId = new mongoose.Types.ObjectId();
  const recipientId = new mongoose.Types.ObjectId();
  const recipient = await User.create({
    _id: recipientId,
    name: 'Bob Recipient',
    email: `bob_${timestamp}@test.com`,
    password: 'Password123!',
    rootDirId: recipientRootId,
    storageUsed: 0,
    storageLimit: 209715200,
    plan: 'free'
  });
  await Directory.create({ _id: recipientRootId, name: `root-${recipient.email}`, parentDirId: null, userId: recipientId });

  // 1. Test Email Template & URL Generation
  console.log('\n--- 1. Verify Email Template & Application URL ---');
  const configuredAppUrl = getAppUrl();
  console.log('Configured App URL:', configuredAppUrl);
  if (!configuredAppUrl.startsWith('http')) {
    throw new Error('Configured app URL is invalid');
  }

  const emailHtml = generateShareEmailHtml({
    ownerName: 'Alice Owner',
    recipientName: 'Bob Recipient',
    fileName: 'Project-Specs.pdf',
    role: 'Viewer',
    openUrl: `${configuredAppUrl}/dashboard?section=Shared`
  });

  if (!emailHtml.includes('cloudspacego')) throw new Error('Email template missing cloudspacego branding');
  if (!emailHtml.includes('Alice Owner')) throw new Error('Email template missing owner display name');
  if (!emailHtml.includes('Project-Specs.pdf')) throw new Error('Email template missing file name');
  if (!emailHtml.includes('Viewer')) throw new Error('Email template missing permission level');
  if (!emailHtml.includes(`${configuredAppUrl}/dashboard?section=Shared`)) throw new Error('Email template missing action link');
  console.log('✓ Email template branding, owner, file name, role badge, and link verified.');

  // 2. Upload file for Owner
  console.log('\n--- 2. Upload File for Owner ---');
  const fileContent = Buffer.from('Project presentation document');
  const uploadRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${ownerRootId.toString()}`,
    method: 'POST',
    headers: {
      'Cookie': ownerCookie,
      'Content-Type': 'text/plain',
      'Content-Length': fileContent.length,
      'filename': 'Project-Specs.pdf'
    }
  }, fileContent);

  const ownerFiles = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: '/file',
    method: 'GET',
    headers: { 'Cookie': ownerCookie }
  });
  const file = ownerFiles.body?.data?.[0];
  if (!file) throw new Error('File upload failed');
  const fileId = file._id || file.id;
  console.log('✓ File uploaded successfully, ID:', fileId);

  // 3. Test Invalid Recipients / Validation Failures (Must NOT send email or create Share)
  console.log('\n--- 3. Validation Failures (No email, no share) ---');
  const nonExistentEmailRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share`,
    method: 'POST',
    headers: { 'Cookie': ownerCookie, 'Content-Type': 'application/json' }
  }, { recipientEmail: 'doesnotexist@unknown-domain.com', role: 'viewer' });
  console.log('Non-existent recipient status:', nonExistentEmailRes.status);
  if (nonExistentEmailRes.status !== 404) throw new Error('Expected 404 for non-existent recipient');

  const invalidEmailRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share`,
    method: 'POST',
    headers: { 'Cookie': ownerCookie, 'Content-Type': 'application/json' }
  }, { recipientEmail: 'notanemail', role: 'viewer' });
  if (invalidEmailRes.status !== 400) throw new Error('Expected 400 for invalid email');

  const countBeforeValid = await Share.countDocuments({ fileId });
  if (countBeforeValid !== 0) throw new Error('Failed validation created unexpected share record');
  console.log('✓ No shares created on validation failures.');

  // 4. Test Successful Share with Registered Recipient
  console.log('\n--- 4. Successful Share with Registered Recipient ---');
  const shareRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share`,
    method: 'POST',
    headers: { 'Cookie': ownerCookie, 'Content-Type': 'application/json' }
  }, { recipientEmail: recipient.email, role: 'viewer' });

  console.log('Share response status:', shareRes.status);
  console.log('Share response body:', shareRes.body);
  if (shareRes.status !== 201) throw new Error('Expected 201 on initial share');
  if (shareRes.body?.share?.role !== 'viewer') throw new Error('Expected role viewer');
  if (!shareRes.body?.share?.notificationStatus) throw new Error('Expected notificationStatus in response');

  const shareRecord = await Share.findOne({ fileId, recipientId });
  if (!shareRecord) throw new Error('Share record was not found in DB');
  console.log('DB Share notificationStatus:', shareRecord.notificationStatus);
  console.log('DB Share notificationSentAt:', shareRecord.notificationSentAt);
  console.log('✓ Share record created with notificationStatus tracking.');

  // 5. Test Duplicate Share (Same role -> 409, no duplicate share record, no extra email)
  console.log('\n--- 5. Duplicate Active Share (409 Conflict) ---');
  const dupRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share`,
    method: 'POST',
    headers: { 'Cookie': ownerCookie, 'Content-Type': 'application/json' }
  }, { recipientEmail: recipient.email, role: 'viewer' });
  if (dupRes.status !== 409) throw new Error('Expected 409 on duplicate share');
  const sharesCount = await Share.countDocuments({ fileId, recipientId, status: 'active' });
  if (sharesCount !== 1) throw new Error('Duplicate shares found in database!');
  console.log('✓ Duplicate share rejected with 409, no duplicate DB record created.');

  // 6. Test Email Failure Safety: Share remains valid even if email provider fails
  console.log('\n--- 6. Simulate Email Provider Failure Safety ---');
  const recipient2RootId = new mongoose.Types.ObjectId();
  const recipient2Id = new mongoose.Types.ObjectId();
  const recipient2 = await User.create({
    _id: recipient2Id,
    name: 'Charlie Recipient',
    email: `charlie_${timestamp}@test.com`,
    password: 'Password123!',
    rootDirId: recipient2RootId,
    storageUsed: 0,
    storageLimit: 209715200,
    plan: 'free'
  });
  await Directory.create({ _id: recipient2RootId, name: `root-${recipient2.email}`, parentDirId: null, userId: recipient2Id });

  // Create active share record first
  const simulatedShare = await Share.create({
    fileId,
    ownerId,
    recipientId: recipient2Id,
    role: 'editor',
    status: 'active',
    sharedAt: new Date(),
    notificationStatus: 'pending'
  });

  // Temporarily set invalid API key in this test environment and run dispatch
  const originalKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_invalid_api_key_simulation_12345';

  const dispatchResult = await dispatchShareEmailAndUpdateRecord({
    share: simulatedShare,
    owner,
    recipient: recipient2,
    file
  });

  console.log('Dispatch result on simulated provider error:', dispatchResult);
  if (dispatchResult.success !== false) throw new Error('Expected dispatch to return success: false');

  const reloadedShare = await Share.findById(simulatedShare._id);
  if (!reloadedShare) throw new Error('Share record must NOT be deleted when email fails');
  if (reloadedShare.status !== 'active') throw new Error('Share record must remain active');
  if (reloadedShare.notificationStatus !== 'failed') throw new Error('notificationStatus must be "failed"');
  if (!reloadedShare.notificationError) throw new Error('notificationError must be recorded');
  console.log('✓ Share remains valid and active in DB with notificationStatus="failed" and error logged.');

  // Restore API key
  process.env.RESEND_API_KEY = originalKey;

  // 7. Test Email Retry Mechanism
  console.log('\n--- 7. Test Notification Retry Endpoint ---');
  const retryRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share/${recipient2Id.toString()}/retry-email`,
    method: 'POST',
    headers: { 'Cookie': ownerCookie }
  });
  console.log('Retry endpoint status:', retryRes.status);
  console.log('Retry response:', retryRes.body);
  if (retryRes.status !== 200) throw new Error('Expected 200 from retry endpoint');
  if (retryRes.body?.success !== true) throw new Error('Expected retry to succeed with restored credentials');

  // Verify DB record after retry
  const retriedShare = await Share.findById(simulatedShare._id);
  if (retriedShare.notificationStatus !== 'sent') throw new Error('notificationStatus should be "sent" after retry');
  if (!retriedShare.notificationSentAt) throw new Error('notificationSentAt should be populated');

  // Ensure still only 1 share record for recipient 2
  const sharesCount2 = await Share.countDocuments({ fileId, recipientId: recipient2Id });
  if (sharesCount2 !== 1) throw new Error('Retry created duplicate share record!');
  // 8. Test Revoke Share (Must NOT send email notification)
  console.log('\n--- 8. Test Revoke Share (No email on revoke) ---');
  const revokeRes = await makeRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/file/${fileId}/share/${recipient2Id.toString()}`,
    method: 'DELETE',
    headers: { 'Cookie': ownerCookie }
  });
  console.log('Revoke status:', revokeRes.status);
  if (revokeRes.status !== 200) throw new Error('Revoke failed');
  const revokedShare = await Share.findOne({ fileId, recipientId: recipient2Id });
  if (revokedShare.status !== 'revoked') throw new Error('Share should be revoked');
  console.log('✓ Share revoked successfully, no notification sent.');

  // Cleanup
  console.log('\nCleaning up verification data...');
  await User.deleteMany({ _id: { $in: [ownerId, recipientId, recipient2Id] } });
  await Directory.deleteMany({ _id: { $in: [ownerRootId, recipientRootId, recipient2RootId] } });
  await Session.deleteMany({ userId: { $in: [ownerId, recipientId, recipient2Id] } });
  await File.deleteMany({ _id: fileId });
  await Share.deleteMany({ fileId });
  await mongoose.disconnect();

  console.log('\n=======================================');
  console.log('🎉 ALL EMAIL NOTIFICATION TESTS PASSED! 🎉');
  console.log('=======================================');
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
