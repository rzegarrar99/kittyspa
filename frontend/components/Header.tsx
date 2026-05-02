import React, { useState } from 'react';
import { LogOut, ChevronDown, Clock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { KittyIcon } from './KittyIcon';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const { user, logout, getHighestRole } = useAuthStore();
  const { date, time } = useCurrentTime();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const highestRole = getHighestRole();

  if (!user) return null;

  // Dynamic Greeting
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const firstName = user.name.split(' ')[0] || 'Administradora';

  return (
    <header className="h-24 flex items-center justify-between px-8 sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-white/50 shadow-sm transition-all">
      
      {/* Left Side: Dynamic Greeting with Date & Time (No encapsulation) */}
      <div className="flex items-center gap-4">
        <div className="bg-white/60 backdrop-blur-md rounded-full p-2.5 shadow-sm border border-white/50 flex items-center justify-center">
          <KittyIcon className="w-10 h-10" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-plum tracking-tight leading-none mb-1.5">
            {greetingTime}, {firstName} ✨
          </h1>
          <div className="flex items-center gap-2 text-[13px] font-bold text-plum/50">
            <span className="capitalize">{date}</span>
            <span className="text-plum/30">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FF8EAF]" />
              {time}
            </span>
          </div>
        </div>
      </div>

      {/* Right Side: User Profile & Dropdown (Encapsulated) */}
      <div className="relative">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 bg-white/80 backdrop-blur-sm hover:bg-white p-2 pr-4 rounded-full border border-white shadow-sm transition-all"
        >
          <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className="w-10 h-10 rounded-full border-2 bg-white" 
            style={{ borderColor: highestRole?.color || '#FF2A7A' }} 
          />
          <div className="text-left hidden md:block">
            <p className="font-black text-sm text-plum leading-tight uppercase">{firstName}</p>
            <p className="text-[10px] font-bold text-plum/60 uppercase tracking-widest">{highestRole?.name || 'Staff'}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-plum/40 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl border border-white rounded-3xl shadow-glass overflow-hidden"
            >
              <div className="p-4 border-b border-pink-50 bg-secondary/10">
                <p className="font-black text-plum text-sm truncate">{user.name}</p>
                <p className="text-xs font-bold text-plum/50 truncate">{user.email}</p>
              </div>
              <div className="p-2">
                <button 
                  onClick={() => { setIsMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 rounded-2xl transition-colors uppercase tracking-wide"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
