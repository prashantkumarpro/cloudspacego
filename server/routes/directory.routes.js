import express from 'express'
import validateId from '../middlewares/validateId.middleware.js'
import {
  createDirectory,
  deleteDriectory,
  getDirectory,
  updateDirectory
} from '../controllers/directory.controller.js'

const router = express.Router()

router.param('parentDirId', validateId)
router.param('id', validateId)

// Create Directory
router.post('/{:parentDirId}', createDirectory)

// Read
router.get('/{:id}', getDirectory)

// Update Directory
router.patch('/:id', updateDirectory)

// Delete Direcotry
router.delete('/:id', deleteDriectory)

export default router
