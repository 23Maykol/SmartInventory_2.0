import { z } from 'zod'

export const createProductSchema = z.object({
    name: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede superar 100 caracteres')
        .trim(),

    stock: z.number()
        .int('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .default(0),

    price: z.number()
        .positive('El precio debe ser mayor a 0')
        .multipleOf(0.01, 'El precio no puede tener más de 2 decimales'),

    category: z.string()
        .max(100, 'La categoría no puede superar 100 caracteres')
        .trim()
        .optional()
        .nullable(),

    description: z.string()
        .max(500, 'La descripción no puede superar 500 caracteres')
        .trim()
        .optional()
        .nullable(),

    traceable: z.boolean().default(false)
})

export const updateProductSchema = createProductSchema.partial()

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    category: z.string().trim().optional()
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type PaginationInput = z.infer<typeof paginationSchema>