import React, { useState, useMemo } from 'react';
import { Card, Spinner, EmptyState, Select, Button } from '../components/UI';
import { TrendingUp, PieChart as PieChartIcon, Clock, Download, Filter } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useOrders, useClients } from '../hooks/useSupabase';
import { exportToCSV } from '../utils/exportUtils';
import { KittyIcon } from '../components/KittyIcon';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-coquette border border-white">
        <p className="text-plum font-black mb-2 uppercase tracking-wider text-xs">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color || '#FF2A7A' }}>
            {entry.name}: {typeof entry.value === 'number' && entry.name.includes('Ventas') ? `S/. ${entry.value.toFixed(2)}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Reportes: React.FC = () => {
  const { orders } = useOrders();
  const { loading: loadingClients } = useClients();
  const [dateRange, setDateRange] = useState('7'); // '7', '30', 'all'

  // Filter orders based on selected date range
  const filteredOrders = useMemo(() => {
    if (dateRange === 'all') return orders;
    
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return orders.filter(o => new Date(o.created_at) >= cutoffDate);
  }, [orders, dateRange]);

  // Process Data for AreaChart (Sales Evolution)
  const salesData = useMemo(() => {
    const daysToShow = dateRange === 'all' ? 30 : parseInt(dateRange); // Cap at 30 for chart readability
    
    const dateArray = Array.from({length: daysToShow}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return dateArray.map(date => {
      const dayTotal = filteredOrders
        .filter(o => o.created_at.startsWith(date))
        .reduce((sum, o) => sum + o.total, 0);
      return {
        name: new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
        Ventas: dayTotal
      };
    });
  }, [filteredOrders, dateRange]);

  // Process Data for PieChart (Service Popularity)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        counts[item.category || 'Otros'] = (counts[item.category || 'Otros'] || 0) + (item.price * item.quantity);
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const COLORS = ['#FF2A7A', '#FFB6C1', '#D4AF37', '#9b59b6', '#00D8D6'];

  // Process Data for BarChart (Peak Hours)
  const peakHoursData = useMemo(() => {
    const hours = Array.from({length: 12}, (_, i) => i + 9); // 9 AM to 8 PM
    const data = hours.map(h => ({ name: `${h}:00`, Clientes: 0 }));
    
    filteredOrders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      const slot = data.find(d => d.name === `${hour}:00`);
      if (slot) slot.Clientes += 1;
    });
    return data;
  }, [filteredOrders]);

  const handleExport = () => {
    const exportData = filteredOrders.map(o => ({
      ID: o.id,
      Fecha: new Date(o.created_at).toLocaleString('es-PE'),
      Total: o.total,
      Estado: o.status,
      'Método de Pago': o.payments?.map(p => p.method).join(', ') || 'Efectivo'
    }));
    exportToCSV(`reporte_ventas_${dateRange}dias.csv`, exportData);
  };

  if (loadingClients) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-full border border-white p-2 shadow-sm">
            <KittyIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-plum">Inteligencia de Negocio</h1>
            <p className="text-plum/60 font-bold mt-1">Analiza el rendimiento de tu spa.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white/40 p-2 rounded-3xl border border-white shadow-sm">
          <Filter className="w-5 h-5 text-plum/40 ml-2" />
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white/80 border border-white rounded-2xl px-4 py-2 text-sm font-bold text-plum focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="all">Histórico Completo</option>
          </select>
          <Button onClick={handleExport} variant="secondary" className="py-2 px-4 text-sm">
            <Download className="w-4 h-4" /> Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <h3 className="text-lg font-black text-plum mb-6 flex items-center gap-2 uppercase tracking-wide">
              <TrendingUp className="w-5 h-5 text-primary" /> Evolución de Ventas
            </h3>
            {filteredOrders.length === 0 ? <EmptyState message="Aún no hay datos para este periodo ✨" /> : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D1B2E" strokeOpacity={0.05} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#2D1B2E', fontWeight: 700, fontSize: 12, opacity: 0.6 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#2D1B2E', fontWeight: 700, opacity: 0.6 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Ventas" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <h3 className="text-lg font-black text-plum mb-6 flex items-center gap-2 uppercase tracking-wide">
              <PieChartIcon className="w-5 h-5 text-secondary" /> Ingresos por Categoría
            </h3>
            {categoryData.length === 0 ? <EmptyState message="Aún no hay datos para este periodo ✨" /> : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {categoryData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs font-bold text-plum uppercase tracking-wider">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-black text-plum mb-6 flex items-center gap-2 uppercase tracking-wide">
              <Clock className="w-5 h-5 text-primary" /> Horas Pico de Atención
            </h3>
            {filteredOrders.length === 0 ? <EmptyState message="Aún no hay datos para este periodo ✨" /> : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D1B2E" strokeOpacity={0.05} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#2D1B2E', fontWeight: 700, opacity: 0.6 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#2D1B2E', fontWeight: 700, opacity: 0.6 }} allowDecimals={false} />
                    <Tooltip cursor={{fill: 'rgba(255, 182, 193, 0.2)'}} content={<CustomTooltip />} />
                    <Bar dataKey="Clientes" fill="#FFB6C1" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
