import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Staff, Role } from '../types';
import { useStaff } from '../hooks/useSupabase';

interface AuthContextType {
  user: Staff | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  highestRole: Role | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Staff | null>(null);
  const { staff } = useStaff();

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('spa_current_user');
    if (storedUser && staff.length > 0) {
      const parsed = JSON.parse(storedUser);
      // Refresh user data from staff list to get updated roles
      const freshUser = staff.find(s => s.id === parsed.id);
      if (freshUser) setUser(freshUser);
    }
  }, [staff]);

  const login = useCallback((username: string, password?: string) => {
    // Hardcoded credentials for easy access
    if (username.toLowerCase() === 'admin' && password === '123') {
      // Assign the staff member who has the '*' permission (Admin)
      const adminUser = staff.find(s => s.roles.some(r => r.permissions.includes('*'))) || staff[0];
      if (adminUser) {
        setUser(adminUser);
        localStorage.setItem('spa_current_user', JSON.stringify(adminUser));
        return true;
      }
    }
    return false;
  }, [staff]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('spa_current_user');
  }, []);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    
    // Check all roles for the permission or wildcard '*'
    return user.roles.some(role => 
      role.permissions.includes('*') || role.permissions.includes(permission)
    );
  }, [user]);

  const highestRole = React.useMemo(() => {
    if (!user || user.roles.length === 0) return null;
    return [...user.roles].sort((a, b) => b.priority - a.priority)[0];
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, highestRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
