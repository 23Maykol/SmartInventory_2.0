import { pool } from '../../config/db'
import { User } from '../../types'
import { RegisterInput } from './auth.schema'

export class AuthRepository {
    async findByEmail(email: string): Promise<User | null> {
        const [rows] = await pool.execute<any[]>(
            'SELECT * FROM users WHERE email = ? AND is_active = true LIMIT 1',
            [email]
        )
        return rows[0] || null
    }

    async findById(id: number): Promise<Omit<User, 'password'> | null> {
        const [rows] = await pool.execute<any[]>(
            'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ? AND is_active = true LIMIT 1',
            [id]
        )
        return rows[0] || null
    }

    async create(data: RegisterInput & { password: string }): Promise<number> {
        const [result] = await pool.execute<any>(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [data.name, data.email, data.password, data.role]
        )
        return result.insertId
    }

    async emailExists(email: string): Promise<boolean> {
        const [rows] = await pool.execute<any[]>(
            'SELECT id FROM users WHERE email = ? LIMIT 1',
            [email]
        )
        return rows.length > 0
    }
}