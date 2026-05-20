import cluster from 'cluster'
import os from 'os'
import http from 'http'
import app from './app'
import { env } from './config/env'
import { logger } from './config/logger'
import { testConnection } from './config/db'
import { AuthService } from './modules/auth/auth.service'

const numCPUs = os.cpus().length

const startServer = async (): Promise<void> => {
    await testConnection()

    const authService = new AuthService()
    await authService.createInitialAdmin()

    const server = http.createServer(app)

    server.maxConnections = 50000
    server.keepAliveTimeout = 65000
    server.headersTimeout = 66000
    server.timeout = 120000

    server.listen(env.port, () => {
        logger.info(`🚀 Servidor corriendo en http://localhost:${env.port}`)
        logger.info(`📋 Entorno: ${env.nodeEnv}`)
        logger.info(`🔧 Worker PID: ${process.pid}`)
        logger.info(`⚡ CPUs disponibles: ${numCPUs}`)
    })

    server.on('error', (error) => {
        logger.error('Error en el servidor HTTP:', error)
    })
}

if (env.nodeEnv === 'production' && cluster.isPrimary) {
    logger.info(`🖥️  Master PID ${process.pid} corriendo`)
    logger.info(`⚡ Iniciando ${numCPUs} workers...`)

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        logger.warn(`⚠️  Worker ${worker.process.pid} murió. Reiniciando...`)
        cluster.fork()
    })
} else {
    startServer().catch(error => {
        logger.error('Error al iniciar el servidor:', error)
        process.exit(1)
    })
}

process.on('uncaughtException', (error) => {
    logger.error('Error no capturado:', error)
    process.exit(1)
})

process.on('unhandledRejection', (reason) => {
    logger.error('Promesa rechazada no manejada:', reason)
    process.exit(1)
})