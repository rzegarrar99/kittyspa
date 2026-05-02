import React from 'react';
import { Modal, Button } from '../UI';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isDestructive = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="text-center space-y-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm ${isDestructive ? 'bg-red-100 text-red-500' : 'bg-accent/20 text-accent'}`}>
          <AlertTriangle className="w-10 h-10" />
        </div>
        <p className="text-plum/70 font-bold text-lg">{message}</p>
        <div className="flex justify-center gap-4 pt-4">
          <Button variant="ghost" onClick={onCancel}>{cancelText}</Button>
          <Button 
            onClick={() => { onConfirm(); onCancel(); }} 
            className={isDestructive ? 'bg-gradient-to-r from-red-500 to-red-400 shadow-glow' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
