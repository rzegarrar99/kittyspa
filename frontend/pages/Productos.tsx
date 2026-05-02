import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Badge, Spinner, Button, Modal, EmptyState, Input, Select } from '../components/UI';
import { Package, Search, Plus, Trash2, Edit } from 'lucide-react';
import { useInventory, useCategories, useBrands, useUnits } from '../hooks/useSupabase';
import { useToast } from '../contexts/ToastContext';
import { InventoryItem } from '../types';
import { KittyIcon } from '../components/KittyIcon';
import { inventorySchema, InventoryFormData } from '../schemas/inventory.schema';
import { motion } from 'framer-motion';

export const Productos: React.FC = () => {
  const { data: inventory, loading, addItem, updateItem, deleteItem } = useInventory();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: units } = useUnits();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // 🚀 ENTERPRISE: React Hook Form + Zod
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: { name: '', category: '', brand: '', unit: '', stock: 0, minStock: 5, cost: 0, price: 0 }
  });

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      reset({
        name: item.name,
        category: item.category,
        brand: item.brand || '',
        unit: item.unit || '',
        stock: item.stock,
        minStock: item.minStock,
        cost: item.cost,
        price: item.price
      });
    } else {
      setEditingItem(null);
      reset({ name: '', category: '', brand: '', unit: '', stock: 0, minStock: 5, cost: 0, price: 0 });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: InventoryFormData) => {
    try {
      const payload = {
        ...data,
        lastUpdated: new Date().toISOString()
      };

      if (editingItem) {
        await updateItem(editingItem.id, payload);
        addToast('Producto actualizado 🎀', 'success');
      } else {
        await addItem(payload);
        addToast('Producto agregado al catálogo 🎀', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Ocurrió un error al guardar.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás segura de eliminar este producto del catálogo?')) {
      await deleteItem(id);
      addToast('Producto eliminado.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-full border border-white p-2 shadow-sm">
            <KittyIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-plum">Catálogo de Productos</h1>
            <p className="text-plum/60 font-bold mt-1">Define los productos que vendes en el Spa.</p>
          </div>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-5 h-5" /> Nuevo Producto
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-white/50 flex items-center gap-4 bg-white/40">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-plum/40">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Buscar producto, categoría o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-white/80 border border-white rounded-full focus:ring-2 focus:ring-primary/20 transition-all text-plum font-bold placeholder-plum/40 shadow-sm"
            />
          </div>
        </div>

        {loading ? <Spinner /> : filteredInventory.length === 0 ? <EmptyState message="No hay productos registrados." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-plum/50 text-xs uppercase tracking-widest font-bold border-b border-pink-100">
                  <th className="p-4 pl-6">Producto</th>
                  <th className="p-4">Marca</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Costo (S/.)</th>
                  <th className="p-4">Precio Venta (S/.)</th>
                  <th className="p-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredInventory.map((item, idx) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/40 transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/80 p-2 rounded-xl border border-white shadow-sm">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-plum">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-plum/70 font-semibold">{item.brand || '-'}</td>
                    <td className="p-4"><Badge variant="gray">{item.category}</Badge></td>
                    <td className="p-4 font-semibold text-plum/70">S/. {item.cost.toFixed(2)}</td>
                    <td className="p-4 font-extrabold text-primary">S/. {item.price.toFixed(2)}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-2 text-plum/40 hover:text-primary hover:bg-white rounded-full transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-full transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Editar Producto" : "Nuevo Producto"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Nombre del Producto"
            {...register('name')}
            error={errors.name?.message}
            placeholder="Ej. Crema Facial Ácido Hialurónico"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select 
              label="Categoría"
              {...register('category')}
              error={errors.category?.message}
              options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
            />
            <Select 
              label="Marca"
              {...register('brand')}
              error={errors.brand?.message}
              options={[{ value: '', label: 'Ninguna...' }, ...brands.map(b => ({ value: b.name, label: b.name }))]}
            />
            <Select 
              label="Unidad"
              {...register('unit')}
              error={errors.unit?.message}
              options={[{ value: '', label: 'Ninguna...' }, ...units.map(u => ({ value: u.name, label: u.name }))]}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {!editingItem && (
              <Input 
                label="Stock Inicial"
                type="number"
                min="0"
                {...register('stock')}
                error={errors.stock?.message}
              />
            )}
            <Input 
              label="Stock Mínimo"
              type="number"
              min="0"
              {...register('minStock')}
              error={errors.minStock?.message}
            />
            <Input 
              label="Costo (S/.)"
              type="number"
              min="0"
              step="0.1"
              {...register('cost')}
              error={errors.cost?.message}
            />
            <Input 
              label="Precio Venta (S/.)"
              type="number"
              min="0"
              step="0.1"
              {...register('price')}
              error={errors.price?.message}
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingItem ? "Actualizar" : "Guardar Producto"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
