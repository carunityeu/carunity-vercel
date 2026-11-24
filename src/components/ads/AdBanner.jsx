import React, { useState, useEffect } from 'react';
import { useAdImage } from '@/lib/useAdConfig';

// ============================================================
// РЕКЛАМА — глобальный переключатель
// ============================================================
export const ADS_ENABLED = true;

// URL рекламных изображений (fallback)
export const AD_IMAGES = {
  hondaCity: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/1053963ad_a055f22c6403f18744c45843415e625a.jpg',
  citroen: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/4fd0a0a4c_4707e7e3922f0dc53f4735f40d789e04.jpg',
  bmwM: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/0dec8d59c_55d4e744e0bc25040b905c7311ffb1a7.jpg',
};

// Fallback static ads, used when no AdConfiguration exists for a slot.
// Banner slots have none: without a booked ad they render nothing (no placeholder banner).
const ADS = {
  'catalog-sidebar': [
    {
      gradient: 'linear-gradient(160deg, #101014 0%, #1e3a5f 50%, #0c4a6e 100%)',
      accent: '#0ea5e9',
      brand: 'AutoParts PRO',
      tagline: { ru: 'Запчасти за 24 часа', et: 'Varuosad 24h jooksul', en: 'Parts in 24 hours' },
      desc: { ru: 'Оригинал и аналоги для любого автомобиля. Доставка по Балтии', et: 'Originaal ja analoogid igale autole. Kohaletoimetamine Baltikumis', en: 'OEM & aftermarket. Delivered across Baltics' },
      cta: { ru: 'Найти запчасть →', et: 'Leia osa →', en: 'Find a part →' },
      url: '#ad-parts',
      icon: (
        <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
          <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
        </svg>
      ),
    },
    {
      gradient: 'linear-gradient(160deg, #1a0533 0%, #3b0764 50%, #1e1b4b 100%)',
      accent: '#a855f7',
      brand: 'NORDAUTO',
      tagline: { ru: 'Страховка онлайн', et: 'Kindlustus veebis', en: 'Insurance online' },
      desc: { ru: 'ОСАГО и КАСКО. Лучшие ставки в странах Балтии', et: 'KASKO ja OSAGO. Parimad hinnad Baltikumis', en: 'Best rates in the Baltics' },
      cta: { ru: 'Рассчитать стоимость →', et: 'Arvuta hind →', en: 'Get a quote →' },
      url: '#ad-insurance',
      icon: (
        <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      ),
    },
  ],
};


// Ссылки баннеров: внешние — в новой вкладке (как в hero-баннере),
// без сохранённой ссылки — баннер просто не кликается
const linkProps = (url) => {
  if (!url || url === '#') return { onClick: (e) => e.preventDefault() };
  return url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};
};

// Метка «Реклама» на всех языках платформы
const AD_LABELS = { ru: 'Реклама', en: 'Ad', et: 'Reklaam', lv: 'Reklāma', lt: 'Reklama' };
export const adLabel = (lang) => AD_LABELS[String(lang || '').slice(0, 2)] || AD_LABELS.ru;

// Горизонтальный баннер (leaderboard / billboard / inline)
function HorizontalAd({ ad, lang, aspectRatio }) {
  const l = lang === 'et' ? 'et' : lang === 'en' ? 'en' : 'ru';
  const labelText = adLabel(lang);

  // Image-based ad — full-bleed image banner
  if (ad.image) {
    return (
      <a href={ad.url}       {...linkProps(ad.url)}
        className="block relative w-full max-w-[970px] mx-auto overflow-hidden rounded-xl transition-opacity hover:opacity-95"
      >
        <span className="absolute top-1.5 right-2 z-10 text-[10px] uppercase tracking-widest text-white/70 bg-black/30 px-1.5 py-0.5 rounded">
          {labelText}
        </span>
        <img
          src={ad.image}
          alt={ad.imageAlt || 'Advertisement'}
          className={`w-full object-cover object-center ${aspectRatio === '10/3' ? 'h-auto aspect-[10/3]' : 'h-[100px] sm:h-[140px] lg:h-[250px]'}`}
          loading="lazy"
        />
      </a>
    );
  }

  return (
    <a href={ad.url}       {...linkProps(ad.url)}
      className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 rounded-xl overflow-hidden relative w-full transition-opacity hover:opacity-90"
      style={{ background: ad.gradient, minHeight: 96 }}
    >
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${ad.accent}, transparent 70%)` }} />
      <span className="absolute top-1 right-2 text-[10px] uppercase tracking-widest text-white/30">
        {labelText}
      </span>
      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
        style={{ background: `${ad.accent}30`, border: `1px solid ${ad.accent}55` }}>
        <span className="text-white font-black text-[10px] sm:text-xs">{ad.brand[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-bold text-xs sm:text-sm leading-tight truncate">{ad.tagline[l]}</div>
        <div className="text-white/55 text-[11px] leading-tight mt-0.5 hidden sm:block truncate">{ad.desc[l]}</div>
      </div>
      <div className="flex-shrink-0 hidden sm:flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white"
        style={{ background: `${ad.accent}35`, border: `1px solid ${ad.accent}55` }}>
        {ad.cta[l]}
      </div>
    </a>
  );
}

// Вертикальный баннер (rectangle / sidebar)
function VerticalAd({ ad, lang, size }) {
  const l = lang === 'et' ? 'et' : lang === 'en' ? 'en' : 'ru';
  const labelText = adLabel(lang);
  const tall = size === 'sidebar';

  // Image-based ad — full-bleed image
  if (ad.image) {
    return (
      <a href={ad.url}       {...linkProps(ad.url)}
        className="block relative w-full overflow-hidden rounded-xl transition-opacity hover:opacity-95"
      >
        <span className="absolute top-1.5 left-2 z-10 text-[10px] uppercase tracking-widest text-white/70 bg-black/30 px-1.5 py-0.5 rounded">
          {labelText}
        </span>
        <img
          src={ad.image}
          alt={ad.imageAlt || 'Advertisement'}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </a>
    );
  }

  return (
    <a href={ad.url}       {...linkProps(ad.url)}
      className="flex flex-col items-center text-center rounded-xl overflow-hidden relative w-full transition-opacity hover:opacity-90"
      style={{ background: ad.gradient, minHeight: tall ? 400 : 220, padding: tall ? '32px 20px' : '24px 16px' }}
    >
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle, ${ad.accent}, transparent 70%)` }} />
      <span className="absolute top-2 left-3 text-[10px] uppercase tracking-widest text-white/30">
        {labelText}
      </span>
      {ad.icon ? (
        <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center relative z-10"
          style={{ background: `${ad.accent}30`, border: `1px solid ${ad.accent}55` }}>
          {ad.icon}
        </div>
      ) : (
        <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center relative z-10"
          style={{ background: `${ad.accent}30`, border: `1px solid ${ad.accent}55` }}>
          <span className="text-white font-black text-xl">{ad.brand[0]}</span>
        </div>
      )}
      <div className="text-white/50 text-[11px] font-semibold uppercase tracking-widest mb-2 relative z-10">{ad.brand}</div>
      <h3 className="text-white font-bold text-lg leading-tight mb-3 relative z-10">{ad.tagline[l]}</h3>
      <p className="text-white/55 text-sm leading-snug mb-6 relative z-10">{ad.desc[l]}</p>
      <div className="relative z-10 px-5 py-2.5 rounded-xl font-bold text-white text-sm mt-auto"
        style={{ background: `${ad.accent}35`, border: `1px solid ${ad.accent}66` }}>
        {ad.cta[l]}
      </div>
    </a>
  );
}

const HORIZONTAL_SIZES = ['leaderboard', 'billboard', 'inline'];

export default function AdBanner({ size = 'leaderboard', slot, className = '', lang, aspectRatio }) {
  const [adIndex, setAdIndex] = useState(0);
  const configuredAd = useAdImage(slot);

  // Use configured ad if available, otherwise fall back to static
  const slotAds = configuredAd ? [{ ...configuredAd, url: configuredAd.link }] : (ADS[slot] || []);
  const ad = slotAds.length ? slotAds[adIndex % slotAds.length] : null;

  // Ротация если несколько объявлений (fallback static only)
  useEffect(() => {
    if (configuredAd) return; // configured ad is fixed per page load
    if (slotAds.length <= 1) return;
    const t = setInterval(() => setAdIndex(i => i + 1), 8000);
    return () => clearInterval(t);
  }, [slotAds.length, configuredAd]);

  if (!ADS_ENABLED || !ad) return null;

  const detectedLang = lang || (typeof window !== 'undefined' ? localStorage.getItem('i18nextLng')?.slice(0, 2) : null) || 'ru';
  const isHorizontal = HORIZONTAL_SIZES.includes(size);

  return (
    <div className={className}>
      {isHorizontal
        ? <HorizontalAd ad={ad} lang={detectedLang} aspectRatio={aspectRatio} />
        : <VerticalAd ad={ad} lang={detectedLang} size={size} />
      }
    </div>
  );
}