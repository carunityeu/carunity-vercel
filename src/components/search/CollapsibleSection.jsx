import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 px-1 text-left"
      >
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  );
}