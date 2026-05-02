import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Staff, Role } from '../types';
import { staffService } from '../services/staff.service';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

interface AuthState {
  user: Staff | null;
  isLoading: boolean;
}

interface AuthActions {
  login: (username: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  getHighestRole: () => Role | null;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      // Login Manual (Validado contra la BD Mock)
      login: async (username: string, password?: string) => {
        set({ isLoading: true });
        try {
          const user = await staffService.findByCredentials(username, password);
          if (user) {
            set({ user, isLoading: false });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error("Error en login manual:", error);
          set({ isLoading: false });
          return false;
        }
      },

      // Login con Google (Producción / Firebase)
      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const firebaseUser = result.user;
          const userEmail = firebaseUser.email || '';
          let userRoles: Role[] = [];

          // BOOTSTRAP ADMIN: Si eres tú, te damos acceso total automáticamente
          if (userEmail === 'rzegarrar99@gmail.com') {
            userRoles = [{
              id: 'role-super-admin',
              name: 'Super Administradora',
              color: '#D4AF37', // Dorado Luxury
              priority: 1000,
              permissions: ['*'] // Acceso a TODO
            }];
          } else {
            console.warn(`Acceso denegado para: ${userEmail}`);
            await signOut(auth);
            set({ isLoading: false });
            return false;
          }

          const staffUser: Staff = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Administradora',
            username: userEmail.split('@')[0],
            email: userEmail,
            roles: userRoles,
            commission_rate: 0,
            avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${firebaseUser.uid}&backgroundColor=FFB6C1`
          };

          set({ user: staffUser, isLoading: false });
          return true;

        } catch (error) {
          console.error("Error en login con Google:", error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
        } catch (e) {
          // Ignorar error si no estaba logueado con Firebase
        } finally {
          set({ user: null });
        }
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        
        // El comodín '*' otorga acceso a todo el sistema sin restricciones
        return user.roles.some(role => 
          role.permissions.includes('*') || role.permissions.includes(permission)
        );
      },

      getHighestRole: () => {
        const { user } = get();
        if (!user || !user.roles || user.roles.length === 0) return null;
        return [...user.roles].sort((a, b) => b.priority - a.priority)[0];
      }
    }),
    {
      name: 'spa_auth_storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
