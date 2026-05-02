import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Spinner, Modal, EmptyState, Input } from '../components/UI';
import { Shield, Plus, Trash2, Edit, Check } from 'lucide-react';
import { useRoles } from '../hooks/useSupabase';
import { useToast } from '../contexts/ToastContext';
import { KittyIcon } from '../components/KittyIcon';
import { Role } from '../types';
import { AVAILABLE_PERMISSIONS } from '../constants';
import { roleSchema, RoleFormData } from '../schemas/staff.schema';
import { motion } from 'framer-motion';

export const Roles: React.FC = () => {
  const { data: roles = [], loading, addItem, updateItem, deleteItem } = useRoles();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  // 🚀 ENTERPRISE: React Hook Form + Zod
  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: '', color: '#FF2A7A' }
  });

  const currentColor = watch('color');

  // Agrupar permisos para la UI
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, typeof AVAILABLE_PERMISSIONS> = {};
    AVAILABLE_PERMISSIONS.forEach(p => {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    });
    return groups;
  }, []);

  const openModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      reset({ name: role.name, color: role.color });
      setSelectedPerms(role.permissions || []);
    } else {
      setEditingRole(null);
      reset({ name: '', color: '#FF2A7A' });
      setSelectedPerms([]);
    }
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    if (permId === '*') {
      setSelectedPerms(selectedPerms.includes('*') ? [] : ['*']);
      return;
    }
    
    if (selectedPerms.includes('*')) return; // Si es admin total, no hace nada

    if (selectedPerms.includes(permId)) {
      setSelectedPerms(selectedPerms.filter(id => id !== permId));
    } else {
      setSelectedPerms([...selectedPerms, permId]);
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    try {
      // Cálculo automático de prioridad: Admin = 1000, Otros = cantidad de permisos * 10
      const calculatedPriority = selectedPerms.includes('*') ? 1000 : selectedPerms.length * 10;

      const payload = {
        name: data.name,
        color: data.color,
        priority: calculatedPriority,
        permissions: selectedPerms
      };

      if (editingRole) {
        await updateItem(editingRole.id, payload);
        addToast('Rol actualizado con éxito 🎀', 'success');
      } else {
        await addItem(payload);
        addToast('Rol creado con éxito 🎀', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Ocurrió un error al guardar el rol.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás segura de eliminar este rol? Los usuarios con este rol perderán sus permisos.')) {
      await deleteItem(id);
      addToast('Rol eliminado.', 'success');
    }
  };

  const isAdmin = selectedPerms.includes('*');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-full border border-white p-2 shadow-sm">
            <KittyIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-plum">Gestión de Roles</h1>
            <p className="text-plum/60 font-bold mt-1">La prioridad se calcula automáticamente según los permisos 🎀</p>
          </div>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-5 h-5" /> Nuevo Rol
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? <Spinner /> : roles.length === 0 ? <EmptyState message="No hay roles registrados." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-plum/50 text-xs uppercase tracking-widest font-bold border-b border-pink-100">
                  <th className="p-4 pl-6">Rol</th>
                  <th className="p-4">Prioridad (Auto)</th>
                  <th className="p-4">Permisos</th>
                  <th className="p-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {[...roles].sort((a, b) => b.priority - a.priority).map((role, idx) => (
                  <motion.tr key={role.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="hover:bg-white/40 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shadow-sm border border-white" style={{ backgroundColor: role.color }}></div>
                        <span className="font-extrabold text-plum uppercase tracking-wide" style={{ color: role.color }}>{role.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-plum/70 font-bold">{role.priority} pts</td>
                    <td className="p-4">
                      {(role.permissions || []).includes('*') ? (
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-accent/20 text-yellow-700 border border-accent/30">Administrador Total</span>
                      ) : (
                        <span className="text-xs font-bold text-plum/60">{(role.permissions || []).length} permisos asignados</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(role)} className="p-2 text-plum/40 hover:text-primary hover:bg-white rounded-full transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(role.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-full transition-all">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? "Editar Rol" : "Nuevo Rol"} maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nombre del Rol"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Ej. Cajera Fin de Semana"
            />
            <div>
              <label className="block text-xs font-bold text-plum/60 mb-2 ml-1 uppercase tracking-wider">Color del Rol</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  {...register('color')}
                  className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white shadow-sm" 
                />
                <span className="font-bold text-plum/60">{currentColor?.toUpperCase()}</span>
              </div>
              {errors.color && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-wide">{errors.color.message}</p>}
            </div>
          </div>

          <div className="border-t border-white/50 pt-4">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-extrabold text-plum uppercase tracking-wider">Permisos del Sistema</label>
              <label className="flex items-center gap-2 cursor-pointer bg-accent/10 px-4 py-2 rounded-full border border-accent/30 hover:bg-accent/20 transition-colors">
                <input type="checkbox" checked={isAdmin} onChange={() => togglePermission('*')} className="rounded text-accent focus:ring-accent/20 w-4 h-4" />
                <span className="text-xs font-black text-yellow-700 uppercase">Administrador Total (*)</span>
              </label>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${isAdmin ? 'opacity-50 pointer-events-none' : ''}`}>
              {Object.entries(groupedPermissions).map(([group, perms]) => (
                <div key={group} className="bg-white/50 p-4 rounded-2xl border border-white shadow-sm">
                  <h4 className="font-black text-primary mb-3 uppercase text-[10px] tracking-widest">{group}</h4>
                  <div className="space-y-2">
                    {perms.map(p => (
                      <label key={p.id} className="flex items-center gap-3 cursor-pointer group/label">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedPerms.includes(p.id) ? 'bg-primary border-primary text-white' : 'bg-white border-plum/20 group-hover/label:border-primary/50'}`}>
                          {selectedPerms.includes(p.id) && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-sm font-bold text-plum/80 group-hover/label:text-plum transition-colors">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/50">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingRole ? "Actualizar Rol" : "Crear Rol"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
