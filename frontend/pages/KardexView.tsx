import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Spinner, Button, EmptyState, Input, Select } from '../components/UI';
import { ArrowLeft, Download, TrendingUp, TrendingDown, Package, FileText, User, Hash } from 'lucide-react';
import { useInventory, useKardex } from '../hooks/useSupabase';
import { exportToCSV } from '../utils/exportUtils';
import { motion } from 'framer-motion';

export const KardexView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: inventory, loading: loadingInv } = useInventory();
  const { data: kardex, loading: loadingKardex } = useKardex();
  
  const [filterType, setFilterType] = useState<'Todos' | 'Ingreso' | 'Salida'>('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const item = inventory.find(i => i.id === id);
  
  if (loadingInv || loadingKardex) return <Spinner />;
  if (!item) return <EmptyState message="Producto no encontrado." action={<Button onClick={() => navigate('/almacen')}>Volver al Almacén</Button>} />;

  // Ordenar cronológicamente (más antiguo primero para que el saldo tenga sentido matemático)
  const itemKardex = kardex
    .filter(k => k.item_id === id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const filteredKardex = itemKardex.filter(k => {
    if (filterType !== 'Todos' && k.type !== filterType) return false;
    if (startDate && new Date(k.date) < new Date(startDate)) return false;
    if (endDate && new Date(k.date) > new Date(endDate + 'T23:59:59')) return false;
    return true;
  });

  const totalIngresos = filteredKardex.filter(k => k.type === 'Ingreso').reduce((sum, k) => sum + k.quantity, 0);
  const totalSalidas = filteredKardex.filter(k => k.type === 'Salida').reduce((sum, k) => sum + k.quantity, 0);

  const handleExport = () => {
    const exportData = filteredKardex.map(k => ({
      Fecha: new Date(k.date).toLocaleString('es-PE'),
      Transacción: k.transaction_type,
      Documento: `${k.document_type} ${k.document_number}`,
      Motivo: k.reason,
      Responsable: k.staff_name,
      'Entrada Cant.': k.type === 'Ingreso' ? k.quantity : 0,
      'Entrada Costo U.': k.type === 'Ingreso' ? k.unit_cost : 0,
      'Entrada Total': k.type === 'Ingreso' ? k.total_cost : 0,
      'Salida Cant.': k.type === 'Salida' ? k.quantity : 0,
      'Salida Costo U.': k.type === 'Salida' ? k.unit_cost : 0,
      'Salida Total': k.type === 'Salida' ? k.total_cost : 0,
      'Saldo Cant.': k.balance,
      'Saldo Total': k.balance * k.unit_cost
    }));
    exportToCSV(`kardex_contable_${item.name.replace(/\s+/g, '_')}.csv`, exportData);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/almacen')} className="p-3 bg-white/80 backdrop-blur-sm rounded-full border border-white shadow-sm hover:bg-white hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-plum">Kardex Contable: {item.name}</h1>
          <p className="text-plum/60 font-bold mt-1">Libro de inventarios y balances valorizado.</p>
        </div>
      </div>

      {/* Resumen del Producto */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary border border-primary/20"><Package className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-bold text-plum/50 uppercase tracking-widest">Stock Actual</p>
            <p className="text-2xl font-black text-plum">{item.stock} <span className="text-sm">{item.unit?.split(' ')[0]}</span></p>
          </div>
        </Card>
        <Card className="bg-white/80 flex items-center gap-4">
          <div className="bg-accent/10 p-3 rounded-2xl text-accent border border-accent/20"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-bold text-plum/50 uppercase tracking-widest">Costo Unitario Prom.</p>
            <p className="text-2xl font-black text-plum">S/. {item.cost.toFixed(2)}</p>
          </div>
        </Card>
        <Card className="bg-white/80 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-2xl text-green-600 border border-green-200"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-bold text-plum/50 uppercase tracking-widest">Ingresos (Periodo)</p>
            <p className="text-2xl font-black text-green-600">+{totalIngresos}</p>
          </div>
        </Card>
        <Card className="bg-white/80 flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-2xl text-red-500 border border-red-200"><TrendingDown className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-bold text-plum/50 uppercase tracking-widest">Salidas (Periodo)</p>
            <p className="text-2xl font-black text-red-500">-{totalSalidas}</p>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Filtros */}
        <div className="p-6 border-b border-white/50 bg-white/40 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <Select 
              label="Tipo de Movimiento"
              value={filterType} 
              onChange={e => setFilterType(e.target.value as any)}
              options={[
                { value: 'Todos', label: 'Todos los movimientos' },
                { value: 'Ingreso', label: 'Solo Ingresos' },
                { value: 'Salida', label: 'Solo Salidas' }
              ]}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <Input label="Desde" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="flex-1 min-w-[150px]">
            <Input label="Hasta" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <Button variant="secondary" onClick={handleExport} className="py-3 px-6 shrink-0">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
        </div>

        {/* Tabla Contable Enterprise */}
        {filteredKardex.length === 0 ? (
          <EmptyState message="No hay movimientos para los filtros seleccionados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                {/* Fila 1: Agrupaciones */}
                <tr className="bg-white/80 border-b border-white">
                  <th colSpan={4} className="p-3 text-center border-r border-white/50 text-plum/50 text-[10px] uppercase tracking-widest font-black">Detalle de Operación</th>
                  <th colSpan={3} className="p-3 text-center border-r border-white/50 bg-green-50/50 text-green-700 text-[10px] uppercase tracking-widest font-black">Entradas</th>
                  <th colSpan={3} className="p-3 text-center border-r border-white/50 bg-red-50/50 text-red-700 text-[10px] uppercase tracking-widest font-black">Salidas</th>
                  <th colSpan={2} className="p-3 text-center bg-blue-50/50 text-blue-700 text-[10px] uppercase tracking-widest font-black">Saldos</th>
                </tr>
                {/* Fila 2: Columnas Específicas */}
                <tr className="bg-white/60 border-b-2 border-white text-plum/70 text-[10px] uppercase tracking-widest font-bold">
                  <th className="p-3 pl-6">Fecha</th>
                  <th className="p-3">Transacción</th>
                  <th className="p-3">Comprobante</th>
                  <th className="p-3 border-r border-white/50">Usuario</th>
                  
                  {/* Entradas */}
                  <th className="p-3 text-center bg-green-50/30">Cant.</th>
                  <th className="p-3 text-right bg-green-50/30">V.U.</th>
                  <th className="p-3 text-right border-r border-white/50 bg-green-50/30">V.Total</th>
                  
                  {/* Salidas */}
                  <th className="p-3 text-center bg-red-50/30">Cant.</th>
                  <th className="p-3 text-right bg-red-50/30">V.U.</th>
                  <th className="p-3 text-right border-r border-white/50 bg-red-50/30">V.Total</th>
                  
                  {/* Saldos */}
                  <th className="p-3 text-center bg-blue-50/30">Cant.</th>
                  <th className="p-3 text-right pr-6 bg-blue-50/30">V.Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50">
                {filteredKardex.map((k, idx) => {
                  const isIngreso = k.type === 'Ingreso';
                  const isSalida = k.type === 'Salida';
                  
                  return (
                    <motion.tr 
                      key={k.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-white/40 transition-colors bg-white/20"
                    >
                      <td className="p-3 pl-6 text-xs font-bold text-plum/80 whitespace-nowrap">
                        {new Date(k.date).toLocaleDateString('es-PE')} <span className="text-[10px] text-plum/40">{new Date(k.date).toLocaleTimeString('es-PE', {hour: '2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant={isIngreso ? 'green' : 'red'}>{k.transaction_type.replace('_', ' ')}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs font-bold text-plum">
                          <Hash className="w-3 h-3 text-plum/40" />
                          {k.document_type !== 'NINGUNO' ? `${k.document_type} ${k.document_number}` : '-'}
                        </div>
                      </td>
                      <td className="p-3 border-r border-white/50">
                        <div className="flex items-center gap-1 text-xs font-bold text-plum/60">
                          <User className="w-3 h-3" /> {k.staff_name.split(' ')[0]}
                        </div>
                      </td>

                      {/* Entradas */}
                      <td className="p-3 text-center font-black text-green-600 bg-green-50/10">{isIngreso ? k.quantity : ''}</td>
                      <td className="p-3 text-right font-bold text-plum/70 bg-green-50/10">{isIngreso ? k.unit_cost.toFixed(2) : ''}</td>
                      <td className="p-3 text-right font-black text-green-700 border-r border-white/50 bg-green-50/10">{isIngreso ? k.total_cost.toFixed(2) : ''}</td>

                      {/* Salidas */}
                      <td className="p-3 text-center font-black text-red-500 bg-red-50/10">{isSalida ? k.quantity : ''}</td>
                      <td className="p-3 text-right font-bold text-plum/70 bg-red-50/10">{isSalida ? k.unit_cost.toFixed(2) : ''}</td>
                      <td className="p-3 text-right font-black text-red-600 border-r border-white/50 bg-red-50/10">{isSalida ? k.total_cost.toFixed(2) : ''}</td>

                      {/* Saldos */}
                      <td className="p-3 text-center font-black text-blue-600 bg-blue-50/10">{k.balance}</td>
                      <td className="p-3 text-right pr-6 font-black text-blue-700 bg-blue-50/10">{(k.balance * k.unit_cost).toFixed(2)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
