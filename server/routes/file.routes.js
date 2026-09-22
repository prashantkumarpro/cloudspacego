import express from 'express'
import validateId from '../middlewares/validateId.middleware.js'

import {
  createFile,
  deleteFile,
  getFile,
  getFiles,
  updateFile
} from '../controllers/file.controller.js'
const router = express.Router()

router.param('parentDirId', validateId)
router.param('id', validateId)

// Upload or Create
router.post('/{:parentDirId}', createFile)

// Read
router.get('/', getFiles)
router.get('/:id', getFile)

// Update
router.patch('/:id', updateFile)

// Delete
router.delete('/:id', deleteFile)

export default router
