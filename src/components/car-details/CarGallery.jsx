import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import AdSlideGallery from '@/components/ads/AdSlideGallery';
import { useAdImage } from '@/lib/useAdConfig';

const GALLERY_ICON = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/381ee1165_galleryicon.png';
const AD_LABELS = { et: 'Reklaam', en: 'Ad', lv: 'Reklāma', lt: 'Reklama', ru: 'Реклама' };
const ARROW = 'absolute top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-opacity hover:bg-black/80';

// Main photo (opens the photo list on click) + a row of thumbnails
export default function CarGallery({ images = [], title, index, onIndexChange, onOpen, lang, readOnly = false }) {
  const { t } = useTranslation();
  // Рекламный слайд из админки (слот listing-gallery-slide) — только если он заполнен
  const ad = useAdImage('listing-gallery-slide');
  const hasAd = !readOnly && !!ad?.image;
  const total = images.length > 0 ? images.length + (hasAd ? 1 : 0) : 0;
  const isAd = hasAd && index === images.length;

  return (
    <div>
      <div className="relative aspect-[4/3] sm:aspect-[3/2] overflow-hidden rounded-2xl bg-slate-800">
        {images.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-slate-400">{t('car.no_photos')}</div>
        ) : (
          <>
            {isAd ? (
              <AdSlideGallery ad={ad} lang={lang} />
            ) : (
              <img src={images[Math.min(index, images.length - 1)]} alt={title} className="h-full w-full cursor-pointer object-cover" onClick={onOpen} />
            )}
            {total > 1 && (
              <>
                <button type="button" className={cn(ARROW, 'left-2 sm:left-4')} disabled={index === 0}
                  style={{ opacity: index === 0 ? 0.3 : 1 }} onClick={() => onIndexChange(Math.max(0, index - 1))}>
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button type="button" className={cn(ARROW, 'right-2 sm:right-4')} disabled={index === total - 1}
                  style={{ opacity: index === total - 1 ? 0.3 : 1 }} onClick={() => onIndexChange(Math.min(total - 1, index + 1))}>
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </>
            )}
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 py-1 pl-2 pr-2.5 text-[11px] font-medium text-white backdrop-blur-sm sm:hidden">
              <img src={GALLERY_ICON} alt="" className="h-3.5 w-3.5" />
              <span>{isAd ? AD_LABELS[lang] || AD_LABELS.ru : `${index + 1} / ${images.length}`}</span>
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="scrollbar-hide mt-2 flex gap-1.5 overflow-x-auto sm:gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onIndexChange(i)}
              className={cn(
                'aspect-[4/3] w-[calc((100%-24px)/5)] flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:w-[calc((100%-48px)/7)]',
                i === index ? 'border-emerald-500' : 'border-transparent opacity-70 hover:opacity-100'
              )}>
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}