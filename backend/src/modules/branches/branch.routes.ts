import { Router } from 'express'
import { BranchController } from './branch.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'

const router = Router()
const controller = new BranchController()

// All branch routes require super_admin
router.use(authenticate, authorize('super_admin'))

router.get('/', controller.getAll)
router.get('/global-stats', controller.getGlobalStats)
router.get('/:id', controller.getById)
router.get('/:id/stats', controller.getStats)

export default router
