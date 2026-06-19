import rateLimit from 'express-rate-limit'
import { env } from '../config/env'

const isProduction = env.nodeEnv === 'production'

// Leer límites personalizados del .env, con defaults inteligentes:
//   - RATE_LIMIT_GLOBAL: p.ej. 500 para testing, 100 para prod
//   - RATE_LIMIT_AUTH  : p.ej. 200 para testing, 10  para prod
const globalMax = process.env.RATE_LIMIT_GLOBAL
    ? parseInt(process.env.RATE_LIMIT_GLOBAL)
    : isProduction ? 100 : 10_000

const authMax = process.env.RATE_LIMIT_AUTH
    ? parseInt(process.env.RATE_LIMIT_AUTH)
    : isProduction ? 10 : 10_000

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: globalMax,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => true, // Deshabilitado temporalmente para pruebas
    message: {
        ok: false,
        message: 'Demasiadas peticiones. Intenta en 15 minutos.'
    }
})

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: authMax,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => true, // Deshabilitado temporalmente para pruebas
    message: {
        ok: false,
        message: 'Demasiados intentos de autenticación. Intenta en 15 minutos.'
    }
})