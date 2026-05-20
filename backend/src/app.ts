import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { env } from './config/env'
import { globalLimiter } from './middleware/rateLimit.middleware'
import { errorMiddleware } from './middleware/error.middleware'
import { logger } from './config/logger'
import authRoutes from './modules/auth/auth.routes'
import productRoutes from './modules/products/product.routes'
import userRoutes from './modules/users/user.routes'
import movementRoutes from './modules/movements/movement.routes'
import statsRoutes from './modules/stats/stats.routes'

const app = express()

// ─── Seguridad ───
app.use(helmet())
app.use(cors({
    origin: env.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Authorization', 'Content-Type']
}))

// ─── Performance ───
app.use(compression({ level: 6, threshold: 1024 }))
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.set('etag', false)

// ─── Body Parser ───
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── Rate limit global ───
app.use('/api/', globalLimiter)

// ─── Logger de peticiones ───
app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
        const duration = Date.now() - start
        if (duration > 1000) {
            logger.warn(`SLOW ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`)
        } else {
            logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`)
        }
    })
    next()
})

// ─── Rutas ───
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/movements', movementRoutes)
app.use('/api/stats', statsRoutes)

// ─── Health check ───
app.get('/api/health', (req, res) => {
    res.status(200).json({
        ok: true,
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: env.nodeEnv
    })
})

// ─── Ruta no encontrada ───
app.use((req, res) => {
    res.status(404).json({
        ok: false,
        message: `Ruta ${req.originalUrl} no encontrada`
    })
})

// ─── Manejo de errores ───
app.use(errorMiddleware)

export default app