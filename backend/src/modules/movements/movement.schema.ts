import { z } from 'zod'

export const createMovementSchema = z.object({
    product_id: z.number().int().positive('ID de producto inválido'),
    type: z.enum(['entrada', 'salida']),
    quantity: z.number()
        .int('La cantidad debe ser un número entero')
        .positive('La cantidad debe ser mayor a 0')
        .max(10_000, 'La cantidad no puede superar 10.000 unidades por movimiento'),
    note: z.string()
        .max(500, 'La nota no puede superar 500 caracteres')
        .trim()
        .regex(/^[^<>]*$/, 'La nota no puede contener caracteres HTML')
        .optional()
        .nullable()
})

export const listMovementsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    product_id: z.coerce.number().int().optional(),
    type: z.enum(['entrada', 'salida']).optional(),
    user_id: z.coerce.number().int().optional(),
    branch_id: z.coerce.number().int().optional()
})

export type CreateMovementInput = z.infer<typeof createMovementSchema>
export type ListMovementsInput = z.infer<typeof listMovementsSchema>    