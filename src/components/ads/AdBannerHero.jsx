import React, { useState, useEffect } from 'react';
import { ADS_ENABLED, AD_IMAGES, adLabel } from './AdBanner';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

// Слайды: первый — наша реклама, остальные — внешние
// Внешние слайды с изображениями (Honda City, Citroën) — для теста ротации в hero

const SLIDES = [
  {
    type: 'image',
    brand: 'Honda',
    tagline: { ru: 'Stun The City', et: 'Stun The City', en: 'Stun The City' },
    desc: { ru: 'Новый Honda City — восхищает издалека, удивляет вблизи', et: 'Uus Honda City — imeb kaugelt, üllatab lähedalt', en: 'The New Honda City — admired from afar, amazing up close' },
    cta: { ru: 'Узнать больше →', et: 'Lisainfo →', en: 'Learn more →' },
    url: '#ad-honda-city',
    image: AD_IMAGES.hondaCity,
    accent: '#00a1e4',
  },
  {
    type: 'image',
    brand: 'Citroën',
    tagline: { ru: 'Exploradores Confort — SUV Citroën', et: 'Exploradores Confort — Citroën SUV', en: 'Exploradores Confort — Citroën SUV' },
    desc: { ru: 'Открывайте новое с комфортом Citroën SUV', et: 'Avastage uut Citroën SUV mugavusega', en: 'Explore new horizons with Citroën SUV comfort' },
    cta: { ru: 'Узнать больше →', et: 'Lisainfo →', en: 'Learn more →' },
    url: '#ad-citroen-suv',
    image: AD_IMAGES.citroen,
    accent: '#F26639',
  },
  {
    type: 'internal',
    brand: 'CarUnity',
    tagline: { ru: 'Продайте авто быстрее', et: 'Müü auto kiiremini', en: 'Sell your car faster' },
    desc: { ru: 'Разместите объявление и получите тысячи просмотров уже сегодня', et: 'Lisa kuulutus ja saa tuhandeid vaatamisi juba täna', en: 'Post a listing and get thousands of views today' },
    cta: { ru: 'Разместить бесплатно', et: 'Lisa tasuta', en: 'List for free' },
    url: '/CreateListing',
    gradient: 'linear-gradient(160deg, #064e3b 0%, #065f46 40%, #101014 100%)',
    accent: '#34d399',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>
    ),
  },
  {
    type: 'external',
    brand: 'NORDAUTO',
    tagline: { ru: 'Страховка за 5 минут', et: 'Kindlustus 5 minutiga', en: 'Insurance in 5 minutes' },
    desc: { ru: 'Лучшие ставки ОСАГО и КАСКО в Балтии', et: 'Parimad KASKO ja OSAGO hinnad Baltikumis', en: 'Best rates in the Baltics' },
    cta: { ru: 'Рассчитать →', et: 'Arvuta →', en: 'Calculate →' },
    url: '#ad-insurance',
    gradient: 'linear-gradient(160deg, #1a0533 0%, #3b0764 50%, #1e1b4b 100%)',
    accent: '#a855f7',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
    ),
  },
  {
    type: 'external',
    brand: 'AutoParts PRO',
    tagline: { ru: 'Запчасти за 24 часа', et: 'Varuosad 24 tunniga', en: 'Parts in 24 hours' },
    desc: { ru: 'Оригинал и аналоги для любого авто', et: 'Originaal ja analoogid igale autole', en: 'OEM & aftermarket for any car' },
    cta: { ru: 'Найти запчасть →', et: 'Leia varuosa →', en: 'Find a part →' },
    url: '#ad-parts',
    gradient: 'linear-gradient(160deg, #101014 0%, #1e3a5f 40%, #0c4a6e 100%)',
    accent: '#0ea5e9',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
      </svg>
    ),
  },
];

export default function AdBannerHero({ lang = 'ru' }) {
  const [dismissed, setDismissed] = useState(false);
  const [current, setCurrent] = useState(0);

  // Auto-rotate every 5s
  useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [dismissed]);

  if (!ADS_ENABLED || dismissed) return null;

  const slide = SLIDES[current];
  const l = lang === 'et' ? 'et' : lang === 'en' ? 'en' : 'ru';
  const isImageSlide = slide.type === 'image';

  return (
    <div className="hidden md:block absolute bottom-0 right-0 z-20 md:mb-6 md:mr-5 lg:mb-10 lg:mr-8"
      style={{ width: 'clamp(180px, 20vw, 300px)' }}>
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{
          background: isImageSlide ? '#000' : slide.gradient,
          minHeight: 'clamp(220px, 25vw, 380px)'
        }}
      >
        {/* Image background for image slides */}
        {isImageSlide && (
          <img
            src={slide.image}
            alt={slide.brand}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {isImageSlide && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        )}

        {/* Ad label */}
        <div className="absolute top-2 left-2.5 z-10">
          <span className="text-[9px] text-white/70 uppercase tracking-widest bg-black/40 px-1.5 py-0.5 rounded">
            {slide.type === 'internal' ? 'CarUnity' : adLabel(lang)}
          </span>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-1.5 right-1.5 z-20 w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3 text-white" />
        </button>

        {/* Image slide: brand badge top-right */}
        {isImageSlide && (
          <div className="absolute top-7 right-2 z-10">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
              <ExternalLink className="w-2.5 h-2.5 text-white/70" />
              <span className="text-[9px] text-white/70">{slide.brand}</span>
            </div>
          </div>
        )}

        {/* Decorative glow (non-image only) */}
        {!isImageSlide && (
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${slide.accent} 0%, transparent 70%)` }} />
        )}

        {/* Content */}
        <a href={slide.url} className="relative z-10 flex flex-col flex-1 px-3 pt-7 pb-3 gap-2">
          {/* Icon + brand (non-image only) */}
          {!isImageSlide && (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${slide.accent}33`, border: `1px solid ${slide.accent}55` }}>
                {slide.icon}
              </div>
              <span className="text-white font-bold text-xs sm:text-sm tracking-wide leading-tight">{slide.brand}</span>
            </div>
          )}

          {/* Tagline */}
          <p className={`text-white font-bold text-sm sm:text-base leading-tight ${isImageSlide ? 'drop-shadow-lg' : ''}`}>
            {slide.tagline[l]}
          </p>
          {isImageSlide ? (
            <p className="text-white/85 text-[11px] sm:text-xs leading-snug flex-1 drop-shadow-md">
              {slide.desc[l]}
            </p>
          ) : (
            <p className="text-white/60 text-[11px] sm:text-xs leading-snug flex-1">
              {slide.desc[l]}
            </p>
          )}

          {/* CTA */}
          <div
            className="inline-flex items-center self-start px-3 py-1.5 rounded-lg text-xs font-bold text-white mt-1"
            style={isImageSlide
              ? { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }
              : { background: `${slide.accent}33`, border: `1px solid ${slide.accent}66` }}
          >
            {slide.cta[l]}
          </div>
        </a>

        {/* Pagination dots + arrows */}
        <div className="relative z-10 flex items-center justify-between px-3 pb-2.5 pt-1">
          <button
            onClick={() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)}
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-3 h-3 text-white/70" />
          </button>
          <div className="flex gap-1">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === current ? slide.accent : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent(c => (c + 1) % SLIDES.length)}
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-3 h-3 text-white/70" />
          </button>
        </div>
      </div>
    </div>
  );
}