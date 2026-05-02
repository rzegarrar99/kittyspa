export type PaymentMethod = 'Efectivo' | 'Billetera Digital' | 'Tarjeta' | 'Transferencia';
export type TransactionType = 'COMPRA' | 'VENTA_POS' | 'AJUSTE_INGRESO' | 'AJUSTE_SALIDA' | 'MERMA' | 'DEVOLUCION';
export type DocumentType = 'FACTURA' | 'BOLETA' | 'TICKET' | 'GUIA_REMISION' | 'NOTA_CREDITO' | 'NINGUNO';

export interface PaymentDetail {
  method: PaymentMethod;
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  dni: string;
  phone: string;
  email?: string;
  status: 'VIP' | 'Activo' | 'Inactivo';
  lastVisit: string;
  avatarUrl: string;
  created_at?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number; // in minutes
  created_at?: string;
}

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
  username: string;
  email: string;
  roles: Role[];
  commission_rate: number;
  avatarUrl: string;
  password?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discountType?: 'percentage' | 'fixed' | 'gift';
  discountValue?: number;
  quantity: number;
  type: 'service' | 'product';
}

export interface Order {
  id: string;
  client_id: string;
  staff_id: string;
  area_id?: string;
  total: number;
  payments: PaymentDetail[];
  status: 'Completado' | 'Pendiente' | 'Cancelada';
  created_at: string;
  items?: OrderItem[];
}

export interface Movement {
  id: string;
  type: 'Ingreso' | 'Egreso';
  amount: number;
  payment_method: PaymentMethod;
  description: string;
  expense_category?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  unit?: string;
  stock: number;
  minStock: number;
  cost: number;
  price: number;
  lastUpdated: string;
}

export interface KardexEntry {
  id: string;
  item_id: string;
  type: 'Ingreso' | 'Salida';
  transaction_type: TransactionType;
  document_type: DocumentType;
  document_number: string;
  quantity: number;
  previous_balance: number;
  balance: number;
  unit_cost: number;
  total_cost: number;
  reason: string;
  observations?: string;
  staff_name: string;
  date: string;
}

export interface KpiData {
  title: string;
  value: string;
  trend: string;
  icon: any;
  color: string;
  bg: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface SimpleDictionary {
  id: string;
  name: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  origin: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Area {
  id: string;
  name: string;
  capacity: number;
  status: 'Disponible' | 'Ocupado' | 'Mantenimiento';
}

export interface Supplier {
  id: string;
  name: string;
  ruc: string;
  phone: string;
  email: string;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  document_type: DocumentType;
  document_number: string;
  total: number;
  date: string;
  status: 'Completado' | 'Pendiente';
}

export interface CashRegister {
  id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  status: 'Abierta' | 'Cerrada';
  opened_at: string;
  closed_at?: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  staff_id: string;
  service_id: string;
  date: string;
  time: string;
  status: 'Pendiente' | 'Confirmada' | 'Completada' | 'Cancelada';
  notes?: string;
  created_at: string;
}
