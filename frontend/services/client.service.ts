import { Client } from '../types';
import { MOCK_CLIENTS } from '../constants';

const STORAGE_KEY = 'spa_clients_v2';

// Helper temporal para localStorage
const getStored = (): Client[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CLIENTS));
  return MOCK_CLIENTS;
};

const setStored = (data: Client[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const clientService = {
  getAll: async (): Promise<Client[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular latencia de red
    return getStored().sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  },

  create: async (clientData: Omit<Client, 'id' | 'lastVisit' | 'avatarUrl' | 'created_at'>): Promise<Client> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newClient: Client = {
      ...clientData,
      id: crypto.randomUUID(), // Uso de UUID estándar en lugar de Date.now()
      lastVisit: new Date().toISOString(),
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${clientData.name}&backgroundColor=FFB6C1`,
      created_at: new Date().toISOString()
    };
    const current = getStored();
    setStored([newClient, ...current]);
    return newClient;
  },

  update: async (id: string, updates: Partial<Client>): Promise<Client> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const current = getStored();
    const index = current.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Cliente no encontrado');
    
    const updatedClient = { ...current[index], ...updates };
    current[index] = updatedClient;
    setStored(current);
    return updatedClient;
  },

  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const current = getStored();
    setStored(current.filter(c => c.id !== id));
  }
};

// MIGRACIÓN A FIREBASE:
// Las firmas de estas funciones (getAll, create, update, delete) NO cambiarán.
// Solo se reemplazará el cuerpo para usar `getDocs(collection(db, 'clients'))`, `addDoc`, etc.
