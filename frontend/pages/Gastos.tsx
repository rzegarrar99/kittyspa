import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Badge, Modal, EmptyState, Input, Select } from '../components/UI';
import { Receipt, Plus, TrendingDown } from 'lucide-react';
import { useOrders } from '../hooks/useSupabase';
import { useToast } from '../contexts/ToastContext';
import { KittyIcon } from '../components/KittyIcon';
import { expenseSchema, ExpenseFormData } from '../schemas/system.schema';
import { motion } from 'framer-motion';

export const Gastos: React.FC = () => {
  const { movements, addMovement } = useOrders();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 🚀 ENTERPRISE: React Hook Form + Zod
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { description: '', amount: 0, category: 'Insumos' }
  });

  const expenses = movements.filter(m => m.type === 'Egreso');
  const totalExpenses = expenses.reduce((sum, m) => sum + m.amount, 0);

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await addMovement({
        type: 'Egreso',
        description: data.description,
        amount: data.amount,
        payment_method: 'Efectivo',
        expense_category: data.category
      });
      addToast('¡Gasto registrado correctamente! 💸', 'success');
      setIsModalOpen(false);
      reset();
    } catch (error) {
      addToast('Ocurrió un error al registrar el gasto.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-full border border-white p-2 shadow-sm">
            <KittyIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-plum">Control de Gastos</h1>
            <p className="text-plum/60 font-bold mt-1">Registra y categoriza los egresos del spa.</p>
          </div>
        </div>
        <Button onClick={() => { reset(); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5" />
          Nuevo Gasto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-50/80 border-red-100 flex items-center gap-4">
          <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm text-red-500">
            <TrendingDown className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-red-800/60 uppercase tracking-widest">Total Egresos</p>
            <h3 className="text-2xl font-extrabold text-red-600">S/. {totalExpenses.toFixed(2)}</h3>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        {expenses.length === 0 ? (
          <EmptyState message="No hay gastos registrados aún." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-plum/50 text-xs uppercase tracking-widest font-bold border-b border-pink-100">
                  <th className="p-4 pl-6">Fecha</th>
                  <th className="p-4">Descripción</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4 text-right pr-6">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {expenses.map((expense, idx) => (
                  <motion.tr 
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/40 transition-colors group"
                  >
                    <td className="p-4 pl-6 font-semibold text-plum/80">
                      {new Date(expense.created_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-bold text-plum flex items-center gap-3">
                      <div className="bg-white/80 p-2 rounded-xl border border-white shadow-sm">
                        <Receipt className="w-4 h-4 text-primary" />
                      </div>
                      {expense.description}
                    </td>
                    <td className="p-4">
                      <Badge variant="gray">{expense.expense_category || 'General'}</Badge>
                    </td>
                    <td className="p-4 pr-6 text-right font-extrabold text-red-500">
                      - S/. {expense.amount.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Gasto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select 
            label="Categoría del Gasto"
            {...register('category')}
            error={errors.category?.message}
            options={[
              { value: 'Insumos', label: 'Insumos y Productos' },
              { value: 'Servicios Básicos', label: 'Servicios Básicos (Agua, Luz, Internet)' },
              { value: 'Planilla', label: 'Planilla y Comisiones' },
              { value: 'Mantenimiento', label: 'Mantenimiento y Limpieza' },
              { value: 'Marketing', label: 'Publicidad y Marketing' },
              { value: 'Otros', label: 'Otros Gastos' }
            ]}
          />
          <Input 
            label="Descripción del Gasto"
            {...register('description')}
            error={errors.description?.message}
            placeholder="Ej. Compra de toallas, Pago de luz..." 
          />
          <Input 
            label="Monto (S/.)"
            type="number" 
            min="0.1" 
            step="0.1" 
            {...register('amount')}
            error={errors.amount?.message}
            placeholder="0.00" 
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="bg-gradient-to-r from-red-500 to-red-400 text-white shadow-glow">Guardar Gasto</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
