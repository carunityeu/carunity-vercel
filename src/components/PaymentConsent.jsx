import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

/**
 * Before paying for a digital service: the buyer asks to start it right away (EU withdrawal right),
 * with a link to the Terms. Pay buttons stay blocked until it is ticked.
 */
export default function PaymentConsent({ checked, onChange, highlight = false, className }) {
  const { t } = useTranslation();
  return (
    <label className={cn('flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm leading-relaxed text-ink-2',
      highlight && !checked ? 'border-red-400/60 bg-red-500/10' : 'border-line bg-raised', className)}>
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5 shrink-0" />
      <span>
        {t('payment.start_now_consent', 'Прошу начать оказание услуги сразу после оплаты. При отказе мне вернут стоимость неиспользованной части.')}{' '}
        <a href="/Terms" target="_blank" rel="noreferrer" className="text-brand-text underline underline-offset-2">{t('footer.terms')}</a>
      </span>
    </label>
  );
}
