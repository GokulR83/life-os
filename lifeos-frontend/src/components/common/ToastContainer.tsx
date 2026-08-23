import React, { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastItem } from '../../types/toast';

const ToastMessageItem: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />,
    info: <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100',
    error: 'border-rose-500/30 bg-rose-950/80 text-rose-100',
    info: 'border-cyan-500/30 bg-cyan-950/80 text-cyan-100',
    warning: 'border-amber-500/30 bg-amber-950/80 text-amber-100',
  };

  return (
    <div
      className={`p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl flex items-start justify-between space-x-3 transition-all duration-300 transform translate-y-0 animate-slide-in max-w-md w-full ${
        borders[toast.type] || borders.info
      }`}
    >
      <div className="flex items-start space-x-3 min-w-0">
        {icons[toast.type]}
        <div className="min-w-0">
          {toast.title && <h4 className="text-xs font-black uppercase tracking-wider mb-0.5">{toast.title}</h4>}
          <p className="text-xs font-semibold leading-relaxed break-words">{toast.message}</p>
        </div>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-3 pointer-events-auto">
      {toasts.map((t) => (
        <ToastMessageItem key={t.id} toast={t} onDismiss={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
