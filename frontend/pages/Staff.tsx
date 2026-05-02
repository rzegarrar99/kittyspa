import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Spinner, Modal, Badge, Input } from '../components/UI';
import { UserPlus, Check, Trash2, Edit, KeyRound, Image as ImageIcon } from 'lucide-react';
import { useStaff, useRoles } from '../hooks/useSupabase';
import { useToast } from '../contexts/ToastContext';
import { Staff as StaffType, Role } from '../types';
import { KittyIcon } from '../components/KittyIcon';
import { staffSchema, StaffFormData } from '../schemas/staff.schema';
import { motion } from 'framer-motion';

// Avatares predefinidos para mejorar la UX
const PREDEFINED_AVATARS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Kitty1&backgroundColor=FFB6C1',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Kitty2&backgroundColor=FFB6C1',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Kitty3&backgroundColor=FFB6C1',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Kitty4&backgroundColor=FFB6C1',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Kitty5&backgroundColor=FFB6C1',
];

export const Staff: React.FC = () => {
  const { staff = [], loading, addStaff, updateStaff, deleteStaff } = useStaff();
  const { data: roles = [] } = useRoles();
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  
  // 🚀 ENTERPRISE: React Hook Form + Zod
  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: '', username: '', password: '', email: '', commission_rate: 0, avatarUrl: PREDEFINED_AVATARS[0] }
  });

  const currentAvatar = watch('avatarUrl');

  const openModal = (member?: StaffType) => {
    if (member) {
      setEditingStaff(member);
      setSelectedRoles(member.roles || []);
      reset({
        name: member.name,
        username: member.username || '',
        password: '', // No mostramos la contraseña actual por seguridad
        email: member.email,
        commission_rate: member.commission_rate * 100,
        avatarUrl: member.avatarUrl
      });
    } else {
      setEditingStaff(null);
      setSelectedRoles([]);
      reset({ name: '', username: '', password: '', email: '', commission_rate: 0, avatarUrl: PREDEFINED_AVATARS[0] });
    }
    setIsModalOpen(true);
  };

  const toggleRole = (role: Role) => {
    const hasRole = selectedRoles.find(r => r.id === role.id);
    if (hasRole) {
      setSelectedRoles(selectedRoles.filter(r => r.id !== role.id));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const onSubmit = async (data: StaffFormData) => {
    try {
      if (!editingStaff && !data.password) {
        addToast('La contraseña es obligatoria para nuevos usuarios.', 'error');
        return;
      }

      const payload: Partial<StaffType> = {
        name: data.name,
        username: data.username,
        email: data.email,
        commission_rate: data.commission_rate / 100,
        avatarUrl: data.avatarUrl || PREDEFINED_AVATARS[0],
        roles: selectedRoles
      };

      // Solo actualizamos la contraseña si se escribió una nueva
      if (data.password) {
        payload.password = data.password;
      }

      if (editingStaff) {
        await updateStaff(editingStaff.id, payload);
        addToast(`Perfil de ${data.name} actualizado 🎀`, 'success');
      } else {
        await addStaff(payload as Omit<StaffType, 'id'>);
        addToast('Nuevo miembro agregado al equipo 🎀', 'success');
      }
      
      setIsModalOpen(false);
    } catch (error) {
      addToast('Ocurrió un error al guardar.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás segura de eliminar a este miembro del equipo?')) {
      await deleteStaff(id);
      addToast('Miembro eliminado.', 'success');
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
            <h1 className="text-3xl font-extrabold text-plum">Gestión de Personal</h1>
            <p className="text-plum/60 font-bold mt-1">Crea accesos y asigna roles a tu equipo.</p>
          </div>
        </div>
        <Button onClick={() => openModal()}>
          <UserPlus className="w-5 h-5" />
          Nuevo Miembro
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-plum/50 text-xs uppercase tracking-widest font-bold border-b border-pink-100">
                  <th className="p-4 pl-6">Especialista</th>
                  <th className="p-4">Usuario (Login)</th>
                  <th className="p-4">Rol Principal</th>
                  <th className="p-4">Otros Roles</th>
                  <th className="p-4">Comisión Base</th>
                  <th className="p-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {staff.map((member, idx) => {
                  const sortedRoles = [...(member.roles || [])].sort((a, b) => b.priority - a.priority);
                  const highestRole = sortedRoles[0];
                  const otherRoles = sortedRoles.slice(1);
                  
                  return (
                    <motion.tr 
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="hover:bg-white/40 transition-colors group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={member.avatarUrl} 
                            alt={member.name} 
                            className="w-12 h-12 rounded-full object-cover border-2 shadow-sm bg-white"
                            style={{ borderColor: highestRole?.color || '#FF2A7A' }}
                          />
                          <div>
                            <span className="font-extrabold text-lg" style={{ color: highestRole?.color || '#2D1B2E' }}>
                              {member.name}
                            </span>
                            <p className="text-xs text-plum/60 font-bold">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-plum/80">@{member.username}</td>
                      <td className="p-4">
                        {highestRole ? (
                          <span className="text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1 w-max" style={{ backgroundColor: `${highestRole.color}15`, color: highestRole.color, borderColor: `${highestRole.color}30` }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: highestRole.color }}></div>
                            {highestRole.name}
                          </span>
                        ) : (
                          <span className="text-plum/40 text-sm italic font-bold">Sin rol asignado</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {otherRoles.map(role => (
                            <span key={role.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: `${role.color}10`, color: role.color, borderColor: `${role.color}30` }}>
                              {role.name}
                            </span>
                          ))}
                          {otherRoles.length === 0 && highestRole && <span className="text-plum/30 text-xs">-</span>}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-plum/70">
                        {(member.commission_rate * 100).toFixed(0)}%
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal(member)} className="p-2 text-plum/40 hover:text-primary hover:bg-white rounded-full transition-all">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(member.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-full transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? "Editar Miembro" : "Nuevo Miembro del Equipo"} maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* 🚀 UX MEJORADA: Selector Visual de Avatar (Sin input de texto) */}
          <div className="bg-white/50 p-5 rounded-3xl border border-white shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0 relative">
              <img src={currentAvatar || PREDEFINED_AVATARS[0]} alt="Preview" className="w-24 h-24 rounded-full border-4 border-white shadow-sm bg-white object-cover" />
              <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                <ImageIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-black text-plum-light mb-3 uppercase tracking-widest">Selecciona un Avatar</label>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {PREDEFINED_AVATARS.map((url, idx) => (
                  <img 
                    key={idx} 
                    src={url} 
                    onClick={() => setValue('avatarUrl', url)}
                    className={`w-14 h-14 rounded-full cursor-pointer border-4 transition-all bg-white ${currentAvatar === url ? 'border-primary scale-110 shadow-md' : 'border-white hover:border-primary/50 shadow-sm'}`} 
                  />
                ))}
              </div>
              {/* Input oculto para mantener el valor en el formulario sin ensuciar la UI */}
              <input type="hidden" {...register('avatarUrl')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nombre Completo"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Ej. Ana Directora"
            />
            <Input 
              label="Correo Electrónico"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="Ej. ana@spaglowkitty.pe"
            />
          </div>

          <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-5 h-5 text-primary" />
              <h4 className="font-black text-plum text-sm uppercase tracking-wider">Credenciales de Acceso</h4>
            </div>
            
            {/* 🚀 UX MEJORADA: Alineación Pixel-Perfect de Inputs usando el componente estandarizado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                label="Usuario"
                {...register('username')}
                error={errors.username?.message}
                placeholder="Ej. ana_admin"
              />
              <Input 
                label={editingStaff ? "Contraseña (Opc.)" : "Contraseña"}
                type="password"
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
              />
              <Input 
                label="Comisión Base (%)"
                type="number"
                min="0"
                max="100"
                {...register('commission_rate')}
                error={errors.commission_rate?.message}
                placeholder="Ej. 10"
              />
            </div>
          </div>

          <div className="border-t border-white/50 pt-4">
            <label className="block text-sm font-extrabold text-plum mb-3 uppercase tracking-wider">Asignar Roles</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(roles || []).map(role => {
                const isSelected = selectedRoles.some(r => r.id === role.id);
                return (
                  <div 
                    key={role.id} 
                    onClick={() => toggleRole(role)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected ? 'bg-white/80 shadow-sm' : 'hover:bg-white/50 border-transparent'
                    }`}
                    style={{ borderColor: isSelected ? role.color : 'transparent' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                      <span className="font-bold text-sm" style={{ color: role.color }}>{role.name}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? 'text-white' : 'border-plum/20'
                    }`} style={{ backgroundColor: isSelected ? role.color : 'transparent', borderColor: isSelected ? role.color : '' }}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/50">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingStaff ? "Actualizar Perfil" : "Guardar Miembro"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
