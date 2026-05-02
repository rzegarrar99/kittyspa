import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Spinner, Button, Modal, EmptyState, Input, Select } from '../components/UI';
import { AlertTriangle, Archive, Search, ArrowRightLeft, FileText, Package } from 'lucide-react';
import { useInventory, useKardex } from '../hooks/useSupabase';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../contexts/ToastContext';
import { InventoryItem, TransactionType, DocumentType } from '../types';
import { KittyIcon } from '../components/KittyIcon';
import { motion } from 'framer-motion';

export const Almacen: React.FC = () => {
  const { data: inventory, loading, updateItem } = useInventory();
  const { addItem: addKardex } = useKardex();
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  
  // Formulario de Ajuste Enterprise
  const [adjustForm, setAdjustForm] = useState({ 
    type: 'Ingreso' as 'Ingreso' | 'Salida', 
    transaction_type: 'AJUSTE_INGRESO' as TransactionType,
    document_type: 'NINGUNO' as DocumentType,
    document_number: '',
    quantity: '', 
    reason: 'Inventario Inicial',
    observations: ''
  });

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.stock <= item.minStock);

  const openAdjustModal = (item: InventoryItem) => {
    setAdjustingItem(item);
    setAdjustForm({ 
      type: 'Ingreso', 
      transaction_type: 'AJUSTE_INGRESO',
      document_type: 'NINGUNO',
      document_number: '',
      quantity: '', 
      reason: 'Inventario Inicial',
      observations: ''
    });
    setIsAdjustModalOpen(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || !user) return;
    
    const qty = Number(adjustForm.quantity);
    const newStock = adjustForm.type === 'Ingreso' 
      ? adjustingItem.stock + qty 
      : adjustingItem.stock - qty;

    if (newStock < 0) {
      addToast('El stock no puede ser negativo.', 'error');
      return;
    }

    // 1. Update Inventory
    await updateItem(adjustingItem.id, { stock: newStock, lastUpdated: new Date().toISOString() });
    
    // 2. Add Kardex Entry (Enterprise Level)
    await addKardex({
      item_id: adjustingItem.id,
      type: adjustForm.type,
      transaction_type: adjustForm.transaction_type,
      document_type: adjustForm.document_type,
      document_number: adjustForm.document_number || '-',
      quantity: qty,
      previous_balance: adjustingItem.stock,
      balance: newStock,
      unit_cost: adjustingItem.cost,
      total_cost: adjustingItem.cost * qty,
      reason: adjustForm.reason,
      observations: adjustForm.observations,
      staff_name: user.name,
      date: new Date().toISOString()
    });

    addToast(`Stock actualizado: ${newStock} unidades.`, 'success');
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-full border border-white p-2 shadow-sm">
          <KittyIcon className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-plum">Control de Almacén</h1>
          <p className="text-plum/60 font-bold mt-1">Monitorea el stock y revisa el Kardex de movimientos.</p>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-red-50/80 border-red-100 flex items-start gap-4">
            <div className="bg-white/80 p-3 rounded-full text-red-500 shrink-0 border border-white shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-red-800 font-extrabold text-lg">¡Alerta de Stock Bajo!</h3>
              <p className="text-red-600/80 font-bold text-sm mt-1">
                Hay {lowStockItems.length} producto(s) por debajo del nivel mínimo. Por favor, ajusta el stock o abastece los productos.
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-white/50 flex items-center gap-4 bg-white/40">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-plum/40">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Buscar producto o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-white/80 border border-white rounded-full focus:ring-2 focus:ring-primary/20 transition-all text-plum font-bold placeholder-plum/40 shadow-sm"
            />
          </div>
        </div>

        {loading ? <Spinner /> : filteredInventory.length === 0 ? <EmptyState message="No hay productos en el almacén." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-plum/50 text-xs uppercase tracking-widest font-bold border-b border-pink-100">
                  <th className="p-4 pl-6">Producto</th>
                  <th className="p-4">Stock Actual</th>
                  <th className="p-4">Stock Mínimo</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredInventory.map((item, idx) => {
                  const isLowStock = item.stock <= item.minStock;
                  
                  return (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-white/40 transition-colors group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/80 p-2 rounded-xl border border-white shadow-sm">
                            <Archive className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-bold text-plum">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-extrabold text-lg ${isLowStock ? 'text-red-500' : 'text-plum'}`}>
                          {item.stock} <span className="text-sm font-bold text-plum/50">{item.unit ? item.unit.split(' ')[0] : 'und'}</span>
                        </span>
                      </td>
                      <td className="p-4 font-bold text-plum/70">{item.minStock}</td>
                      <td className="p-4">
                        {isLowStock ? <Badge variant="red">Bajo</Badge> : <Badge variant="pink">Normal</Badge>}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" onClick={() => navigate(`/almacen/kardex/${item.id}`)} className="py-1.5 px-3 text-sm">
                            <FileText className="w-4 h-4" /> Kardex
                          </Button>
                          <Button variant="outline" onClick={() => openAdjustModal(item)} className="py-1.5 px-3 text-sm">
                            <ArrowRightLeft className="w-4 h-4" /> Ajustar
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Ajuste Manual Enterprise */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Ajustar Stock Manualmente" maxWidth="max-w-2xl">
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <div className="bg-white/50 p-4 rounded-2xl border border-white mb-4 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-plum/60 uppercase tracking-wider">Producto Seleccionado</p>
              <p className="font-extrabold text-plum text-lg">{adjustingItem?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-plum/60 uppercase tracking-wider">Stock Actual</p>
              <p className="font-black text-primary text-xl">{adjustingItem?.stock}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Tipo de Movimiento"
              required 
              value={adjustForm.type} 
              onChange={e => {
                const newType = e.target.value as 'Ingreso' | 'Salida';
                setAdjustForm({
                  ...adjustForm, 
                  type: newType,
                  transaction_type: newType === 'Ingreso' ? 'AJUSTE_INGRESO' : 'AJUSTE_SALIDA',
                  reason: newType === 'Ingreso' ? 'Inventario Inicial' : 'Uso interno (Spa)'
                });
              }}
              options={[
                { value: 'Ingreso', label: 'Ingreso (+)' },
                { value: 'Salida', label: 'Salida (-)' }
              ]}
            />
            <Input 
              label="Cantidad"
              required 
              type="number" 
              min="1" 
              value={adjustForm.quantity} 
              onChange={e => setAdjustForm({...adjustForm, quantity: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Tipo de Transacción"
              required 
              value={adjustForm.transaction_type} 
              onChange={e => setAdjustForm({...adjustForm, transaction_type: e.target.value as TransactionType})}
              options={adjustForm.type === 'Ingreso' ? [
                { value: 'AJUSTE_INGRESO', label: 'Ajuste de Ingreso' },
                { value: 'DEVOLUCION', label: 'Devolución' }
              ] : [
                { value: 'AJUSTE_SALIDA', label: 'Ajuste de Salida' },
                { value: 'MERMA', label: 'Merma / Vencimiento' }
              ]}
            />
            <Select 
              label="Motivo Detallado"
              required 
              value={adjustForm.reason} 
              onChange={e => setAdjustForm({...adjustForm, reason: e.target.value})}
              options={adjustForm.type === 'Ingreso' ? [
                { value: 'Inventario Inicial', label: 'Inventario Inicial' },
                { value: 'Devolución de Cliente', label: 'Devolución de Cliente' },
                { value: 'Ajuste por Sobrante', label: 'Ajuste por Sobrante' },
                { value: 'Muestra Gratis / Regalo', label: 'Muestra Gratis / Regalo' }
              ] : [
                { value: 'Uso interno (Spa)', label: 'Uso interno (Spa)' },
                { value: 'Merma / Vencimiento', label: 'Merma / Vencimiento' },
                { value: 'Producto Dañado', label: 'Producto Dañado' },
                { value: 'Ajuste por Faltante', label: 'Ajuste por Faltante' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Tipo de Comprobante"
              value={adjustForm.document_type} 
              onChange={e => setAdjustForm({...adjustForm, document_type: e.target.value as DocumentType})}
              options={[
                { value: 'NINGUNO', label: 'Ninguno (Ajuste Interno)' },
                { value: 'GUIA_REMISION', label: 'Guía de Remisión' },
                { value: 'NOTA_CREDITO', label: 'Nota de Crédito' }
              ]}
            />
            <Input 
              label="N° de Comprobante (Opcional)"
              type="text" 
              value={adjustForm.document_number} 
              onChange={e => setAdjustForm({...adjustForm, document_number: e.target.value})} 
              placeholder="Ej. GR-001-123"
              disabled={adjustForm.document_type === 'NINGUNO'}
            />
          </div>

          <Input 
            label="Observaciones (Opcional)"
            type="text" 
            value={adjustForm.observations} 
            onChange={e => setAdjustForm({...adjustForm, observations: e.target.value})} 
            placeholder="Detalles adicionales del ajuste..." 
          />
          
          <div className="pt-4 flex justify-end gap-3 border-t border-white/50">
            <Button type="button" variant="ghost" onClick={() => setIsAdjustModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Confirmar Ajuste</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
