import { model, Schema } from 'mongoose'

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    extension: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      default: 0
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: 'Directory',
      required: true
    },

    userId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    storageKey: {
      type: String,
      required: true,
    },
    isStarred: {
      type: Boolean,
      default: false
    },
    lastAccessedAt: {
      type: Date,
      default: null
    },
    isTrash: {
      type: Boolean,
      default: false,
      index: true
    },
    trashedAt: {
      type: Date,
      default: null
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

// Index for user starred queries with pagination
fileSchema.index({ userId: 1, isStarred: 1, createdAt: -1, _id: -1 })

// Index for user recent queries with pagination
fileSchema.index({ userId: 1, lastAccessedAt: -1, _id: -1 })

// Index for user trash queries with pagination
fileSchema.index({ userId: 1, isTrash: 1, trashedAt: -1, _id: -1 })

// Index for standard user file queries excluding trash
fileSchema.index({ userId: 1, isTrash: 1, createdAt: -1, _id: -1 })

const File = model('File', fileSchema)
export default File
