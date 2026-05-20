import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { JwtPayload } from '../types'
import { AppError } from './error.middleware'

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader?.split(' ')[1]

        if (!token) throw new AppError(401, 'Token requerido')

        const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload
        req.user = decoded
        next()
    } catch (error) {
        if (error instanceof AppError) return next(error)
        next(new AppError(401, 'Token inválido o expirado'))
    }
}

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError(403, 'No tienes permisos para esta acción'))
        }
        next()
    }
}