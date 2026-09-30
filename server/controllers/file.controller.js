import mongoose from 'mongoose'
import { createCursor, decodeCursor } from '../utils/cursor.js'
import path from 'path'
import Directory from '../models/directory.model.js'
import File from '../models/file.model.js'

import { getFile as getStoredFile } from '../services/storage.service.js'
import { uploadFile } from '../services/storage.service.js'

export const createFile = async (req, res) => {
  try {
    // 1. Get parent directory
    const parentDirId =
      req.params.parentDirId || req.user.rootDirId

    // 2. Check parent directory belongs to current user
    const parentsDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    }).lean()

    if (!parentsDirData) {
      return res.status(404).json({
        error: 'Parent directory not found!',
      })
    }

    // 3. Get filename
    const filename = req.headers.filename || 'untitled'

    // 4. Get extension
    const extension = path.extname(filename)

    // 5. Generate MongoDB ObjectId ourselves
    const fileId = new mongoose.Types.ObjectId()

    // 6. Create storage key
    const storageKey = `files/${fileId.toString()}${extension}`

    // 7. Get content type
    const contentType =
      req.headers['content-type'] || 'application/octet-stream'

    // 8. Get size if frontend sends Content-Length
    const contentLength = req.headers['content-length']
      ? Number(req.headers['content-length'])
      : undefined

    // 9. Upload using configured storage provider
    await uploadFile({
      key: storageKey,
      body: req,
      contentType,
      contentLength,
    })

    // 10. Save file metadata in MongoDB
    await File.create({
      _id: fileId,
      extension,
      name: filename,
      size: contentLength || 0,
      parentDirId: parentsDirData._id,
      userId: req.user._id,
      storageKey,
    })

    return res.status(201).json({
      message: 'File Uploaded',
    })
  } catch (error) {
    console.error('File upload error:', error)

    return res.status(500).json({
      message: 'Could not Upload File',
    })
  }
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
  try {
    const id = req.params.id

    const fileData = await File.findOne({
      _id: id,
      userId: req.user._id
    }).lean()

    // Check if file exists
    if (!fileData) {
      return res.status(404).json({
        message: 'File not found'
      })
    }

    // Get file from configured storage provider
    const result = await getStoredFile(fileData.storageKey)

    // Set content type
    res.setHeader(
      'Content-Type',
      result.ContentType || 'application/octet-stream'
    )

    // Set file size if available
    if (result.ContentLength !== undefined) {
      res.setHeader(
        'Content-Length',
        result.ContentLength.toString()
      )
    }

    // Set download header when download is requested
    if (req.query.action === 'download') {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileData.name)}"`
      )
    }

    // Stream file to browser
    result.Body.pipe(res)

  } catch (error) {
    console.error('Get file error:', error)

    if (!res.headersSent) {
      return res.status(404).json({
        error: 'File not found!'
      })
    }

    res.end()
  }
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
  }).select('storageKey')

  if (!file) {
    return res.status(404).json({
      error: 'File not found!'
    })
  }

  try {
    // NEW: Delete the actual file from Cloudflare R2
    await deleteFromR2(file.storageKey)

    // Delete file metadata from MongoDB
    await file.deleteOne()

    return res
      .status(200)
      .json({
        success: true,
        message: 'File deleted successfully'
      })
  } catch (error) {
    return next(error)
  }
}