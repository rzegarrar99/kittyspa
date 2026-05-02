export type TransactionType = 'COMPRA' | 'VENTA_POS' | 'AJUSTE_INGRESO' | 'AJUSTE_SALIDA' | 'MERMA' | 'DEVOLUCION';
export type DocumentType = 'FACTURA' | 'BOLETA' | 'TICKET' | 'GUIA_REMISION' | 'NOTA_CREDITO' | 'NINGUNO';

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
