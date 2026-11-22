import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export default function InfoHint({ titleKey, descKey, side = 'top', align = 'center', className }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const title = titleKey ? t(titleKey) : '';
  const desc = descKey ? t(descKey) : '';
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center w-4 h-4 rounded-full text-slate-500 hover:text-emerald-400 hover:bg-[#292a32] transition-colors flex-shrink-0',
            className
          )}
          aria-label={title}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side={side} align={align} className="w-[280px] bg-[#1b1b22] border-[#292a32] text-slate-200 p-4 z-50">
        <p className="text-sm font-semibold text-white mb-1.5">{title}</p>
        <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-3 text-xs font-medium text-emerald-400 hover:text-emerald-300"
        >
          {t('dealer.info_close')}
        </button>
      </PopoverContent>
    </Popover>
  );
}