export interface Appointment {
  id: string;
  client_id: string;
  staff_id: string;
  service_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'Pendiente' | 'Confirmada' | 'Completada' | 'Cancelada';
  notes?: string;
  created_at: string;
}
