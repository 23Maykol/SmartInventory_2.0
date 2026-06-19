import { pool } from '../../config/db'
import { Product } from '../../types'
import { CreateProductInput, UpdateProductInput, PaginationInput } from './product.schema'

export class ProductRepository {
    async findAll(params: PaginationInput): Promise<{ data: Product[], total: number }> {
        const { page, limit, search, category } = params
        const offset = (page - 1) * limit

        let whereClause = 'WHERE is_active = true'
        const countValues: any[] = []
        const dataValues: any[] = []

        if (search) {
            whereClause += ' AND (name LIKE ? OR description LIKE ?)'
            countValues.push(`%${search}%`, `%${search}%`)
            dataValues.push(`%${search}%`, `%${search}%`)
        }

        if (category) {
            whereClause += ' AND category = ?'
            countValues.push(category)
            dataValues.push(category)
        }

        dataValues.push(limit, offset)

        const [countRows] = await pool.query<any[]>(
            `SELECT COUNT(*) as total FROM products ${whereClause}`,
            countValues
        )
        const total = countRows[0].total

        const [rows] = await pool.query<any[]>(
            `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            dataValues
        )

        return { data: rows, total }
    }

    async findById(id: number): Promise<Product | null> {
        const [rows] = await pool.execute<any[]>(
            'SELECT * FROM products WHERE id = ? AND is_active = true LIMIT 1',
            [id]
        )
        return rows[0] || null
    }

    async create(data: CreateProductInput): Promise<number> {
        const [result] = await pool.execute<any>(
            'INSERT INTO products (name, stock, price, category, description, traceable) VALUES (?, ?, ?, ?, ?, ?)',
            [data.name, data.stock, data.price, data.category ?? null, data.description ?? null, data.traceable ? 1 : 0]
        )
        return result.insertId
    }

    async update(id: number, data: UpdateProductInput): Promise<boolean> {
        const fields = Object.keys(data)
            .filter(key => data[key as keyof UpdateProductInput] !== undefined)
            .map(key => `${key} = ?`)
            .join(', ')

        if (!fields) return false

        const values: any[] = Object.keys(data)
            .filter(key => data[key as keyof UpdateProductInput] !== undefined)
            .map(key => data[key as keyof UpdateProductInput])

        const [result] = await pool.execute<any>(
            `UPDATE products SET ${fields} WHERE id = ? AND is_active = true`,
            [...values, id]
        )
        return result.affectedRows > 0
    }

    async softDelete(id: number): Promise<boolean> {
        const [result] = await pool.execute<any>(
            'UPDATE products SET is_active = false WHERE id = ? AND is_active = true',
            [id]
        )
        return result.affectedRows > 0
    }

    async nameExists(name: string, excludeId?: number): Promise<boolean> {
        const query = excludeId
            ? 'SELECT id FROM products WHERE name = ? AND id != ? AND is_active = true LIMIT 1'
            : 'SELECT id FROM products WHERE name = ? AND is_active = true LIMIT 1'

        const values = excludeId ? [name, excludeId] : [name]
        const [rows] = await pool.execute<any[]>(query, values)
        return rows.length > 0
    }
}