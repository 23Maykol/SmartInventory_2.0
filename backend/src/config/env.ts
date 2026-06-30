import dotenv from 'dotenv'
dotenv.config()

const requiredEnvVars = [
    'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
    'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'
]

requiredEnvVars.forEach(key => {
    if (!process.env[key]) {
        console.error(`❌ Variable de entorno faltante: ${key}`)
        process.exit(1)
    }
})

export const env = {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',

    db: {
        host: process.env.DB_HOST!,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        name: process.env.DB_NAME!,
        port: parseInt(process.env.DB_PORT || '3306'),
    },

    jwt: {
        secret: process.env.JWT_SECRET!,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },

    cors: {
        origin: process.env.FRONTEND_URL || '*',
    },

    admin: {
        name: process.env.ADMIN_NAME || 'Administrador',
        email: process.env.ADMIN_EMAIL!,
        password: process.env.ADMIN_PASSWORD!,
    },
    
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '732878725249-ji0si7douqtdko97k73bksss3pngsdki.apps.googleusercontent.com',
    }
}