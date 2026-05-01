import { z } from 'zod';

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().optional().default('mock-key'),
  VITE_FIREBASE_PROJECT_ID: z.string().optional().default('mock-project'),
  VITE_FIREBASE_APP_ID: z.string().optional().default('mock-app-id'),
  // Nota: En producción, quitar .optional().default() para forzar la validación estricta
});

// import.meta.env está disponible en Vite
const parsed = envSchema.safeParse(import.meta.env || {});

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:', parsed.error.format());
  throw new Error('Faltan variables de entorno críticas para iniciar la aplicación.');
}

export const env = parsed.data;

// MIGRACIÓN A FIREBASE:
// Cuando se configure Firebase real, quitar los .default() del schema para que 
// la app falle rápido (fail-fast) si no están configuradas las credenciales en Vercel/Netlify.
