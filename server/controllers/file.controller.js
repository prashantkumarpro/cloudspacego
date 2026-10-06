import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { createCursor, decodeCursor } from '../utils/cursor.js'
import Directory from '../models/directory.model.js'
import File from '../models/file.model.js'
import User from '../models/user.model.js'
import {
  DEFAULT_STORAGE_LIMIT,
  getStorageStats,
} from '../config/storageQuota.js'

import { getFile as getStoredFile, deleteFile as deleteStoredFile } from '../services/storage.service.js'
import { uploadFile } from '../services/storage.service.js'

export const createFile = async (req, res) => {
  let fileId = null
  let storageKey = null
  let isUploadedToStorage = false
  let isMetadataCreated = false
  let reservedSize = 0

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

    // 3. Determine if Content-Length header is provided
    const contentLength = req.headers['content-length']
      ? Number(req.headers['content-length'])
      : undefined
    const hasKnownSize =
      contentLength !== undefined && !Number.isNaN(contentLength) && contentLength > 0

    // 4. If Content-Length is known, ATOMICALLY RESERVE quota in MongoDB
    if (hasKnownSize) {
      const reservedUser = await User.findOneAndUpdate(
        {
          _id: req.user._id,
          $expr: {
            $lte: [
              { $add: [{ $ifNull: ['$storageUsed', 0] }, contentLength] },
              { $ifNull: ['$storageLimit', DEFAULT_STORAGE_LIMIT] },
            ],
          },
        },
        { $inc: { storageUsed: contentLength } },
        { returnDocument: 'after' }
      )

      if (!reservedUser) {
        const currentUser = await User.findById(req.user._id).select(
          'storageUsed storageLimit plan'
        )
        const stats = getStorageStats(currentUser || req.user)

        return res.status(400).json({
          error: 'Storage limit exceeded',
          message: 'Storage quota exceeded. Please free up space or upgrade your plan.',
          limit: stats.limit,
          used: stats.used,
          required: contentLength,
          remaining: stats.remaining,
        })
      }

      reservedSize = contentLength
    }

    // 5. Get filename and extension
    const filename = req.headers.filename || 'untitled'
    const extension = path.extname(filename)

    // 6. Generate MongoDB ObjectId and storage key
    fileId = new mongoose.Types.ObjectId()
    storageKey = `files/${fileId.toString()}${extension}`

    // 7. Get content type
    const contentType =
      req.headers['content-type'] || 'application/octet-stream'

    // 8. Stream file to storage provider
    await uploadFile({
      key: storageKey,
      body: req,
      contentType,
      contentLength,
    })
    isUploadedToStorage = true

    // 9. Determine actual uploaded size
    let actualSize = reservedSize

    if (process.env.STORAGE_DRIVER === 'local' || actualSize === 0) {
      try {
        const localFilePath = path.resolve('./storage', storageKey)
        const stat = await fs.promises.stat(localFilePath)
        if (stat && typeof stat.size === 'number') {
          actualSize = stat.size
        }
      } catch {
        // Fallback to existing actualSize if stat fails
      }
    }

    // 10. Handle size adjustments or unknown initial size
    if (reservedSize === 0) {
      // Content-Length was missing; atomically reserve actualSize now
      const postReservedUser = await User.findOneAndUpdate(
        {
          _id: req.user._id,
          $expr: {
            $lte: [
              { $add: [{ $ifNull: ['$storageUsed', 0] }, actualSize] },
              { $ifNull: ['$storageLimit', DEFAULT_STORAGE_LIMIT] },
            ],
          },
        },
        { $inc: { storageUsed: actualSize } },
        { returnDocument: 'after' }
      )

      if (!postReservedUser) {
        await deleteStoredFile(storageKey).catch(() => {})
        isUploadedToStorage = false

        const currentUser = await User.findById(req.user._id).select(
          'storageUsed storageLimit plan'
        )
        const stats = getStorageStats(currentUser || req.user)

        return res.status(400).json({
          error: 'Storage limit exceeded',
          message: 'Storage quota exceeded. Please free up space or upgrade your plan.',
          limit: stats.limit,
          used: stats.used,
          required: actualSize,
          remaining: stats.remaining,
        })
      }

      reservedSize = actualSize
    } else if (actualSize !== reservedSize) {
      // Actual streamed size differed from Content-Length
      if (actualSize < reservedSize) {
        // Release excess reservation atomically
        const diff = reservedSize - actualSize
        await User.updateOne(
          { _id: req.user._id },
          [
            {
              $set: {
                storageUsed: {
                  $max: [0, { $subtract: [{ $ifNull: ['$storageUsed', 0] }, diff] }],
                },
              },
            },
          ],
          { updatePipeline: true }
        )
        reservedSize = actualSize
      } else if (actualSize > reservedSize) {
        // Streamed more than header; reserve delta atomically
        const delta = actualSize - reservedSize
        const extraReserved = await User.findOneAndUpdate(
          {
            _id: req.user._id,
            $expr: {
              $lte: [
                { $add: [{ $ifNull: ['$storageUsed', 0] }, delta] },
                { $ifNull: ['$storageLimit', DEFAULT_STORAGE_LIMIT] },
              ],
            },
          },
          { $inc: { storageUsed: delta } },
          { returnDocument: 'after' }
        )

        if (!extraReserved) {
          // Extra bytes exceeded quota -> rollback entire reservation and clean up
          await deleteStoredFile(storageKey).catch(() => {})
          isUploadedToStorage = false

          await User.updateOne(
            { _id: req.user._id },
            [
              {
                $set: {
                  storageUsed: {
                    $max: [0, { $subtract: [{ $ifNull: ['$storageUsed', 0] }, reservedSize] }],
                  },
                },
              },
            ],
            { updatePipeline: true }
          )
          reservedSize = 0

          const currentUser = await User.findById(req.user._id).select(
            'storageUsed storageLimit plan'
          )
          const stats = getStorageStats(currentUser || req.user)

          return res.status(400).json({
            error: 'Storage limit exceeded',
            message: 'Storage quota exceeded. Please free up space or upgrade your plan.',
            limit: stats.limit,
            used: stats.used,
            required: actualSize,
            remaining: stats.remaining,
          })
        }

        reservedSize = actualSize
      }
    }

    // 11. Save file metadata in MongoDB
    await File.create({
      _id: fileId,
      extension,
      name: filename,
      size: actualSize,
      parentDirId: parentsDirData._id,
      userId: req.user._id,
      storageKey,
    })
    isMetadataCreated = true

    return res.status(201).json({
      message: 'File Uploaded',
      size: actualSize,
    })
  } catch (error) {
    console.error('File upload error:', error)

    // Release any reserved quota on failure atomically
    if (reservedSize > 0) {
      try {
        await User.updateOne(
          { _id: req.user._id },
          [
            {
              $set: {
                storageUsed: {
                  $max: [0, { $subtract: [{ $ifNull: ['$storageUsed', 0] }, reservedSize] }],
                },
              },
            },
          ],
          { updatePipeline: true }
        )
      } catch (releaseErr) {
        console.error('Failed to release reserved storage quota:', releaseErr)
      }
    }

    // Cleanup storage file if partially uploaded
    if (isUploadedToStorage && storageKey) {
      try {
        await deleteStoredFile(storageKey)
      } catch (cleanupErr) {
        console.error('Cleanup storage error on upload failure:', cleanupErr)
      }
    }

    // Cleanup MongoDB file metadata if partially created
    if (isMetadataCreated && fileId) {
      try {
        await File.deleteOne({ _id: fileId, userId: req.user._id })
      } catch (cleanupErr) {
        console.error('Cleanup DB error on upload failure:', cleanupErr)
      }
    }

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
          size: 1,
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
  }).select('storageKey size')

  if (!file) {
    return res.status(404).json({
      error: 'File not found!'
    })
  }

  try {
    // Delete the actual file from storage
    await deleteStoredFile(file.storageKey)

    // Delete file metadata from MongoDB
    await file.deleteOne()

    // Atomically decrement user's storageUsed (never negative)
    const fileSize = typeof file.size === 'number' && file.size > 0 ? file.size : 0
    if (fileSize > 0) {
      await User.updateOne(
        { _id: req.user._id },
        [
          {
            $set: {
              storageUsed: {
                $max: [0, { $subtract: [{ $ifNull: ['$storageUsed', 0] }, fileSize] }],
              },
            },
          },
        ],
        { updatePipeline: true }
      )
    }

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