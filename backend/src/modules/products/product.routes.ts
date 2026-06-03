import { Router } from 'express'
import { ProductController } from './product.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'
import { createProductSchema, updateProductSchema } from './product.schema'

const router = Router()
const controller = new ProductController()

router.use(authenticate)

router.get('/', controller.getAll)
router.get('/:id', controller.getById)
router.post('/', authorize('admin', 'employee'), validate(createProductSchema), controller.create)
router.put('/:id', authorize('admin'), validate(updateProductSchema), controller.update)
router.delete('/:id', authorize('admin'), controller.delete)

export default router