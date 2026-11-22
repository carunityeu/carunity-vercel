import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, Check } from 'lucide-react';
import AdFormatPreviewBadge from '@/components/ads/AdFormatPreviewBadge';

const HERO_IMG = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/273f7126a_generated_image.png';
const PRIVATE_IMG = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/33321c58d_.png';
const DEALER_IMG = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/0f77f1499_UI-.png';

function SectionImage({ src, alt }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
      <img src={src} alt={alt} className="w-full h-auto object-cover" loading="lazy" />
    </div>
  );
}

function FormatsSection({ t }) {
  const plans = [
    {
      id: 'between',
      title: t('advertising.plan_between_title'),
      subtitle: t('advertising.plan_between_subtitle'),
      price: '49',
      period: t('advertising.period_30'),
      features: [t('advertising.plan_between_f1'), t('advertising.plan_between_f2'), t('advertising.plan_between_f3')],
      for: t('advertising.plan_between_for'),
    },
    {
      id: 'afterlisting',
      title: t('advertising.plan_afterlisting_title'),
      subtitle: t('advertising.plan_afterlisting_subtitle'),
      price: t('advertising.from') + ' 99',
      period: t('advertising.period_30'),
      features: [t('advertising.plan_afterlisting_f1'), t('advertising.plan_afterlisting_f2'), t('advertising.plan_afterlisting_f3')],
      for: t('advertising.plan_afterlisting_for'),
    },
    {
      id: 'hero',
      title: t('advertising.plan_hero_title'),
      subtitle: t('advertising.plan_hero_subtitle'),
      price: t('advertising.from') + ' 119',
      period: t('advertising.period_30'),
      features: [t('advertising.plan_hero_f1'), t('advertising.plan_hero_f2'), t('advertising.plan_hero_f3')],
      for: t('advertising.plan_hero_for'),
      note: t('advertising.limited_spots'),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400 mb-3">
          {t('advertising_info.formats_title')}
        </h1>
        <p className="text-lg sm:text-xl font-semibold text-white mb-4">
          {t('advertising_info.formats_subtitle')}
        </p>
        <p className="text-slate-400 leading-relaxed mb-6">
          {t('advertising_info.formats_body')}
        </p>

        <div className="space-y-4 mb-6">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                <AdFormatPreviewBadge type={plan.id} />
              </div>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-3">{plan.subtitle}</p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-white">{plan.price}€</span>
                <span className="text-sm text-slate-500">/ {plan.period}</span>
              </div>
              <ul className="space-y-2 mb-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="shrink-0 w-4 h-4 text-emerald-500 mt-0.5" />
                    {f}
                  </li>
                ))}
                {plan.note && (
                  <li className="flex items-start gap-2 text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                    <Check className="shrink-0 w-4 h-4 text-emerald-500 mt-0.5" />
                    {plan.note}
                  </li>
                )}
              </ul>
              <p className="text-xs text-slate-500"><span className="font-semibold text-slate-400">{t('advertising.for_whom')}:</span> {plan.for}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-500 mb-6">{t('advertising_info.formats_contact')}</p>
        <a
          href={`mailto:contact@carunity.eu?subject=${t('advertising.email_subject')}`}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
        >
          <Mail className="w-4 h-4" />
          {t('advertising_info.contact_btn')}
        </a>
      </div>
      <div className="hidden lg:block">
        <SectionImage src={PRIVATE_IMG} alt={t('advertising_info.formats_title')} />
      </div>
    </div>
  );
}

function TargetedSection({ t }) {
  const items = [1, 2, 3, 4].map((n) => t(`advertising_info.targeted_list_${n}`));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400 mb-3">
          {t('advertising_info.targeted_title')}
        </h1>
        <p className="text-lg sm:text-xl font-semibold text-white mb-4">
          {t('advertising_info.targeted_subtitle')}
        </p>
        <p className="text-slate-400 leading-relaxed mb-6">
          {t('advertising_info.targeted_body')}
        </p>
        <ul className="space-y-3 mb-6">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-300">
              <Check className="shrink-0 w-5 h-5 text-emerald-500 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-500 mb-6">{t('advertising_info.targeted_contact')}</p>
        <a
          href={`mailto:contact@carunity.eu?subject=${t('advertising.email_subject')}`}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
        >
          <Mail className="w-4 h-4" />
          {t('advertising_info.contact_btn')}
        </a>
      </div>
      <div className="hidden lg:block">
        <SectionImage src={DEALER_IMG} alt={t('advertising_info.targeted_title')} />
      </div>
    </div>
  );
}

function PricingSection({ t }) {
  const rows = [
    { format: t('advertising.plan_between_title'), specs: '728 × 250', price: '49€', period: t('advertising.period_30') },
    { format: t('advertising.plan_afterlisting_title'), specs: t('advertising.plan_afterlisting_subtitle'), price: t('advertising.from') + ' 99€', period: t('advertising.period_30') },
    { format: t('advertising.plan_hero_title'), specs: t('advertising.plan_hero_subtitle'), price: t('advertising.from') + ' 119€', period: t('advertising.period_30') },
  ];
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400 mb-3">
        {t('advertising_info.pricing_title')}
      </h1>
      <p className="text-lg sm:text-xl font-semibold text-white mb-4">
        {t('advertising_info.pricing_subtitle')}
      </p>
      <p className="text-slate-400 leading-relaxed mb-8 max-w-2xl">
        {t('advertising_info.pricing_body')}
      </p>

      {/* Table (desktop) */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900 text-left">
              <th className="px-4 py-3 font-semibold text-slate-300">{t('advertising_info.pricing_col_format')}</th>
              <th className="px-4 py-3 font-semibold text-slate-300">{t('advertising_info.pricing_col_specs')}</th>
              <th className="px-4 py-3 font-semibold text-slate-300">{t('advertising_info.pricing_col_price')}</th>
              <th className="px-4 py-3 font-semibold text-slate-300">{t('advertising_info.pricing_col_period')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-slate-800 hover:bg-slate-900/50">
                <td className="px-4 py-3 font-medium text-white">{row.format}</td>
                <td className="px-4 py-3 text-slate-400">{row.specs}</td>
                <td className="px-4 py-3 font-semibold text-emerald-400">{row.price}</td>
                <td className="px-4 py-3 text-slate-400">{row.period}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="sm:hidden space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="font-bold text-white mb-1">{row.format}</h3>
            <p className="text-xs text-slate-400 mb-2">{row.specs}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-emerald-400">{row.price}</span>
              <span className="text-xs text-slate-500">{row.period}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <a
          href={`mailto:contact@carunity.eu?subject=${t('advertising.email_subject')}`}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
        >
          <Mail className="w-4 h-4" />
          {t('advertising_info.contact_btn')}
        </a>
      </div>
    </div>
  );
}

function TargetingSection({ t }) {
  const items = [1, 2, 3].map((n) => t(`advertising_info.targeting_list_${n}`));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400 mb-3">
          {t('advertising_info.targeting_title')}
        </h1>
        <p className="text-lg sm:text-xl font-semibold text-white mb-4">
          {t('advertising_info.targeting_subtitle')}
        </p>
        <p className="text-slate-400 leading-relaxed mb-6">
          {t('advertising_info.targeting_body')}
        </p>
        <ul className="space-y-3 mb-6">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-300">
              <Check className="shrink-0 w-5 h-5 text-emerald-500 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-500 mb-2">{t('advertising_info.targeting_closing_1')}</p>
        <p className="text-sm text-slate-400 mb-1">{t('advertising_info.targeting_closing_2')}</p>
        <p className="text-sm text-slate-400 mb-6">{t('advertising_info.targeting_closing_3')}</p>
        <a
          href={`mailto:contact@carunity.eu?subject=${t('advertising.email_subject')}`}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
        >
          <Mail className="w-4 h-4" />
          {t('advertising_info.contact_btn')}
        </a>
      </div>
      <div className="hidden lg:block">
        <SectionImage src={HERO_IMG} alt={t('advertising_info.targeting_title')} />
      </div>
    </div>
  );
}

export default function AdvertisingInfo() {
  const { t } = useTranslation();
  const { section } = useParams();

  const sections = {
    formats: <FormatsSection t={t} />,
    targeted: <TargetedSection t={t} />,
    pricing: <PricingSection t={t} />,
    targeting: <TargetingSection t={t} />,
  };

  const content = sections[section];
  if (!content) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">404</p>
          <Link to="/Advertising" className="text-emerald-400 hover:underline">{t('advertising_info.back')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-16 sm:pt-12 sm:pb-24">
        <Link
          to="/Advertising"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('advertising_info.back')}
        </Link>
        {content}
      </div>
    </div>
  );
}