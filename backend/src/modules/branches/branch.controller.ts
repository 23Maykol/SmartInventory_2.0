import { Request, Response, NextFunction } from 'express'
import { BranchRepository } from './branch.repository'
import { AppError } from '../../middleware/error.middleware'

export class BranchController {
    private repository: BranchRepository

    constructor() {
        this.repository = new BranchRepository()
    }

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const branches = await this.repository.findAll()
            res.status(200).json({ ok: true, data: branches })
        } catch (error) {
            next(error)
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const branch = await this.repository.findById(Number(req.params.id))
            if (!branch) throw new AppError(404, 'Sucursal no encontrada')
            res.status(200).json({ ok: true, data: branch })
        } catch (error) {
            next(error)
        }
    }

    getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const stats = await this.repository.getStats(Number(req.params.id))
            res.status(200).json({ ok: true, data: stats })
        } catch (error) {
            next(error)
        }
    }

    getGlobalStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const stats = await this.repository.getGlobalBranchStats()
            res.status(200).json({ ok: true, data: stats })
        } catch (error) {
            next(error)
        }
    }
}
