import React from 'react';
import { Tags } from 'lucide-react';
import { useBrands } from '../hooks/useSupabase';
import { CrudPage } from '../components/shared/CrudPage';
import { Brand } from '../types';
import { Badge } from '../components/UI';

export const Marcas: React.FC = () => {
  const { data, loading, addItem, updateItem, deleteItem } = useBrands();

  return (
    <CrudPage<Brand>
      title="Marcas"
      subtitle="Marcas de productos utilizados en el spa."
      icon={<Tags className="w-4 h-4 text-primary" />}
      data={data}
      loading={loading}
      entityName="Marca"
      searchFields={['name', 'description', 'origin']}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      initialFormState={{ name: '', description: '', origin: '' }}
      columns={[
        { header: 'Marca', accessor: (item) => item.name },
        { header: 'Descripción', accessor: (item) => <span className="text-plum/70 font-semibold">{item.description || '-'}</span> },
        { header: 'Origen', accessor: (item) => <Badge variant="gray">{item.origin || '-'}</Badge> }
      ]}
      renderForm={(formData, setFormData) => (
        <>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Nombre</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. Glow Beauty, L'Oréal..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Descripción</label>
            <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. Línea premium de cuidado facial" />
          </div>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">País de Origen</label>
            <input type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. Francia, Japón, Perú..." />
          </div>
        </>
      )}
    />
  );
};
