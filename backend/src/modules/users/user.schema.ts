import { z } from 'zod'

export const updateUserSchema = z.object({
    name: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100)
        .trim()
        .optional(),

    email: z.string()
        .email('Formato de email inválido')
        .toLowerCase()
        .trim()
        .optional(),

    role: z.enum(['super_admin', 'admin', 'employee']).optional(),

    is_active: z.boolean().optional(),
    
    branch_id: z.number().int().positive().nullable().optional()
})

export const listUsersSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    role: z.enum(['super_admin', 'admin', 'employee']).optional()
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ListUsersInput = z.infer<typeof listUsersSchema>;

export const createUserSchema = z.object({
    name: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100)
        .trim()
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'El nombre solo puede contener letras, espacios y guiones'),
    email: z.string()
        .email('Formato de email inválido')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
        .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número')
        .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial (!@#$%...)'),
    role: z.enum(['super_admin', 'admin', 'employee']).default('employee'),
    branch_id: z.number().int().positive().nullable().optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;