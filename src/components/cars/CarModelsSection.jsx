import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Car, Star } from 'lucide-react';
import CarModelGridSkeleton from '@/components/cars/CarModelGridSkeleton';

function RatingBadge({ rating }) {
  const color = rating >= 8 ? 'bg-emerald-400' : rating >= 6 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className={`${color} rounded-lg px-2.5 py-1 text-center`}>
      <span className="text-sm font-black text-white">{rating?.toFixed(1)}/10</span>
    </div>
  );
}

export default function CarModelsSection() {
  const { t } = useTranslation();
  const { data: models = [], isLoading } = useQuery({
    queryKey: ['publishedCarModels'],
    queryFn: () => base44.entities.CarModelInfo.filter({ is_published: true }, '-created_date', 6)
  });

  if (!isLoading && models.length === 0) return null;

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-baseline gap-3 mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{t('models.title')}</h2>
          {models.length > 0 && (
            <span className="text-2xl lg:text-3xl font-bold text-slate-300 dark:text-slate-600">
              {models.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <CarModelGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {models.map((model) => (
              <Link
                key={model.id}
                to={createPageUrl('CarModelDetails') + `?id=${model.id}`}
                className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg transition-all"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  {model.cover_image ? (
                    <img
                      src={model.cover_image}
                      alt={model.title}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-12 h-12 text-slate-300" />
                    </div>
                  )}

                  {/* Rating overlay */}
                  {model.user_rating > 0 && (
                    <div className="absolute top-3 right-3">
                      <RatingBadge rating={model.user_rating} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {model.title}
                      </h3>
                      {model.years && (
                        <p className="text-xs text-slate-400 mt-0.5">{model.years}</p>
                      )}
                    </div>

                  </div>

                  {model.short_description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {model.short_description}
                    </p>
                  )}

                  {model.body_types?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {model.body_types.slice(0, 3).map((bt) => (
                        <span key={bt} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                          {bt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}