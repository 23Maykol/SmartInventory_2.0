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

    async getSuperAdminStats(): Promise<any> {
        // General KPIs
        const [products] = await pool.execute<any[]>(`
            SELECT
                COUNT(*) as total_products,
                COALESCE(SUM(stock), 0) as total_stock,
                SUM(CASE WHEN stock <= 5 AND is_active = 1 THEN 1 ELSE 0 END) as low_stock_count,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_products
            FROM products
        `)

        const [users] = await pool.execute<any[]>(`
            SELECT
                COUNT(*) as total_users,
                SUM(is_active = 1) as active_users,
                SUM(role = 'super_admin') as super_admins,
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

        const [branches] = await pool.execute<any[]>(`
            SELECT
                COUNT(*) as total_branches,
                SUM(is_active = 1) as active_branches
            FROM branches
        `)

        // Daily movements — last 30 days
        const [monthlyMovements] = await pool.query<any[]>(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                DATE_FORMAT(created_at, '%d %b') as label,
                COUNT(*) as total,
                SUM(CASE WHEN type = 'entrada' THEN quantity ELSE 0 END) as entradas,
                SUM(CASE WHEN type = 'salida' THEN quantity ELSE 0 END) as salidas
            FROM inventory_movements
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d'), DATE_FORMAT(created_at, '%d %b')
            ORDER BY date ASC
        `)

        // Stock by category (pie chart)
        const [stockByCategory] = await pool.query<any[]>(`
            SELECT 
                COALESCE(category, 'Sin categoría') as category,
                SUM(stock) as total_stock,
                COUNT(*) as product_count
            FROM products
            WHERE is_active = 1
            GROUP BY category
            ORDER BY total_stock DESC
            LIMIT 8
        `)

        // Top products by movement
        const [topProducts] = await pool.query<any[]>(`
            SELECT 
                p.id, p.name, p.category,
                SUM(m.quantity) as total_movimientos,
                SUM(CASE WHEN m.type = 'entrada' THEN m.quantity ELSE 0 END) as entradas,
                SUM(CASE WHEN m.type = 'salida' THEN m.quantity ELSE 0 END) as salidas
            FROM inventory_movements m
            JOIN products p ON m.product_id = p.id
            GROUP BY p.id, p.name, p.category
            ORDER BY total_movimientos DESC
            LIMIT 5
        `)

        // Branch stats (global overview)
        const [branchStats] = await pool.query<any[]>(`
            SELECT 
                b.id,
                b.name,
                b.address,
                b.is_active,
                u.name as admin_name,
                u.email as admin_email,
                COUNT(DISTINCT m.id) as total_movements,
                COALESCE(SUM(CASE WHEN m.type = 'entrada' THEN m.quantity ELSE 0 END), 0) as total_entradas,
                COALESCE(SUM(CASE WHEN m.type = 'salida' THEN m.quantity ELSE 0 END), 0) as total_salidas,
                (SELECT COUNT(*) FROM users u2 WHERE u2.branch_id = b.id AND u2.is_active = 1) as active_users
            FROM branches b
            LEFT JOIN users u ON u.branch_id = b.id AND u.role = 'admin' AND u.is_active = 1
            LEFT JOIN inventory_movements m ON m.user_id = u.id
            GROUP BY b.id, b.name, b.address, b.is_active, u.name, u.email
            ORDER BY total_movements DESC
        `)

        // Low stock products
        const [lowStockProducts] = await pool.query<any[]>(`
            SELECT id, name, stock, category
            FROM products
            WHERE stock <= 5 AND is_active = 1
            ORDER BY stock ASC
            LIMIT 10
        `)

        return {
            products: products[0],
            users: users[0],
            movements: movements[0],
            branches: branches[0],
            monthlyMovements,
            stockByCategory,
            topProducts,
            branchStats,
            lowStockProducts
        }
    }
}