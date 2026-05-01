import React, { useState } from 'react';
import { KittyIcon } from '../components/KittyIcon';
import { Button } from '../components/UI';
import { Lock, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);
    
    if (success) {
      addToast('¡Bienvenida al sistema! ✨', 'success');
    } else {
      addToast('Credenciales incorrectas. Intenta con usuario "admin" y contraseña "123"', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl"></div>
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-10 rounded-[3rem] bg-white/60 backdrop-blur-2xl shadow-glass border border-white"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="mb-4 bg-white/80 rounded-full p-4 shadow-sm border border-white">
            <KittyIcon className="w-20 h-20" />
          </div>
          <h1 className="text-3xl font-extrabold text-plum text-center tracking-tight">
            Spa Glow <span className="text-primary">Kitty</span>
          </h1>
          <p className="text-plum/60 font-bold mt-2 text-sm tracking-wide uppercase">Acceso Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-plum/60 mb-2 ml-2 uppercase tracking-wider">Usuario</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-primary/50">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-12 pr-4 py-3.5 bg-white/80 border border-white rounded-full focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-plum font-bold placeholder-plum/30 shadow-sm"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-plum/60 mb-2 ml-2 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-primary/50">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-3.5 bg-white/80 border border-white rounded-full focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-plum font-bold placeholder-plum/30 shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full py-4 text-lg mt-8 shadow-glow">
            {isLoading ? 'Verificando...' : 'Ingresar al Sistema'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
