import { model, Schema } from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, 'Name must be at least 3 characters long'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email address'
      ]
    },

    password: {
      type: String,
      required: true,
      minLength: [6, 'Password must be 6 character long'],
      select: false // Do not return password by default
    },

    rootDirId: {
      type: Schema.Types.ObjectId,
      ref: 'Directory'
    }
  },

  {
    versionKey: false
  }
)

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default model('User', userSchema)
