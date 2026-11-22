import React from 'react';

export default function PricingSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="flex items-start gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-800">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base sm:text-lg">{title}</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-slate-800">{children}</div>
    </section>
  );
}