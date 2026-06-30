import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
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
            if (req.user?.role === 'admin' && req.user?.branch_id) {
                params.branch_id = req.user.branch_id
            }
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

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.service.create(req.body);
            res.status(201).json({ ok: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Prevent non-super_admin from modifying role
            const payload = { ...req.body };
            if (req.user?.role !== 'super_admin' && payload.role) {
                delete payload.role;
            }
            // Pass requesterId so service can block self-role changes
            const user = await this.service.update(
                Number(req.params.id),
                payload,
                req.user!.id
            );
            res.status(200).json({
                ok: true,
                message: 'Usuario actualizado exitosamente',
                data: user
            });
        } catch (error) {
            next(error);
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
            let branchId: number | undefined
            if (req.user?.role === 'admin' && req.user?.branch_id) {
                branchId = req.user.branch_id
            }
            const stats = await this.service.getStats(branchId)
            res.status(200).json({ ok: true, data: stats })
        } catch (error) {
            next(error)
        }
    }

    getByBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const branchId = req.user?.branch_id
            if (!branchId) {
                res.status(200).json({ ok: true, data: [] })
                return
            }
            const { pool } = await import('../../config/db')
            const [rows] = await pool.query<any[]>(
                `SELECT id, name, email, role FROM users WHERE branch_id = ? AND is_active = 1 ORDER BY name ASC`,
                [branchId]
            )
            res.status(200).json({ ok: true, data: rows })
        } catch (error) {
            next(error)
        }
    }
}