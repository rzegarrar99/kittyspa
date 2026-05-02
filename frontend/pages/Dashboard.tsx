import React, { useMemo } from 'react';
import { Card, Spinner, EmptyState } from '../components/UI';
import { DollarSign, CalendarHeart, Users, TrendingUp, Sparkles } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { useOrders, useClients } from '../hooks/useSupabase';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { orders, movements } = useOrders();
  const { clients, loading: loadingClients } = useClients();

  const today = new Date().toISOString().split('T')[0];
  
  const todaySales = useMemo(() => 
    orders.filter(o => o.created_at.startsWith(today)).reduce((sum, o) => sum + o.total, 0)
  , [orders, today]);

  const totalCashFlow = useMemo(() => 
    movements.reduce((sum, m) => m.type === 'Ingreso' ? sum + m.amount : sum - m.amount, 0)
  , [movements]);

  const newClients = useMemo(() => 
    clients.filter(c => c.created_at?.startsWith(today)).length
  , [clients, today]);

  const weeklySalesData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const data = days.map(day => ({ name: day, value: 0 }));
    orders.forEach(o => {
      const orderDate = new Date(o.created_at);
      data[orderDate.getDay()].value += o.total;
    });
    if (orders.length === 0) {
      return [
        { name: 'Lun', value: 1200 }, { name: 'Mar', value: 1900 }, { name: 'Mié', value: 1500 },
        { name: 'Jue', value: 2200 }, { name: 'Vie', value: 3500 }, { name: 'Sáb', value: 4800 }, { name: 'Dom', value: 3100 }
      ];
    }
    return data;
  }, [orders]);

  const topServicesData = useMemo(() => {
    const itemCounts: Record<string, number> = {};
    orders.forEach(o => {
      o.items?.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
      });
    });
    
    const sorted = Object.entries(itemCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
      
    return sorted;
  }, [orders]);

  const kpis = [
    { title: 'Ventas del Día', value: `S/. ${todaySales.toFixed(2)}`, trend: '+15%', icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Órdenes Hoy', value: orders.filter(o => o.created_at.startsWith(today)).length.toString(), trend: '+5%', icon: CalendarHeart, color: 'text-accent', bg: 'bg-accent/10' },
    { title: 'Nuevos Clientes', value: newClients.toString(), trend: '+12%', icon: Users, color: 'text-secondary', bg: 'bg-secondary/20' },
    { title: 'Flujo de Caja', value: `S/. ${totalCashFlow.toFixed(2)}`, trend: '+8%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100' },
  ];

  if (loadingClients) return <Spinner />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="flex items-center gap-4 hover:-translate-y-1 transition-transform">
              <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-plum/50 uppercase tracking-widest">{kpi.title}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-extrabold text-plum">{kpi.value}</h3>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-plum mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Ventas Semanales (S/.)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF2A7A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF2A7A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D1B2E" strokeOpacity={0.05} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#2D1B2E', fontWeight: 700, opacity: 0.6 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#2D1B2E', fontWeight: 700, opacity: 0.6 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px -10px rgba(255, 42, 122, 0.15)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#FF2A7A', fontWeight: '800' }}
                />
                <Area type="monotone" dataKey="value" stroke="#FF2A7A" strokeWidth={4} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-plum mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Top Servicios
          </h3>
          <div className="h-[300px] w-full">
            {topServicesData.length === 0 ? (
              <EmptyState message="Aún no hay ventas." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServicesData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2D1B2E" strokeOpacity={0.05} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#2D1B2E', fontWeight: 700, fontSize: 11, opacity: 0.8 }} width={100} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255, 182, 193, 0.2)'}}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px -10px rgba(255, 42, 122, 0.15)' }}
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                    {topServicesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#D4AF37' : '#FFB6C1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
