import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Client, Service, Staff, Order, Movement, InventoryItem, Role, SimpleDictionary, Brand, Unit, Area, Supplier, Purchase, CashRegister, KardexEntry, PaymentDetail } from '../types';
import { MOCK_CLIENTS, MOCK_SERVICES, MOCK_STAFF, MOCK_ROLES } from '../constants';

// Helper to handle sandbox fallback gracefully
const useFallback = <T>(key: string, initialData: T[]) => {
  const getLocal = (): T[] => {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  };
  const setLocal = (data: T[]) => localStorage.setItem(key, JSON.stringify(data));
  return { getLocal, setLocal };
};

// Generic CRUD Hook for simple dictionaries to save code space
export const useGenericCrud = <T extends { id: string }>(key: string, initialData: T[]) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { getLocal, setLocal } = useFallback<T>(key, initialData);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setData(getLocal());
    setLoading(false);
  }, []);

  const addItem = async (item: Omit<T, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() } as unknown as T;
    const updated = [newItem, ...data];
    setLocal(updated);
    setData(updated);
    return newItem;
  };

  const updateItem = async (id: string, updates: Partial<T>) => {
    const updated = data.map(item => item.id === id ? { ...item, ...updates } : item);
    setLocal(updated);
    setData(updated);
  };

  const deleteItem = async (id: string) => {
    const updated = data.filter(item => item.id !== id);
    setLocal(updated);
    setData(updated);
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, addItem, updateItem, deleteItem, fetchData };
};

// Specific Hooks using the Generic Hook
export const useCategories = () => useGenericCrud<SimpleDictionary>('spa_categories', [{ id: 'c1', name: 'Faciales', description: 'Tratamientos para el rostro' }, { id: 'c2', name: 'Masajes', description: 'Relajación corporal' }]);
export const useBrands = () => useGenericCrud<Brand>('spa_brands', [
  { id: 'b1', name: 'Glow Beauty', description: 'Línea premium de cuidado facial', origin: 'Francia' }, 
  { id: 'b2', name: 'Kitty Cosmetics', description: 'Maquillaje y accesorios coquette', origin: 'Japón' }
]);
export const useUnits = () => useGenericCrud<Unit>('spa_units', [
  { id: 'u1', name: 'Mililitros', abbreviation: 'ml' }, 
  { id: 'u2', name: 'Unidades', abbreviation: 'und' },
  { id: 'u3', name: 'Gramos', abbreviation: 'gr' }
]);
export const useAreas = () => useGenericCrud<Area>('spa_areas', [{ id: 'a1', name: 'Sala VIP 1', capacity: 1, status: 'Disponible' }, { id: 'a2', name: 'Sala Masajes', capacity: 2, status: 'Ocupado' }]);
export const useSuppliers = () => useGenericCrud<Supplier>('spa_suppliers', [{ id: 'sup1', name: 'Distribuidora Belleza SAC', ruc: '20555555555', phone: '999888777', email: 'ventas@belleza.pe' }]);
export const usePurchases = () => useGenericCrud<Purchase>('spa_purchases', [{ id: 'p1', supplier_id: 'sup1', total: 1500.50, date: new Date().toISOString(), status: 'Completado' }]);
export const useCashRegisters = () => useGenericCrud<CashRegister>('spa_cash_registers', [{ id: 'cr1', name: 'Caja Principal', initial_balance: 500, current_balance: 1250, status: 'Abierta', opened_at: new Date().toISOString() }]);
export const useRoles = () => useGenericCrud<Role>('spa_roles', MOCK_ROLES);

const MOCK_KARDEX: KardexEntry[] = [
  { id: 'k1', item_id: 'i1', type: 'Ingreso', quantity: 10, balance: 10, reason: 'Inventario Inicial', reference: '-', unit_cost: 45, total_cost: 450, staff_name: 'Ana Directora', date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'k2', item_id: 'i1', type: 'Salida', quantity: 2, balance: 8, reason: 'Venta POS', reference: 'Orden #10023', unit_cost: 45, total_cost: 90, staff_name: 'María Masajista', date: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'k3', item_id: 'i1', type: 'Salida', quantity: 3, balance: 5, reason: 'Venta POS', reference: 'Orden #10045', unit_cost: 45, total_cost: 135, staff_name: 'Lucía Recepción', date: new Date(Date.now() - 86400000 * 1).toISOString() },
];
export const useKardex = () => useGenericCrud<KardexEntry>('spa_kardex', MOCK_KARDEX);

const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Crema Facial Ácido Hialurónico', category: 'Cremas', brand: 'Glow Beauty', unit: 'Mililitros', stock: 5, minStock: 10, cost: 45, price: 120, lastUpdated: new Date().toISOString() },
  { id: 'i2', name: 'Aceite de Masaje Oro 24k', category: 'Aceites', brand: 'Kitty Cosmetics', unit: 'Mililitros', stock: 15, minStock: 5, cost: 80, price: 200, lastUpdated: new Date().toISOString() },
  { id: 'i3', name: 'Esmalte Semipermanente Rosa', category: 'Uñas', brand: 'Kitty Cosmetics', unit: 'Unidades', stock: 2, minStock: 8, cost: 15, price: 45, lastUpdated: new Date().toISOString() },
];
export const useInventory = () => useGenericCrud<InventoryItem>('spa_inventory', MOCK_INVENTORY);

// Existing Hooks
export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const { getLocal, setLocal } = useFallback<Staff>('spa_staff', MOCK_STAFF);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      throw new Error("Sandbox mode");
    } catch (e) {
      setStaff(getLocal());
    } finally {
      setLoading(false);
    }
  }, []);

  const addStaff = async (member: Omit<Staff, 'id' | 'avatarUrl'>) => {
    const newStaff: Staff = {
      ...member,
      id: Date.now().toString(),
      avatarUrl: `https://picsum.photos/150/150?random=${Math.floor(Math.random() * 100)}`
    };
    try {
      throw new Error("Sandbox mode");
    } catch (e) {
      const updated = [newStaff, ...staff];
      setLocal(updated);
      setStaff(updated);
    }
  };

  const updateStaff = async (id: string, updates: Partial<Staff>) => {
    try {
      throw new Error("Sandbox mode");
    } catch (e) {
      const currentStaff = getLocal();
      const updatedStaff = currentStaff.map(s => 
        s.id === id ? { ...s, ...updates } : s
      );
      setLocal(updatedStaff);
      setStaff(updatedStaff);
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      throw new Error("Sandbox mode");
    } catch (e) {
      const updated = staff.filter(s => s.id !== id);
      setLocal(updated);
      setStaff(updated);
    }
  };

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  return { staff, loading, addStaff, updateStaff, deleteStaff, fetchStaff };
};

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { getLocal, setLocal } = useFallback<Client>('spa_clients', MOCK_CLIENTS);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      throw new Error("Sandbox mode");
    } catch (e) {
      setClients(getLocal());
    } finally {
      setLoading(false);
    }
  }, []);

  const addClient = async (client: Omit<Client, 'id' | 'lastVisit' | 'avatarUrl'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      lastVisit: new Date().toISOString(),
      avatarUrl: `https://picsum.photos/150/150?random=${Math.floor(Math.random() * 100)}`,
      created_at: new Date().toISOString()
    };

    try {
      throw new Error("Sandbox mode");
    } catch (e) {
      const updated = [newClient, ...clients];
      setLocal(updated);
      setClients(updated);
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      throw new Error("Sandbox mode");
    } catch (e) {
      const updated = clients.map(c => c.id === id ? { ...c, ...updates } : c);
      setLocal(updated);
      setClients(updated);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      throw new Error("Sandbox mode");
    } catch (e) {
      const updated = clients.filter(c => c.id !== id);
      setLocal(updated);
      setClients(updated);
    }
  };

  useEffect(() => { fetchClients(); }, [fetchClients]);

  return { clients, loading, addClient, updateClient, deleteClient, fetchClients };
};

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { getLocal, setLocal } = useFallback<Service>('spa_services', MOCK_SERVICES);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      throw new Error("Sandbox mode");
    } catch (e) {
      setServices(getLocal());
    } finally {
      setLoading(false);
    }
  }, []);

  const addService = async (service: Omit<Service, 'id'>) => {
    const newService: Service = { ...service, id: Date.now().toString(), created_at: new Date().toISOString() };
    try {
      throw new Error("Sandbox mode");
    } catch (e) {
      const updated = [...services, newService];
      setLocal(updated);
      setServices(updated);
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      throw new Error("Sandbox mode");
    } catch (e) {
      const updated = services.map(s => s.id === id ? { ...s, ...updates } : s);
      setLocal(updated);
      setServices(updated);
    }
  };

  const deleteService = async (id: string) => {
    try {
      throw new Error("Sandbox mode");
    } catch (e) {
      const updated = services.filter(s => s.id !== id);
      setLocal(updated);
      setServices(updated);
    }
  };

  useEffect(() => { fetchServices(); }, [fetchServices]);

  return { services, loading, addService, updateService, deleteService };
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const { getLocal: getOrders, setLocal: setLocalOrders } = useFallback<Order>('spa_orders', []);
  const { getLocal: getMovs, setLocal: setLocalMovs } = useFallback<Movement>('spa_movements', []);

  const fetchDashboardData = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      throw new Error("Sandbox mode");
    } catch (e) {
      setOrders(getOrders());
      setMovements(getMovs());
    }
  }, []);

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'status' | 'payments'>, items: any[], payments: PaymentDetail[]) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      status: 'Completado',
      payments,
      created_at: new Date().toISOString(),
      items: items
    };

    // Generar un movimiento por cada método de pago
    const newMovements: Movement[] = payments.map((p, idx) => ({
      id: Date.now().toString() + idx,
      type: 'Ingreso',
      amount: p.amount,
      payment_method: p.method,
      description: `Venta POS - Orden #${newOrder.id.slice(-4)}`,
      created_at: new Date().toISOString()
    }));

    try {
      throw new Error("Sandbox mode");
    } catch (e) {
      const updatedOrders = [newOrder, ...getOrders()];
      setLocalOrders(updatedOrders);
      setOrders(updatedOrders);
      
      const updatedMovs = [...newMovements, ...getMovs()];
      setLocalMovs(updatedMovs);
      setMovements(updatedMovs);
      return newOrder;
    }
  };

  const addMovement = async (movementData: Omit<Movement, 'id' | 'created_at'>) => {
    const newMovement: Movement = {
      ...movementData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    try {
      throw new Error("Sandbox mode");
    } catch (e) {
      const updatedMovs = [newMovement, ...getMovs()];
      setLocalMovs(updatedMovs);
      setMovements(updatedMovs);
      return newMovement;
    }
  };

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  return { orders, movements, createOrder, addMovement, fetchDashboardData };
};
