import { Appointment } from '../types';
import { BaseService } from './base.service';

class AppointmentService extends BaseService<Appointment> {
  constructor() {
    super('spa_appointments', []);
  }
}

export const appointmentService = new AppointmentService();
