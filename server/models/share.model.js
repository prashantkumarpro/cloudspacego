import { model, Schema } from 'mongoose'

const shareSchema = new Schema(
  {
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
      required: true
    },
    sharedAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    notificationStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    notificationError: {
      type: String,
      default: null
    },
    notificationSentAt: {
      type: Date,
      default: null
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

// Index for recipient querying active shares with pagination
shareSchema.index({ recipientId: 1, status: 1, sharedAt: -1, _id: -1 })

// Index for owner / file lookup of active shares
shareSchema.index({ fileId: 1, status: 1 })

// Unique index to prevent duplicate active shares for the same file-recipient pair
shareSchema.index(
  { fileId: 1, recipientId: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
)

const Share = model('Share', shareSchema)
export default Share
