import { Router } from 'express'
import { UserController } from './user.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { updateUserSchema } from './user.schema'

const router = Router()
const controller = new UserController()

// Todas las rutas requieren autenticación y rol admin
router.use(authenticate, authorize('admin'))

router.get('/', controller.getAll)
router.get('/stats', controller.getStats)
router.get('/:id', controller.getById)
router.put('/:id', validate(updateUserSchema), controller.update)
router.patch('/:id/toggle', controller.toggleActive)

export default router