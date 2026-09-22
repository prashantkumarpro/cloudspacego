import Directory from '../models/directory.model.js'
import User from '../models/user.model.js'
import mongoose, { Types } from 'mongoose'
import Session from '../models/sessionModel.js'
import OTP from '../models/otpModel.js'

export const addUser = async (req, res, next) => {
  const { name, email, password, otp } = req.body
  const otpRecord = await OTP.findOne({ email, otp })
  await otpRecord.deleteOne()

  const session = await mongoose.startSession()

  try {
    const rootDirId = new Types.ObjectId()
    const userId = new Types.ObjectId()

    session.startTransaction()

    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId
      },
      { session }
    )

    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        password,
        rootDirId
      },
      { session }
    )

    session.commitTransaction()

    res.status(201).json({ message: 'User Registered' })
  } catch (err) {
    await session.abortTransaction()

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const fieldErrors = {}

      for (const field in err.errors) {
        fieldErrors[field] = err.errors[field].message
      }

      return res.status(400).json({
        error: 'Validation failed',
        fieldErrors
      })
    }

    // Duplicate email
    if (err.code === 11000) {
      if (err.keyValue?.email) {
        return res.status(409).json({
          error: 'This email already exists',
          message:
            'A user with this email address already exists. Please try logging in or use a different email.'
        })
      }
    }

    // MongoDB validation
    if (err.code === 121) {
      return res.status(400).json({
        error: 'Invalid input, please enter valid details'
      })
    }

    next(err)
  }
}

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return res.status(404).json({ error: 'Invalid Credentials' })
  }

  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    return res.status(404).json({ error: 'Invalid Credentials' })
  }

  const allSessions = await Session.find({ userId: user.id })

  if (allSessions.length >= 2) {
    await allSessions[0].deleteOne()
  }

  const session = await Session.create({ userId: user._id })


  res.cookie('sid', session.id, {
    httpOnly: true,
    signed: true,
    maxAge: 60 * 1000 * 60 * 24 * 7
  })

  res.json({ message: 'logged in' })
}

export const getUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email
  })
}

export const logoutUser = async (req, res) => {
  const { sid } = req.signedCookies
  await Session.findByIdAndDelete(sid)
  res.clearCookie('sid')
  res.status(204).end()
}

export const logoutAll = async (req, res) => {
  const { sid } = req.signedCookies
  const session = await Session.findById(sid)
  await Session.deleteMany({ userId: session.userId })
  res.clearCookie('sid')
  res.status(204).end()
}
