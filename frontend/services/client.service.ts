import { Client } from '../types';
import { BaseService } from './base.service';
import { MOCK_CLIENTS } from '../constants';

class ClientService extends BaseService<Client> {
  constructor() {
    super('spa_clients', MOCK_CLIENTS);
  }

  // Aquí podemos agregar métodos específicos de dominio en el futuro
  // Ejemplo: async getVipClients() { ... }
}

export const clientService = new ClientService();

// 🚀 MIGRACIÓN A FIREBASE: 
// No requiere cambios. Heredará automáticamente la lógica de Firestore de BaseService.
