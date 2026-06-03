import { z } from 'zod'

export const createUserSchema = z.object({
    name: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede superar 100 caracteres')
        .trim()
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'El nombre solo puede contener letras, espacios y guiones'),

    email: z.string()
        .email('Formato de email inválido')
        .max(100, 'El email no puede superar 100 caracteres')
        .toLowerCase()
        .trim(),

    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(100, 'La contraseña no puede superar 100 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
        .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número')
        .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial (!@#$%...)'),

    role: z.enum(['admin', 'employee', 'super_admin']).optional().default('employee')
})

export const loginSchema = z.object({
    email: z.string()
        .email('Formato de email inválido')
        .toLowerCase()
        .trim(),

    password: z.string()
        .min(1, 'La contraseña es requerida')
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof createUserSchema>