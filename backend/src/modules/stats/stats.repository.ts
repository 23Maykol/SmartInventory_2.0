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

        const [topProductsByCategory] = await pool.query<any[]>(`
            WITH RankedProducts AS (
                SELECT 
                    p.id, p.name, COALESCE(p.category, 'Sin categoría') as category,
                    SUM(m.quantity) as total_movimientos,
                    ROW_NUMBER() OVER(PARTITION BY COALESCE(p.category, 'Sin categoría') ORDER BY SUM(m.quantity) DESC) as rn
                FROM inventory_movements m
                JOIN products p ON m.product_id = p.id
                GROUP BY p.id, p.name, COALESCE(p.category, 'Sin categoría')
            )
            SELECT id, name, category, total_movimientos 
            FROM RankedProducts 
            WHERE rn <= 3
        `)

        return {
            products: products[0],
            users: users[0],
            movements: movements[0],
            recentMovements,
            lowStockProducts,
            topProducts,
            topProductsByCategory
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

        // Movements — last 14 days
        const [movementsDaily] = await pool.query<any[]>(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                DATE_FORMAT(created_at, '%d %b') as label,
                CAST(COUNT(*) AS UNSIGNED) as total,
                CAST(SUM(CASE WHEN type = 'entrada' THEN quantity ELSE 0 END) AS UNSIGNED) as entradas,
                CAST(SUM(CASE WHEN type = 'salida' THEN quantity ELSE 0 END) AS UNSIGNED) as salidas
            FROM inventory_movements
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d'), DATE_FORMAT(created_at, '%d %b')
            ORDER BY date ASC
        `)

        // Movements — last 12 weeks
        const [movementsWeekly] = await pool.query<any[]>(`
            SELECT 
                CONCAT(YEAR(created_at), '-', LPAD(WEEK(created_at, 1), 2, '0')) as date,
                CONCAT('Sem ', WEEK(created_at, 1)) as label,
                CAST(COUNT(*) AS UNSIGNED) as total,
                CAST(SUM(CASE WHEN type = 'entrada' THEN quantity ELSE 0 END) AS UNSIGNED) as entradas,
                CAST(SUM(CASE WHEN type = 'salida' THEN quantity ELSE 0 END) AS UNSIGNED) as salidas
            FROM inventory_movements
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
            GROUP BY YEAR(created_at), WEEK(created_at, 1)
            ORDER BY YEAR(created_at) ASC, WEEK(created_at, 1) ASC
        `)

        // Movements — last 6 months
        const [movementsMonthly] = await pool.query<any[]>(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as date,
                DATE_FORMAT(created_at, '%b %y') as label,
                CAST(COUNT(*) AS UNSIGNED) as total,
                CAST(SUM(CASE WHEN type = 'entrada' THEN quantity ELSE 0 END) AS UNSIGNED) as entradas,
                CAST(SUM(CASE WHEN type = 'salida' THEN quantity ELSE 0 END) AS UNSIGNED) as salidas
            FROM inventory_movements
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b %y')
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
                (SELECT name FROM users WHERE branch_id = b.id AND role = 'admin' AND is_active = 1 LIMIT 1) as admin_name,
                (SELECT email FROM users WHERE branch_id = b.id AND role = 'admin' AND is_active = 1 LIMIT 1) as admin_email,
                CAST(COUNT(DISTINCT m.id) AS UNSIGNED) as total_movements,
                CAST(COALESCE(SUM(CASE WHEN m.type = 'entrada' THEN m.quantity ELSE 0 END), 0) AS UNSIGNED) as total_entradas,
                CAST(COALESCE(SUM(CASE WHEN m.type = 'salida' THEN m.quantity ELSE 0 END), 0) AS UNSIGNED) as total_salidas,
                (SELECT COUNT(*) FROM users u2 WHERE u2.branch_id = b.id AND u2.is_active = 1) as active_users
            FROM branches b
            LEFT JOIN users u_all ON u_all.branch_id = b.id
            LEFT JOIN inventory_movements m ON m.user_id = u_all.id
            GROUP BY b.id, b.name, b.address, b.is_active
            ORDER BY total_movements DESC
        `)

        // Low stock products — all of them, frontend will filter by category
        const [lowStockProducts] = await pool.query<any[]>(`
            SELECT id, name, stock, COALESCE(category, 'Sin categoría') as category
            FROM products
            WHERE stock <= 5 AND is_active = 1
            ORDER BY stock ASC
        `)

        return {
            products: products[0],
            users: users[0],
            movements: movements[0],
            branches: branches[0],
            movementsDaily,
            movementsWeekly,
            movementsMonthly,
            stockByCategory,
            topProducts,
            branchStats,
            lowStockProducts
        }
    }
}