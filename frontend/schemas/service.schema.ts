import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  category: z.string().min(1, 'Debes seleccionar una categoría'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  duration: z.coerce.number().min(1, 'La duración debe ser de al menos 1 minuto')
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
