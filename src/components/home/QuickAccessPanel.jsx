import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ICONS = {
  news: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/a4eea0322_newsicon.png',
  favorites: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/c38e1d308_booksmarkicon.png',
  valuation: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/380ddd9a0_calcicon.png',
  partners: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/a0bd8cb14_keyicon.png',
  account: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/072e9cd49_accounticon.png'
};

// Статичный баннер про дилеров (без переключения слайдов)
const BANNER = {
  bg: '#1b1b22',
  titleKey: 'quick_access.slide2_title',
  subtitleKey: 'quick_access.slide2_subtitle',
  image: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/0d89d14dc_0cd09081-298e-4223-b9d0-ff608ab74912.png'
};

export default function QuickAccessPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const buttons = [
    { icon: ICONS.news, label: t('quick_access.news'), onClick: () => navigate('/AutoNews') },
    { icon: ICONS.favorites, label: t('quick_access.favorites'), onClick: () => navigate('/Dashboard?tab=favorites') },
    { icon: ICONS.valuation, label: t('quick_access.valuation'), onClick: () => window.dispatchEvent(new CustomEvent('open-valuation')) },
    { icon: ICONS.partners, label: t('quick_access.partners'), onClick: () => navigate('/Dealers') },
    { icon: ICONS.account, label: t('quick_access.account'), onClick: () => navigate('/Dashboard') }
  ];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-3 sm:gap-4">
        {/* 5 square buttons: on desktop the square side equals the banner height */}
        <div className="flex gap-1.5 sm:gap-3 w-full justify-between lg:justify-start lg:w-auto lg:flex-shrink-0">
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              className="group flex flex-col items-center gap-1.5 sm:gap-2 flex-1 min-w-0 max-w-[96px] sm:max-w-[140px] lg:max-w-none lg:flex-none lg:w-24 xl:w-28"
            >
              <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden group-hover:scale-[1.03] transition-transform">
                <img src={btn.icon} alt={btn.label} className="w-full h-full object-cover" />
              </div>
              <span className="whitespace-nowrap text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">
                {btn.label}
              </span>
            </button>
          ))}
        </div>

        {/* Banner: same height as the square buttons on desktop */}
        <div className="relative w-full h-[112px] sm:h-[120px] lg:flex-1 lg:w-auto lg:min-w-0 lg:h-24 xl:h-28">
          {/* Outer container: no rounding */}
          <div className="relative h-full overflow-hidden bg-slate-950">
            {/* Inner card with rounded corners */}
            <div
              className="flex w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden"
              style={{ background: BANNER.bg }}
            >
              {/* Text on left */}
              <div className="flex-1 min-w-0 px-3 py-2 sm:px-5 lg:px-6 flex flex-col justify-center">
                <h3 className="text-base sm:text-lg lg:text-base xl:text-xl font-bold leading-tight text-white">
                  {t(BANNER.titleKey)}
                </h3>
                <p className="text-xs sm:text-sm lg:text-xs xl:text-sm mt-1 text-white/90">
                  {t(BANNER.subtitleKey)}
                </p>
              </div>
              {/* Image on right */}
              <div className="w-[38%] sm:w-[42%] lg:w-[30%] xl:w-[36%] relative overflow-hidden">
                <img
                  src={BANNER.image}
                  alt={t(BANNER.titleKey)}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}