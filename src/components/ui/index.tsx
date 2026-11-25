import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Droplet, Flower, Leaf, Mountain, Sprout, Sun, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AVATARS } from '../../data/content';

export function Logo({ size = 28, withWord = true }: { size?: number; withWord?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-deep">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" rx="18" fill="#D9E9D8" />
        <path d="M32 50V30" stroke="#35543D" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M32 34c-9 0-14-6-14-14 9 0 14 5 14 14z" fill="#83B85D" />
        <path d="M32 30c0-9 6-15 15-15 0 9-6 15-15 15z" fill="#527D56" />
        <circle cx="32" cy="50" r="4" fill="#EBA77F" />
      </svg>
      {withWord && <span className="font-display text-[22px] font-semibold tracking-[0.08em]">BLOOM</span>}
    </span>
  );
}

const AVATAR_ICONS: Record<string, typeof Leaf> = {
  leaf: Leaf,
  blossom: Flower,
  sun: Sun,
  water: Droplet,
  clay: Mountain,
  moss: Sprout,
};

export function Avatar({ id, size = 40, className = '' }: { id: string; size?: number; className?: string }) {
  const a = AVATARS.find((x) => x.id === id) ?? AVATARS[0];
  const Icon = AVATAR_ICONS[a.id] ?? Leaf;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ring-2 ring-white ${className}`}
      style={{ width: size, height: size, background: a.bg, color: a.fg }}
      aria-hidden
    >
      <Icon size={size * 0.48} strokeWidth={2} />
    </span>
  );
}

export function PageHeader({ eyebrow, title, subtitle, back, right }: { eyebrow?: string; title: string; subtitle?: string; back?: boolean | string; right?: ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <button
            onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}
            className="mb-3 -ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-muted hover:text-deep"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        {eyebrow && <p className="label mb-1.5">{eyebrow}</p>}
        <h1 className="text-[30px] font-medium leading-tight text-deep sm:text-[36px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-xl text-[15px] text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Modal({
  open,
  onClose,
  children,
  label,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#26332a]/30 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-cream p-6 shadow-[var(--shadow-lift)] sm:rounded-[28px] ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-muted hover:bg-black/5" aria-label="Close">
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} label={title}>
      <h2 className="pr-8 text-2xl font-medium text-deep">{title}</h2>
      <div className="mt-3 text-[15px] leading-relaxed text-muted">{body}</div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Stat({ value, label, icon }: { value: ReactNode; label: string; icon?: ReactNode }) {
  return (
    <div className="card flex items-center gap-3 px-4 py-3.5">
      {icon && <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint text-forest">{icon}</span>}
      <div>
        <div className="font-display text-2xl font-medium leading-none text-deep">{value}</div>
        <div className="mt-1 text-xs font-medium text-muted">{label}</div>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-forest' : 'bg-[#d8dbd2]'}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-mint text-forest">{icon}</span>
      <h3 className="text-xl font-medium text-deep">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
