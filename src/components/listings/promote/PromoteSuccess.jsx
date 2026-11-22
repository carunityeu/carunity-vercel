import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPromoteDate } from '@/lib/promoteFormat';
import { formatPrice } from '@/lib/promoteOptions';

export default function PromoteSuccess({ items, total, onClose }) {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-10 px-4 sm:px-6 text-center overflow-y-auto">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4 sm:mb-5">
        <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10 text-emerald-400" />
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
        {items.length === 1
          ? t('promote.success_title', 'Продвижение активировано!')
          : t('promote.success_multi', { count: items.length, defaultValue: 'Продвижение активировано: {{count}}' })}
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 mb-4">
        {t('promote.success_multi_desc', 'Все выбранные объявления подняты в топе')}
      </p>

      <div className="bg-[#101014] border border-[#292a32] rounded-xl p-3 mb-5 w-full max-w-md text-left space-y-2 max-h-[40dvh] overflow-y-auto">
        {items.map((item) => (
          <div key={item.carId} className="flex items-start gap-2 text-xs text-slate-300">
            <Rocket className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span className="flex-1 min-w-0">
              <span className="block truncate">{item.title}</span>
              <span className="block text-[10px] text-slate-500">
                {t('promote.premium_until', 'Премиум до')}: {formatPromoteDate(item.until, i18n)}
              </span>
            </span>
            <span className="text-slate-400 flex-shrink-0">{formatPrice(item.total)}</span>
          </div>
        ))}
        <div className="border-t border-[#292a32] pt-2 flex items-center justify-between">
          <span className="text-slate-400 text-xs">{t('promote.total', 'Итого')}</span>
          <span className="text-white font-bold">{formatPrice(total)}</span>
        </div>
      </div>

      <Button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-600 px-8">
        {t('promote.done', 'Готово')}
      </Button>
    </div>
  );
}