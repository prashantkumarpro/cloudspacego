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
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

// // Prevent duplicate file names in the same directory
// fileSchema.index({ userId: 1, parentDirId: 1, name: 1 }, { unique: true })

// // Fast lookup for files inside a directory
// fileSchema.index({ userId: 1, parentDirId: 1 })

const File = model('File', fileSchema)
export default File
