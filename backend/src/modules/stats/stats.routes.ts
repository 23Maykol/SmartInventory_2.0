import { Router } from 'express'
import { StatsController } from './stats.controller'
import { authenticate, authorize } from '../../middleware/auth.middleware'

const router = Router()
const controller = new StatsController()

// Dashboard stats for admin and super_admin
router.get('/dashboard', authenticate, authorize('super_admin', 'admin'), controller.getDashboard)

// Super admin exclusive dashboard with extended stats + branches
router.get('/super-dashboard', authenticate, authorize('super_admin'), controller.getSuperDashboard)

export default router