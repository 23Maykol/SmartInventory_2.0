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

        if (params.branch_id) {
            whereClause += ' AND u.branch_id = ?'
            countValues.push(params.branch_id)
            dataValues.push(params.branch_id)
        }

        if (params.branch_status === 'assigned') {
            whereClause += ' AND u.branch_id IS NOT NULL'
        } else if (params.branch_status === 'unassigned') {
            whereClause += ' AND u.branch_id IS NULL'
        }

        dataValues.push(limit, offset)

        const [countRows] = await pool.query<any[]>(
            `SELECT COUNT(*) as total FROM users u ${whereClause.replace(/name LIKE/g, 'u.name LIKE').replace(/email LIKE/g, 'u.email LIKE').replace(/role =/g, 'u.role =')}`,
            countValues
        )

        const [rows] = await pool.query<any[]>(
            `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at, u.branch_id, b.name as branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       ${whereClause.replace(/name LIKE/g, 'u.name LIKE').replace(/email LIKE/g, 'u.email LIKE').replace(/role =/g, 'u.role =')} 
       ORDER BY u.created_at DESC 
       LIMIT ? OFFSET ?`,
            dataValues
        )

        return { data: rows, total: countRows[0].total }
    }

    async findById(id: number): Promise<Omit<User, 'password'> | null> {
        const [rows] = await pool.execute<any[]>(
            `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at, u.branch_id, b.name as branch_name 
             FROM users u
             LEFT JOIN branches b ON u.branch_id = b.id
             WHERE u.id = ? LIMIT 1`,
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

    async findByEmail(email: string): Promise<User | null> {
        const [rows] = await pool.execute<any[]>(
            'SELECT * FROM users WHERE email = ? AND is_active = true LIMIT 1',
            [email]
        )
        return rows[0] || null
    }

    async create(data: { name: string; email: string; password?: string | null; role: string; auth_provider?: string }): Promise<number> {
        const [result] = await pool.execute<any>(
            'INSERT INTO users (name, email, password, role, auth_provider) VALUES (?, ?, ?, ?, ?)',
            [data.name, data.email, data.password || null, data.role, data.auth_provider || 'local']
        )
        return result.insertId
    }

    async getStats(branchId?: number): Promise<any> {
        let query = `
      SELECT
        COUNT(*) as total,
        SUM(role = 'admin') as admins,
        SUM(role = 'employee') as employees,
        SUM(is_active = 1) as active,
        SUM(is_active = 0) as inactive
      FROM users
    `
        const values: any[] = []

        if (branchId) {
            query += ' WHERE branch_id = ?'
            values.push(branchId)
        }

        const [rows] = await pool.execute<any[]>(query, values)
        return rows[0]
    }
}