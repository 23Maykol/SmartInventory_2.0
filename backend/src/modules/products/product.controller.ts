import { Request, Response, NextFunction } from 'express'
import { ProductService } from './product.service'
import { paginationSchema } from './product.schema'

export class ProductController {
    private service: ProductService

    constructor() {
        this.service = new ProductService()
    }

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const params = paginationSchema.parse(req.query)
            const result = await this.service.getAll(params)
            res.status(200).json({ ok: true, ...result })
        } catch (error) {
            next(error)
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const product = await this.service.getById(Number(req.params.id))
            res.status(200).json({ ok: true, data: product })
        } catch (error) {
            next(error)
        }
    }

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const product = await this.service.create(req.body)
            res.status(201).json({
                ok: true,
                message: 'Producto creado exitosamente',
                data: product
            })
        } catch (error) {
            next(error)
        }
    }

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const product = await this.service.update(Number(req.params.id), req.body)
            res.status(200).json({
                ok: true,
                message: 'Producto actualizado exitosamente',
                data: product
            })
        } catch (error) {
            next(error)
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.service.delete(Number(req.params.id))
            res.status(200).json({
                ok: true,
                message: 'Producto eliminado exitosamente'
            })
        } catch (error) {
            next(error)
        }
    }

    traceUnit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const trace = await this.service.traceUnit(String(req.params.serial_code))
            res.status(200).json({ ok: true, data: trace })
        } catch (error) {
            next(error)
        }
    }
}