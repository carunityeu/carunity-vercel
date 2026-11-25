// Design code building blocks (docs/DESIGN_CODE.md). Sections reworked to the design code
// are assembled from these instead of repeating long class strings.
import React from 'react';
import { cn } from '@/lib/utils';

/** Page-width wrapper: the same max width and side gutters everywhere. */
export function Container({ as: Tag = 'div', className, children, ...props }) {
  return <Tag className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6', className)} {...props}>{children}</Tag>;
}

/** A section card: surface background, line border, 16px corners, optional header row. */
export function Panel({ as: Tag = 'section', title, action, className, bodyClassName, children, ...props }) {
  return (
    <Tag className={cn('rounded-2xl border border-line bg-surface', className)} {...props}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-4 pt-4 md:px-5">
          {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
          {action}
        </div>
      )}
      <div className={cn('p-4 md:p-5', (title || action) && 'pt-3 md:pt-3', bodyClassName)}>{children}</div>
    </Tag>
  );
}

/** A small fact about a listing: icon + value on a raised background. */
export function Chip({ icon, className, style, children }) {
  return (
    <span style={style} className={cn('inline-flex items-center gap-1.5 rounded-lg bg-raised px-2.5 py-1 text-xs font-semibold text-ink-2 sm:text-sm', className)}>
      {icon}
      {children}
    </span>
  );
}

/** Classes for form controls (select triggers, inputs) so every field looks the same. */
export const fieldClass = 'h-10 w-full rounded-xl border-transparent bg-raised px-3 text-sm text-ink placeholder:text-ink-3 focus:ring-1 focus:ring-brand';

/** Header / menu link look: one place for hover and active states. */
export const navLinkClass = 'rounded-lg px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-raised hover:text-ink';

/* Form fields (mobile.de-like): 36px, thin light outline, selects get a caret compartment on the right. */
export const boxFieldClass = 'h-9 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:italic placeholder:text-ink-3 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand';
export const boxSelectClass = 'relative flex h-9 w-full items-center rounded-lg border border-line-strong bg-raised pl-3 pr-11 text-left text-sm text-ink focus:outline-none focus-visible:border-brand data-[placeholder]:italic data-[placeholder]:text-ink-3 [&>svg]:hidden';

/** The caret compartment of a select: a divider line and a small filled triangle. */
export function SelectCaret() {
  return (
    // div, not span: the select trigger restyles its direct span children
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center border-l border-line-strong">
      <div className="h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-ink" />
    </div>
  );
}
