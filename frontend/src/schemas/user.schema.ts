import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Email inválido'),
  nombres: z.string().min(1, 'Nombres requeridos'),
  apellidos: z.string().min(1, 'Apellidos requeridos'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .optional(),
  isActive: z.boolean().default(true),
  isSuperuser: z.boolean().default(false),
});

export const userCreateSchema = userSchema.extend({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type UserFormValues = z.infer<typeof userSchema>;
export type UserCreateFormValues = z.infer<typeof userCreateSchema>;
