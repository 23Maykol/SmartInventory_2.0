import { pool } from '../../config/db'
import { User } from '../../types'
import { UpdateUserInput, ListUsersInput } from './user.schema'

export class UserRepository {
    async findAll(params: ListUsersInput): Promise<{ data: Omit<User, 'password'>[], total: number }> {
        const { page, limit, search, role } = params
        const offset = (page - 1) * limit

        let whereClause = 'WHERE 1=1'
        const countValues: any[] = []
        const dataValues: any[] = []

        if (search) {
            whereClause += ' AND (name LIKE ? OR email LIKE ?)'
            countValues.push(`%${search}%`, `%${search}%`)
            dataValues.push(`%${search}%`, `%${search}%`)
        }

        if (role) {
            whereClause += ' AND role = ?'
            countValues.push(role)
            dataValues.push(role)
        }

        dataValues.push(limit, offset)

        const [countRows] = await pool.query<any[]>(
            `SELECT COUNT(*) as total FROM users ${whereClause}`,
            countValues
        )

        const [rows] = await pool.query<any[]>(
            `SELECT id, name, email, role, is_active, created_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
            dataValues
        )

        return { data: rows, total: countRows[0].total }
    }

    async findById(id: number): Promise<Omit<User, 'password'> | null> {
        const [rows] = await pool.execute<any[]>(
            'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ? LIMIT 1',
            [id]
        )
        return rows[0] || null
    }

    async update(id: number, data: UpdateUserInput): Promise<boolean> {
        const keys = Object.keys(data).filter(
            key => data[key as keyof UpdateUserInput] !== undefined
        )

        if (keys.length === 0) return false

        const fields = keys.map(key => `${key} = ?`).join(', ')
        const values: any[] = keys.map(key => data[key as keyof UpdateUserInput])
        values.push(id)

        const [result] = await pool.query<any>(
            `UPDATE users SET ${fields} WHERE id = ?`,
            values
        )
        return result.affectedRows > 0
    }

    async toggleActive(id: number): Promise<boolean> {
        const [result] = await pool.execute<any>(
            'UPDATE users SET is_active = NOT is_active WHERE id = ?',
            [id]
        )
        return result.affectedRows > 0
    }

    async getStats(): Promise<any> {
        const [rows] = await pool.execute<any[]>(`
      SELECT
        COUNT(*) as total,
        SUM(role = 'admin') as admins,
        SUM(role = 'employee') as employees,
        SUM(is_active = 1) as active,
        SUM(is_active = 0) as inactive
      FROM users
    `)
        return rows[0]
    }
}