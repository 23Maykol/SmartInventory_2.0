export interface User {
    id: number
    name: string
    email: string
    role: 'admin' | 'employee' | 'super_admin'
    branch_id?: number | null
}

export interface Product {
    id: number
    name: string
    stock: number
    price: number
    category: string | null
    description: string | null
    is_active: boolean
    created_at: string
}

export interface AuthResponse {
    ok: boolean
    message: string
    data: {
        token: string
        user: User
    }
}

export interface ProductsResponse {
    ok: boolean
    data: Product[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface ApiError {
    ok: boolean
    message: string
    errors?: { field: string; message: string }[]
}

export interface UserItem {
    id: number
    name: string
    email: string
    role: 'admin' | 'employee' | 'super_admin'
    is_active: boolean
    created_at: string
    branch_id?: number | null
    branch_name?: string | null
}

export interface UsersResponse {
    ok: boolean
    data: UserItem[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface UserStats {
    total: number
    admins: number
    employees: number
    active: number
    inactive: number
}

export interface Movement {
    id: number
    type: 'entrada' | 'salida'
    quantity: number
    note: string | null
    created_at: string
    product_id: number
    product_name: string
    user_id: number
    user_name: string
}

export interface MovementsResponse {
    ok: boolean
    data: Movement[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface DashboardStats {
    products: {
        total_products: number
        total_stock: number
        low_stock_count: number
        active_products: number
    }
    users: {
        total_users: number
        active_users: number
        admins: number
        employees: number
    }
    movements: {
        total_movements: number
        total_entradas: number
        total_salidas: number
    }
    recentMovements: Movement[]
    lowStockProducts: {
        id: number
        name: string
        stock: number
        category: string
    }[]
    topProducts: {
        id: number
        name: string
        category: string
        total_movimientos: number
    }[]
    monthlyMovements: MonthlyMovement[]
    stockByCategory: StockByCategory[]
}

// ─── Branches ────────────────────────────────────────────────

export interface Branch {
    id: number
    name: string
    address: string | null
    is_active: boolean
    created_at: string
    admin_id: number | null
    admin_name: string | null
    admin_email: string | null
}

export interface BranchStat {
    id: number
    name: string
    address: string | null
    is_active: boolean
    admin_name: string | null
    admin_email: string | null
    total_movements: number
    total_entradas: number
    total_salidas: number
    active_users: number
}

// ─── Super Admin Stats ────────────────────────────────────────

export interface MonthlyMovement {
    month: string
    label: string
    total: number
    entradas: number
    salidas: number
}

export interface StockByCategory {
    category: string
    total_stock: number
    product_count: number
}

export interface TopProduct {
    id: number
    name: string
    category: string
    total_movimientos: number
    entradas: number
    salidas: number
}

export interface SuperAdminStats {
    products: {
        total_products: number
        total_stock: number
        low_stock_count: number
        active_products: number
    }
    users: {
        total_users: number
        active_users: number
        super_admins: number
        admins: number
        employees: number
    }
    movements: {
        total_movements: number
        total_entradas: number
        total_salidas: number
    }
    branches: {
        total_branches: number
        active_branches: number
    }
    monthlyMovements: MonthlyMovement[]
    stockByCategory: StockByCategory[]
    topProducts: TopProduct[]
    branchStats: BranchStat[]
    lowStockProducts: {
        id: number
        name: string
        stock: number
        category: string
    }[]
}