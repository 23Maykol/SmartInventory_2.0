import { pool } from '../../config/db'
import { MovementRepository } from './movement.repository'
import { CreateMovementInput, ListMovementsInput } from './movement.schema'
import { AppError } from '../../middleware/error.middleware'
import { logger } from '../../config/logger'

export class MovementService {
    private repository: MovementRepository

    constructor() {
        this.repository = new MovementRepository()
    }

    async getAll(params: ListMovementsInput) {
        const { data, total } = await this.repository.findAll(params)
        const totalPages = Math.ceil(total / params.limit)
        return { data, total, page: params.page, limit: params.limit, totalPages }
    }

    async create(data: CreateMovementInput, userId: number) {
        // Verificar que el producto existe
        const [rows] = await pool.execute<any[]>(
            'SELECT id, name, stock FROM products WHERE id = ? AND is_active = true LIMIT 1',
            [data.product_id]
        )
        const product = rows[0]
        if (!product) throw new AppError(404, 'Producto no encontrado')

        // Verificar stock suficiente para salidas
        if (data.type === 'salida' && product.stock < data.quantity) {
            throw new AppError(400, `Stock insuficiente. Stock actual: ${product.stock}`)
        }

        // Actualizar stock
        const stockChange = data.type === 'entrada' ? data.quantity : -data.quantity
        await pool.execute(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [stockChange, data.product_id]
        )

        // Registrar movimiento
        const movementId = await this.repository.create(data, userId)

        logger.info(`Movimiento ${data.type}: producto ID ${data.product_id}, cantidad ${data.quantity}, usuario ID ${userId}`)

        return movementId
    }

    async getByProduct(productId: number) {
        return await this.repository.getRecentByProduct(productId)
    }
}