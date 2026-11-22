import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Full-page list of every listing photo; tapping one opens it full screen
export default function PhotoDump({ images, title, onClose, onSelect, paused }) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !paused) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, paused]);

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950">
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[860px] items-center justify-between gap-3 px-3 py-4 sm:px-4">
          <h2 className="truncate text-xl font-bold text-white sm:text-2xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('carPage.close')}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="mx-auto grid max-w-[860px] grid-cols-2 gap-1.5 px-3 pb-8 sm:grid-cols-3 sm:gap-2 sm:px-4">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-lg bg-slate-800">
            <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-md bg-slate-600/80 px-2 py-0.5 text-xs font-semibold text-white">
                {t('carPage.pictures_count', { count: images.length })}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}