import { InventoryItem, KardexEntry, Purchase, Supplier } from '../types';
import { BaseService } from './base.service';

const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Crema Facial Ácido Hialurónico', category: 'Cremas', brand: 'Glow Beauty', unit: 'Mililitros', stock: 5, minStock: 10, cost: 45, price: 120, lastUpdated: new Date().toISOString() },
  { id: 'i2', name: 'Aceite de Masaje Oro 24k', category: 'Aceites', brand: 'Kitty Cosmetics', unit: 'Mililitros', stock: 15, minStock: 5, cost: 80, price: 200, lastUpdated: new Date().toISOString() },
  { id: 'i3', name: 'Esmalte Semipermanente Rosa', category: 'Uñas', brand: 'Kitty Cosmetics', unit: 'Unidades', stock: 2, minStock: 8, cost: 15, price: 45, lastUpdated: new Date().toISOString() },
];

const MOCK_KARDEX: KardexEntry[] = [
  { 
    id: 'k1', item_id: 'i1', type: 'Ingreso', transaction_type: 'AJUSTE_INGRESO', document_type: 'NINGUNO', document_number: '-', 
    quantity: 10, previous_balance: 0, balance: 10, unit_cost: 45, total_cost: 450, reason: 'Inventario Inicial', staff_name: 'Admin', date: new Date(Date.now() - 86400000 * 5).toISOString() 
  },
  { 
    id: 'k2', item_id: 'i1', type: 'Salida', transaction_type: 'VENTA_POS', document_type: 'TICKET', document_number: '000123', 
    quantity: 2, previous_balance: 10, balance: 8, unit_cost: 45, total_cost: 90, reason: 'Venta en POS', staff_name: 'Admin', date: new Date(Date.now() - 86400000 * 3).toISOString() 
  },
  { 
    id: 'k3', item_id: 'i1', type: 'Salida', transaction_type: 'VENTA_POS', document_type: 'TICKET', document_number: '000145', 
    quantity: 3, previous_balance: 8, balance: 5, unit_cost: 45, total_cost: 135, reason: 'Venta en POS', staff_name: 'Admin', date: new Date(Date.now() - 86400000 * 1).toISOString() 
  },
];

class InventoryService extends BaseService<InventoryItem> {
  constructor() {
    super('spa_inventory', MOCK_INVENTORY);
  }
}

class KardexService extends BaseService<KardexEntry> {
  constructor() {
    super('spa_kardex', MOCK_KARDEX);
  }
}

class PurchaseService extends BaseService<Purchase> {
  constructor() {
    super('spa_purchases', [
      { id: 'p1', supplier_id: 'sup1', document_type: 'FACTURA', document_number: 'F001-00234', total: 1500.50, date: new Date().toISOString(), status: 'Completado' }
    ]);
  }
}

class SupplierService extends BaseService<Supplier> {
  constructor() {
    super('spa_suppliers', [
      { id: 'sup1', name: 'Distribuidora Belleza SAC', ruc: '20555555555', phone: '999888777', email: 'ventas@belleza.pe' }
    ]);
  }
}

export const inventoryService = new InventoryService();
export const kardexService = new KardexService();
export const purchaseService = new PurchaseService();
export const supplierService = new SupplierService();
