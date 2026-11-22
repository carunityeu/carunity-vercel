import React from 'react';
import { useTranslation } from 'react-i18next';
export default function PricingStage({ number, title, hint, children, id, label }) {
  const { t } = useTranslation();
  return <section id={id} className="pr-stage">
    <p className="pr-eyebrow">{t('priceRef.step')} {number} · {t(`priceRef.${label || (number === 1 ? 'tariff' : 'social')}`)}</p>
    <h2>{title}</h2><p className="pr-hint">{hint}</p>{children}
  </section>;
}