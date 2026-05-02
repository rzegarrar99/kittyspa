import { z } from 'zod';

export const appointmentSchema = z.object({
  client_id: z.string().min(1, 'Debes seleccionar una clienta'),
  staff_id: z.string().min(1, 'Debes seleccionar un especialista'),
  service_id: z.string().min(1, 'Debes seleccionar un servicio'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  time: z.string().min(1, 'La hora es obligatoria'),
  notes: z.string().optional(),
  status: z.enum(['Pendiente', 'Confirmada', 'Completada', 'Cancelada']).default('Pendiente')
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
