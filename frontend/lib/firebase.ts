import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { env } from '../config/env';

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

// MIGRACIÓN A FIREBASE:
// Actualmente los servicios usan localStorage. Cuando se activen las credenciales reales
// en env.ts, los archivos en /services/ importarán `db` de aquí para usar `getDocs`, `addDoc`, etc.
