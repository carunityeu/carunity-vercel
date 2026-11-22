import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import {
  Search,
  Building2,
  MapPin,
  Star,
  CheckCircle,
  Car,
  ChevronLeft,
  Loader2,
  SlidersHorizontal,
  ShieldCheck,
  X } from
'lucide-react';
import { translateCity, translateCountry } from '@/utils/locationUtils';
import ListPagination from '@/components/ui/ListPagination';
import useDealerDirectory from '@/hooks/useDealerDirectory';

export default function Dealers() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('cars');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const { data, isSearching: isLoading, error, refetch } = useDealerDirectory({ searchQuery, selectedCountry, selectedCity, verifiedOnly, sortBy, page, language: i18n.language });
  const pagedDealers = data?.items || [];
  const carCounts = Object.fromEntries(pagedDealers.map(dealer => [dealer.id, dealer.car_count]));
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countryOptions = [
    { value: 'all', label: t('dealers.all_countries') },
    ...['Latvia', 'Lithuania', 'Estonia'].map(country => ({ value: country, label: translateCountry(t, country) }))
  ];
  const cityOptions = useMemo(() => {
    const cities = new Map();
    (data?.cities || []).forEach(city => {
      const label = translateCity(t, city);
      if (!cities.has(label)) cities.set(label, { value: city, label });
    });
    return [{ value: 'all', label: t('dealers.all_cities') }, ...[...cities.values()].sort((a, b) => a.label.localeCompare(b.label, i18n.language))];
  }, [data?.cities, t, i18n.language]);
  const sortOptions = [
    { value: 'cars', label: t('dealers.sort_by_cars') },
    { value: 'rating', label: t('dealers.sort_by_rating') },
    { value: 'name', label: t('dealers.sort_by_name') },
    { value: 'newest', label: t('dealers.sort_by_newest') }
  ];
  useEffect(() => { setPage(1); }, [searchQuery, selectedCountry, selectedCity, verifiedOnly, sortBy]);
  const activeFiltersCount = (selectedCountry !== 'all' ? 1 : 0) + (selectedCity !== 'all' ? 1 : 0) + (verifiedOnly ? 1 : 0) + (sortBy !== 'cars' ? 1 : 0);

  const resetFilters = () => {
    setSelectedCountry('all');
    setSelectedCity('all');
    setVerifiedOnly(false);
    setSortBy('cars');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm mb-4">
            
            <ChevronLeft className="w-4 h-4" />
            {t('common.back', 'Назад')}
          </button>
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {t('dealers.title')}
            </h1>
            <p className="text-slate-400">
              {t('dealers.subtitle', { count: data?.allTotal || 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-3 sm:p-4 border border-slate-100 dark:border-slate-800">
          {/* Search row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder={t('dealers.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11" />
              
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-44 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) =>
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Filter chips row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="h-9 w-auto min-w-[120px] text-sm border-slate-200 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((opt) =>
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-9 w-auto min-w-[120px] text-sm border-slate-200 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((opt) =>
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium border transition-colors ${
              verifiedOnly ?
              'bg-emerald-500 text-white border-emerald-500' :
              'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'}`
              }>
              
              <ShieldCheck className="w-4 h-4" />
              {t('dealers.verified_only', 'Проверенные')}
            </button>
            {activeFiltersCount > 0 &&
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 h-9 px-3 rounded-lg text-sm text-slate-500 hover:text-red-500 transition-colors">
              
                <X className="w-3.5 h-3.5" />
                {t('catalog.reset', 'Сбросить')}
              </button>
            }
            <span className="ml-auto text-sm text-slate-400 hidden sm:block">
              {total} {t('dealers.count_label', 'салонов')}
            </span>
          </div>
        </div>
      </div>

      {/* Dealers List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ?
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div> :
        error ? <div className="py-12 text-center"><p className="text-muted-foreground mb-4">{t('dealers.load_error')}</p><Button variant="outline" onClick={() => refetch()}>{t('dealers.retry')}</Button></div> :
        total === 0 ?
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <Building2 className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('dealers.not_found_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">{t('dealers.not_found_desc')}</p>
            {activeFiltersCount > 0 &&
          <Button onClick={resetFilters} variant="outline" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                {t('catalog.reset_filters')}
              </Button>
          }
          </div> :

        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {pagedDealers.map((dealer) => {
            const cityTranslated = dealer.city ? translateCity(t, dealer.city) || dealer.city : '';
            const countryTranslated = dealer.country ? translateCountry(t, dealer.country) || dealer.country : '';
            return (
              <Link
                key={dealer.id}
                to={createPageUrl('DealerProfile') + `?id=${dealer.id}`}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg dark:hover:shadow-emerald-900/10 transition-all flex flex-col">
                
                  {/* Cover */}
                  <div className="relative h-28 sm:h-32 bg-slate-100 dark:bg-slate-800">
                    {dealer.cover_image ?
                  <img src={dealer.cover_image} alt="" className="w-full h-full object-cover" /> :

                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700" />
                  }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {dealer.is_verified &&
                  <div className="absolute top-2 right-2">
                        <Badge className="bg-emerald-500/90 text-white border-0 gap-1 text-xs px-2 py-1">
                          <CheckCircle className="w-3 h-3" />
                          {t('car.verified', 'Проверен')}
                        </Badge>
                      </div>
                  }
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 pt-0 -mt-8 relative flex-1 flex flex-col">
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center border-2 border-white dark:border-slate-700 flex-shrink-0 mb-3">
                      {dealer.logo ?
                    <img src={dealer.logo} alt={dealer.name} className="w-full h-full object-cover rounded-[10px]" /> :

                    <Building2 className="w-7 h-7 text-slate-400" />
                    }
                    </div>

                    {/* Name */}
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {dealer.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm mt-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                      <span className="truncate">
                        {cityTranslated}{countryTranslated ? `, ${countryTranslated}` : ''}
                      </span>
                    </div>

                    {/* Description */}
                    {(() => {
                    const lang = i18n.language?.split('-')[0];
                    const localizedDesc = dealer[`description_${lang}`] || dealer.description;
                    return localizedDesc ?
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                          {localizedDesc}
                        </p> :
                    null;
                  })()}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Car className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {carCounts[dealer.id] || 0}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {t('catalog.cars')}
                        </span>
                      </div>
                      {dealer.rating ?
                    <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {dealer.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({dealer.reviews_count || 0})
                          </span>
                        </div> :
                    null}
                    </div>

                    {/* Brands */}
                    {dealer.brands?.length > 0 &&
                  <div className="flex flex-wrap gap-1 mt-3">
                        {dealer.brands.slice(0, 4).map((brand) =>
                    <Badge key={brand} className="text-xs font-normal bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20">
                            {brand === 'Volkswagen' ? 'VW' : brand}
                          </Badge>
                    )}
                        {dealer.brands.length > 4 &&
                    <Badge className="text-xs font-normal bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20">
                            +{dealer.brands.length - 4}
                          </Badge>
                    }
                      </div>
                  }
                  </div>
                </Link>);

          })}
          </div>
          <ListPagination page={data?.page || page} totalPages={totalPages} onPageChange={setPage} />
          </>
        }
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 sm:p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">
            {t('dealers.cta_title')}
          </h2>
          <p className="text-emerald-50 mb-6 max-w-xl mx-auto">
            {t('dealers.cta_desc')}
          </p>
          <Link to={createPageUrl('DealerRegister')}>
            <Button className="bg-white text-emerald-600 hover:bg-emerald-50 gap-2">
              <Building2 className="w-4 h-4" />
              {t('dealers.cta_btn')}
            </Button>
          </Link>
        </div>
      </div>
    </div>);

}