import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Input, Select } from '../components/UI';
import { Save, Store, ReceiptText } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { settingsSchema, SettingsFormData } from '../schemas/system.schema';
import { motion } from 'framer-motion';

export const Configuracion: React.FC = () => {
  const { addToast } = useToast();
  const { settings, updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);

  // 🚀 ENTERPRISE: React Hook Form + Zod
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      spaName: '',
      ruc: '',
      address: '',
      phone: '',
      taxRate: 18,
      currency: 'PEN (S/.)'
    }
  });

  // Cargar datos iniciales del contexto
  useEffect(() => {
    reset({
      spaName: settings.spaName,
      ruc: settings.ruc,
      address: settings.address,
      phone: settings.phone,
      taxRate: settings.taxRate,
      currency: settings.currency
    });
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormData) => {
    setIsSaving(true);
    
    // Simulamos latencia de red
    setTimeout(() => {
      updateSettings(data);
      setIsSaving(false);
      addToast('Configuración guardada exitosamente 🎀', 'success');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-plum">Configuración del Sistema</h1>
        <p className="text-plum/60 font-bold mt-1">Ajusta los parámetros generales de tu negocio.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <h3 className="text-lg font-bold text-plum mb-6 flex items-center gap-2 border-b border-white/50 pb-4 uppercase tracking-wide">
              <Store className="w-5 h-5 text-primary" /> Datos del Negocio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Nombre Comercial"
                {...register('spaName')}
                error={errors.spaName?.message}
              />
              <Input 
                label="RUC"
                maxLength={11}
                {...register('ruc')}
                error={errors.ruc?.message}
              />
              <div className="md:col-span-2">
                <Input 
                  label="Dirección Principal"
                  {...register('address')}
                  error={errors.address?.message}
                />
              </div>
              <Input 
                label="Teléfono de Contacto"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <h3 className="text-lg font-bold text-plum mb-6 flex items-center gap-2 border-b border-white/50 pb-4 uppercase tracking-wide">
              <ReceiptText className="w-5 h-5 text-accent" /> Facturación y Moneda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Moneda Principal"
                {...register('currency')}
                error={errors.currency?.message}
                options={[
                  { value: 'PEN (S/.)', label: 'Soles (PEN)' },
                  { value: 'USD ($)', label: 'Dólares (USD)' }
                ]}
              />
              <Input 
                label="Impuesto (IGV %)"
                type="number"
                min="0"
                max="100"
                {...register('taxRate')}
                error={errors.taxRate?.message}
              />
            </div>
          </Card>
        </motion.div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="px-8 py-3 text-lg">
            {isSaving ? 'Guardando...' : <><Save className="w-5 h-5" /> Guardar Configuración</>}
          </Button>
        </div>
      </form>
    </div>
  );
};
