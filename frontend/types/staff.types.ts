export interface Role {
  id: string;
  name: string;
  color: string;
  priority: number;
  permissions: string[];
}

export interface Staff {
  id: string;
  name: string;
  username: string; // NUEVO: Nombre de usuario para login
  email: string;
  roles: Role[];
  commission_rate: number;
  avatarUrl: string;
  password?: string; // Solo para el mock local. En Firebase esto vive en Firebase Auth.
}
