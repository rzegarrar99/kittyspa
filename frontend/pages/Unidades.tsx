import React from 'react';
import { Box } from 'lucide-react';
import { useUnits } from '../hooks/useSupabase';
import { CrudPage } from '../components/shared/CrudPage';
import { Unit } from '../types';
import { Badge } from '../components/UI';

export const Unidades: React.FC = () => {
  const { data, loading, addItem, updateItem, deleteItem } = useUnits();

  return (
    <CrudPage<Unit>
      title="Unidades de Medida"
      subtitle="Unidades para el control de inventario."
      icon={<Box className="w-4 h-4 text-primary" />}
      data={data}
      loading={loading}
      entityName="Unidad"
      searchFields={['name', 'abbreviation']}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      initialFormState={{ name: '', abbreviation: '' }}
      columns={[
        { header: 'Unidad', accessor: (item) => item.name },
        { header: 'Abreviatura', accessor: (item) => <Badge variant="pink">{item.abbreviation}</Badge> }
      ]}
      renderForm={(formData, setFormData) => (
        <>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Nombre (Ej. Litros, Gramos)</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. Litros, Gramos, Unidades..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Abreviatura (Ej. ml, gr)</label>
            <input required type="text" value={formData.abbreviation} onChange={e => setFormData({...formData, abbreviation: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. ml, gr, und..." />
          </div>
        </>
      )}
    />
  );
};
