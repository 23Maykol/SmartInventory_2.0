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

    async getAll(params: ListMovementsInput, user: { id: number; role: string }) {
        // RBAC: employees only see their own movements
        if (user.role === 'employee') {
            params = { ...params, user_id: user.id }
        }
        const { data, total } = await this.repository.findAll(params)
        const totalPages = Math.ceil(total / params.limit)
        return { data, total, page: params.page, limit: params.limit, totalPages }
    }

    async create(data: CreateMovementInput, userId: number) {
        // Verificar que el producto existe y si es trazable
        const [rows] = await pool.execute<any[]>(
            'SELECT id, name, stock, traceable FROM products WHERE id = ? AND is_active = true LIMIT 1',
            [data.product_id]
        )
        const product = rows[0]
        if (!product) throw new AppError(404, 'Producto no encontrado')

        let unitId: number | null = null;

        // Lógica de trazabilidad
        if (product.traceable) {
            if (!data.serial_code) {
                throw new AppError(400, 'Se requiere código de serie (serial_code) para este producto');
            }
            if (data.quantity !== 1) {
                throw new AppError(400, 'Los movimientos de productos con número de serie deben ser de 1 unidad');
            }

            const [existingUnits] = await pool.execute<any[]>(
                'SELECT id, status FROM product_units WHERE serial_code = ? AND product_id = ? LIMIT 1',
                [data.serial_code, data.product_id]
            );

            if (data.type === 'entrada') {
                if (existingUnits.length > 0) {
                    const unit = existingUnits[0];
                    if (unit.status === 'en_stock') {
                        throw new AppError(400, 'Esta unidad ya se encuentra en stock');
                    }
                    // Es una devolución/reingreso
                    await pool.execute('UPDATE product_units SET status = "en_stock" WHERE id = ?', [unit.id]);
                    unitId = unit.id;
                } else {
                    // Nuevo stock
                    const [result] = await pool.execute<any>(
                        'INSERT INTO product_units (product_id, serial_code, status) VALUES (?, ?, "en_stock")',
                        [data.product_id, data.serial_code]
                    );
                    unitId = result.insertId;
                }
            } else if (data.type === 'salida') {
                if (existingUnits.length === 0) {
                    throw new AppError(404, 'Unidad no encontrada');
                }
                const unit = existingUnits[0];
                if (unit.status !== 'en_stock') {
                    throw new AppError(400, `La unidad no se puede sacar, estado actual: ${unit.status}`);
                }
                // Salida normal (despacho de almacén)
                await pool.execute('UPDATE product_units SET status = "despachado" WHERE id = ?', [unit.id]);
                unitId = unit.id;
            }
        }

        // Verificar stock suficiente para salidas
        if (data.type === 'salida' && product.stock < data.quantity) {
            throw new AppError(400, `Stock insuficiente. Stock actual: ${product.stock}`)
        }

        // Actualizar stock agregado
        const stockChange = data.type === 'entrada' ? data.quantity : -data.quantity
        await pool.execute(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [stockChange, data.product_id]
        )

        // Registrar movimiento
        const movementId = await this.repository.create(data, userId, unitId)

        logger.info(`Movimiento ${data.type}: producto ID ${data.product_id}, cantidad ${data.quantity}, usuario ID ${userId}`)

        return movementId
    }

    async getByProduct(productId: number) {
        return await this.repository.getRecentByProduct(productId)
    }
}