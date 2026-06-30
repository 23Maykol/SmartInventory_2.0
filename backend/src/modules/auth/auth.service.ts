import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthRepository } from './auth.repository'
import { LoginInput, CreateUserInput } from './auth.schema'
import { AppError } from '../../middleware/error.middleware'
import { env } from '../../config/env'
import { logger } from '../../config/logger'
import { UserService } from '../users/user.service'
import { OAuth2Client } from 'google-auth-library'

export class AuthService {
    private authRepository: AuthRepository
    private userService: UserService
    private googleClient: OAuth2Client

    constructor() {
        this.authRepository = new AuthRepository()
        this.userService = new UserService()
        this.googleClient = new OAuth2Client(env.google.clientId)
    }

    // Create initial admin (super_admin) if not exists
    async createInitialAdmin(): Promise<void> {
        const adminEmail = env.admin.email
        const existing = await this.userService.findByEmail(adminEmail)
        if (existing) {
            logger.info('ℹ️  Admin already exists, skipping creation')
            return
        }
        // Create super admin without double‑hashing (UserService will hash the password)
        await this.userService.create({
            name: env.admin.name,
            email: adminEmail,
            password: env.admin.password,
            role: 'super_admin',
        })
        logger.info(`✅ Initial super_admin created: ${adminEmail}`)
    }

    // Public registration – role is forced to 'employee', cannot self-assign admin
    async register(data: CreateUserInput) {
        const existing = await this.userService.findByEmail(data.email)
        if (existing) throw new AppError(409, 'Ya existe una cuenta con ese correo')

        const user = await this.userService.create({
            name: data.name,
            email: data.email,
            password: data.password,
            role: 'employee',  // always employee on public register
        })

        logger.info(`✅ Nuevo usuario registrado: ${data.email}`)
        return { id: user?.id, name: user?.name, email: user?.email, role: user?.role }
    }

    // async register(...) { ... }

    async login(data: LoginInput) {
        const user = await this.authRepository.findByEmail(data.email)
        if (!user) throw new AppError(401, 'Credenciales incorrectas')
        const validPassword = await bcrypt.compare(data.password, user.password)
        if (!validPassword) throw new AppError(401, 'Credenciales incorrectas')
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, branch_id: user.branch_id ?? null },
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
                role: user.role,
                branch_id: user.branch_id ?? null,
            },
        }
    }

    async googleLogin(idToken: string) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: env.google.clientId,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new AppError(400, 'Token de Google inválido');
            }

            const { email, name } = payload;

            let user = await this.authRepository.findByEmail(email);

            if (!user) {
                // Registrar usuario nuevo vía Google
                await this.userService.create({
                    name: name || 'Usuario',
                    email,
                    password: '',
                    role: 'employee',
                    auth_provider: 'google'
                });
                
                user = await this.authRepository.findByEmail(email);
                if (!user) throw new AppError(500, 'Error al crear usuario con Google');
                logger.info(`✅ Nuevo usuario registrado vía Google: ${email}`);
            } else {
                logger.info(`✅ Login exitoso vía Google: ${email}`);
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, branch_id: user.branch_id ?? null },
                env.jwt.secret,
                { expiresIn: env.jwt.expiresIn as any }
            )

            return {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    branch_id: user.branch_id ?? null,
                },
            }
        } catch (error) {
            logger.error(`Error verificando token de Google: ${error}`);
            throw new AppError(401, 'Autenticación con Google fallida');
        }
    }
}