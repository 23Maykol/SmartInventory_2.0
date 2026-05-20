import { UserRepository } from './user.repository'
import { UpdateUserInput, ListUsersInput } from './user.schema'
import { AppError } from '../../middleware/error.middleware'
import { logger } from '../../config/logger'

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

    async update(id: number, data: UpdateUserInput) {
        const user = await this.repository.findById(id)
        if (!user) throw new AppError(404, 'Usuario no encontrado')

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
}