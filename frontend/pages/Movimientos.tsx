import React from 'react';
import { Card, Badge, EmptyState } from '../components/UI';
import { ArrowRightLeft, TrendingUp, TrendingDown, Wallet, Banknote, CreditCard, Landmark, QrCode } from 'lucide-react';
import { useOrders } from '../hooks/useSupabase';
import { KittyIcon } from '../components/KittyIcon';
import { motion } from 'framer-motion';

export const Movimientos: React.FC = () => {
  const { movements } = useOrders();

  const totalIngresos = movements.filter(m => m.type === 'Ingreso').reduce((sum, m) => sum + m.amount, 0);
  const totalEgresos = movements.filter(m => m.type === 'Egreso').reduce((sum, m) => sum + m.amount, 0);
  const balance = totalIngresos - totalEgresos;

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Efectivo': return <Banknote className="w-3 h-3" />;
      case 'Billetera Digital': return <QrCode className="w-3 h-3" />;
      case 'Tarjeta': return <CreditCard className="w-3 h-3" />;
      case 'Transferencia': return <Landmark className="w-3 h-3" />;
      default: return <Wallet className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-full border border-white p-2 shadow-sm">
          <KittyIcon className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-plum">Movimientos de Caja</h1>
          <p className="text-plum/60 font-bold mt-1">Historial completo de ingresos y egresos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50/80 border-green-100 flex items-center gap-4">
          <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm text-green-500">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-green-800/60 uppercase tracking-widest">Ingresos</p>
            <h3 className="text-2xl font-extrabold text-green-600">S/. {totalIngresos.toFixed(2)}</h3>
          </div>
        </Card>
        <Card className="bg-red-50/80 border-red-100 flex items-center gap-4">
          <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm text-red-500">
            <TrendingDown className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-red-800/60 uppercase tracking-widest">Egresos</p>
            <h3 className="text-2xl font-extrabold text-red-600">S/. {totalEgresos.toFixed(2)}</h3>
          </div>
        </Card>
        <Card className="bg-primary/5 border-primary/20 flex items-center gap-4">
          <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm text-primary">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">Balance Actual</p>
            <h3 className="text-2xl font-extrabold text-primary">S/. {balance.toFixed(2)}</h3>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        {movements.length === 0 ? (
          <EmptyState message="No hay movimientos registrados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-plum/50 text-xs uppercase tracking-widest font-bold border-b border-pink-100">
                  <th className="p-4 pl-6">Fecha</th>
                  <th className="p-4">Descripción</th>
                  <th className="p-4">Método</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4 text-right pr-6">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {movements.map((mov, idx) => (
                  <motion.tr 
                    key={mov.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/40 transition-colors group"
                  >
                    <td className="p-4 pl-6 font-semibold text-plum/80">
                      {new Date(mov.created_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-bold text-plum flex items-center gap-3">
                      <div className="bg-white/80 p-2 rounded-xl border border-white shadow-sm">
                        <ArrowRightLeft className="w-4 h-4 text-primary" />
                      </div>
                      {mov.description}
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-xs font-bold text-plum/70 bg-white/50 px-2 py-1 rounded-lg border border-white w-max">
                        {getPaymentIcon(mov.payment_method)} {mov.payment_method}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={mov.type === 'Ingreso' ? 'pink' : 'red'}>{mov.type}</Badge>
                    </td>
                    <td className={`p-4 pr-6 text-right font-extrabold ${mov.type === 'Ingreso' ? 'text-green-500' : 'text-red-500'}`}>
                      {mov.type === 'Ingreso' ? '+' : '-'} S/. {mov.amount.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
