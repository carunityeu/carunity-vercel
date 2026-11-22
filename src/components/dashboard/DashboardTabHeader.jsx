import React from 'react';
import { cn } from '@/lib/utils';

export default function DashboardTabHeader({ icon: Icon, title, count, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-[#292a32] rounded-lg flex items-center justify-center flex-shrink-0">
          {Icon && <Icon className="w-5 h-5 text-emerald-400" />}
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <span className="truncate">{title}</span>
            {count !== undefined && count !== null && (
              <span className="text-xs font-normal text-slate-400 bg-[#292a32] px-2 py-0.5 rounded-full border border-[#292a32] flex-shrink-0">
                {count}
              </span>
            )}
          </h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}