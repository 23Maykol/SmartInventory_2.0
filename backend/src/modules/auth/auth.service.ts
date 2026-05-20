import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthRepository } from './auth.repository'
import { RegisterInput, LoginInput } from './auth.schema'
import { AppError } from '../../middleware/error.middleware'
import { env } from '../../config/env'
import { logger } from '../../config/logger'

export class AuthService {
    private repository: AuthRepository

    constructor() {
        this.repository = new AuthRepository()
    }

    async register(data: RegisterInput) {
        const exists = await this.repository.emailExists(data.email)
        if (exists) throw new AppError(409, 'El email ya está registrado')

        const hashedPassword = await bcrypt.hash(data.password, 10)
        const userId = await this.repository.create({
            ...data,
            password: hashedPassword
        })

        const user = await this.repository.findById(userId)
        logger.info(`Nuevo usuario registrado: ${data.email}`)
        return user
    }

    async login(data: LoginInput) {
        const user = await this.repository.findByEmail(data.email)
        if (!user) throw new AppError(401, 'Credenciales incorrectas')

        const validPassword = await bcrypt.compare(data.password, user.password)
        if (!validPassword) throw new AppError(401, 'Credenciales incorrectas')

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            env.jwt.secret,
            { expiresIn: env.jwt.expiresIn as any }
        )

        logger.info(`Login exitoso: ${data.email}`)

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    }

    async createInitialAdmin(): Promise<void> {
        const exists = await this.repository.emailExists(env.admin.email)
        if (exists) {
            logger.info('ℹ️  Admin ya existe, omitiendo creación')
            return
        }

        const hashedPassword = await bcrypt.hash(env.admin.password, 10)
        await this.repository.create({
            name: env.admin.name,
            email: env.admin.email,
            password: hashedPassword,
            role: 'admin'
        })

        logger.info(`✅ Admin inicial creado: ${env.admin.email}`)
    }
}