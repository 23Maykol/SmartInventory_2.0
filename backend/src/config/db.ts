import mysql from 'mysql2/promise'
import { env } from './env'
import { logger } from './logger'

export const pool = mysql.createPool({
    host: env.db.host,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    port: env.db.port,
    connectionLimit: 150,
    waitForConnections: true,
    queueLimit: 500,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    timezone: '+00:00',
    connectTimeout: 60000,
    idleTimeout: 60000,
})

export const testConnection = async (): Promise<void> => {
    try {
        const conn = await pool.getConnection()
        await conn.ping()
        conn.release()
        logger.info('✅ Base de datos conectada correctamente')
    } catch (error) {
        logger.error('❌ Error al conectar la base de datos:', error)
        process.exit(1)
    }
}