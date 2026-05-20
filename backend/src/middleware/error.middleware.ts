import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../config/logger'

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string
    ) {
        super(message)
        this.name = 'AppError'
    }
}

export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Error de validación Zod
    if (err instanceof ZodError) {
        const zodErr = err as ZodError
        res.status(400).json({
            ok: false,
            message: 'Datos inválidos',
            errors: zodErr.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        })
        return
    }

    // Error controlado de la aplicación
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            ok: false,
            message: err.message
        })
        return
    }

    // Error MySQL duplicado
    if ((err as any).code === 'ER_DUP_ENTRY') {
        res.status(409).json({
            ok: false,
            message: 'El recurso ya existe'
        })
        return
    }

    // Error desconocido
    logger.error('Error no controlado:', err)
    res.status(500).json({
        ok: false,
        message: 'Error interno del servidor'
    })
}