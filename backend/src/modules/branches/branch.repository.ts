import { pool } from '../../config/db'

export class BranchRepository {

    async findAll(): Promise<any[]> {
        const [rows] = await pool.query<any[]>(`
            SELECT 
                b.id,
                b.name,
                b.address,
                b.is_active,
                b.created_at,
                u.id as admin_id,
                u.name as admin_name,
                u.email as admin_email
            FROM branches b
            LEFT JOIN users u ON u.branch_id = b.id AND u.role = 'admin' AND u.is_active = 1
            ORDER BY b.created_at ASC
        `)
        return rows
    }

    async findById(id: number): Promise<any | null> {
        const [rows] = await pool.execute<any[]>(
            `SELECT b.*, u.id as admin_id, u.name as admin_name, u.email as admin_email
             FROM branches b
             LEFT JOIN users u ON u.branch_id = b.id AND u.role = 'admin' AND u.is_active = 1
             WHERE b.id = ? LIMIT 1`,
            [id]
        )
        return rows[0] || null
    }

    async getStats(branchId: number): Promise<any> {
        // Products in this branch (via movements made by its admin)
        const [products] = await pool.execute<any[]>(`
            SELECT
                COUNT(DISTINCT p.id) as total_products,
                COALESCE(SUM(p.stock), 0) as total_stock,
                SUM(CASE WHEN p.stock <= 5 AND p.is_active = 1 THEN 1 ELSE 0 END) as low_stock_count
            FROM products p
            WHERE p.is_active = 1
        `)

        // Movements made by users in this branch
        const [movements] = await pool.execute<any[]>(`
            SELECT
                COUNT(*) as total_movements,
                SUM(CASE WHEN m.type = 'entrada' THEN m.quantity ELSE 0 END) as total_entradas,
                SUM(CASE WHEN m.type = 'salida' THEN m.quantity ELSE 0 END) as total_salidas
            FROM inventory_movements m
            JOIN users u ON m.user_id = u.id
            WHERE u.branch_id = ?
        `, [branchId])

        // Users in this branch
        const [users] = await pool.execute<any[]>(`
            SELECT
                COUNT(*) as total_users,
                SUM(is_active = 1) as active_users
            FROM users
            WHERE branch_id = ?
        `, [branchId])

        // Recent movements for this branch
        const [recentMovements] = await pool.query<any[]>(`
            SELECT 
                m.id, m.type, m.quantity, m.note, m.created_at,
                p.name as product_name,
                u.name as user_name
            FROM inventory_movements m
            JOIN products p ON m.product_id = p.id
            JOIN users u ON m.user_id = u.id
            WHERE u.branch_id = ?
            ORDER BY m.created_at DESC
            LIMIT 5
        `, [branchId])

        // Monthly movements for this branch (last 6 months)
        const [monthlyMovements] = await pool.query<any[]>(`
            SELECT 
                DATE_FORMAT(m.created_at, '%Y-%m') as month,
                DATE_FORMAT(m.created_at, '%b %Y') as label,
                COUNT(*) as total,
                SUM(CASE WHEN m.type = 'entrada' THEN m.quantity ELSE 0 END) as entradas,
                SUM(CASE WHEN m.type = 'salida' THEN m.quantity ELSE 0 END) as salidas
            FROM inventory_movements m
            JOIN users u ON m.user_id = u.id
            WHERE u.branch_id = ?
              AND m.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(m.created_at, '%Y-%m'), DATE_FORMAT(m.created_at, '%b %Y')
            ORDER BY month ASC
        `, [branchId])

        return {
            products: products[0],
            movements: movements[0],
            users: users[0],
            recentMovements,
            monthlyMovements
        }
    }

    async getGlobalBranchStats(): Promise<any[]> {
        const [rows] = await pool.query<any[]>(`
            SELECT 
                b.id,
                b.name,
                b.address,
                b.is_active,
                u.name as admin_name,
                COUNT(DISTINCT m.id) as total_movements,
                SUM(CASE WHEN m.type = 'entrada' THEN m.quantity ELSE 0 END) as total_entradas,
                SUM(CASE WHEN m.type = 'salida' THEN m.quantity ELSE 0 END) as total_salidas,
                (SELECT COUNT(*) FROM users u2 WHERE u2.branch_id = b.id AND u2.is_active = 1) as active_users
            FROM branches b
            LEFT JOIN users u ON u.branch_id = b.id AND u.role = 'admin' AND u.is_active = 1
            LEFT JOIN inventory_movements m ON m.user_id = u.id
            GROUP BY b.id, b.name, b.address, b.is_active, u.name
            ORDER BY total_movements DESC
        `)
        return rows
    }
}
