import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);

  const toast = useCallback((message, type = 'success') => {
    const id = nextId++;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[92vw] max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-fade-up ${
              t.type === 'error' ? 'bg-red-600' : 'bg-slate-900'
            }`}
          >
            {t.type === 'error'
              ? <AlertCircle className="w-4 h-4 shrink-0" />
              : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="cursor-pointer opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
