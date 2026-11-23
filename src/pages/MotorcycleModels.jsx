import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { entities } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronDown, Bike, Loader2, Gauge, Zap, Calendar, Cog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

export default function MotorcycleModels() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandFilter = searchParams.get('brand');
  const brandsFilter = searchParams.get('brands');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const queryKey = brandFilter
    ? ['motorcycleModels', 'brand', brandFilter]
    : brandsFilter
      ? ['motorcycleModels', 'brands', brandsFilter]
      : ['motorcycleModels', 'all'];

  const { data: models = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (brandFilter) {
        return entities.MotorcycleModelInfo.filter({ brand: brandFilter }, 'model', 100000);
      } else if (brandsFilter) {
        const brandList = brandsFilter.split(',');
        const results = await Promise.all(
          brandList.map(b => entities.MotorcycleModelInfo.filter({ brand: b }, 'model', 100000))
        );
        return results.flat();
      }
      const [ascending, descending] = await Promise.all([
        entities.MotorcycleModelInfo.filter({}, 'brand', 100000),
        entities.MotorcycleModelInfo.filter({}, '-brand', 100000),
      ]);
      return [...ascending, ...descending];
    },
    staleTime: 5 * 60 * 1000,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000),
  });

  const categories = useMemo(() => {
    const set = new Set(models.map(m => m.category).filter(Boolean));
    return Array.from(set).sort();
  }, [models]);

  const filtered = useMemo(() => {
    let result = models;
    // Deduplicate by title
    const seen = new Set();
    result = result.filter(m => {
      if (!m.title || seen.has(m.title)) return false;
      seen.add(m.title);
      return true;
    });
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.title?.toLowerCase().includes(q) ||
        m.model?.toLowerCase().includes(q) ||
        m.brand?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter(m => m.category === categoryFilter);
    }
    return result;
  }, [models, search, categoryFilter]);

  const brandTitle = brandFilter || (brandsFilter ? brandsFilter.split(',').join(', ') : '');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-[104px] md:pt-[120px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.back', 'Назад')}
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Bike className="w-7 h-7 text-emerald-500" />
          {brandTitle
            ? `${t('moto_models.title_brand', 'Мотоциклы')} ${brandTitle}`
            : t('moto_models.title_all', 'Все мотоциклы')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {filtered.length} {t('moto_models.count', 'моделей')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t('moto_models.search_placeholder', 'Поиск по модели...')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {categories.length > 1 && (
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="appearance-none px-3 py-2 pr-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="all">{t('moto_models.all_categories', 'Все категории')}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bike className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('moto_models.not_found', 'Модели не найдены')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((model) => (
              <Link
                key={model.id}
                to={`/MotorcycleModelDetails?id=${model.id}`}
                className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg transition-all"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm leading-tight">
                        {model.title}
                      </h3>
                      {model.category && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{model.category}</p>
                      )}
                    </div>
                    {model.rating > 0 && (
                      <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1 text-center flex-shrink-0">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{model.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400 block leading-none">/5</span>
                      </div>
                    )}
                  </div>

                  {model.year_start && (
                    <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {model.year_start}{model.year_end && model.year_end !== model.year_start ? ` — ${model.year_end}` : ''}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {model.displacement_cc > 0 && (
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                        <span>{Math.round(model.displacement_cc)} {t('moto_specs.cc', 'куб.см')}</span>
                      </div>
                    )}
                    {model.power_hp > 0 && (
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        <span>{Math.round(model.power_hp)} {t('moto_specs.hp', 'л.с.')}</span>
                      </div>
                    )}
                    {model.dry_weight_kg > 0 && (
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Cog className="w-3.5 h-3.5 text-slate-400" />
                        <span>{Math.round(model.dry_weight_kg)} {t('moto_specs.kg', 'кг')}</span>
                      </div>
                    )}
                    {model.cooling_system && (
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <span className="w-3.5 h-3.5" />
                        <span>{model.cooling_system}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}