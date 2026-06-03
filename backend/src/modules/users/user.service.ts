import { UserRepository } from './user.repository'
import { UpdateUserInput, ListUsersInput } from './user.schema'
import { AppError } from '../../middleware/error.middleware'
import { logger } from '../../config/logger';
import bcrypt from 'bcryptjs';

export class UserService {
    private repository: UserRepository

    constructor() {
        this.repository = new UserRepository()
    }

    async getAll(params: ListUsersInput) {
        const { data, total } = await this.repository.findAll(params)
        const totalPages = Math.ceil(total / params.limit)
        return { data, total, page: params.page, limit: params.limit, totalPages }
    }

    async getById(id: number) {
        const user = await this.repository.findById(id)
        if (!user) throw new AppError(404, 'Usuario no encontrado')
        return user
    }

    async update(id: number, data: UpdateUserInput, requesterId?: number) {
        const user = await this.repository.findById(id)
        if (!user) throw new AppError(404, 'Usuario no encontrado')

        // Prevent any user from changing their own role
        if (requesterId !== undefined && id === requesterId && data.role !== undefined) {
            throw new AppError(400, 'No puedes cambiar tu propio rol')
        }

        // Prevent assigning super_admin role via normal update
        if (data.role === 'super_admin') {
            throw new AppError(400, 'No se puede asignar el rol de super_admin')
        }

        await this.repository.update(id, data)
        const updated = await this.repository.findById(id)

        logger.info(`Usuario actualizado: ID ${id}`)
        return updated
    }

    async toggleActive(id: number, requesterId: number) {
        if (id === requesterId) {
            throw new AppError(400, 'No puedes desactivar tu propia cuenta')
        }

        const user = await this.repository.findById(id)
        if (!user) throw new AppError(404, 'Usuario no encontrado')

        await this.repository.toggleActive(id)
        const updated = await this.repository.findById(id)

        logger.info(`Usuario ${updated?.is_active ? 'activado' : 'desactivado'}: ID ${id}`)
        return updated
    }

    async getStats() {
        return await this.repository.getStats()
    }

    async findByEmail(email: string) {
        const user = await this.repository.findByEmail(email)
        return user
    }

    async create(data: any) {
        // data includes name, email, password, role
        const hashed = await bcrypt.hash(data.password, 10)
        const userId = await this.repository.create({
            name: data.name,
            email: data.email,
            password: hashed,
            role: data.role ?? 'employee',
        })
        const user = await this.repository.findById(userId)
        logger.info(`Usuario creado: ID ${userId}`)
        return user
    }
}