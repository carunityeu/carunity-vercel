import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Wraps filter content in a sidebar panel with independent scrolling.
 * The filter list scrolls separately from the listing results.
 *
 * Props:
 *  - children:      filter content
 *  - storageKey:    localStorage key prefix (kept for backwards compat)
 *  - title:         panel title (falls back to t('catalog.filters'))
 *  - headerExtra:   extra React node rendered in the header (e.g. bookmark btn)
 *  - footer:        React node rendered at the bottom (e.g. action buttons)
 *  - onDetachChange: accepted but ignored (no-op, kept for backwards compat)
 */
export default function DraggableFilterPanel({
  children,
  storageKey = 'filter-panel',
  title,
  headerExtra,
  footer,
  onDetachChange,
}) {
  const { t } = useTranslation();
  const panelTitle = title || t('catalog.filters');

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-sm font-semibold text-slate-800 dark:text-white">{panelTitle}</span>
        <div className="flex items-center gap-1">
          {headerExtra}
        </div>
      </div>
      {/* Body */}
      <div className="px-3 pb-3">
        {children}
      </div>
      {/* Footer */}
      {footer && (
        <div className="px-3 pb-3">
          {footer}
        </div>
      )}
    </div>
  );
}