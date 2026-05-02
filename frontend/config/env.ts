import { z } from 'zod';

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().optional(),
  VITE_FIREBASE_PROJECT_ID: z.string().optional(),
  VITE_FIREBASE_APP_ID: z.string().optional(),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
});

// En Vite las variables de entorno están en import.meta.env
// Usamos un fallback vacío para evitar que rompa en el sandbox si no existen aún
const parsed = envSchema.safeParse(import.meta.env || {});

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:', parsed.error.format());
  // throw new Error(`Faltan variables de entorno críticas. Revisa tu archivo .env`);
}

export const env = parsed.success ? parsed.data : { MODE: 'development' };

// 🚀 MIGRACIÓN A FIREBASE: 
// Cuando se migre a Firebase, cambiar .optional() por .min(1) en las credenciales 
// y descomentar el throw new Error para aplicar el patrón Fail-Fast.
