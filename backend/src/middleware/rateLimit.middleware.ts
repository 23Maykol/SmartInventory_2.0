import rateLimit from 'express-rate-limit'
import { env } from '../config/env'

// En producción rate limit normal, en desarrollo sin límite para pruebas
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.nodeEnv === 'production' ? 100 : 100000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        ok: false,
        message: 'Demasiadas peticiones. Intenta en 15 minutos.'
    }
})

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.nodeEnv === 'production' ? 10 : 100000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        ok: false,
        message: 'Demasiados intentos de autenticación. Intenta en 15 minutos.'
    }
})