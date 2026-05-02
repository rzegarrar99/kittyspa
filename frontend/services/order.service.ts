import { Order, Movement, CashRegister } from '../types';
import { BaseService } from './base.service';

class OrderService extends BaseService<Order> {
  constructor() {
    super('spa_orders', []);
  }
}

class MovementService extends BaseService<Movement> {
  constructor() {
    super('spa_movements', []);
  }
}

class CashRegisterService extends BaseService<CashRegister> {
  constructor() {
    super('spa_cash_registers', [
      { id: 'cr1', name: 'Caja Principal', initial_balance: 500, current_balance: 1250, status: 'Abierta', opened_at: new Date().toISOString() }
    ]);
  }
}

export const orderService = new OrderService();
export const movementService = new MovementService();
export const cashRegisterService = new CashRegisterService();

// 🚀 MIGRACIÓN A FIREBASE: 
// No requiere cambios. Heredan de BaseService.
