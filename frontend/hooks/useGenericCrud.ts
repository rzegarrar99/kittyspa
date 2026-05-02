import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseService } from '../services/base.service';

// 🚀 MIGRACIÓN A FIREBASE: 
// Este hook NO CAMBIA. React Query es agnóstico a la base de datos.
// Seguirá funcionando perfectamente cuando BaseService se conecte a Firestore.

export function useGenericCrud<T extends { id: string }>(
  queryKey: string, 
  service: BaseService<T>
) {
  const queryClient = useQueryClient();

  // Fetch Data (Caché automático)
  const { data = [], isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn: () => service.getAll(),
  });

  // Create
  const createMutation = useMutation({
    mutationFn: (newItem: Omit<T, 'id'>) => service.create(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<T> }) => service.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  return {
    data,
    loading: isLoading,
    error,
    addItem: createMutation.mutateAsync,
    updateItem: async (id: string, updates: Partial<T>) => updateMutation.mutateAsync({ id, updates }),
    deleteItem: deleteMutation.mutateAsync,
  };
}
