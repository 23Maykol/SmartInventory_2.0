export interface User {
    id: number
    name: string
    email: string
    password: string
    role: 'super_admin' | 'admin' | 'employee'
    is_active: boolean
    branch_id?: number | null
    branch_name?: string | null
    created_at: Date
}

export interface Product {
    id: number
    name: string
    stock: number
    price: number
    category: string | null
    description: string | null
    is_active: boolean
    created_at: Date
}

export interface InventoryMovement {
    id: number
    product_id: number
    user_id: number
    type: 'entrada' | 'salida'
    quantity: number
    note: string | null
    created_at: Date
}

export interface JwtPayload {
    id: number
    email: string
    role: 'super_admin' | 'admin' | 'employee'
}

export interface ApiResponse<T = null> {
    ok: boolean
    message: string
    data?: T
}

export interface PaginatedResponse<T> {
    ok: boolean
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

// Extender Request de Express para incluir el usuario autenticado
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}