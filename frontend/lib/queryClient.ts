import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de caché por defecto
      gcTime: 1000 * 60 * 30, // 30 minutos antes de limpiar la caché
      retry: 1, // Solo reintentar 1 vez si falla la red
      refetchOnWindowFocus: false, // Evitar refetch innecesario al cambiar de pestaña
      refetchOnMount: false, // Evitar refetch al remontar componentes si la data está fresca
    },
  },
});

// MIGRACIÓN A FIREBASE:
// React Query manejará el estado de carga, error y caché de las llamadas a Firestore.
// Si Firestore tiene soporte offline habilitado, React Query trabajará en conjunto con él.
