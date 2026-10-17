import Directory from '../models/directory.model.js'
import File from '../models/file.model.js'
import User from '../models/user.model.js'
import mongoose from 'mongoose'
import { deleteFile as deleteStoredFile } from '../services/storage.service.js'
import { rm } from 'fs/promises'

export const createDirectory = async (req, res, next) => {
  const user = req.user

  const isRoot = !req.params.parentDirId || (user.rootDirId && req.params.parentDirId === user.rootDirId.toString())
  const parentDirId = req.params.parentDirId || user.rootDirId
  const dirname = req.headers.dirname || 'New Folder'
  try {
    let parentDir = await Directory.findOne({
      _id: parentDirId
    })

    if (!parentDir && isRoot) {
      const rootId = user.rootDirId || new mongoose.Types.ObjectId()
      if (!user.rootDirId || user.rootDirId.toString() !== rootId.toString()) {
        await User.updateOne({ _id: user._id }, { $set: { rootDirId: rootId } })
        user.rootDirId = rootId
      }
      parentDir = await Directory.create({
        _id: rootId,
        name: `root-${user.email || user._id}`,
        parentDirId: null,
        userId: user._id
      })
    }

    if (!parentDir)
      return res
        .status(404)
        .json({ message: 'Parent Directory Does not exist!' })

    const newDir = await Directory.insertOne({
      name: dirname,
      parentDirId,
      userId: user._id
    })

    const dirObj = newDir && typeof newDir.toObject === 'function' ? newDir.toObject() : newDir
    return res.status(200).json({
      message: 'Directory Created!',
      directory: {
        ...dirObj,
        id: (dirObj?._id || dirObj?.id || '').toString()
      }
    })
  } catch (err) {
    console.dir(err)
    next(err)
  }
}

export const getDirectory = async (req, res, next) => {
  const user = req.user
  const isRoot = !req.params.id || (user.rootDirId && req.params.id === user.rootDirId.toString())
  const _id = req.params.id || user.rootDirId

  try {
    let directoryData = await Directory.findOne({ _id })

    if (!directoryData && isRoot) {
      const rootId = user.rootDirId || new mongoose.Types.ObjectId()
      if (!user.rootDirId || user.rootDirId.toString() !== rootId.toString()) {
        await User.updateOne({ _id: user._id }, { $set: { rootDirId: rootId } })
        user.rootDirId = rootId
      }
      directoryData = await Directory.create({
        _id: rootId,
        name: `root-${user.email || user._id}`,
        parentDirId: null,
        userId: user._id
      })
    }

    if (!directoryData) {
      return res
        .status(404)
        .json({ error: 'Directory not found or you do not have access to it!' })
    }

    const files = await File.find({ parentDirId: directoryData._id, isTrash: { $ne: true } }).lean()
    const directories = await Directory.find({ parentDirId: directoryData._id }).lean()

    const dirObj = directoryData && typeof directoryData.toObject === 'function' ? directoryData.toObject() : directoryData

    return res.status(200).json({
      ...dirObj,
      id: (dirObj?._id || dirObj?.id || '').toString(),
      files: files.map(dir => ({ ...dir, id: dir._id })),
      directories: directories.map(dir => ({ ...dir, id: dir._id }))
    })
  } catch (err) {
    if (next) return next(err)
    return res.status(500).json({ error: 'Failed to fetch directory' })
  }
}

export const updateDirectory = async (req, res, next) => {
  const user = req.user
  const { id } = req.params
  const { newDirName } = req.body

  if (!newDirName || !newDirName.trim()) {
    return res.status(400).json({ error: 'newDirName is required' })
  }

  try {
    const updated = await Directory.findOneAndUpdate(
      {
        _id: id,
        userId: user._id
      },
      { $set: { name: newDirName.trim() } },
      { new: true }
    ).lean()

    if (!updated) {
      return res.status(404).json({ error: 'Directory not found!' })
    }

    return res.status(200).json({
      message: 'Directory Renamed!',
      directory: {
        ...updated,
        id: updated._id.toString()
      }
    })
  } catch (err) {
    next(err)
  }
}

export const deleteDriectory = async (req, res, next) => {
  const { id } = req.params
  try {
    if (req.user.rootDirId && id === req.user.rootDirId.toString()) {
      return res.status(400).json({ error: 'Cannot delete root directory!' })
    }

    const directoryData = await Directory.findOne(
      {
        _id: id,
        userId: req.user._id
      },
      { _id: 1 }
    ).lean()

    if (!directoryData) {
      return res.status(404).json({ error: 'Directory not found!' })
    }

    async function getDirectoryContents (id) {
      let files = await File.find({ parentDirId: id })
        .select('extension size storageKey')
        .lean()

      let directories = await Directory.find({ parentDirId: id })
        .select('_id')
        .lean()

      for (const { _id } of directories) {
        const { files: childFiles, directories: childDirectories } =
          await getDirectoryContents(_id)

        files = [...files, ...childFiles]
        directories = [...directories, ...childDirectories]
      }

      return { files, directories }
    }

    const { files, directories } = await getDirectoryContents(id)

    let totalDeletedBytes = 0

    for (const file of files) {
      const fileKey = file.storageKey || `files/${file._id.toString()}${file.extension}`
      await deleteStoredFile(fileKey).catch(() => {})
      if (typeof file.size === 'number' && file.size > 0) {
        totalDeletedBytes += file.size
      }
    }

    await File.deleteMany({
      _id: { $in: files.map(({ _id }) => _id) }
    })

    await Directory.deleteMany({
      _id: { $in: [...directories.map(({ _id }) => _id), id] }
    })

    if (totalDeletedBytes > 0) {
      await User.updateOne(
        { _id: req.user._id },
        [
          {
            $set: {
              storageUsed: {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $ifNull: ['$storageUsed', 0] },
                      totalDeletedBytes,
                    ],
                  },
                ],
              },
            },
          },
        ],
        { updatePipeline: true }
      )
    }
  } catch (error) {
    next(error)
  }

  return res.json({ message: 'Files deleted successfully' })
}
