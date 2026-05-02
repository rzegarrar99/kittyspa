import { z } from 'zod';

export const staffSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  username: z.string().min(4, 'El usuario debe tener al menos 4 caracteres').regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  email: z.string().email('Formato de correo inválido'),
  commission_rate: z.coerce.number().min(0, 'No puede ser negativo').max(100, 'No puede ser mayor a 100%'),
  avatarUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal(''))
});

export type StaffFormData = z.infer<typeof staffSchema>;

export const roleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Debe ser un color hexadecimal válido (ej. #FF2A7A)')
});

export type RoleFormData = z.infer<typeof roleSchema>;
