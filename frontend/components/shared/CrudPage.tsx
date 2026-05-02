import React, { useState } from 'react';
import { Card, Button, Spinner, Modal, EmptyState } from '../UI';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import { KittyIcon } from '../KittyIcon';
import { AnimatedRow } from './AnimatedRow';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../../contexts/ToastContext';

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface CrudPageProps<T extends { id: string }> {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  data: T[];
  loading: boolean;
  columns: Column<T>[];
  searchFields: (keyof T)[];
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  renderForm: (formData: any, setFormData: (data: any) => void) => React.ReactNode;
  initialFormState: any;
  entityName: string;
}

export function CrudPage<T extends { id: string }>({
  title,
  subtitle,
  icon,
  data,
  loading,
  columns,
  searchFields,
  onAdd,
  onUpdate,
  onDelete,
  renderForm,
  initialFormState,
  entityName
}: CrudPageProps<T>) {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  
  // Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const filteredData = data.filter(item => 
    searchFields.some(field => 
      String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const openModal = (item?: T) => {
    if (item) {
      setEditingItem(item);
      // Extraer solo los campos que existen en initialFormState para no ensuciar el form
      const editData = { ...initialFormState };
      Object.keys(initialFormState).forEach(key => {
        if (key in item) editData[key] = (item as any)[key];
      });
      setFormData(editData);
    } else {
      setEditingItem(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await onUpdate(editingItem.id, formData);
        addToast(`${entityName} actualizada con éxito 🎀`, 'success');
      } else {
        await onAdd(formData);
        addToast(`${entityName} guardada con éxito 🎀`, 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast(`Error al guardar ${entityName.toLowerCase()}`, 'error');
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await onDelete(itemToDelete);
        addToast(`${entityName} eliminada.`, 'success');
      } catch (error) {
        addToast(`Error al eliminar ${entityName.toLowerCase()}`, 'error');
      }
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
            <h1 className="text-3xl font-extrabold text-plum">{title}</h1>
            <p className="text-plum/60 font-bold mt-1">{subtitle}</p>
          </div>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-5 h-5" /> Nueva {entityName}
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
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-white/80 border border-white rounded-full focus:ring-2 focus:ring-primary/20 transition-all text-plum font-bold placeholder-plum/40 shadow-sm"
            />
          </div>
        </div>

        {loading ? <Spinner /> : filteredData.length === 0 ? <EmptyState message={`No hay ${entityName.toLowerCase()}s registradas.`} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-plum/50 text-xs uppercase tracking-widest font-bold border-b border-pink-100">
                  {columns.map((col, idx) => (
                    <th key={idx} className={`p-4 ${col.className || ''}`}>{col.header}</th>
                  ))}
                  <th className="p-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredData.map((item, idx) => (
                  <AnimatedRow key={item.id} index={idx}>
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`p-4 ${col.className || ''}`}>
                        {colIdx === 0 ? (
                          <div className="flex items-center gap-3">
                            <div className="bg-white/80 p-2 rounded-xl border border-white shadow-sm text-primary">
                              {icon}
                            </div>
                            <span className="font-bold text-plum">{col.accessor(item)}</span>
                          </div>
                        ) : (
                          col.accessor(item)
                        )}
                      </td>
                    ))}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-2 text-plum/40 hover:text-primary hover:bg-white rounded-full transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-white rounded-full transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </AnimatedRow>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Editar ${entityName}` : `Nueva ${entityName}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderForm(formData, setFormData)}
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editingItem ? "Actualizar" : "Guardar"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        title="Confirmar Eliminación"
        message={`¿Estás segura de eliminar esta ${entityName.toLowerCase()}? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isDestructive={true}
      />
    </div>
  );
}
