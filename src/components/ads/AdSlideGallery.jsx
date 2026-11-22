import React from 'react';
import { adLabel } from './AdBanner';

// Рекламный слайд галереи фото объявления — «последнее фото = реклама».
// Изображение и ссылка задаются в админке (слот listing-gallery-slide).
export default function AdSlideGallery({ ad, lang = 'ru' }) {
  if (!ad?.image) return null;

  const link = ad.link && ad.link !== '#' ? ad.link : '';
  const external = /^https?:\/\//i.test(link);
  const Wrapper = link ? 'a' : 'div';
  const wrapperProps = link
    ? { href: link, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }
    : {};

  return (
    <Wrapper {...wrapperProps} className="block w-full h-full relative overflow-hidden select-none">
      <img
        src={ad.image}
        alt={ad.alt || 'Advertisement'}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[10px] text-white/80 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">
          {adLabel(lang)}
        </span>
      </div>
    </Wrapper>
  );
}