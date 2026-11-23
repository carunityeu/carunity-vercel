import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, Heart, MapPin, Fuel, Gauge, Calendar, SlidersHorizontal, RotateCcw } from 'lucide-react';
import ListPagination from '@/components/ui/ListPagination';

export default function LuxuryBrand() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const brand = params.get('brand') || '';

  const { data: brandInfo } = useQuery({
    queryKey: ['luxuryBrandInfo', brand],
    queryFn: () => entities.LuxuryBrand.filter({ name: brand, is_published: true }, 'sort_order', 1).then(r => r[0]),
    enabled: !!brand
  });

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['luxuryBrand', brand],
    queryFn: () => entities.LuxuryCar.filter({ brand, is_published: true }, '-created_date'),
    enabled: !!brand
  });

  // Filter state
  const [filterModel, setFilterModel] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [filterYearMin, setFilterYearMin] = useState('');
  const [filterYearMax, setFilterYearMax] = useState('');
  const [filterMileageMin, setFilterMileageMin] = useState('');
  const [filterMileageMax, setFilterMileageMax] = useState('');
  const [filterFuel, setFilterFuel] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const models = useMemo(() => [...new Set(cars.map(c => c.model).filter(Boolean))].sort(), [cars]);

  const filtered = useMemo(() => {
    let result = [...cars];
    if (filterModel) result = result.filter(c => c.model === filterModel);
    if (filterPriceMin) result = result.filter(c => c.price >= Number(filterPriceMin));
    if (filterPriceMax) result = result.filter(c => c.price <= Number(filterPriceMax));
    if (filterYearMin) result = result.filter(c => c.year >= Number(filterYearMin));
    if (filterYearMax) result = result.filter(c => c.year <= Number(filterYearMax));
    if (filterMileageMin) result = result.filter(c => c.mileage >= Number(filterMileageMin));
    if (filterMileageMax) result = result.filter(c => c.mileage <= Number(filterMileageMax));
    if (filterFuel) result = result.filter(c => c.fuel_type === filterFuel);
    if (sortBy === 'newest') result.sort((a, b) => (b.year || 0) - (a.year || 0));
    else if (sortBy === 'price_asc') result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === 'price_desc') result.sort((a, b) => (b.price || 0) - (a.price || 0));
    return result;
  }, [cars, filterModel, filterPriceMin, filterPriceMax, filterYearMin, filterYearMax, filterMileageMin, filterMileageMax, filterFuel, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedCars = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filterModel, filterPriceMin, filterPriceMax, filterYearMin, filterYearMax, filterMileageMin, filterMileageMax, filterFuel, sortBy]);

  const resetFilters = () => {
    setFilterModel(''); setFilterPriceMin(''); setFilterPriceMax('');
    setFilterYearMin(''); setFilterYearMax(''); setFilterMileageMin('');
    setFilterMileageMax(''); setFilterFuel('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Back + Breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('common.back', 'Назад')}
          </button>
          <span className="text-slate-600">|</span>
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">{t('breadcrumb.home', 'Главная')}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/LuxuryBrand" className="hover:text-white transition-colors">{t('luxury.title')}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{brand}</span>
          </nav>
        </div>

        {/* Brand header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {brandInfo?.logo ? (
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: `${brandInfo.logo_width || 64}px`, height: '64px' }}>
                <img src={brandInfo.logo} alt={brand} className="w-full h-full object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl font-black">{brand[0]}</div>
            )}
            <div>
              <h1 className="text-3xl font-black text-white">{brand}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{cars.length} {t('catalog.cars')}</p>
            </div>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2 outline-none cursor-pointer"
          >
            <option value="newest">{t('catalog.sort_newest')}</option>
            <option value="price_asc">{t('catalog.sort_price_asc')}</option>
            <option value="price_desc">{t('catalog.sort_price_desc')}</option>
          </select>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className="hidden lg:flex flex-col gap-5 w-72 flex-shrink-0 max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="bg-slate-900 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-white font-semibold">
                   <SlidersHorizontal className="w-4 h-4" /> {t('catalog.filters')}
                </div>
                <button onClick={resetFilters} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> {t('catalog.reset_all')}
                </button>
              </div>

              {/* Model */}
              <div className="mb-5">
                <label className="text-xs text-slate-400 font-medium mb-2 block">{t('home.search_model')}</label>
                <select value={filterModel} onChange={e => setFilterModel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none">
                  <option value="">{t('luxury.all_models')}</option>
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Price */}
              <div className="mb-5">
                <label className="text-xs text-slate-400 font-medium mb-2 block">{t('luxury.price_eur')}</label>
                <div className="flex gap-2">
                  <input type="number" placeholder={t('luxury.from')} value={filterPriceMin} onChange={e => setFilterPriceMin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none placeholder-slate-600" />
                  <input type="number" placeholder={t('luxury.to')} value={filterPriceMax} onChange={e => setFilterPriceMax(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none placeholder-slate-600" />
                </div>
              </div>

              {/* Year */}
              <div className="mb-5">
                <label className="text-xs text-slate-400 font-medium mb-2 block">{t('car.spec_year')}</label>
                <div className="flex gap-2">
                  <input type="number" placeholder={t('luxury.from')} value={filterYearMin} onChange={e => setFilterYearMin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none placeholder-slate-600" />
                  <input type="number" placeholder={t('luxury.to')} value={filterYearMax} onChange={e => setFilterYearMax(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none placeholder-slate-600" />
                </div>
              </div>

              {/* Mileage */}
              <div className="mb-5">
                <label className="text-xs text-slate-400 font-medium mb-2 block">{t('luxury.mileage_km')}</label>
                <div className="flex gap-2">
                  <input type="number" placeholder={t('luxury.from')} value={filterMileageMin} onChange={e => setFilterMileageMin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none placeholder-slate-600" />
                  <input type="number" placeholder={t('luxury.to')} value={filterMileageMax} onChange={e => setFilterMileageMax(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none placeholder-slate-600" />
                </div>
              </div>

              {/* Fuel */}
              <div className="mb-6">
                <label className="text-xs text-slate-400 font-medium mb-2 block">{t('car.spec_fuel')}</label>
                <select value={filterFuel} onChange={e => setFilterFuel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none">
                  <option value="">{t('home.any_fuel')}</option>
                  {['petrol','diesel','electric','hybrid','plugin_hybrid','gas'].map(k => <option key={k} value={k}>{t('fuel_types.' + k)}</option>)}
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
              >
                {t('luxury.show_count', { count: filtered.length })}
              </button>
            </div>
          </aside>

          {/* Cars grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-20 text-slate-400">{t('catalog.loading')}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400">{t('luxury.no_cars')}</div>
            ) : (
              <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {pagedCars.map(car => (
                  <Link key={car.id} to={`/LuxuryCarDetails?id=${car.id}`} className="group">
                    <div className="bg-slate-900 rounded-2xl overflow-hidden hover:ring-1 hover:ring-emerald-500 transition-all duration-200">
                      {/* Image */}
                      <div className="relative bg-slate-800 overflow-hidden" style={{ height: '180px' }}>
                        {car.image ? (
                          <img src={car.image} alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">{t('luxury.photo_soon')}</div>
                        )}
                        {car.badge && (
                          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                            {car.badge}
                          </div>
                        )}
                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors">
                          <Heart className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-white text-sm leading-tight mb-1">
                          {car.brand} {car.model}
                          {car.subtitle && <span className="text-slate-400 font-normal"> {car.subtitle}</span>}
                        </h3>
                        {car.price && (
                          <p className="text-emerald-400 font-bold text-base mb-3">
                            {car.price.toLocaleString('ru-RU')} €
                          </p>
                        )}

                        {/* Specs badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {car.year && (
                            <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 rounded-lg px-2 py-1">
                              <Calendar className="w-3 h-3" />{car.year}
                            </span>
                          )}
                          {car.mileage && (
                            <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 rounded-lg px-2 py-1">
                              <Gauge className="w-3 h-3" />{car.mileage.toLocaleString('ru-RU')} {t('car.km')}
                            </span>
                          )}
                          {car.fuel_type && (
                            <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 rounded-lg px-2 py-1">
                              <Fuel className="w-3 h-3" />{t('fuel_types.' + car.fuel_type, car.fuel_type)}
                            </span>
                          )}
                        </div>

                        {/* Location */}
                        {car.description && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{car.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}