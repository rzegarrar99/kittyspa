import { useGenericCrud } from './useGenericCrud';
import { clientService } from '../services/client.service';
import { staffService, roleService } from '../services/staff.service';
import { orderService, movementService, cashRegisterService } from '../services/order.service';
import { inventoryService, kardexService, purchaseService, supplierService } from '../services/inventory.service';
import { categoryService, brandService, unitService, areaService, spaServiceService } from '../services/system.service';
import { appointmentService } from '../services/appointment.service';
import { Order, PaymentDetail } from '../types';

// --- Ventas y CRM ---
export const useClients = () => {
  const crud = useGenericCrud('clients', clientService);
  return { clients: crud.data, loading: crud.loading, addClient: crud.addItem, updateClient: crud.updateItem, deleteClient: crud.deleteItem };
};

export const useOrders = () => {
  const ordersCrud = useGenericCrud('orders', orderService);
  const movementsCrud = useGenericCrud('movements', movementService);
  
  // Lógica transaccional para el POS
  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'status' | 'payments'>, items: any[], payments: PaymentDetail[]) => {
    const newOrder = {
      ...orderData,
      status: 'Completado',
      payments,
      created_at: new Date().toISOString(),
      items: items
    };

    // 1. Crear la orden
    const createdOrder = await ordersCrud.addItem(newOrder as any);

    // 2. Crear un movimiento de caja por cada método de pago utilizado
    for (const p of payments) {
      await movementsCrud.addItem({
        type: 'Ingreso',
        amount: p.amount,
        payment_method: p.method,
        description: `Venta POS - Orden #${createdOrder.id.slice(-6)}`,
        created_at: new Date().toISOString()
      } as any);
    }

    return createdOrder;
  };

  return { 
    orders: ordersCrud.data, 
    movements: movementsCrud.data, 
    createOrder, 
    updateOrder: ordersCrud.updateItem,
    addMovement: movementsCrud.addItem 
  };
};

export const useAppointments = () => {
  const crud = useGenericCrud('appointments', appointmentService);
  return { appointments: crud.data, loading: crud.loading, addAppointment: crud.addItem, updateAppointment: crud.updateItem, deleteAppointment: crud.deleteItem };
};

// --- Personal ---
export const useStaff = () => {
  const crud = useGenericCrud('staff', staffService);
  return { staff: crud.data, loading: crud.loading, addStaff: crud.addItem, updateStaff: crud.updateItem, deleteStaff: crud.deleteItem };
};

export const useRoles = () => useGenericCrud('roles', roleService);

// --- Inventario y Compras ---
export const useInventory = () => useGenericCrud('inventory', inventoryService);
export const useKardex = () => useGenericCrud('kardex', kardexService);
export const usePurchases = () => useGenericCrud('purchases', purchaseService);
export const useSuppliers = () => useGenericCrud('suppliers', supplierService);

// --- Catálogo y Sistema ---
export const useServices = () => {
  const crud = useGenericCrud('services', spaServiceService);
  return { services: crud.data, loading: crud.loading, addService: crud.addItem, updateService: crud.updateItem, deleteService: crud.deleteItem };
};
export const useCategories = () => useGenericCrud('categories', categoryService);
export const useBrands = () => useGenericCrud('brands', brandService);
export const useUnits = () => useGenericCrud('units', unitService);
export const useAreas = () => useGenericCrud('areas', areaService);
export const useCashRegisters = () => useGenericCrud('cash_registers', cashRegisterService);
