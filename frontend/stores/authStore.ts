import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Staff, Role } from '../types';
import { MOCK_STAFF } from '../constants';

interface AuthState {
  user: Staff | null;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  getHighestRole: () => Role | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, password?: string) => {
        // Simulación de llamada asíncrona al servicio de Auth
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (username.toLowerCase() === 'admin' && password === '123') {
          const adminUser = MOCK_STAFF.find(s => s.roles.some(r => r.permissions.includes('*'))) || MOCK_STAFF[0];
          set({ user: adminUser, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        return user.roles.some(role => 
          role.permissions.includes('*') || role.permissions.includes(permission)
        );
      },

      getHighestRole: () => {
        const { user } = get();
        if (!user || user.roles.length === 0) return null;
        return [...user.roles].sort((a, b) => b.priority - a.priority)[0];
      }
    }),
    {
      name: 'spa_auth_storage',
    }
  )
);

// MIGRACIÓN A FIREBASE:
// La función `login` llamará a `signInWithEmailAndPassword` de Firebase Auth.
// El `user` se sincronizará con el documento de Firestore correspondiente al UID del usuario.
