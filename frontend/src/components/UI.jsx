import { X, AlertTriangle, Loader2, PackageOpen } from 'lucide-react';

// ── Modal ────────────────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  }[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full ${sizeClass} bg-white rounded-2xl shadow-2xl animate-fade-in`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="font-display text-xl text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────

export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-fade-in">
        <div className="px-6 pt-6 pb-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? 'bg-rose-50' : 'bg-amber-50'}`}>
            <AlertTriangle size={24} className={danger ? 'text-rose-500' : 'text-amber-500'} />
          </div>
          <h3 className="font-display text-xl text-ink-900 mb-2">{title}</h3>
          <p className="text-sm text-ink-500">{message}</p>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Loading Spinner ───────────────────────────────────────────────────────────

export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-64">
      <Spinner size={32} className="text-amber-500" />
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-ink-100 rounded-2xl flex items-center justify-center mb-4">
        <PackageOpen size={28} className="text-ink-400" />
      </div>
      <h3 className="font-display text-xl text-ink-700 mb-1">{title}</h3>
      <p className="text-sm text-ink-400 max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

const statusStyles = {
  pending:   'bg-amber-100 text-amber-800',
  confirmed: 'bg-sky-100 text-sky-800',
  shipped:   'bg-violet-100 text-violet-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-ink-100 text-ink-500',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge capitalize ${statusStyles[status] || 'bg-ink-100 text-ink-500'}`}>
      {status}
    </span>
  );
}

// ── Stock Badge ───────────────────────────────────────────────────────────────

export function StockBadge({ quantity }) {
  if (quantity === 0) return <span className="badge bg-rose-100 text-rose-700">Out of Stock</span>;
  if (quantity <= 10) return <span className="badge bg-amber-100 text-amber-700">Low Stock</span>;
  return <span className="badge bg-emerald-100 text-emerald-700">In Stock</span>;
}

// ── Form Field ────────────────────────────────────────────────────────────────

export function FormField({ label, error, required, children }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

// ── Search Input ──────────────────────────────────────────────────────────────

import { Search } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9 w-64"
      />
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display text-3xl text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
