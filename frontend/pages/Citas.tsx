import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Spinner, Modal, Badge, Input, Select, EmptyState } from '../components/UI';
import { CalendarHeart, Plus, Clock, User, Sparkles, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useAppointments, useClients, useStaff, useServices } from '../hooks/useSupabase';
import { useToast } from '../contexts/ToastContext';
import { Appointment } from '../types';
import { KittyIcon } from '../components/KittyIcon';
import { appointmentSchema, AppointmentFormData } from '../schemas/appointment.schema';
import { motion } from 'framer-motion';

export const Citas: React.FC = () => {
  const { appointments, loading, addAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const { clients } = useClients();
  const { staff } = useStaff();
  const { services } = useServices();
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { client_id: '', staff_id: '', service_id: '', date: filterDate, time: '10:00', status: 'Pendiente', notes: '' }
  });

  const filteredAppointments = appointments
    .filter(a => a.date === filterDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const openModal = (appt?: Appointment) => {
    if (appt) {
      setEditingAppt(appt);
      reset({
        client_id: appt.client_id,
        staff_id: appt.staff_id,
        service_id: appt.service_id,
        date: appt.date,
        time: appt.time,
        status: appt.status,
        notes: appt.notes || ''
      });
    } else {
      setEditingAppt(null);
      reset({ client_id: '', staff_id: '', service_id: '', date: filterDate, time: '10:00', status: 'Pendiente', notes: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (editingAppt) {
        await updateAppointment(editingAppt.id, data);
        addToast('Cita actualizada 🎀', 'success');
      } else {
        await addAppointment(data);
        addToast('Cita agendada con éxito 🎀', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Error al guardar la cita.', 'error');
    }
  };

  const handleStatusChange = async (id: string, newStatus: Appointment['status']) => {
    await updateAppointment(id, { status: newStatus });
    addToast(`Estado cambiado a ${newStatus}`, 'success');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmada': return <Badge variant="gold">Confirmada</Badge>;
      case 'Completada': return <Badge variant="green">Completada</Badge>;
      case 'Cancelada': return <Badge variant="red">Cancelada</Badge>;
      default: return <Badge variant="gray">Pendiente</Badge>;
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
            <h1 className="text-3xl font-extrabold text-plum">Agenda de Citas</h1>
            <p className="text-plum/60 font-bold mt-1">Gestiona las reservas de tus clientas.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)}
            className="px-4 py-3 bg-white/80 border border-white rounded-full focus:ring-2 focus:ring-primary/20 text-plum font-bold shadow-sm outline-none"
          />
          <Button onClick={() => openModal()}>
            <Plus className="w-5 h-5" /> Nueva Cita
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden min-h-[400px]">
        {loading ? <Spinner /> : filteredAppointments.length === 0 ? (
          <EmptyState message="No hay citas agendadas para esta fecha." />
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppointments.map((appt, idx) => {
              const client = clients.find(c => c.id === appt.client_id);
              const specialist = staff.find(s => s.id === appt.staff_id);
              const service = services.find(s => s.id === appt.service_id);

              return (
                <motion.div 
                  key={appt.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-5 rounded-3xl border-2 shadow-sm transition-all ${appt.status === 'Cancelada' ? 'bg-white/40 border-white/50 opacity-60' : 'bg-white/80 border-white hover:border-primary/30 hover:shadow-md'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-primary font-black text-lg bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
                      <Clock className="w-4 h-4" /> {appt.time}
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-primary shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-plum/50 uppercase tracking-widest leading-none mb-1">Clienta</p>
                        <p className="font-black text-plum text-sm truncate">{client?.name || 'Desconocida'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-plum/50 uppercase tracking-widest leading-none mb-1">Servicio</p>
                        <p className="font-black text-plum text-sm truncate">{service?.name || 'Desconocido'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-plum/5 flex justify-between items-center">
                    <p className="text-xs font-bold text-plum/60 truncate max-w-[120px]">Por: {specialist?.name.split(' ')[0]}</p>
                    <div className="flex gap-1">
                      {appt.status === 'Pendiente' && (
                        <button onClick={() => handleStatusChange(appt.id, 'Confirmada')} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Confirmar">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {appt.status !== 'Cancelada' && appt.status !== 'Completada' && (
                        <button onClick={() => handleStatusChange(appt.id, 'Cancelada')} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openModal(appt)} className="p-1.5 text-plum/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAppt ? "Editar Cita" : "Agendar Cita"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select 
            label="Clienta"
            {...register('client_id')}
            error={errors.client_id?.message}
            options={clients.map(c => ({ value: c.id, label: c.name }))}
          />
          <Select 
            label="Servicio"
            {...register('service_id')}
            error={errors.service_id?.message}
            options={services.map(s => ({ value: s.id, label: `${s.name} (${s.duration} min)` }))}
          />
          <Select 
            label="Especialista"
            {...register('staff_id')}
            error={errors.staff_id?.message}
            options={staff.map(s => ({ value: s.id, label: s.name }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Fecha"
              type="date"
              {...register('date')}
              error={errors.date?.message}
            />
            <Input 
              label="Hora"
              type="time"
              {...register('time')}
              error={errors.time?.message}
            />
          </div>
          {editingAppt && (
            <Select 
              label="Estado"
              {...register('status')}
              options={[
                { value: 'Pendiente', label: 'Pendiente' },
                { value: 'Confirmada', label: 'Confirmada' },
                { value: 'Completada', label: 'Completada' },
                { value: 'Cancelada', label: 'Cancelada' }
              ]}
            />
          )}
          <Input 
            label="Notas (Opcional)"
            {...register('notes')}
            placeholder="Ej. Alergia a ciertos productos..."
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingAppt ? "Actualizar" : "Agendar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
