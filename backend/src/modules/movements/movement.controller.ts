import { Request, Response, NextFunction } from 'express'
import { MovementService } from './movement.service'
import { listMovementsSchema } from './movement.schema'

export class MovementController {
    private service: MovementService

    constructor() {
        this.service = new MovementService()
    }

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const params = listMovementsSchema.parse(req.query)
            // Scope movements to the branch of the authenticated user
            if (req.user?.branch_id) {
                params.branch_id = req.user.branch_id
            }
            const result = await this.service.getAll(params)
            res.status(200).json({ ok: true, ...result })
        } catch (error) {
            next(error)
        }
    }

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (req.user!.role === 'employee' && !req.user!.branch_id) {
                res.status(403).json({
                    ok: false,
                    message: 'No puedes registrar movimientos porque no tienes una sucursal asignada. Contacta a un administrador.'
                });
                return;
            }
            const movementId = await this.service.create(req.body, req.user!.id)
            res.status(201).json({
                ok: true,
                message: 'Movimiento registrado exitosamente',
                data: { id: movementId }
            })
        } catch (error) {
            next(error)
        }
    }

    getByProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const movements = await this.service.getByProduct(Number(req.params.productId))
            res.status(200).json({ ok: true, data: movements })
        } catch (error) {
            next(error)
        }
    }
}