import React from 'react';
import { BookOpen } from 'lucide-react';
import { useCategories } from '../hooks/useSupabase';
import { CrudPage } from '../components/shared/CrudPage';
import { SimpleDictionary } from '../types';

export const Categorias: React.FC = () => {
  const { data, loading, addItem, updateItem, deleteItem } = useCategories();

  return (
    <CrudPage<SimpleDictionary>
      title="Categorías"
      subtitle="Clasificación de productos y servicios."
      icon={<BookOpen className="w-4 h-4 text-primary" />}
      data={data}
      loading={loading}
      entityName="Categoría"
      searchFields={['name', 'description']}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      initialFormState={{ name: '', description: '' }}
      columns={[
        { header: 'Nombre', accessor: (item) => item.name },
        { header: 'Descripción', accessor: (item) => <span className="text-plum/70 font-semibold">{item.description || '-'}</span> }
      ]}
      renderForm={(formData, setFormData) => (
        <>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Nombre</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. Faciales, Masajes, Cremas..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Descripción</label>
            <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. Tratamientos para el cuidado del rostro" />
          </div>
        </>
      )}
    />
  );
};
