import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Spinner, Modal, EmptyState, Badge, Input } from '../components/UI';
import { Wallet, Plus, Lock, Unlock, AlertCircle, TrendingUp, TrendingDown, CreditCard, QrCode, Landmark } from 'lucide-react';
import { useCashRegisters, useOrders } from '../hooks/useSupabase';
import { useToast } from '../contexts/ToastContext';
import { KittyIcon } from '../components/KittyIcon';
import { CashRegister } from '../types';
import { cashRegisterSchema, CashRegisterFormData } from '../schemas/system.schema';
import { motion } from 'framer-motion';

export const Cajas: React.FC = () => {
  const { data: registers, loading, addItem, updateItem } = useCashRegisters();
  const { movements, addMovement } = useOrders();
  const { addToast } = useToast();
  
  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(null);
  const [expectedBalance, setExpectedBalance] = useState(0);
  const [digitalStats, setDigitalStats] = useState({ billetera: 0, tarjeta: 0, transferencia: 0 });

  // 🚀 ENTERPRISE: React Hook Form + Zod para Crear/Abrir Caja
  const { register: registerForm, handleSubmit: handleFormSubmit, reset: resetForm, formState: { errors: formErrors } } = useForm<CashRegisterFormData>({
    resolver: zodResolver(cashRegisterSchema),
    defaultValues: { name: '', initial_balance: 0 }
  });

  // Estado simple para el cierre de caja (solo un input)
  const [physicalAmount, setPhysicalAmount] = useState('');

  // 1. Crear nueva caja física (Admin)
  const onCraeteSubmit = async (data: CashRegisterFormData) => {
    try {
      await addItem({
        name: data.name,
        initial_balance: 0,
        current_balance: 0,
        status: 'Cerrada',
        opened_at: new Date().toISOString()
      });
      addToast('Nueva caja registradora creada 🎀', 'success');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      addToast('Error al crear la caja.', 'error');
    }
  };

  // 2. Abrir Turno
  const onOpenSubmit = async (data: CashRegisterFormData) => {
    if (!selectedRegister) return;
    try {
      await updateItem(selectedRegister.id, {
        status: 'Abierta',
        initial_balance: data.initial_balance,
        current_balance: data.initial_balance,
        opened_at: new Date().toISOString(),
        closed_at: undefined
      });
      
      addToast(`Turno abierto en ${selectedRegister.name} 🎀`, 'success');
      setIsOpenModalOpen(false);
      resetForm();
    } catch (error) {
      addToast('Error al abrir el turno.', 'error');
    }
  };

  // 3. Cerrar Turno (Arqueo)
  const handleConfirmClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegister || physicalAmount === '') return;

    const physical = Number(physicalAmount);
    const difference = physical - expectedBalance;

    try {
      if (difference < 0) {
        await addMovement({
          type: 'Egreso',
          description: `Faltante en cierre de caja: ${selectedRegister.name}`,
          amount: Math.abs(difference),
          payment_method: 'Efectivo'
        });
        addToast(`Se registró un faltante de S/. ${Math.abs(difference).toFixed(2)}`, 'error');
      } else if (difference > 0) {
        await addMovement({
          type: 'Ingreso',
          description: `Sobrante en cierre de caja: ${selectedRegister.name}`,
          amount: difference,
          payment_method: 'Efectivo'
        });
        addToast(`Se registró un sobrante de S/. ${difference.toFixed(2)}`, 'success');
      }

      await updateItem(selectedRegister.id, { 
        status: 'Cerrada', 
        closed_at: new Date().toISOString(), 
        current_balance: physical 
      });
      
      addToast('Turno cerrado correctamente.', 'success');
      setIsCloseModalOpen(false);
      setPhysicalAmount('');
    } catch (error) {
      addToast('Error al cerrar la caja.', 'error');
    }
  };

  // Helper para calcular estadísticas en vivo (Separando Efectivo de Digital)
  const getRegisterStats = (reg: CashRegister) => {
    if (reg.status === 'Cerrada') return { efectivo: reg.current_balance, digital: 0, egresos: 0, billetera: 0, tarjeta: 0, transferencia: 0 };

    const openDate = new Date(reg.opened_at);
    const regMovements = movements.filter(m => new Date(m.created_at) >= openDate);
    
    const ingresosEfectivo = regMovements.filter(m => m.type === 'Ingreso' && m.payment_method === 'Efectivo').reduce((sum, m) => sum + m.amount, 0);
    const ingresosDigitales = regMovements.filter(m => m.type === 'Ingreso' && m.payment_method !== 'Efectivo').reduce((sum, m) => sum + m.amount, 0);
    
    const egresosEfectivo = regMovements.filter(m => m.type === 'Egreso').reduce((sum, m) => sum + m.amount, 0); 
    
    const billetera = regMovements.filter(m => m.type === 'Ingreso' && m.payment_method === 'Billetera Digital').reduce((sum, m) => sum + m.amount, 0);
    const tarjeta = regMovements.filter(m => m.type === 'Ingreso' && m.payment_method === 'Tarjeta').reduce((sum, m) => sum + m.amount, 0);
    const transferencia = regMovements.filter(m => m.type === 'Ingreso' && m.payment_method === 'Transferencia').reduce((sum, m) => sum + m.amount, 0);

    return {
      efectivo: reg.initial_balance + ingresosEfectivo - egresosEfectivo,
      digital: ingresosDigitales,
      egresos: egresosEfectivo,
      billetera,
      tarjeta,
      transferencia
    };
  };

  const openCloseModal = (reg: CashRegister, stats: any) => {
    setSelectedRegister(reg);
    setExpectedBalance(stats.efectivo);
    setDigitalStats({ billetera: stats.billetera, tarjeta: stats.tarjeta, transferencia: stats.transferencia });
    setPhysicalAmount(stats.efectivo.toString());
    setIsCloseModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-full border border-white p-2 shadow-sm">
            <KittyIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-plum">Control de Cajas</h1>
            <p className="text-plum/60 font-bold mt-1">Apertura de turnos y arqueo de cajas.</p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} variant="secondary">
          <Plus className="w-5 h-5" /> Crear Caja Física
        </Button>
      </div>

      {loading ? <Spinner /> : registers.length === 0 ? <EmptyState message="No hay cajas registradas." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registers.map((reg, idx) => {
            const stats = getRegisterStats(reg);
            
            return (
              <motion.div key={reg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/80 p-3 rounded-2xl border border-white shadow-sm">
                        <Wallet className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-black text-plum text-xl uppercase tracking-tight">{reg.name}</h3>
                    </div>
                    <Badge variant={reg.status === 'Abierta' ? 'pink' : 'gray'}>{reg.status}</Badge>
                  </div>

                  {reg.status === 'Abierta' ? (
                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-plum/60 uppercase tracking-wider text-xs">Apertura</span>
                        <span className="font-black text-plum">{new Date(reg.opened_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-plum/60 uppercase tracking-wider text-xs">Base Inicial</span>
                        <span className="font-black text-plum">S/. {reg.initial_balance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600 bg-green-50/50 p-2 rounded-xl border border-white">
                        <span className="font-bold uppercase tracking-wider text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Ingresos (Efectivo)</span>
                        <span className="font-black">+ S/. {(stats.efectivo - reg.initial_balance + stats.egresos).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-red-500 bg-red-50/50 p-2 rounded-xl border border-white">
                        <span className="font-bold uppercase tracking-wider text-xs flex items-center gap-1"><TrendingDown className="w-3 h-3"/> Egresos (Efectivo)</span>
                        <span className="font-black">- S/. {stats.egresos.toFixed(2)}</span>
                      </div>
                      <div className="pt-4 border-t border-white/50 flex justify-between items-center">
                        <span className="font-black text-plum uppercase tracking-wider text-xs">Efectivo en Caja</span>
                        <span className="text-2xl font-black text-primary">S/. {stats.efectivo.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 flex justify-between items-center text-xs text-plum/60 font-bold">
                        <span>+ Pagos Digitales (Banco)</span>
                        <span>S/. {stats.digital.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6 flex-1 flex flex-col justify-center items-center py-8 bg-white/40 rounded-3xl border border-white border-dashed">
                      <Lock className="w-8 h-8 text-plum/20 mb-2" />
                      <p className="font-black text-plum/40 uppercase tracking-widest text-xs">Caja Cerrada</p>
                      {reg.closed_at && (
                        <p className="text-xs font-bold text-plum/40 mt-1">Último cierre: {new Date(reg.closed_at).toLocaleDateString('es-PE')}</p>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-white/50">
                    {reg.status === 'Abierta' ? (
                      <Button className="w-full" onClick={() => openCloseModal(reg, stats)}>
                        <Lock className="w-5 h-5" /> Arqueo y Cierre
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" onClick={() => { setSelectedRegister(reg); resetForm({ name: reg.name, initial_balance: 0 }); setIsOpenModalOpen(true); }}>
                        <Unlock className="w-5 h-5" /> Abrir Turno
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Crear Caja Física */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Crear Caja Física">
        <form onSubmit={handleFormSubmit(onCraeteSubmit)} className="space-y-4">
          <Input 
            label="Nombre de la Caja"
            {...registerForm('name')}
            error={formErrors.name?.message}
            placeholder="Ej. Caja Recepción, Caja 2..." 
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Crear Caja</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Abrir Turno */}
      <Modal isOpen={isOpenModalOpen} onClose={() => setIsOpenModalOpen(false)} title={`Abrir Turno: ${selectedRegister?.name}`}>
        <form onSubmit={handleFormSubmit(onOpenSubmit)} className="space-y-4">
          <Input 
            label="Base Inicial (Efectivo en caja) S/."
            type="number" 
            min="0" 
            step="0.1" 
            {...registerForm('initial_balance')}
            error={formErrors.initial_balance?.message}
            placeholder="0.00" 
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsOpenModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Iniciar Turno</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Arqueo y Cierre de Caja */}
      <Modal isOpen={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)} title={`Arqueo: ${selectedRegister?.name}`}>
        <form onSubmit={handleConfirmClose} className="space-y-6">
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-fuchsia-50/80 border border-white rounded-2xl p-3 text-center shadow-sm">
              <QrCode className="w-5 h-5 text-fuchsia-600 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-plum/50 uppercase">Billetera Digital</p>
              <p className="font-black text-plum">S/. {digitalStats.billetera.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50/80 border border-white rounded-2xl p-3 text-center shadow-sm">
              <CreditCard className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-plum/50 uppercase">Tarjeta</p>
              <p className="font-black text-plum">S/. {digitalStats.tarjeta.toFixed(2)}</p>
            </div>
            <div className="bg-orange-50/80 border border-white rounded-2xl p-3 text-center shadow-sm">
              <Landmark className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-plum/50 uppercase">Transf.</p>
              <p className="font-black text-plum">S/. {digitalStats.transferencia.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white/50 p-6 rounded-3xl border border-white text-center shadow-sm">
            <p className="text-xs font-bold text-plum/60 uppercase tracking-widest mb-2">Efectivo Esperado en Cajón</p>
            <p className="text-4xl font-black text-plum">S/. {expectedBalance.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-plum/60 mb-2 ml-1 uppercase tracking-wider">Efectivo Físico Contado (S/.)</label>
            <input 
              required 
              type="number" 
              min="0" 
              step="0.1" 
              value={physicalAmount} 
              onChange={e => setPhysicalAmount(e.target.value)} 
              className="w-full px-4 py-4 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-black text-2xl text-center shadow-sm" 
              placeholder="0.00" 
            />
          </div>

          {physicalAmount !== '' && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-sm ${
              Number(physicalAmount) === expectedBalance 
                ? 'bg-green-50/80 border-green-200 text-green-700' 
                : 'bg-red-50/80 border-red-200 text-red-700'
            }`}>
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-black text-sm uppercase tracking-wide">
                  {Number(physicalAmount) === expectedBalance 
                    ? 'La caja está perfectamente cuadrada.' 
                    : Number(physicalAmount) > expectedBalance 
                      ? `Hay un SOBRANTE de S/. ${(Number(physicalAmount) - expectedBalance).toFixed(2)}`
                      : `Hay un FALTANTE de S/. ${(expectedBalance - Number(physicalAmount)).toFixed(2)}`
                  }
                </p>
                {Number(physicalAmount) !== expectedBalance && (
                  <p className="text-xs mt-1 font-bold opacity-80">Se generará un movimiento automático por la diferencia.</p>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-white/50">
            <Button type="button" variant="ghost" onClick={() => setIsCloseModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Confirmar Cierre</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
