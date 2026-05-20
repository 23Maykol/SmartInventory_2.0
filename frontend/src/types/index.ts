export interface User {
    id: number
    name: string
    email: string
    role: 'admin' | 'employee'
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
    role: 'admin' | 'employee'
    is_active: boolean
    created_at: string
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
}