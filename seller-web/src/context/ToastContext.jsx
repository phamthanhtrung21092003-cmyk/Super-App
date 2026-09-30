import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg, dur) => addToast(msg, 'error', dur), [addToast]);
  const warning = useCallback((msg, dur) => addToast(msg, 'warning', dur), [addToast]);
  const info = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast]);

  const toast = { success, error, warning, info, add: addToast, remove: removeToast };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container-root" aria-live="polite">
        {toasts.map((item) => {
          let IconComp = Info;
          let iconColor = '#3B82F6';
          let borderLeftColor = '#3B82F6';

          if (item.type === 'success') {
            IconComp = CheckCircle2;
            iconColor = '#10B981';
            borderLeftColor = '#10B981';
          } else if (item.type === 'error') {
            IconComp = AlertCircle;
            iconColor = '#EF4444';
            borderLeftColor = '#EF4444';
          } else if (item.type === 'warning') {
            IconComp = AlertTriangle;
            iconColor = '#F59E0B';
            borderLeftColor = '#F59E0B';
          }

          return (
            <div
              key={item.id}
              className={`seller-toast-item toast-${item.type}`}
              style={{ borderLeft: `4px solid ${borderLeftColor}` }}
              role="alert"
            >
              <IconComp size={20} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="toast-message-text">{item.message}</div>
              <button
                className="toast-close-btn"
                onClick={() => removeToast(item.id)}
                aria-label="Đóng thông báo"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      success: (msg) => console.log('Toast [Success]:', msg),
      error: (msg) => console.error('Toast [Error]:', msg),
      warning: (msg) => console.warn('Toast [Warning]:', msg),
      info: (msg) => console.info('Toast [Info]:', msg),
    };
  }
  return context;
}
