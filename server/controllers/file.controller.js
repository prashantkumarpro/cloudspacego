import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { createCursor, decodeCursor } from '../utils/cursor.js'
import Directory from '../models/directory.model.js'
import File from '../models/file.model.js'
import Share from '../models/share.model.js'
import User from '../models/user.model.js'
import {
  DEFAULT_STORAGE_LIMIT,
  getStorageStats,
} from '../config/storageQuota.js'

import { getFile as getStoredFile, deleteFile as deleteStoredFile } from '../services/storage.service.js'
import { uploadFile } from '../services/storage.service.js'
import {
  dispatchShareEmailAndUpdateRecord,
  retryShareNotification
} from '../services/shareEmailService.js'

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
          isStarred: { $ifNull: ['$isStarred', false] },
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

export const getStarredFiles = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Limit must be between 1 and 100'
      })
    }

    const cursor = req.query.cursor

    const query = {
      userId: req.user._id,
      isStarred: true
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
          isStarred: { $ifNull: ['$isStarred', false] },
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

export const toggleStarFile = async (req, res, next) => {
  const { id } = req.params

  try {
    const file = await File.findById(id)

    if (!file) {
      return res.status(404).json({
        error: 'File not found'
      })
    }

    // Verify ownership
    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Unauthorized: You do not have permission to modify this file'
      })
    }

    // Explicit desired state if provided in request body, otherwise toggle
    let targetState
    if (typeof req.body?.isStarred === 'boolean') {
      targetState = req.body.isStarred
    } else if (req.body?.isStarred !== undefined && req.body?.isStarred !== null) {
      targetState = Boolean(req.body.isStarred)
    } else {
      targetState = !Boolean(file.isStarred)
    }

    // Metadata-only update without touching Cloudflare R2
    file.isStarred = targetState
    await file.save()

    return res.status(200).json({
      success: true,
      message: targetState ? 'File starred successfully' : 'File unstarred successfully',
      file: {
        id: file._id,
        _id: file._id,
        name: file.name,
        extension: file.extension,
        size: file.size,
        parentDirId: file.parentDirId,
        userId: file.userId,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        isStarred: file.isStarred
      }
    })
  } catch (err) {
    next(err)
  }
}



export const getFile = async (req, res) => {
  try {
    const id = req.params.id

    const fileData = await File.findById(id).lean()

    // Check if file exists
    if (!fileData) {
      return res.status(404).json({
        error: 'File not found'
      })
    }

    // Permission check: owner or active share (viewer or editor)
    if (fileData.userId.toString() !== req.user._id.toString()) {
      const share = await Share.findOne({
        fileId: id,
        recipientId: req.user._id,
        status: 'active'
      }).lean()

      if (!share) {
        return res.status(403).json({
          error: 'Unauthorized: You do not have access to this file'
        })
      }
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

  if (!newFilename) {
    return res.status(400).json({
      error: 'newFilename is required'
    })
  }

  try {
    const fileData = await File.findById(id)

    // Check if file exists
    if (!fileData) {
      return res.status(404).json({
        error: 'File not found'
      })
    }

    // Permission check: owner or active share with role 'editor'
    if (fileData.userId.toString() !== req.user._id.toString()) {
      const share = await Share.findOne({
        fileId: id,
        recipientId: req.user._id,
        status: 'active',
        role: 'editor'
      }).lean()

      if (!share) {
        return res.status(403).json({
          error: 'Unauthorized: You do not have edit permission for this file'
        })
      }
    }

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

  try {
    const file = await File.findById(id).select('storageKey size userId')

    if (!file) {
      return res.status(404).json({
        error: 'File not found!'
      })
    }

    // Only the file owner can delete the file
    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Unauthorized: Only the file owner can delete this file'
      })
    }

    // Delete the actual file from storage
    await deleteStoredFile(file.storageKey)

    // Delete file metadata from MongoDB
    await file.deleteOne()

    // Revoke any active shares for this file
    await Share.updateMany({ fileId: id }, { status: 'revoked' })

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

export const getSharedWithMeFiles = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Limit must be between 1 and 100'
      })
    }

    const cursor = req.query.cursor

    const query = {
      recipientId: req.user._id,
      status: 'active'
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
          sharedAt: {
            $lt: new Date(createdAt)
          }
        },
        {
          sharedAt: new Date(createdAt),
          _id: {
            $lt: new mongoose.Types.ObjectId(id)
          }
        }
      ]
    }

    const shares = await Share.find(query)
      .sort({
        sharedAt: -1,
        _id: -1
      })
      .limit(limit + 1)
      .populate({
        path: 'fileId',
        select: '_id name extension size parentDirId createdAt updatedAt isStarred'
      })
      .populate({
        path: 'ownerId',
        select: '_id name email'
      })
      .lean()

    // Filter out shares whose files have been removed
    const validShares = shares.filter(s => s.fileId != null)
    const hasMore = validShares.length > limit
    const pageShares = validShares.slice(0, limit)

    let nextCursor = null
    if (hasMore) {
      const lastShare = pageShares[pageShares.length - 1]
      nextCursor = createCursor({
        createdAt: lastShare.sharedAt ? lastShare.sharedAt.toISOString() : new Date().toISOString(),
        id: lastShare._id.toString()
      })
    }

    const data = pageShares.map(s => {
      const file = s.fileId
      const owner = s.ownerId
      return {
        id: file._id.toString(),
        _id: file._id.toString(),
        name: file.name,
        extension: file.extension,
        size: file.size,
        parentDirId: file.parentDirId,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        isStarred: Boolean(file.isStarred),
        role: s.role,
        sharedAt: s.sharedAt,
        shareId: s._id.toString(),
        owner: owner
          ? {
              id: owner._id.toString(),
              _id: owner._id.toString(),
              name: owner.name,
              email: owner.email
            }
          : undefined
      }
    })

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

export const shareFile = async (req, res, next) => {
  const { id } = req.params
  const recipientEmail = req.body?.recipientEmail ? String(req.body.recipientEmail).trim().toLowerCase() : ''
  const role = req.body?.role ? String(req.body.role).trim().toLowerCase() : 'viewer'

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!recipientEmail || !emailRegex.test(recipientEmail)) {
    return res.status(400).json({
      error: 'Valid recipientEmail is required'
    })
  }

  if (role !== 'viewer' && role !== 'editor') {
    return res.status(400).json({
      error: 'Role must be either viewer or editor'
    })
  }

  try {
    const file = await File.findById(id)
    if (!file) {
      return res.status(404).json({
        error: 'File not found'
      })
    }

    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Unauthorized: You do not own this file'
      })
    }

    const recipient = await User.findOne({ email: recipientEmail })
    if (!recipient) {
      return res.status(404).json({
        error: 'Recipient user not found'
      })
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'You cannot share a file with yourself'
      })
    }

    const existingShare = await Share.findOne({
      fileId: file._id,
      recipientId: recipient._id
    })

    let share
    let statusCode = 201
    let shouldNotify = false

    if (existingShare) {
      if (existingShare.status === 'active') {
        if (existingShare.role === role) {
          return res.status(409).json({
            error: 'File is already shared with this user'
          })
        }
        existingShare.role = role
        existingShare.sharedAt = new Date()
        existingShare.notificationStatus = 'pending'
        existingShare.notificationError = null
        await existingShare.save()
        share = existingShare
        statusCode = 200
        shouldNotify = true
      } else {
        existingShare.status = 'active'
        existingShare.role = role
        existingShare.sharedAt = new Date()
        existingShare.notificationStatus = 'pending'
        existingShare.notificationError = null
        await existingShare.save()
        share = existingShare
        statusCode = 200
        shouldNotify = true
      }
    } else {
      share = await Share.create({
        fileId: file._id,
        ownerId: req.user._id,
        recipientId: recipient._id,
        role,
        status: 'active',
        sharedAt: new Date(),
        notificationStatus: 'pending'
      })
      shouldNotify = true
    }

    if (shouldNotify) {
      try {
        await dispatchShareEmailAndUpdateRecord({
          share,
          owner: req.user,
          recipient,
          file
        })
      } catch (emailErr) {
        // Safe logging - never let email failure bubble up to fail the share operation
        console.error('[shareFile] Error dispatching email notification:', emailErr?.message || emailErr)
      }
    }

    return res.status(statusCode).json({
      success: true,
      message: 'File shared successfully',
      share: {
        id: share._id,
        fileId: share.fileId,
        role: share.role,
        status: share.status,
        sharedAt: share.sharedAt,
        notificationStatus: share.notificationStatus,
        recipient: {
          id: recipient._id,
          name: recipient.name,
          email: recipient.email
        }
      }
    })
  } catch (err) {
    next(err)
  }
}

export const getFileShares = async (req, res, next) => {
  const { id } = req.params

  try {
    const file = await File.findById(id)
    if (!file) {
      return res.status(404).json({
        error: 'File not found'
      })
    }

    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Unauthorized: You do not own this file'
      })
    }

    const shares = await Share.find({
      fileId: id,
      ownerId: req.user._id,
      status: 'active'
    })
      .populate('recipientId', 'name email')
      .sort({ sharedAt: -1 })
      .lean()

    const data = shares
      .filter(s => s.recipientId != null)
      .map(s => ({
        id: s._id,
        role: s.role,
        status: s.status,
        sharedAt: s.sharedAt,
        notificationStatus: s.notificationStatus || 'pending',
        recipient: {
          id: s.recipientId._id,
          name: s.recipientId.name,
          email: s.recipientId.email
        }
      }))

    return res.status(200).json({
      shares: data
    })
  } catch (err) {
    next(err)
  }
}

export const retryFileShareEmail = async (req, res, next) => {
  const { id, recipientId } = req.params

  try {
    const file = await File.findById(id)
    if (!file) {
      return res.status(404).json({
        error: 'File not found'
      })
    }

    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Unauthorized: You do not own this file'
      })
    }

    const share = await Share.findOne({
      fileId: id,
      recipientId,
      ownerId: req.user._id,
      status: 'active'
    })

    if (!share) {
      return res.status(404).json({
        error: 'Active share record not found'
      })
    }

    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({
        error: 'Recipient user not found'
      })
    }

    const emailResult = await dispatchShareEmailAndUpdateRecord({
      share,
      owner: req.user,
      recipient,
      file
    })

    return res.status(200).json({
      success: emailResult.success,
      message: emailResult.success
        ? 'Notification email sent successfully'
        : 'Failed to send notification email',
      notificationStatus: share.notificationStatus,
      error: emailResult.error || null
    })
  } catch (err) {
    next(err)
  }
}

export const revokeFileShare = async (req, res, next) => {
  const { id, recipientId } = req.params

  try {
    const file = await File.findById(id)
    if (!file) {
      return res.status(404).json({
        error: 'File not found'
      })
    }

    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Unauthorized: Only the file owner can revoke sharing'
      })
    }

    const share = await Share.findOne({
      fileId: id,
      recipientId,
      ownerId: req.user._id,
      status: 'active'
    })

    if (!share) {
      return res.status(404).json({
        error: 'Active share record not found'
      })
    }

    share.status = 'revoked'
    await share.save()

    return res.status(200).json({
      success: true,
      message: 'Share access revoked successfully'
    })
  } catch (err) {
    next(err)
  }
}