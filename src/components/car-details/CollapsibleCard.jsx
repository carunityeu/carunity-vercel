import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Dark section card with a title and a chevron that folds the content
export default function CollapsibleCard({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {open ? <ChevronUp className="h-5 w-5 flex-shrink-0 text-slate-400" /> : <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400" />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}