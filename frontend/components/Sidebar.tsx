import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Tags, Box, MapPin, Truck, Sparkles, 
  Package, Archive, Users, MonitorSmartphone, ClipboardList, 
  Receipt, Wallet, ArrowRightLeft, UserCircle, Percent, BarChart3, 
  Settings, Shield, CalendarHeart
} from 'lucide-react';
import { KittyIcon } from './KittyIcon';
import { useAuthStore } from '../stores/authStore';
import { useSettings } from '../contexts/SettingsContext';

export const Sidebar: React.FC = () => {
  const { hasPermission } = useAuthStore();
  const { settings } = useSettings();

  const navGroups = [
    {
      title: 'Principal',
      items: [{ name: 'Dashboard', path: '/', icon: LayoutDashboard, permission: 'dashboard.view' }]
    },
    {
      title: 'Ventas & Atención',
      items: [
        { name: 'Agenda / Citas', path: '/citas', icon: CalendarHeart, permission: 'clients.view' }, // NUEVO MÓDULO
        { name: 'Punto de Venta', path: '/pos', icon: MonitorSmartphone, permission: 'pos.use' },
        { name: 'Órdenes', path: '/ordenes', icon: ClipboardList, permission: 'pos.use' },
        { name: 'Clientes', path: '/clientes', icon: Users, permission: 'clients.view' },
      ]
    },
    {
      title: 'Catálogo',
      items: [
        { name: 'Categorías', path: '/categorias', icon: BookOpen, permission: 'catalog.view' },
        { name: 'Marcas', path: '/marcas', icon: Tags, permission: 'catalog.view' },
        { name: 'Unidades', path: '/unidades', icon: Box, permission: 'catalog.view' },
        { name: 'Productos', path: '/productos', icon: Package, permission: 'catalog.view' },
      ]
    },
    {
      title: 'Operaciones',
      items: [
        { name: 'Áreas', path: '/areas', icon: MapPin, permission: 'operations.view' },
        { name: 'Proveedores', path: '/proveedores', icon: Truck, permission: 'inventory.view' },
        { name: 'Servicios', path: '/servicios', icon: Sparkles, permission: 'services.view' },
        { name: 'Almacén', path: '/almacen', icon: Archive, permission: 'inventory.view' },
      ]
    },
    {
      title: 'Finanzas',
      items: [
        { name: 'Gastos', path: '/gastos', icon: Receipt, permission: 'finances.view' },
        { name: 'Cajas', path: '/cajas', icon: Wallet, permission: 'finances.view' },
        { name: 'Movimientos', path: '/movimientos', icon: ArrowRightLeft, permission: 'finances.view' },
      ]
    },
    {
      title: 'Personal',
      items: [
        { name: 'Staff', path: '/staff', icon: UserCircle, permission: 'staff.manage' },
        { name: 'Comisiones', path: '/comisiones', icon: Percent, permission: 'reports.view' },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { name: 'Reportes', path: '/reportes', icon: BarChart3, permission: 'reports.view' },
        { name: 'Roles', path: '/roles', icon: Shield, permission: 'system.admin' },
        { name: 'Configuración', path: '/configuracion', icon: Settings, permission: 'system.admin' },
      ]
    }
  ];

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasPermission(item.permission))
  })).filter(group => group.items.length > 0);

  const nameParts = settings.spaName.split(' ');
  const firstPart = nameParts.slice(0, -1).join(' ');
  const lastPart = nameParts[nameParts.length - 1];

  return (
    <aside className="w-[260px] h-[calc(100vh-2rem)] bg-white/60 backdrop-blur-2xl border border-white/80 rounded-4xl flex flex-col shadow-glass z-10 fixed left-4 top-4 overflow-hidden">
      <div className="p-6 flex items-center gap-3 bg-white/40 border-b border-white/60">
        <div className="shrink-0 bg-white rounded-full shadow-sm p-1.5 border border-white">
          <KittyIcon className="w-9 h-9" />
        </div>
        <h1 className="font-black text-xl text-plum leading-tight truncate tracking-tight">
          {firstPart}<br/><span className="text-primary">{lastPart}</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {filteredGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="text-[10px] font-black text-plum-light/50 uppercase tracking-widest mb-3 px-4">
              {group.title}
            </h3>
            <ul className="space-y-1.5">
              {group.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm ${
                        isActive
                          ? 'bg-white text-primary shadow-sm border border-white/80 translate-x-1'
                          : 'text-plum-light hover:bg-white/50 hover:text-primary border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-plum-light/70'}`} />
                        {item.name}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};
