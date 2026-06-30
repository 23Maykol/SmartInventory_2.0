import { pool } from '../../config/db'
import { InventoryMovement } from '../../types'
import { CreateMovementInput, ListMovementsInput } from './movement.schema'

export class MovementRepository {
    async findAll(params: ListMovementsInput): Promise<{ data: any[], total: number }> {
        const { page, limit, product_id, type, user_id, branch_id } = params
        const offset = (page - 1) * limit

        let whereClause = 'WHERE 1=1'
        const countValues: any[] = []
        const dataValues: any[] = []

        if (product_id) {
            whereClause += ' AND m.product_id = ?'
            countValues.push(product_id)
            dataValues.push(product_id)
        }

        if (type) {
            whereClause += ' AND m.type = ?'
            countValues.push(type)
            dataValues.push(type)
        }

        if (user_id) {
            whereClause += ' AND m.user_id = ?'
            countValues.push(user_id)
            dataValues.push(user_id)
        }

        if (branch_id) {
            whereClause += ' AND u.branch_id = ?'
            countValues.push(branch_id)
            dataValues.push(branch_id)
        }

        dataValues.push(limit, offset)

        const [countRows] = await pool.query<any[]>(
            `SELECT COUNT(*) as total FROM inventory_movements m JOIN users u ON m.user_id = u.id ${whereClause}`,
            countValues
        )

        const [rows] = await pool.query<any[]>(
            `SELECT 
        m.id, m.type, m.quantity, m.note, m.created_at,
        p.id as product_id, p.name as product_name,
        u.id as user_id, u.name as user_name, u.branch_id
       FROM inventory_movements m
       JOIN products p ON m.product_id = p.id
       JOIN users u ON m.user_id = u.id
       ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
            dataValues
        )

        return { data: rows, total: countRows[0].total }
    }


    async create(data: CreateMovementInput, userId: number): Promise<number> {
        const [result] = await pool.execute<any>(
            'INSERT INTO inventory_movements (product_id, user_id, type, quantity, note) VALUES (?, ?, ?, ?, ?)',
            [data.product_id, userId, data.type, data.quantity, data.note ?? null]
        )
        return result.insertId
    }

    async getRecentByProduct(productId: number, limit: number = 5): Promise<any[]> {
        const [rows] = await pool.query<any[]>(
            `SELECT m.*, u.name as user_name 
       FROM inventory_movements m
       JOIN users u ON m.user_id = u.id
       WHERE m.product_id = ?
       ORDER BY m.created_at DESC
       LIMIT ?`,
            [productId, limit]
        )
        return rows
    }

    async getTicket(movementId: number): Promise<any> {
        const [movRows] = await pool.execute<any[]>(
            `SELECT m.id, m.type, m.quantity, m.note, m.created_at,
                    p.name as product_name, p.category,
                    u.name as user_name
             FROM inventory_movements m
             JOIN products p ON m.product_id = p.id
             JOIN users u ON m.user_id = u.id
             WHERE m.id = ? LIMIT 1`,
            [movementId]
        );
        const movement = movRows[0];
        if (!movement) return null;

        const [unitRows] = await pool.execute<any[]>(
            `SELECT pu.serial_code, pu.status
             FROM movement_units mu
             JOIN product_units pu ON mu.unit_id = pu.id
             WHERE mu.movement_id = ?`,
            [movementId]
        );

        return { movement, units: unitRows };
    }
}