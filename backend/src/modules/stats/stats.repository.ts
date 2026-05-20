import { pool } from '../../config/db'

export class StatsRepository {
    async getDashboardStats(): Promise<any> {
        const [products] = await pool.execute<any[]>(`
      SELECT
        COUNT(*) as total_products,
        SUM(stock) as total_stock,
        SUM(CASE WHEN stock <= 5 AND is_active = true THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_products
      FROM products
    `)

        const [users] = await pool.execute<any[]>(`
      SELECT
        COUNT(*) as total_users,
        SUM(is_active = 1) as active_users,
        SUM(role = 'admin') as admins,
        SUM(role = 'employee') as employees
      FROM users
    `)

        const [movements] = await pool.execute<any[]>(`
      SELECT
        COUNT(*) as total_movements,
        SUM(CASE WHEN type = 'entrada' THEN quantity ELSE 0 END) as total_entradas,
        SUM(CASE WHEN type = 'salida' THEN quantity ELSE 0 END) as total_salidas
      FROM inventory_movements
    `)

        const [recentMovements] = await pool.query<any[]>(`
      SELECT 
        m.id, m.type, m.quantity, m.note, m.created_at,
        p.name as product_name,
        u.name as user_name
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT 5
    `)

        const [lowStockProducts] = await pool.query<any[]>(`
      SELECT id, name, stock, category
      FROM products
      WHERE stock <= 5 AND is_active = true
      ORDER BY stock ASC
      LIMIT 10
    `)

        const [topProducts] = await pool.query<any[]>(`
      SELECT 
        p.id, p.name, p.category,
        SUM(m.quantity) as total_movimientos
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      GROUP BY p.id, p.name, p.category
      ORDER BY total_movimientos DESC
      LIMIT 5
    `)

        return {
            products: products[0],
            users: users[0],
            movements: movements[0],
            recentMovements,
            lowStockProducts,
            topProducts
        }
    }
}