import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTranslation } from 'react-i18next';
import { Search, Trash2, Tag, Calendar, Car, Fuel, Settings2, Gauge, MapPin, Zap, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ru, enUS, et, lv, lt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import DiscountTag from '@/components/cars/DiscountTag';

const CARD = 'bg-[#1b1b22] border border-[#292a32]';
const localeMap = { ru, en: enUS, et, lv, lt };

function FilterChip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-[#292a32] border border-[#292a32] rounded-md px-2 py-1">

      <span className="truncate max-w-[140px]">{label}</span>
    </span>
  );
}

export default function SavedSearchesTab({ savedSearches, onDelete, onToggleIamLooking }) {
  const { t, i18n } = useTranslation();
  const dateLocale = localeMap[i18n.language?.slice(0, 2)] || ru;

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'd MMM yyyy', { locale: dateLocale });
    } catch {
      return '';
    }
  };

  const buildChips = (filters) => {
    if (!filters) return [];
    const chips = [];

    if (filters.brand) chips.push({ icon: Tag, label: filters.brand });
    if (filters.model) chips.push({ icon: Tag, label: filters.model });

    if (filters.priceFrom || filters.priceTo) {
      const text = filters.priceFrom && filters.priceTo
        ? `${filters.priceFrom}–${filters.priceTo} €`
        : filters.priceFrom
          ? `${t('catalog.price_from', 'from')} ${filters.priceFrom} €`
          : `${t('catalog.price_to', 'to')} ${filters.priceTo} €`;
      chips.push({ icon: Tag, label: text });
    }

    if (filters.yearFrom || filters.yearTo) {
      const text = filters.yearFrom && filters.yearTo
        ? `${filters.yearFrom}–${filters.yearTo}`
        : filters.yearFrom
          ? `${t('catalog.year_from', 'from')} ${filters.yearFrom}`
          : `${t('catalog.year_to', 'to')} ${filters.yearTo}`;
      chips.push({ icon: Calendar, label: text });
    }

    if (filters.bodyType) chips.push({ icon: Car, label: t('body_types.' + filters.bodyType, filters.bodyType) });
    if (filters.fuelType) chips.push({ icon: Fuel, label: t('fuel_types.' + filters.fuelType, filters.fuelType) });
    if (filters.transmission) chips.push({ icon: Settings2, label: t('transmission_types.' + filters.transmission, filters.transmission) });

    if (filters.mileageTo) chips.push({ icon: Gauge, label: `${t('catalog.mileage_to', 'to')} ${filters.mileageTo} km` });

    if (filters.country) chips.push({ icon: MapPin, label: filters.country });

    if (filters.enginePowerFrom || filters.enginePowerTo) {
      const text = filters.enginePowerFrom && filters.enginePowerTo
        ? `${filters.enginePowerFrom}–${filters.enginePowerTo} ${t('catalog.power_unit', 'hp')}`
        : filters.enginePowerFrom
          ? `${t('catalog.power_from', 'from')} ${filters.enginePowerFrom} ${t('catalog.power_unit', 'hp')}`
          : `${t('catalog.power_to', 'to')} ${filters.enginePowerTo} ${t('catalog.power_unit', 'hp')}`;
      chips.push({ icon: Zap, label: text });
    }

    return chips;
  };

  if (savedSearches.length === 0) {
    return (
      <div className={cn(CARD, 'rounded-xl p-8 sm:p-10 text-center')}>

        <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.no_searches_title')}</h3>
        <p className="text-slate-500 text-sm mb-6">{t('dashboard.no_searches_desc')}</p>
        <Link to={createPageUrl('Catalog')}>
          <Button variant="outline" className="bg-secondary text-foreground hover:bg-accent">{t('dashboard.go_catalog')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-3 bg-[#292a32] border border-[#292a32] rounded-xl flex items-start gap-3">
        <Bell className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-white font-medium">{t('dashboard.iam_looking_title')}</p>
          <p className="text-xs text-slate-400 mt-0.5">{t('dashboard.iam_looking_desc')}</p>
        </div>
      </div>
      {savedSearches.map((search) => {
        const chips = buildChips(search.filters);
        const catalogUrl = createPageUrl('Catalog') + '?' + new URLSearchParams(search.filters || {}).toString();
        return (
          <div key={search.id} className={cn(CARD, 'rounded-xl p-4')}>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-white text-sm break-words">{search.name?.replace(/,\s*[\d\s.,]*[–-][\d\s.,]*€\s*$/, '').trim() || t('dashboard.saved_search')}</h3>
                    {(search.filters?.priceFrom || search.filters?.priceTo) && <DiscountTag label={chips.find(chip => chip.label.includes('€'))?.label} />}
                    {search.is_i_am_looking && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-1.5 py-0.5 flex-shrink-0">
                        <Bell className="w-3 h-3" />
                        <span className="hidden sm:inline">{t('dashboard.iam_looking_badge')}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(search.created_date)}</p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Link to={catalogUrl}>
                  <Button size="sm" variant="outline" className="h-9 text-foreground bg-secondary border-border hover:bg-accent">
                    <span>{t('dashboard.open')}</span>
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 h-9 px-3 text-foreground bg-secondary border border-border hover:bg-accent"
                  aria-pressed={!!search.is_i_am_looking}
                  onClick={() => onToggleIamLooking(search.id, search.is_i_am_looking)}
                  title={t('dashboard.iam_looking')}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{search.is_i_am_looking ? t('dashboard.iam_looking_active') : t('dashboard.iam_looking')}</span>
                </Button>
                <Button size="sm" variant="ghost" aria-label={t('dashboard.remove')} className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 h-9 w-9 p-0" onClick={() => onDelete(search.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {chips.filter(chip => !chip.label.includes('€')).map((chip, idx) => (
                  <FilterChip key={idx} icon={chip.icon} label={chip.label} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}