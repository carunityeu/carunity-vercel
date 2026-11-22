import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/utils/format';
import { estimateRegistrationFee, getRegFeeLabels } from '@/lib/registrationFee';

export default function RegistrationFeeLine({ car }) {
  const { i18n } = useTranslation();
  const fee = estimateRegistrationFee(car);
  if (fee == null) return null;

  const labels = getRegFeeLabels(i18n?.language);

  return (
    <p
      className="mt-1 text-right text-[11px] leading-tight text-slate-500 dark:text-slate-400 sm:text-xs"
      title={labels.hint}
    >
      <span className="whitespace-nowrap">{labels.short}</span>{' '}
      <span className="whitespace-nowrap font-semibold text-slate-700 dark:text-slate-200">
        {formatPrice(fee)}
      </span>
    </p>
  );
}