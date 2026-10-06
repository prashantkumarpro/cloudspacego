import express from 'express'
import checkAuth from '../middlewares/auth.middleware.js'
import {
  addUser,
  getUser,
  getUserStorage,
  loginUser,
  logoutUser
} from '../controllers/user.controller.js'
const router = express.Router()


router.post('/register', addUser)
router.post('/login', loginUser)
router.get('/', checkAuth, getUser)
router.get('/storage', checkAuth, getUserStorage)
router.post('/logout', logoutUser)

export default router
