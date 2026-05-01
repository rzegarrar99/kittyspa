import React, { useState } from 'react';
import { Card, Button, Spinner, Modal, Badge, PageHeader, FormInput, Table, Thead, Tbody, Tr, Th, Td } from '../components/UI';
import { UserPlus, Check, Trash2, Edit } from 'lucide-react';
import { useStaff, useRoles } from '../hooks/useSupabase';
import { useToast } from '../contexts/ToastContext';
import { Staff as StaffType, Role } from '../types';

export const Staff: React.FC = () => {
  const { staff, loading, addStaff, updateStaff, deleteStaff } = useStaff();
  const { data: roles = [] } = useRoles();
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);
  
  const [formData, setFormData] = useState<{ name: string; email: string; commission_rate: string; roles: Role[] }>({ 
    name: '', 
    email: '', 
    commission_rate: '',
    roles: []
  });

  const openModal = (member?: StaffType) => {
    if (member) {
      setEditingStaff(member);
      setFormData({
        name: member.name,
        email: member.email,
        commission_rate: (member.commission_rate * 100).toString(),
        roles: member.roles
      });
    } else {
      setEditingStaff(null);
      setFormData({ name: '', email: '', commission_rate: '0', roles: [] });
    }
    setIsModalOpen(true);
  };

  const toggleRole = (role: Role) => {
    const hasRole = formData.roles.find(r => r.id === role.id);
    if (hasRole) {
      setFormData({ ...formData, roles: formData.roles.filter(r => r.id !== role.id) });
    } else {
      setFormData({ ...formData, roles: [...formData.roles, role] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      email: formData.email,
      commission_rate: Number(formData.commission_rate) / 100,
      roles: formData.roles
    };

    if (editingStaff) {
      await updateStaff(editingStaff.id, payload);
      addToast(`Perfil de ${formData.name} actualizado 🎀`, 'success');
    } else {
      await addStaff(payload);
      addToast('Nuevo miembro agregado al equipo 🎀', 'success');
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás segura de eliminar a este miembro del equipo?')) {
      await deleteStaff(id);
      addToast('Miembro eliminado.', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Gestión de Personal" 
        subtitle="El cargo se define automáticamente por el rol de mayor prioridad." 
        action={<Button onClick={() => openModal()}><UserPlus className="w-5 h-5" /> Nuevo Miembro</Button>} 
      />

      <Card className="p-0 overflow-hidden">
        {loading ? <Spinner /> : (
          <Table>
            <Thead>
              <Th className="pl-6">Especialista</Th>
              <Th>Rol Principal</Th>
              <Th>Otros Roles</Th>
              <Th>Comisión Base</Th>
              <Th className="text-right pr-6">Acciones</Th>
            </Thead>
            <Tbody>
              {staff.map((member, idx) => {
                const sortedRoles = [...member.roles].sort((a, b) => b.priority - a.priority);
                const highestRole = sortedRoles[0];
                const otherRoles = sortedRoles.slice(1);
                
                return (
                  <Tr key={member.id} index={idx}>
                    <Td className="pl-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={member.avatarUrl} 
                          alt={member.name} 
                          className="w-12 h-12 rounded-full object-cover border-2 shadow-sm"
                          style={{ borderColor: highestRole?.color || '#FF2A7A' }}
                        />
                        <div>
                          <span className="font-extrabold text-lg" style={{ color: highestRole?.color || '#2D1B2E' }}>
                            {member.name}
                          </span>
                          <p className="text-xs text-plum/60 font-bold">{member.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      {highestRole ? (
                        <span className="text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1 w-max" style={{ backgroundColor: `${highestRole.color}15`, color: highestRole.color, borderColor: `${highestRole.color}30` }}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: highestRole.color }}></div>
                          {highestRole.name}
                        </span>
                      ) : (
                        <span className="text-plum/40 text-sm italic font-bold">Sin rol asignado</span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {otherRoles.map(role => (
                          <span key={role.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: `${role.color}10`, color: role.color, borderColor: `${role.color}30` }}>
                            {role.name}
                          </span>
                        ))}
                        {otherRoles.length === 0 && highestRole && <span className="text-plum/30 text-xs">-</span>}
                      </div>
                    </Td>
                    <Td className="font-bold text-plum/70">
                      {(member.commission_rate * 100).toFixed(0)}%
                    </Td>
                    <Td className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(member)} className="p-2 text-plum/40 hover:text-primary hover:bg-white rounded-full transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(member.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-full transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? "Editar Miembro" : "Nuevo Miembro del Equipo"} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Nombre Completo" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Ana Directora" />
            <FormInput label="Correo Electrónico" required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Ej. ana@spaglowkitty.pe" />
            <FormInput className="md:col-span-2" label="Comisión Base (%)" required type="number" min="0" max="100" value={formData.commission_rate} onChange={e => setFormData({...formData, commission_rate: e.target.value})} placeholder="Ej. 10" />
          </div>

          <div className="border-t border-white/50 pt-4">
            <label className="block text-sm font-extrabold text-plum mb-3 uppercase tracking-wider">Asignar Roles</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map(role => {
                const isSelected = formData.roles.some(r => r.id === role.id);
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
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
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
