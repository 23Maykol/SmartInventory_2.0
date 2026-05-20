import { ProductRepository } from './product.repository'
import { CreateProductInput, UpdateProductInput, PaginationInput } from './product.schema'
import { AppError } from '../../middleware/error.middleware'
import { logger } from '../../config/logger'

export class ProductService {
    private repository: ProductRepository

    constructor() {
        this.repository = new ProductRepository()
    }

    async getAll(params: PaginationInput) {
        const { data, total } = await this.repository.findAll(params)
        const totalPages = Math.ceil(total / params.limit)

        return {
            data,
            total,
            page: params.page,
            limit: params.limit,
            totalPages
        }
    }

    async getById(id: number) {
        const product = await this.repository.findById(id)
        if (!product) throw new AppError(404, 'Producto no encontrado')
        return product
    }

    async create(data: CreateProductInput) {
        const exists = await this.repository.nameExists(data.name)
        if (exists) throw new AppError(409, 'Ya existe un producto con ese nombre')

        const productId = await this.repository.create(data)
        const product = await this.repository.findById(productId)

        logger.info(`Producto creado: ${data.name}`)
        return product
    }

    async update(id: number, data: UpdateProductInput) {
        const product = await this.repository.findById(id)
        if (!product) throw new AppError(404, 'Producto no encontrado')

        if (data.name) {
            const exists = await this.repository.nameExists(data.name, id)
            if (exists) throw new AppError(409, 'Ya existe un producto con ese nombre')
        }

        await this.repository.update(id, data)
        const updated = await this.repository.findById(id)

        logger.info(`Producto actualizado: ID ${id}`)
        return updated
    }

    async delete(id: number) {
        const product = await this.repository.findById(id)
        if (!product) throw new AppError(404, 'Producto no encontrado')

        await this.repository.softDelete(id)
        logger.info(`Producto eliminado: ID ${id}`)
    }
}