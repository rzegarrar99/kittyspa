import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Configuración proporcionada para Spa Glow Kitty
const firebaseConfig = {
  apiKey: "AIzaSyAmp6uGsOfoN3psSZ41zYWC4BC99JpTQDw",
  authDomain: "gen-lang-client-0890955515.firebaseapp.com",
  projectId: "gen-lang-client-0890955515",
  storageBucket: "gen-lang-client-0890955515.firebasestorage.app",
  messagingSenderId: "422319529686",
  appId: "1:422319529686:web:99a3e9c1713d24dcb5b377"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Configurar proveedor de Google
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
