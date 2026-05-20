import { Router } from 'express'
import { MovementController } from './movement.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { createMovementSchema } from './movement.schema'

const router = Router()
const controller = new MovementController()

router.use(authenticate)

router.get('/', controller.getAll)
router.post('/', validate(createMovementSchema), controller.create)
router.get('/product/:productId', controller.getByProduct)

export default router