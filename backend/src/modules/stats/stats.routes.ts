import { Router } from 'express'
import { StatsController } from './stats.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'

const router = Router()
const controller = new StatsController()

router.get('/dashboard', authenticate, authorize('admin'), controller.getDashboard)

export default router