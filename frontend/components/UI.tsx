import React, { forwardRef } from 'react';
import { X } from 'lucide-react';
import { KittyIcon } from './KittyIcon';
import { motion } from 'framer-motion';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/60 backdrop-blur-2xl rounded-4xl p-6 border border-white/80 shadow-glass ${className}`}>
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-full font-extrabold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-[#FF5E99] text-white shadow-glow hover:shadow-lg focus:ring-primary/30 shadow-inner-white",
    secondary: "bg-white text-plum border border-white shadow-sm hover:bg-secondary/10 hover:border-secondary/30 focus:ring-secondary/30",
    outline: "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white focus:ring-primary/30",
    ghost: "bg-transparent text-plum-light hover:text-primary hover:bg-white/50 focus:ring-plum/10",
    danger: "bg-red-500 text-white shadow-sm hover:bg-red-600 focus:ring-red-500/30 shadow-inner-white"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'gold' | 'pink' | 'gray' | 'red' | 'green' }> = ({ children, variant = 'pink' }) => {
  const variants = {
    gold: "bg-accent/15 text-yellow-800 border border-accent/40",
    pink: "bg-primary/10 text-primary border border-primary/20",
    gray: "bg-gray-100 text-gray-700 border border-gray-200",
    red: "bg-red-50 text-red-600 border border-red-200",
    green: "bg-green-50 text-green-700 border border-green-200"
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${variants[variant]}`}>
      {children}
    </span>
  );
};

// --- COMPONENTES DE FORMULARIO ENTERPRISE ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-[11px] font-black text-plum-light mb-1.5 ml-1 uppercase tracking-widest">{label}</label>}
    <input 
      ref={ref} 
      className={`w-full px-4 py-3.5 bg-white/70 hover:bg-white/90 border ${error ? 'border-red-400 focus:ring-red-400/20' : 'border-white/80 focus:border-primary/50 focus:ring-primary/10'} rounded-2xl focus:ring-4 focus:bg-white transition-all duration-300 text-plum font-bold placeholder-plum/30 shadow-sm outline-none ${className}`} 
      {...props} 
    />
    {error && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-bold uppercase tracking-wide">{error}</p>}
  </div>
));
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-[11px] font-black text-plum-light mb-1.5 ml-1 uppercase tracking-widest">{label}</label>}
    <select 
      ref={ref} 
      className={`w-full px-4 py-3.5 bg-white/70 hover:bg-white/90 border ${error ? 'border-red-400 focus:ring-red-400/20' : 'border-white/80 focus:border-primary/50 focus:ring-primary/10'} rounded-2xl focus:ring-4 focus:bg-white transition-all duration-300 text-plum font-bold shadow-sm outline-none appearance-none cursor-pointer ${className}`} 
      {...props}
    >
      <option value="" disabled>Seleccionar...</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-bold uppercase tracking-wide">{error}</p>}
  </div>
));
Select.displayName = 'Select';

export const ProgressBar: React.FC<{ value: number; max: number; colorClass?: string }> = ({ value, max, colorClass = 'bg-primary' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-plum/5 rounded-full h-2 border border-white/50 shadow-inner overflow-hidden mt-1.5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${colorClass} shadow-inner-white`} 
      />
    </div>
  );
};

// ---------------------------------------------------

export const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-12">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-10 h-10 border-4 border-secondary/30 border-t-primary rounded-full"
    />
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string }> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum/30 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`bg-white/80 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl w-full ${maxWidth} overflow-hidden border border-white max-h-[95vh] flex flex-col`}
      >
        <div className="px-8 py-6 border-b border-white/60 flex justify-between items-center bg-white/40 shrink-0">
          <h2 className="text-xl font-black text-plum flex items-center gap-3 tracking-tight">
            <KittyIcon className="w-8 h-8 drop-shadow-sm" /> {title}
          </h2>
          <button onClick={onClose} className="p-2 text-plum-light hover:text-primary hover:bg-white rounded-full transition-all active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const EmptyState: React.FC<{ message: string; action?: React.ReactNode }> = ({ message, action }) => (
  <div className="flex flex-col items-center justify-center p-16 text-center bg-white/40 border border-white/60 rounded-4xl shadow-sm">
    <KittyIcon isSleeping={true} className="w-28 h-28 mb-6 opacity-60 drop-shadow-sm" />
    <p className="text-plum-light font-bold text-lg mb-6">{message}</p>
    {action && <div>{action}</div>}
  </div>
);
