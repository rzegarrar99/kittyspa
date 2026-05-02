import { Staff, Role } from '../types';
import { BaseService } from './base.service';
import { MOCK_ROLES } from '../constants';

// Actualizamos el Mock para incluir username y password
const MOCK_STAFF: Staff[] = [
  { 
    id: 'st1', 
    name: 'Ana Directora', 
    username: 'admin',
    password: '123', // Mock password
    email: 'admin@spaglowkitty.pe',
    roles: [MOCK_ROLES[0]], 
    commission_rate: 0.10,
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ana&backgroundColor=FFB6C1'
  },
  { 
    id: 'st2', 
    name: 'María Masajista', 
    username: 'maria_m',
    password: '123',
    email: 'maria@spaglowkitty.pe',
    roles: [MOCK_ROLES[1]], 
    commission_rate: 0.20,
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Maria&backgroundColor=FFB6C1'
  },
  { 
    id: 'st3', 
    name: 'Lucía Recepción', 
    username: 'lucia_r',
    password: '123',
    email: 'lucia@spaglowkitty.pe',
    roles: [MOCK_ROLES[2], MOCK_ROLES[3]], 
    commission_rate: 0.05,
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Lucia&backgroundColor=FFB6C1'
  },
];

class StaffService extends BaseService<Staff> {
  constructor() {
    super('spa_staff', MOCK_STAFF);
  }

  // 🚀 MIGRACIÓN A FIREBASE: 
  // En Firebase, la autenticación se hace con signInWithEmailAndPassword.
  // Este método es solo para mantener el entorno Sandbox funcional.
  async findByCredentials(username: string, password?: string): Promise<Staff | undefined> {
    const staff = await this.getAll();
    return staff.find(s => 
      (s.username.toLowerCase() === username.toLowerCase() || s.email.toLowerCase() === username.toLowerCase()) && 
      s.password === password
    );
  }
}

class RoleService extends BaseService<Role> {
  constructor() {
    super('spa_roles', MOCK_ROLES);
  }
}

export const staffService = new StaffService();
export const roleService = new RoleService();
