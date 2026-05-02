import React, { Component, ErrorInfo, ReactNode } from 'react';
import { KittyIcon } from '../KittyIcon';
import { Button } from '../UI';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 border border-white shadow-glass max-w-lg text-center">
            <div className="bg-red-50 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm">
              <KittyIcon isSleeping={true} className="w-20 h-20 text-red-400" />
            </div>
            <h1 className="text-3xl font-black text-plum mb-2 uppercase tracking-tight">¡Ups! Algo salió mal 🎀</h1>
            <p className="text-plum/60 font-bold mb-6">
              Nuestra gatita tropezó con un error inesperado. Por favor, recarga la página para continuar.
            </p>
            <div className="bg-white/50 p-4 rounded-2xl border border-white text-left overflow-auto max-h-32 mb-8 shadow-inner">
              <code className="text-xs text-red-500 font-bold">
                {this.state.error?.message || 'Error desconocido'}
              </code>
            </div>
            <Button onClick={() => window.location.reload()} className="w-full py-4 text-lg">
              Recargar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
