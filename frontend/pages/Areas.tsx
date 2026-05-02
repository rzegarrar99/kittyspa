import React from 'react';
import { MapPin } from 'lucide-react';
import { useAreas } from '../hooks/useSupabase';
import { CrudPage } from '../components/shared/CrudPage';
import { Area } from '../types';
import { Badge } from '../components/UI';

export const Areas: React.FC = () => {
  const { data, loading, addItem, updateItem, deleteItem } = useAreas();

  return (
    <CrudPage<Area>
      title="Áreas del Spa"
      subtitle="Salas y espacios de atención."
      icon={<MapPin className="w-4 h-4 text-primary" />}
      data={data}
      loading={loading}
      entityName="Área"
      searchFields={['name', 'status']}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      initialFormState={{ name: '', capacity: 1, status: 'Disponible' }}
      columns={[
        { header: 'Nombre del Área', accessor: (item) => item.name },
        { header: 'Capacidad', accessor: (item) => <span className="text-plum/70 font-semibold">{item.capacity} personas</span> },
        { header: 'Estado', accessor: (item) => <Badge variant={item.status === 'Disponible' ? 'pink' : item.status === 'Ocupado' ? 'red' : 'gray'}>{item.status}</Badge> }
      ]}
      renderForm={(formData, setFormData) => (
        <>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Nombre</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. Sala VIP 1, Cabina de Masajes..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Capacidad (Personas)</label>
            <input required type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. 1" />
          </div>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Estado Inicial</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold shadow-sm">
              <option value="Disponible">Disponible</option>
              <option value="Ocupado">Ocupado</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>
        </>
      )}
    />
  );
};
