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
import connectDB from './config/db.js'

const mySecretKey = 'My-cloudeStorage-123$#'

try {
  connectDB()

  const app = express()
  app.use(cookieParser(mySecretKey))
  app.use(express.json())
  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5174',
        'http://localhost:5173'
      ],
      credentials: true
    })
  )

  app.use((req, res, next) => {
    next()
  })

  app.use('/', healthRoutes)
  app.use('/directory', checkAuth, directoryRoutes)
  app.use('/file', checkAuth, fileRoutes)
  app.use('/user', userRoutes)
  app.use('/auth', authRoutes)

  app.use((err, req, res, next) => {
    console.log(err)
    res.status(err.status || 500).json({ error: 'Something went wrong!!' })
  })

  app.listen(4000, () => {
    console.log(`Server Started`)
  })
} catch (err) {
  console.log('Could not connect to database!')
  console.log(err)
}
