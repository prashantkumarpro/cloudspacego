import express from 'express'
import validateId from '../middlewares/validateId.middleware.js'

import {
  createFile,
  deleteFile,
  getFile,
  getFiles,
  getFileShares,
  getSharedWithMeFiles,
  getStarredFiles,
  revokeFileShare,
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
router.get('/', getFiles)
router.get('/:id', getFile)
router.get('/:id/shares', getFileShares)

// Share & Revoke
router.post('/:id/share', shareFile)
router.delete('/:id/share/:recipientId', revokeFileShare)

// Update
router.patch('/:id/star', toggleStarFile)
router.patch('/:id', updateFile)

// Delete
router.delete('/:id', deleteFile)

export default router
