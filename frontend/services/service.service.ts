import { Service } from '../types';
import { MOCK_SERVICES } from '../constants';

const STORAGE_KEY = 'spa_services_v2';

const getStored = (): Service[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SERVICES));
  return MOCK_SERVICES;
};

const setStored = (data: Service[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const serviceService = {
  getAll: async (): Promise<Service[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getStored().sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  },

  create: async (serviceData: Omit<Service, 'id' | 'created_at'>): Promise<Service> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newService: Service = {
      ...serviceData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    const current = getStored();
    setStored([newService, ...current]);
    return newService;
  },

  update: async (id: string, updates: Partial<Service>): Promise<Service> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const current = getStored();
    const index = current.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Servicio no encontrado');
    
    const updatedService = { ...current[index], ...updates };
    current[index] = updatedService;
    setStored(current);
    return updatedService;
  },

  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const current = getStored();
    setStored(current.filter(s => s.id !== id));
  }
};

// MIGRACIÓN A FIREBASE:
// Reemplazar localStorage por llamadas a Firestore collection('services').
