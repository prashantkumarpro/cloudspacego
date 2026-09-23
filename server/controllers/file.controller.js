import mongoose from 'mongoose'
import { createCursor, decodeCursor } from '../utils/cursor.js'
import path from 'path'
import { createWriteStream } from 'fs'
import { rm } from 'fs/promises'
import Directory from '../models/directory.model.js'
import File from '../models/file.model.js'

export const createFile = async (req, res) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId

  const parentsDirData = await Directory.findOne({
    _id: parentDirId,
    userId: req.user._id
  }).lean()
  // Check if parent directory exists
  if (!parentsDirData) {
    return res.status(404).json({ error: 'Parent directory not found!' })
  }

  const filename = req.headers.filename || 'untitled'

  const extension = path.extname(filename)

  const insertedFile = await File.create({
    extension,
    name: filename,
    parentDirId: parentsDirData._id,
    userId: req.user._id
  })

  const fileId = insertedFile._id.toString()

  const fullFilename = `${fileId}${extension}`

  const storageRoot = path.resolve('./storage')

  // save file using generated ID
  const fullFilePath = path.resolve(storageRoot, fullFilename)

  const writeStream = createWriteStream(fullFilePath)

  req.pipe(writeStream)

  req.on('end', async () => {
    return res.status(201).json({ message: 'File Uploaded' })
  })

  req.on('error', async () => {
    await File.deleteOne({ _id: insertedFile.insertedId })
    return res.status(404).json({ message: 'Could not Upload File' })
  })
}

// Get all files
export const getFiles = async (req, res, next) => {
  try {
    const requestedLimit = Number(req.query.limit)

    const limit = Number.isNaN(requestedLimit) ? 20 : requestedLimit

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Limit must be between 1 and 100'
      })
    }

    const cursor = req.query.cursor

    const query = {
      userId: req.user._id
    }

    if (cursor) {
      let decodedCursor

      try {
        decodedCursor = decodeCursor(cursor)
      } catch {
        return res.status(400).json({
          error: 'Invalid cursor'
        })
      }

      const { createdAt, id } = decodedCursor

      if (
        !createdAt ||
        !id ||
        !mongoose.isValidObjectId(id) ||
        Number.isNaN(new Date(createdAt).getTime())
      ) {
        return res.status(400).json({
          error: 'Invalid cursor'
        })
      }

      query.$or = [
        {
          createdAt: {
            $lt: new Date(createdAt)
          }
        },
        {
          createdAt: new Date(createdAt),
          _id: {
            $lt: new mongoose.Types.ObjectId(id)
          }
        }
      ]
    }

    const files = await File.aggregate([
      {
        $match: query
      },
      {
        $sort: {
          createdAt: -1,
          _id: -1
        }
      },
      {
        $limit: limit + 1
      },
      {
        $lookup: {
          from: 'directories',
          let: {
            parentDirId: '$parentDirId',
            userId: '$userId'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$_id', '$$parentDirId']
                    },
                    {
                      $eq: ['$userId', '$$userId']
                    }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1
              }
            }
          ],
          as: 'directory'
        }
      },
      {
        $unwind: {
          path: '$directory',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          extension: 1,
          parentDirId: 1,
          createdAt: 1,
          directory: {
            _id: '$directory._id',
            name: '$directory.name'
          }
        }
      }
    ])

    const hasMore = files.length > limit

    const data = files.slice(0, limit)

    let nextCursor = null

    if (hasMore) {
      const lastFile = data[data.length - 1]

      nextCursor = createCursor({
        createdAt: lastFile.createdAt,
        id: lastFile._id.toString()
      })
    }

    return res.status(200).json({
      data,
      pagination: {
        limit,
        hasMore,
        nextCursor
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getFile = async (req, res) => {
  const id = req.params.id

  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id
  }).lean()

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ message: 'File not found' })
  }

  // If "download" is requested, set the appropriate headers
  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`

  if (req.query.action === 'download') {
    return res.download(filePath, fileData.name)
  }

  // Send file
  return res.sendFile(filePath, err => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: 'File not found!' })
    }
  })
}

export const updateFile = async (req, res, next) => {
  const { id } = req.params
  const { newFilename } = req.body

  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id
  })

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({
      error: 'File not found'
    })
  }

  if (!newFilename) {
    return res.status(400).json({
      error: 'newFilename is required'
    })
  }

  try {
    fileData.name = newFilename
    await fileData.save()
    return res.status(200).json({ message: 'Renamed' })
  } catch (err) {
    err.status = 500
    next(err)
  }
}

export const deleteFile = async (req, res, next) => {
  const { id } = req.params

  const file = await File.findOne({
    _id: id,
    userId: req.user._id
  }).select('extension')

  if (!file) {
    return res.status(404).json({ error: 'File not found!' })
  }

  try {
    await file.deleteOne()

    await rm(`./storage/${id}${file.extension}`)

    return res
      .status(200)
      .json({ success: true, message: 'File deleted successfully' })
  } catch (error) {
    return res.json(error)
    // next(error)
  }
}
