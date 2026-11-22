import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { translateLocation } from '@/utils/locationUtils';

export default function ListSellerBlock({ dealer }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (!dealer) return null;

  const rating = Math.round(Number(dealer.rating) || 0);
  const reviews = Number(dealer.reviews_count) || 0;
  const place = translateLocation(t, dealer.city, dealer.country) || dealer.address || '';

  const goDealer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`${createPageUrl('DealerProfile')}?id=${dealer.id}`);
  };

  return (
    <button
      type="button"
      onClick={goDealer}
      className="group flex items-center gap-2.5 min-w-0 text-left"
      title={dealer.name}
    >
      {dealer.logo ? (
        <img
          src={dealer.logo}
          alt={dealer.name}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-white"
        />
      ) : (
        <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
          {(dealer.name || '?').slice(0, 2).toUpperCase()}
        </span>
      )}

      <span className="min-w-0">
        <span className="block font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-emerald-500 transition-colors">
          {dealer.name}
        </span>
        {place && (
          <span className="block text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {place}
          </span>
        )}
      </span>

      <span className="hidden sm:flex items-center gap-1 flex-shrink-0 ml-1">
        <span className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i <= rating
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-slate-300 fill-slate-300 dark:text-slate-700 dark:fill-slate-700'
              }`}
            />
          ))}
        </span>
        {reviews > 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">({reviews})</span>
        )}
      </span>
    </button>
  );
}