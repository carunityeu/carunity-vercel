import React from 'react';
import { useTranslation } from 'react-i18next';
import { ApproxTag } from '@/components/ds';

// Static translations for the motor-vehicle tax block.
// Values are placeholders (same for every car) until real data is wired in.
const TAX_LABELS = {
  ru: { title: 'Автоналог', registration: 'Регистрационный сбор', annual: 'Годовой налог (2027)' },
  en: { title: 'Auto tax', registration: 'Registration fee', annual: 'Annual tax (2027)' },
  et: { title: 'Mootorsõidumaks', registration: 'Registreerimistasu', annual: 'Aastamaks (2027)' },
  lv: { title: 'Auto nodoklis', registration: 'Reģistrācijas maksa', annual: 'Gada nodoklis (2027)' },
  lt: { title: 'Automobilio mokestis', registration: 'Registravimo mokestis', annual: 'Metinis mokestis (2027)' },
};

export default function CarTaxBlock() {
  const { i18n } = useTranslation();
  const lang = (i18n?.language?.slice(0, 2)) || 'ru';
  const labels = TAX_LABELS[lang] || TAX_LABELS.ru;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white md:mb-5">{labels.title}<ApproxTag /></h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <div className="rounded-xl bg-slate-950 px-4 py-4 sm:px-5 sm:py-5">
          <p className="mb-2 text-xs font-medium text-slate-400 sm:text-sm">{labels.registration}</p>
          <p className="text-lg font-bold text-white sm:text-xl">671,75 €</p>
        </div>
        <div className="rounded-xl bg-slate-950 px-4 py-4 sm:px-5 sm:py-5">
          <p className="mb-2 text-xs font-medium text-slate-400 sm:text-sm">{labels.annual}</p>
          <p className="text-lg font-bold text-white sm:text-xl">91 €</p>
        </div>
      </div>
    </section>
  );
}