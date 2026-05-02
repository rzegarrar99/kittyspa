import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Badge, Spinner, Modal, EmptyState } from '../components/UI';
import { Plus, Sparkles, Clock, Trash2, Edit, Search } from 'lucide-react';
import { useServices, useCategories } from '../hooks/useSupabase';
import { useToast } from '../contexts/ToastContext';
import { KittyIcon } from '../components/KittyIcon';
import { Service } from '../types';
import { serviceSchema, ServiceFormData } from '../schemas/service.schema';
import { motion } from 'framer-motion';

export const Servicios: React.FC = () => {
  const { services, loading, addService, updateService, deleteService } = useServices();
  const { data: categories } = useCategories();
  const { addToast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // 🚀 ENTERPRISE: React Hook Form + Zod
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: '', category: '', price: 0, duration: 60 }
  });

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      reset({
        name: service.name,
        category: service.category,
        price: service.price,
        duration: service.duration
      });
    } else {
      setEditingService(null);
      reset({ name: '', category: '', price: 0, duration: 60 });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (editingService) {
        await updateService(editingService.id, data);
        addToast('¡Servicio actualizado con éxito! ✨', 'success');
      } else {
        await addService(data);
        addToast('¡Servicio agregado al catálogo! ✨', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Ocurrió un error al guardar.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás segura de eliminar este servicio?')) {
      await deleteService(id);
      addToast('Servicio eliminado.', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-full border border-white p-2 shadow-sm">
            <KittyIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-plum">Catálogo de Servicios</h1>
            <p className="text-plum/60 font-bold mt-1">Administra los tratamientos del spa.</p>
          </div>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-5 h-5" />
          Nuevo Servicio
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
              placeholder="Buscar servicio o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-white/80 border border-white rounded-full focus:ring-2 focus:ring-primary/20 transition-all text-plum font-bold placeholder-plum/40 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : filteredServices.length === 0 ? (
          <EmptyState message="No se encontraron servicios." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-plum/50 text-xs uppercase tracking-widest font-bold border-b border-pink-100">
                  <th className="p-4 pl-6">Servicio</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Duración</th>
                  <th className="p-4">Precio (S/.)</th>
                  <th className="p-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredServices.map((service, idx) => (
                  <motion.tr 
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/40 transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/80 p-2 rounded-xl border border-white shadow-sm">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-plum">{service.name}</span>
                      </div>
                    </td>
                    <td className="p-4"><Badge variant="pink">{service.category}</Badge></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-plum/70 font-semibold">
                        <Clock className="w-4 h-4" /> {service.duration} min
                      </div>
                    </td>
                    <td className="p-4 font-extrabold text-primary text-lg">
                      S/. {service.price.toFixed(2)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(service)} className="p-2 text-plum/40 hover:text-primary hover:bg-white rounded-full transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(service.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-full transition-all">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? "Editar Servicio" : "Crear Nuevo Servicio"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Nombre del Servicio</label>
            <input {...register('name')} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. Limpieza Facial Profunda" />
            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Categoría</label>
            <select {...register('category')} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold shadow-sm">
              <option value="">Seleccionar Categoría...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.category.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Precio (S/.)</label>
              <input {...register('price')} type="number" min="0" step="0.1" className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="0.00" />
              {errors.price && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Duración (min)</label>
              <input {...register('duration')} type="number" min="1" className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold placeholder-plum/40 shadow-sm" placeholder="Ej. 60" />
              {errors.duration && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.duration.message}</p>}
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingService ? "Actualizar" : "Guardar Servicio"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
