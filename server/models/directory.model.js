import { model, Schema } from 'mongoose'

const directorySchema = Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      trim: true
    },

    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: 'Directory',
      default: null
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

const Directory = model('Directory', directorySchema)
export default Directory
