import React, { useState } from 'react';
import { Card, Badge, EmptyState, Modal, Button } from '../components/UI';
import { ClipboardList, Search, MapPin, Eye, Printer, Banknote, CreditCard, Landmark, QrCode, XCircle } from 'lucide-react';
import { useOrders, useClients, useStaff, useAreas, useInventory, useKardex } from '../hooks/useSupabase';
import { useSettings } from '../contexts/SettingsContext';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../contexts/ToastContext';
import { Order } from '../types';
import { printTicket } from '../utils/exportUtils';
import { KittyIcon } from '../components/KittyIcon';
import { motion } from 'framer-motion';

export const Ordenes: React.FC = () => {
  const { orders, updateOrder, addMovement } = useOrders();
  const { clients } = useClients();
  const { staff } = useStaff();
  const { data: areas } = useAreas();
  const { data: inventory, updateItem: updateInventory } = useInventory();
  const { addItem: addKardex } = useKardex();
  const { settings } = useSettings();
  const { user } = useAuthStore();
  const { addToast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const getClientName = (id: string) => {
    if (id === 'WALK_IN') return 'Público General';
    return clients.find(c => c.id === id)?.name || 'Desconocido';
  };
  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Desconocido';
  const getAreaName = (id?: string) => areas.find(a => a.id === id)?.name || 'No asignada';

  const filteredOrders = orders.filter(order => {
    const clientName = getClientName(order.client_id).toLowerCase();
    const orderId = order.id.toLowerCase();
    const search = searchTerm.toLowerCase();
    return clientName.includes(search) || orderId.includes(search);
  });

  const handlePrint = () => {
    if (viewingOrder) {
      printTicket(
        viewingOrder, 
        getClientName(viewingOrder.client_id), 
        getStaffName(viewingOrder.staff_id), 
        viewingOrder.items || [], 
        settings
      );
    }
  };

  // 🚀 LÓGICA ENTERPRISE: Anulación Transaccional
  const handleVoidOrder = async (order: Order) => {
    if (!user) return;
    if (!window.confirm(`¿Estás segura de ANULAR la orden #${order.id.slice(-6)}? Esta acción devolverá el dinero y el stock.`)) return;

    try {
      // 1. Cambiar estado de la orden
      await updateOrder(order.id, { status: 'Cancelada' });

      // 2. Revertir pagos (Generar Egresos por cada Ingreso)
      for (const payment of order.payments) {
        await addMovement({
          type: 'Egreso',
          amount: payment.amount,
          payment_method: payment.method,
          description: `Anulación de Orden #${order.id.slice(-6)}`,
        });
      }

      // 3. Revertir Kardex e Inventario (Solo para productos)
      if (order.items) {
        const productsSold = order.items.filter(item => item.type === 'product');
        for (const prod of productsSold) {
          const invItem = inventory.find(i => i.id === prod.id);
          if (invItem) {
            const newStock = invItem.stock + prod.quantity;
            await updateInventory(invItem.id, { stock: newStock });
            
            await addKardex({
              item_id: invItem.id,
              type: 'Ingreso',
              transaction_type: 'DEVOLUCION',
              document_type: 'NINGUNO',
              document_number: order.id.slice(-6),
              quantity: prod.quantity,
              previous_balance: invItem.stock,
              balance: newStock,
              unit_cost: invItem.cost,
              total_cost: invItem.cost * prod.quantity,
              reason: `Anulación de Venta POS`,
              staff_name: user.name,
              date: new Date().toISOString()
            });
          }
        }
      }

      addToast('Orden anulada correctamente. Stock y caja revertidos.', 'success');
      setViewingOrder(null);
    } catch (error) {
      addToast('Error al anular la orden.', 'error');
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Efectivo': return <Banknote className="w-3 h-3" />;
      case 'Billetera Digital': return <QrCode className="w-3 h-3" />;
      case 'Tarjeta': return <CreditCard className="w-3 h-3" />;
      case 'Transferencia': return <Landmark className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-full border border-white p-2 shadow-sm">
          <KittyIcon className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-plum">Órdenes de Servicio</h1>
          <p className="text-plum/60 font-bold mt-1">Historial de atenciones y ventas realizadas.</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-white/50 flex items-center gap-4 bg-white/40">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-plum/40">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Buscar por clienta o ID de orden..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-white/80 border border-white rounded-full focus:ring-2 focus:ring-primary/20 transition-all text-plum font-bold placeholder-plum/40 shadow-sm"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState message="No se encontraron órdenes." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-plum/50 text-xs uppercase tracking-widest font-bold border-b border-pink-100">
                  <th className="p-4 pl-6">ID Orden</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Clienta</th>
                  <th className="p-4">Especialista</th>
                  <th className="p-4">Pago</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredOrders.map((order, idx) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`transition-colors group ${order.status === 'Cancelada' ? 'bg-red-50/30 opacity-70' : 'hover:bg-white/40'}`}
                  >
                    <td className="p-4 pl-6 font-bold text-plum/70">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border border-white shadow-sm ${order.status === 'Cancelada' ? 'bg-red-100 text-red-500' : 'bg-white/80 text-primary'}`}>
                          <ClipboardList className="w-4 h-4" />
                        </div>
                        <span className={order.status === 'Cancelada' ? 'line-through' : ''}>#{order.id.slice(-6)}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-plum/80">
                      {new Date(order.created_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-bold text-plum">{getClientName(order.client_id)}</td>
                    <td className="p-4 font-semibold text-plum/80">{getStaffName(order.staff_id)}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {order.payments.map((p, i) => (
                          <span key={i} className="flex items-center gap-1 text-[10px] font-bold text-plum/70 bg-white/50 px-2 py-0.5 rounded-lg border border-white w-max">
                            {getPaymentIcon(p.method)} {p.method}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-extrabold text-primary">S/. {order.total.toFixed(2)}</td>
                    <td className="p-4">
                      <Badge variant={order.status === 'Completado' ? 'green' : 'red'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button onClick={() => setViewingOrder(order)} className="p-2 text-plum/40 hover:text-primary hover:bg-white rounded-full transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={!!viewingOrder} onClose={() => setViewingOrder(null)} title={`Detalles de Orden #${viewingOrder?.id.slice(-6)}`}>
        {viewingOrder && (
          <div className="space-y-6">
            {viewingOrder.status === 'Cancelada' && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-2xl text-center font-bold text-sm flex items-center justify-center gap-2">
                <XCircle className="w-5 h-5" /> Esta orden fue anulada.
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-plum/50 font-bold uppercase tracking-wider text-xs">Clienta</p>
                <p className="font-extrabold text-plum">{getClientName(viewingOrder.client_id)}</p>
              </div>
              <div>
                <p className="text-plum/50 font-bold uppercase tracking-wider text-xs">Especialista</p>
                <p className="font-extrabold text-plum">{getStaffName(viewingOrder.staff_id)}</p>
              </div>
              <div>
                <p className="text-plum/50 font-bold uppercase tracking-wider text-xs">Fecha</p>
                <p className="font-bold text-plum">{new Date(viewingOrder.created_at).toLocaleString('es-PE')}</p>
              </div>
              <div>
                <p className="text-plum/50 font-bold uppercase tracking-wider text-xs">Área</p>
                <p className="font-bold text-plum">{getAreaName(viewingOrder.area_id)}</p>
              </div>
            </div>

            <div className="border-t border-pink-100 pt-4">
              <h4 className="font-bold text-plum mb-3">Servicios y Productos</h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {viewingOrder.items && viewingOrder.items.length > 0 ? (
                  viewingOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white/80 border border-white rounded-xl shadow-sm">
                      <span className="font-bold text-sm text-plum">{item.quantity}x {item.name}</span>
                      <span className="text-sm text-primary font-extrabold">S/. {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-plum/50 italic">No hay detalles de items para esta orden antigua.</p>
                )}
              </div>
            </div>

            <div className="border-t border-pink-100 pt-4 flex justify-between items-start">
              <div>
                <span className="text-plum/60 font-bold uppercase tracking-wider text-xs block mb-2">Métodos de Pago</span>
                <div className="space-y-1">
                  {viewingOrder.payments.map((p, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs font-bold text-plum/70">
                      {getPaymentIcon(p.method)} {p.method}: S/. {p.amount.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="text-plum/60 font-bold uppercase tracking-wider text-xs block mb-1">Total Pagado</span>
                <span className="text-2xl font-extrabold text-plum">S/. {viewingOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between gap-3">
              {viewingOrder.status === 'Completado' ? (
                <Button variant="danger" onClick={() => handleVoidOrder(viewingOrder)} className="px-4">
                  <XCircle className="w-4 h-4" /> Anular Orden
                </Button>
              ) : <div></div>}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setViewingOrder(null)}>Cerrar</Button>
                <Button onClick={handlePrint} disabled={viewingOrder.status === 'Cancelada'}><Printer className="w-5 h-5" /> Imprimir Ticket</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
