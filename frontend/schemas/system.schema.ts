import { z } from 'zod';

export const cashRegisterSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  initial_balance: z.coerce.number().min(0, 'El saldo inicial no puede ser negativo')
});

export type CashRegisterFormData = z.infer<typeof cashRegisterSchema>;

export const expenseSchema = z.object({
  category: z.string().min(1, 'Debes seleccionar una categoría'),
  description: z.string().min(3, 'La descripción debe ser más detallada'),
  amount: z.coerce.number().min(0.1, 'El monto debe ser mayor a 0')
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

export const settingsSchema = z.object({
  spaName: z.string().min(2, 'El nombre comercial es requerido'),
  ruc: z.string().length(11, 'El RUC debe tener exactamente 11 dígitos').regex(/^\d+$/, 'El RUC solo debe contener números'),
  address: z.string().min(5, 'La dirección es requerida'),
  phone: z.string().min(6, 'Teléfono inválido'),
  taxRate: z.coerce.number().min(0, 'El impuesto no puede ser negativo').max(100, 'El impuesto no puede ser mayor a 100'),
  currency: z.string().min(1, 'La moneda es requerida')
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
