import { Request, Response, NextFunction } from 'express'
import { UserService } from './user.service'
import { listUsersSchema } from './user.schema'

export class UserController {
    private service: UserService

    constructor() {
        this.service = new UserService()
    }

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const params = listUsersSchema.parse(req.query)
            const result = await this.service.getAll(params)
            res.status(200).json({ ok: true, ...result })
        } catch (error) {
            next(error)
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.service.getById(Number(req.params.id))
            res.status(200).json({ ok: true, data: user })
        } catch (error) {
            next(error)
        }
    }

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.service.update(Number(req.params.id), req.body)
            res.status(200).json({
                ok: true,
                message: 'Usuario actualizado exitosamente',
                data: user
            })
        } catch (error) {
            next(error)
        }
    }

    toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.service.toggleActive(
                Number(req.params.id),
                req.user!.id
            )
            res.status(200).json({
                ok: true,
                message: `Usuario ${user?.is_active ? 'activado' : 'desactivado'} exitosamente`,
                data: user
            })
        } catch (error) {
            next(error)
        }
    }

    getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const stats = await this.service.getStats()
            res.status(200).json({ ok: true, data: stats })
        } catch (error) {
            next(error)
        }
    }
}