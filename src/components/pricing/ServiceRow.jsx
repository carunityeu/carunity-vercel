import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

export default function ServiceRow({ icon: Icon, title, description, onSelect }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-4 sm:px-6 py-4 sm:py-5 hover:bg-slate-800/40 transition-colors text-left"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm sm:text-base leading-tight">{title}</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{description}</p>
        </div>
      </div>

      <span className="inline-flex items-center gap-1 self-start sm:self-auto flex-shrink-0 whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs sm:text-sm font-medium text-emerald-400 transition-colors group-hover:bg-emerald-500/20 group-hover:text-emerald-300">
        {t('pricing.details')}
        <ChevronRight className="w-4 h-4" />
      </span>
    </button>
  );
}