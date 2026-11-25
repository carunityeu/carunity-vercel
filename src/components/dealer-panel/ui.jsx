// Building blocks of the dealer panel (design code: tokens, 2 layers, no hover effects on cards).
import React from 'react';
import { cn } from '@/lib/utils';

/** A block of the panel: surface card with an optional title row. */
export function Card({ title, hint, action, className, bodyClassName, children }) {
  return (
    <section className={cn('rounded-2xl border border-line bg-surface', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {hint && <p className="mt-0.5 text-sm text-ink-3">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-5', (title || action) && 'pt-4', bodyClassName)}>{children}</div>
    </section>
  );
}

/**
 * A key number. `delta` = change vs the previous period (number, or null when it is not measured:
 * then no arrow is drawn instead of a made-up one).
 */
export function Stat({ icon: Icon, label, value, delta = null, deltaLabel, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick}
      className={cn('flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 text-left', onClick && 'cursor-pointer')}>
      <div className="flex items-center gap-2 text-sm text-ink-2">
        {Icon && <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-raised"><Icon className="h-4 w-4 text-ink-2" /></span>}
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold leading-none text-ink">{value}</span>
        {typeof delta === 'number' && delta !== 0 && (
          <span className={cn('text-xs font-semibold', delta > 0 ? 'text-brand-text' : delta < 0 ? 'text-red-400' : 'text-ink-3')}>
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
      {deltaLabel && <p className="-mt-1 text-xs text-ink-3">{deltaLabel}</p>}
    </Tag>
  );
}

/** Segmented switch for views inside a section (status tabs, sub-sections). */
export function Segmented({ items, value, onChange, className }) {
  return (
    <div role="tablist" className={cn('inline-flex flex-wrap gap-1 rounded-xl bg-raised p-1', className)}>
      {items.map((it) => (
        <button key={it.value} type="button" role="tab" aria-selected={value === it.value} onClick={() => onChange(it.value)}
          className={cn('flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium',
            value === it.value ? 'bg-surface text-ink shadow-sm' : 'text-ink-2')}>
          {it.label}
          {it.count !== undefined && <span className={cn('rounded-md px-1.5 text-xs', value === it.value ? 'bg-raised text-ink-2' : 'text-ink-3')}>{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

const STATUS_STYLE = {
  active: 'bg-brand/15 text-brand-text',
  pending: 'bg-amber-500/15 text-amber-300',
  rejected: 'bg-red-500/15 text-red-300',
  sold: 'bg-raised text-ink-2',
};
export function StatusBadge({ status, label }) {
  return <span className={cn('inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold', STATUS_STYLE[status] || 'bg-raised text-ink-2')}>{label}</span>;
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      {Icon && <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-raised"><Icon className="h-5 w-5 text-ink-3" /></span>}
      <p className="text-base font-semibold text-ink">{title}</p>
      {text && <p className="max-w-sm text-sm text-ink-3">{text}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/** Field with a label above (salon settings). */
export function Field({ label, hint, className, children }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}

/** Notice line inside a section: tone = info | warn | danger. */
export function Notice({ tone = 'info', icon: Icon, children, action }) {
  const tones = { info: 'bg-raised text-ink-2', warn: 'bg-amber-500/10 text-amber-200', danger: 'bg-red-500/10 text-red-200' };
  return (
    <div className={cn('flex items-center gap-3 rounded-xl px-4 py-3 text-sm', tones[tone])}>
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}

/** Thin horizontal bar for shares (top categories, funnel). */
export function Bar({ value, max, className }) {
  const pct = max > 0 && value > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0; // nothing drawn for zero
  return <div className={cn('h-1.5 w-full rounded-full bg-raised', className)}><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>;
}
