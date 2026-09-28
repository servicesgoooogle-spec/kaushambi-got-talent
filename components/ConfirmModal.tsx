'use client';

import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export type ConfirmVariant = 'default' | 'danger' | 'success' | 'info';

export interface ConfirmOptions {
  title: string;
  message: string;
  details?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface Props extends ConfirmOptions {
  open: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES: Record<
  ConfirmVariant,
  { ring: string; glow: string; btn: string; icon: string; title: string }
> = {
  default: {
    ring: 'border-brand-gold/50',
    glow: 'shadow-[0_0_40px_rgba(251,191,36,0.35)]',
    btn: 'from-brand-goldbright via-brand-gold to-brand-amber text-black',
    icon: 'text-brand-gold',
    title: 'text-gold-gradient',
  },
  success: {
    ring: 'border-emerald-500/50',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.35)]',
    btn: 'from-emerald-400 to-emerald-600 text-black',
    icon: 'text-emerald-300',
    title: 'text-emerald-300',
  },
  danger: {
    ring: 'border-red-500/50',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.45)]',
    btn: 'from-red-500 to-red-700 text-white',
    icon: 'text-red-300',
    title: 'text-red-300',
  },
  info: {
    ring: 'border-brand-neon/50',
    glow: 'shadow-[0_0_40px_rgba(34,211,238,0.35)]',
    btn: 'from-brand-neon to-cyan-500 text-black',
    icon: 'text-brand-neon',
    title: 'text-brand-neon',
  },
};

export default function ConfirmModal({
  open,
  title,
  message,
  details = [],
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const style = VARIANT_STYLES[variant];

  // Escape key = cancel, Enter key = confirm
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && !busy) onConfirm();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, busy, onCancel, onConfirm]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_180ms_ease-out]"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !busy && onCancel()}
      />

      {/* Modal panel */}
      <div
        className={[
          'relative w-full max-w-md rounded-2xl overflow-hidden',
          'bg-gradient-to-br from-brand-darkred/95 via-black/95 to-brand-deep/95',
          'border-2',
          style.ring,
          style.glow,
          'animate-[popIn_220ms_cubic-bezier(0.34,1.56,0.64,1)]',
        ].join(' ')}
      >
        {/* Noise + stripes background */}
        <div className="absolute inset-0 stripes-bg opacity-40 pointer-events-none" />
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-brand-gold/15 blur-3xl pointer-events-none" />

        {/* Top accent line */}
        <div
          className={[
            'absolute top-0 left-0 right-0 h-[3px]',
            variant === 'danger'
              ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent'
              : variant === 'success'
              ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent'
              : variant === 'info'
              ? 'bg-gradient-to-r from-transparent via-brand-neon to-transparent'
              : 'bg-gradient-to-r from-transparent via-brand-gold to-transparent',
          ].join(' ')}
        />

        {/* Close X */}
        <button
          onClick={onCancel}
          disabled={busy}
          className="absolute top-3 right-3 rounded-full p-1.5 text-brand-gold/60 hover:text-brand-gold hover:bg-white/5 transition disabled:opacity-30 z-10"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className="relative p-6 md:p-7">
          {/* Icon + title */}
          <div className="flex items-start gap-3 mb-4 pr-8">
            <span className={`shrink-0 mt-1 ${style.icon}`}>
              <AlertTriangle size={22} strokeWidth={2.5} />
            </span>
            <h2
              className={[
                'font-display text-xl md:text-2xl leading-tight tracking-wide',
                style.title,
              ].join(' ')}
            >
              {title}
            </h2>
          </div>

          {/* Message */}
          <p className="text-sm text-brand-gold/85 leading-relaxed whitespace-pre-line mb-4">
            {message}
          </p>

          {/* Details list */}
          {details.length > 0 && (
            <ul className="space-y-1.5 mb-5 rounded-lg border border-brand-gold/20 bg-black/40 px-3 py-3">
              {details.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-brand-gold/80 leading-snug"
                >
                  <span className="text-brand-amber mt-[3px] shrink-0">●</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
            <button
              onClick={onCancel}
              disabled={busy}
              className="rounded-full border border-brand-gold/30 text-brand-gold/80 hover:text-brand-gold hover:bg-white/5 text-sm font-semibold px-5 py-2.5 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className={[
                'rounded-full bg-gradient-to-br font-bold text-sm px-5 py-2.5',
                style.btn,
                'transition hover:scale-[1.03] active:scale-95 disabled:opacity-50',
                'shadow-lg',
              ].join(' ')}
            >
              {busy ? 'Working…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Local keyframes — self-contained so no globals change needed */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}