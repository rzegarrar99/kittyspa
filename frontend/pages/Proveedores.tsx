import React from 'react';
import { Truck, Phone, Mail } from 'lucide-react';
import { useSuppliers } from '../hooks/useSupabase';
import { CrudPage } from '../components/shared/CrudPage';
import { Supplier } from '../types';

export const Proveedores: React.FC = () => {
  const { data, loading, addItem, updateItem, deleteItem } = useSuppliers();

  return (
    <CrudPage<Supplier>
      title="Proveedores"
      subtitle="Directorio de proveedores del spa."
      icon={<Truck className="w-4 h-4 text-primary" />}
      data={data}
      loading={loading}
      entityName="Proveedor"
      searchFields={['name', 'ruc', 'email']}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      initialFormState={{ name: '', ruc: '', phone: '', email: '' }}
      columns={[
        { header: 'Razón Social', accessor: (item) => item.name },
        { header: 'RUC', accessor: (item) => <span className="text-plum/70 font-semibold">{item.ruc}</span> },
        { header: 'Contacto', accessor: (item) => (
          <div className="flex flex-col gap-1 text-sm text-plum/80 font-semibold">
            <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-primary/60" /> {item.phone}</div>
            <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-accent/60" /> {item.email}</div>
          </div>
        )}
      ]}
      renderForm={(formData, setFormData) => (
        <>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Razón Social</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. Distribuidora Belleza SAC" />
          </div>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">RUC</label>
            <input required type="text" maxLength={11} value={formData.ruc} onChange={e => setFormData({...formData, ruc: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. 20555555555" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Teléfono</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. 999888777" />
            </div>
            <div>
              <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Correo</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. ventas@proveedor.com" />
            </div>
          </div>
        </>
      )}
    />
  );
};
