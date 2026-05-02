import { z } from 'zod';

export const inventorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  category: z.string().min(1, 'Debes seleccionar una categoría'),
  brand: z.string().optional(),
  unit: z.string().optional(),
  stock: z.coerce.number().min(0, 'El stock no puede ser negativo'),
  minStock: z.coerce.number().min(0, 'El stock mínimo no puede ser negativo'),
  cost: z.coerce.number().min(0, 'El costo no puede ser negativo'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo')
});

export type InventoryFormData = z.infer<typeof inventorySchema>;
