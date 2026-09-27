import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import healthRoutes from './routes/health.routes.js'
import directoryRoutes from './routes/directory.routes.js'
import fileRoutes from './routes/file.routes.js'
import userRoutes from './routes/user.routes.js'
import authRoutes from './routes/auth.routes.js'
import checkAuth from './middlewares/auth.middleware.js'
import fs from 'fs'
import path from 'path'
import connectDB from './config/db.js'

const mySecretKey = 'My-cloudeStorage-123$#'

const startServer = async () => {
  try {
    // 1. Connect to MongoDB first
    await connectDB()

    // 2. Prepare local storage
    fs.mkdirSync(path.resolve('./storage'), { recursive: true })

    // 3. Create Express app
    const app = express()

    app.use(cookieParser(mySecretKey))
    app.use(express.json())

    app.use(
      cors({
        origin: [
          'http://localhost:3000',
          'http://localhost:5174',
          'http://localhost:5173',
          process.env.CORS_ORIGIN
        ],
        credentials: true
      })
    )

    app.use('/', healthRoutes)
    app.use('/directory', checkAuth, directoryRoutes)
    app.use('/file', checkAuth, fileRoutes)
    app.use('/user', userRoutes)
    app.use('/auth', authRoutes)

    app.use((err, req, res, next) => {
      console.log(err)
      res.status(err.status || 500).json({
        error: 'Something went wrong!!'
      })
    })

    // 4. Start server only after DB connection succeeds
    const PORT = process.env.PORT || 4000

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server Started on port ${PORT}`)
    })
  } catch (err) {
    console.error('Could not start server:', err)
    process.exit(1)
  }
}

startServer()