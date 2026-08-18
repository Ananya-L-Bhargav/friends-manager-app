import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`toast ${
              isSuccess ? 'toast-success' : isError ? 'toast-error' : 'toast-info'
            }`}
          >
            {isSuccess && <CheckCircle2 size={18} color="var(--accent-emerald)" />}
            {isError && <AlertCircle size={18} color="var(--accent-rose)" />}
            {!isSuccess && !isError && <Info size={18} color="var(--accent-primary)" />}

            <div style={{ flex: 1, fontSize: '0.875rem' }}>{toast.message}</div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
