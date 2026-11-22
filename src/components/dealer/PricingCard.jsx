import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function PricingCard({ plan }) {
  const [hovered, setHovered] = useState(false);
  const { t } = useTranslation();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: hovered ? '2px solid #34d399' : '2px solid transparent',
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
        boxShadow: hovered ? '0 10px 30px rgba(240,128,90,0.15)' : 'none',
        transition: 'all 0.2s ease',
      }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-8 flex flex-col cursor-pointer"
    >
      {plan.popular && (
        <div className="text-center mb-4">
          <span className="bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">{t('pricing.most_popular')}</span>
        </div>
      )}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">{plan.name}</h3>
      <p className="text-3xl font-bold text-emerald-600 text-center mt-4">{plan.price}</p>
      <ul className="mt-6 space-y-3 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link to={createPageUrl('DealerPricing')} className="mt-8">
        <Button className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200">
          {t('pricing.details')}
        </Button>
      </Link>
    </div>
  );
}