import { Router } from 'express'
import { UserController } from './user.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { updateUserSchema, createUserSchema } from './user.schema'

const router = Router()
const controller = new UserController()

// Auth middleware: only authentication required for all routes
router.use(authenticate)

// Lectura: admin y super_admin pueden listar, ver stats y obtener usuarios
router.get('/', authorize('super_admin', 'admin'), controller.getAll)
router.get('/stats', authorize('super_admin', 'admin'), controller.getStats)
router.get('/:id', authorize('super_admin', 'admin'), controller.getById)

// Creación solo super_admin
router.post('/', authorize('super_admin'), validate(createUserSchema), controller.create)

// Actualización y toggle solo super_admin
router.put('/:id', authorize('super_admin'), validate(updateUserSchema), controller.update)
router.patch('/:id/toggle', authorize('super_admin'), controller.toggleActive)

export default router