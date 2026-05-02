import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Badge, Spinner, Modal } from '../components/UI';
import { Search, Plus, Trash2, Phone, Mail, Star, Edit } from 'lucide-react';
import { useClients, useOrders } from '../hooks/useSupabase';
import { useToast } from '../contexts/ToastContext';
import { Client } from '../types';
import { KittyIcon } from '../components/KittyIcon';
import { clientSchema, ClientFormData } from '../schemas/client.schema';
import { motion } from 'framer-motion';

export const Clientes: React.FC = () => {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const { orders } = useOrders();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // 🚀 ENTERPRISE: React Hook Form + Zod
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', dni: '', phone: '', email: '', status: 'Activo' }
  });

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.dni.includes(searchTerm)
  );

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      reset({
        name: client.name,
        dni: client.dni,
        phone: client.phone,
        email: client.email || '',
        status: client.status
      });
    } else {
      setEditingClient(null);
      reset({ name: '', dni: '', phone: '', email: '', status: 'Activo' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, data);
        addToast('¡Clienta actualizada con éxito! 🎀', 'success');
      } else {
        await addClient(data);
        addToast('¡Clienta guardada con éxito! 🎀', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Ocurrió un error al guardar.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás segura de eliminar a esta clienta?')) {
      await deleteClient(id);
      addToast('Clienta eliminada.', 'success');
    }
  };

  const getClientCRMData = (clientId: string, defaultLastVisit: string) => {
    const clientOrders = orders.filter(o => o.client_id === clientId);
    const totalSpent = clientOrders.reduce((sum, o) => sum + o.total, 0);
    const isVip = totalSpent >= 500;
    
    let lastVisit = defaultLastVisit;
    if (clientOrders.length > 0) {
      clientOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      lastVisit = clientOrders[0].created_at;
    }

    return { isVip, lastVisit, totalSpent };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-full border border-white p-2 shadow-sm">
            <KittyIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-plum">Directorio de Clientes</h1>
            <p className="text-plum/60 font-bold mt-1">CRM Inteligente: El estado VIP se calcula automáticamente.</p>
          </div>
        </div>
        <Button onClick={() => openModal()} className="shrink-0">
          <Plus className="w-5 h-5" />
          Nueva Clienta
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
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-white/80 border border-white rounded-full focus:ring-2 focus:ring-primary/20 transition-all text-plum font-bold placeholder-plum/40 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-plum/50 text-xs uppercase tracking-widest font-bold border-b border-pink-100">
                  <th className="p-4 pl-6">Clienta</th>
                  <th className="p-4">DNI</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Última Visita</th>
                  <th className="p-4">Total Gastado</th>
                  <th className="p-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredClients.map((client) => {
                  const crmData = getClientCRMData(client.id, client.lastVisit);
                  
                  return (
                    <tr key={client.id} className="hover:bg-white/40 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={client.avatarUrl} 
                            alt={client.name} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          <span className="font-bold text-plum">{client.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-plum/80">{client.dni}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-sm text-plum/80 font-semibold">
                          <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-primary/60" /> {client.phone}</div>
                          {client.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-accent/60" /> {client.email}</div>}
                        </div>
                      </td>
                      <td className="p-4">
                        {crmData.isVip ? (
                          <Badge variant="gold"><span className="flex items-center gap-1"><Star className="w-3 h-3 fill-accent" /> VIP</span></Badge>
                        ) : (
                          <Badge variant="pink">Activo</Badge>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-plum/70">
                        {new Date(crmData.lastVisit).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4 font-extrabold text-primary">
                        S/. {crmData.totalSpent.toFixed(2)}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal(client)} className="p-2 text-plum/40 hover:text-primary hover:bg-white rounded-full transition-all">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(client.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-full transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-plum/50 font-bold">
                      No se encontraron clientas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? "Editar Clienta" : "Nueva Clienta"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Nombre Completo</label>
            <input {...register('name')} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold shadow-sm" placeholder="Ej. Valeria Rojas" />
            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">DNI</label>
              <input {...register('dni')} maxLength={8} className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold shadow-sm" placeholder="8 dígitos" />
              {errors.dni && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.dni.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Teléfono</label>
              <input {...register('phone')} type="tel" className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold shadow-sm" placeholder="+51..." />
              {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.phone.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-1 ml-1 uppercase tracking-wider">Correo Electrónico (Opcional)</label>
            <input {...register('email')} type="email" className="w-full px-4 py-3 bg-white/80 border border-white rounded-2xl focus:ring-2 focus:ring-primary/20 text-plum font-bold shadow-sm" placeholder="correo@ejemplo.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-bold">{errors.email.message}</p>}
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingClient ? "Actualizar" : "Guardar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
