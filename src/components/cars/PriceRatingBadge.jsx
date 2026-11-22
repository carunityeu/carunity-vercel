import React from 'react';
import { useTranslation } from 'react-i18next';

const LABEL_KEYS = {
  5: 'car.price_rating.very_good',
  4: 'car.price_rating.good',
  3: 'car.price_rating.fair',
  2: 'car.price_rating.high',
  1: 'car.price_rating.overpriced'
};

export default function PriceRatingBadge({ score, showLabel = true, className = '' }) {
  const { t } = useTranslation();
  if (!score || !LABEL_KEYS[score]) return null;

  return (
    <div className={`flex flex-col items-start gap-1 flex-shrink-0 ${className}`} title={t('car.price_rating.hint')}>
      <div className="flex items-center gap-[3px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-[6px] w-2.5 sm:h-[7px] sm:w-3.5 rounded-[2px] ${i <= score ? 'bg-[#4F7959]' : 'bg-white/15'}`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-[10px] sm:text-[11px] leading-none font-medium text-[#D1D5DB] whitespace-nowrap">
          {t(LABEL_KEYS[score])}
        </span>
      )}
    </div>
  );
}