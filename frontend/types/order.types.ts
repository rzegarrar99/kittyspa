export type PaymentMethod = 'Efectivo' | 'Billetera Digital' | 'Tarjeta' | 'Transferencia';

export interface PaymentDetail {
  method: PaymentMethod;
  amount: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number; // Precio final cobrado
  originalPrice: number; // Precio antes del descuento
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
  status: 'Completado' | 'Pendiente';
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

export interface CashRegister {
  id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  status: 'Abierta' | 'Cerrada';
  opened_at: string;
  closed_at?: string;
}
