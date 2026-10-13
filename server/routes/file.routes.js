import express from 'express'
import validateId from '../middlewares/validateId.middleware.js'

import {
  createFile,
  deleteFile,
  deleteFilePermanent,
  emptyTrash,
  getFile,
  getFiles,
  getFileShares,
  getRecentFiles,
  getSharedWithMeFiles,
  getStarredFiles,
  getTrashFiles,
  recordFileAccess,
  restoreFile,
  revokeFileShare,
  retryFileShareEmail,
  shareFile,
  toggleStarFile,
  updateFile
} from '../controllers/file.controller.js'
const router = express.Router()

router.param('parentDirId', validateId)
router.param('id', validateId)
router.param('recipientId', validateId)

// Upload or Create
router.post('/{:parentDirId}', createFile)

// Read
router.get('/shared-with-me', getSharedWithMeFiles)
router.get('/starred', getStarredFiles)
router.get('/recent', getRecentFiles)
router.get('/trash', getTrashFiles)
router.get('/', getFiles)

// Trash bulk actions (must be registered before /:id)
router.delete('/trash/empty', emptyTrash)

// File specific operations
router.get('/:id', getFile)
router.get('/:id/shares', getFileShares)

// Share & Revoke
router.post('/:id/share', shareFile)
router.post('/:id/share/:recipientId/retry-email', retryFileShareEmail)
router.delete('/:id/share/:recipientId', revokeFileShare)

// Update & Restore
router.patch('/:id/access', recordFileAccess)
router.patch('/:id/star', toggleStarFile)
router.patch('/:id/restore', restoreFile)
router.patch('/:id', updateFile)

// Delete & Permanent Delete
router.delete('/:id/permanent', deleteFilePermanent)
router.delete('/:id', deleteFile)

export default router
