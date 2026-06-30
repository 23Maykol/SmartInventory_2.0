import { Request, Response, NextFunction } from 'express'
import { StatsRepository } from './stats.repository'

export class StatsController {
    private repository: StatsRepository

    constructor() {
        this.repository = new StatsRepository()
    }

    getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const stats = await this.repository.getDashboardStats()
            res.status(200).json({ ok: true, data: stats })
        } catch (error) {
            next(error)
        }
    }

    getSuperDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const branchId = req.query.branch_id ? Number(req.query.branch_id) : undefined;
            const stats = await this.repository.getSuperAdminStats(branchId)
            res.status(200).json({ ok: true, data: stats })
        } catch (error) {
            next(error)
        }
    }
}