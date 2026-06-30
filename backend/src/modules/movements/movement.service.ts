import { pool } from '../../config/db'
import { MovementRepository } from './movement.repository'
import { CreateMovementInput, ListMovementsInput } from './movement.schema'
import { AppError } from '../../middleware/error.middleware'
import { logger } from '../../config/logger'
import crypto from 'crypto'

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
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Verificar que el producto existe
            const [rows] = await connection.execute<any[]>(
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
            await connection.execute(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [stockChange, data.product_id]
            )

            // Registrar movimiento
            const [result] = await connection.execute<any>(
                'INSERT INTO inventory_movements (product_id, user_id, type, quantity, note) VALUES (?, ?, ?, ?, ?)',
                [data.product_id, userId, data.type, data.quantity, data.note ?? null]
            )
            const movementId = result.insertId;

            // Auto-asignación inteligente (Trazabilidad)
            if (data.type === 'entrada') {
                for (let i = 0; i < data.quantity; i++) {
                    const shortUUID = crypto.randomUUID().split('-')[0].toUpperCase();
                    const serialCode = `SN-P${data.product_id}-${shortUUID}-${i}`;
                    
                    const [unitResult] = await connection.execute<any>(
                        'INSERT INTO product_units (product_id, serial_code, status) VALUES (?, ?, ?)',
                        [data.product_id, serialCode, 'en_stock']
                    );
                    
                    await connection.execute(
                        'INSERT INTO movement_units (movement_id, unit_id) VALUES (?, ?)',
                        [movementId, unitResult.insertId]
                    );
                }
            } else if (data.type === 'salida') {
                // Fetch required units (LIMIT requires string interpolation or cast in mysql2 execute)
                const [availableUnits] = await connection.execute<any[]>(
                    `SELECT id FROM product_units WHERE product_id = ? AND status = ? LIMIT ${data.quantity}`,
                    [data.product_id, 'en_stock']
                );

                // For a portfolio/demo, if the units table is out of sync with actual stock, we shouldn't hard-crash. 
                // But let's assume it's perfectly in sync due to transactions.
                if (availableUnits.length < data.quantity) {
                    throw new AppError(500, 'Inconsistencia de datos: No hay suficientes unidades con códigos de serie en stock para despachar.');
                }

                for (const unit of availableUnits) {
                    await connection.execute(
                        'UPDATE product_units SET status = ? WHERE id = ?',
                        ['despachado', unit.id]
                    );
                    await connection.execute(
                        'INSERT INTO movement_units (movement_id, unit_id) VALUES (?, ?)',
                        [movementId, unit.id]
                    );
                }
            }

            await connection.commit();
            logger.info(`Movimiento ${data.type}: producto ID ${data.product_id}, cantidad ${data.quantity}, usuario ID ${userId}`);
            return movementId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getByProduct(productId: number) {
        return await this.repository.getRecentByProduct(productId)
    }

    async getTicket(movementId: number) {
        const ticket = await this.repository.getTicket(movementId);
        if (!ticket) throw new AppError(404, 'Movimiento no encontrado');
        return ticket;
    }
}