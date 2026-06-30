import { Router } from 'express'
import { AuthController } from './auth.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { authLimiter } from '../../middleware/rateLimit.middleware'
import { createUserSchema, loginSchema } from './auth.schema'

const router = Router()
const controller = new AuthController()


router.post('/register', authLimiter, validate(createUserSchema), controller.register)
router.post('/login', authLimiter, validate(loginSchema), controller.login)
router.post('/google', authLimiter, controller.googleLogin)
router.get('/me', authenticate, controller.me)

export default router