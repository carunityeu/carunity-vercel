import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { entities } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
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
  Car,
  Shield,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Building2,
  ChevronRight,
  Star,
  CheckCircle,
  Fuel,
  Calendar,
  Clock,
  Gauge,
  Cog,
  MapPin,
  X,
  Heart,
  MessageCircle,
  GitCompare, SlidersHorizontal } from
'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CarCard from '@/components/cars/CarCard';
import FeaturedCardImage from '@/components/cars/FeaturedCardImage';
import ListingCard from '@/components/cars/ListingCard';
import CompactCarCard from '@/components/cars/CompactCarCard';
import CarGridSkeleton from '@/components/cars/CarGridSkeleton';
import TransmissionOrEnergy from '@/components/cars/TransmissionOrEnergy';
import TileActions from '@/components/cars/TileActions';
import { isElectricAccent } from '@/lib/electricAccent';
import PriceRatingBadge from '@/components/cars/PriceRatingBadge';
import DiscountTag from '@/components/cars/DiscountTag';
import PromoPhotoFrame from '@/components/cars/PromoPhotoFrame';
import { fuelChip } from '@/lib/fuelBadge';
import useCardExtras from '@/hooks/useCardExtras';
import RecentlyViewedCard from '@/components/cars/RecentlyViewedCard';
import LuxurySection from '@/components/cars/LuxurySection';
import NewsSection from '@/components/cars/NewsSection';
import CarModelsSection from '@/components/cars/CarModelsSection';
import { generationsDB } from '@/components/search/GenerationPicker';
import { useCompare } from '@/components/compare/CompareContext';
import { useFavorites } from '@/components/favorites/FavoritesContext';
import { getModelsForBrand } from '@/utils/carData';
import { translateCountry, translateCity, CITIES_BY_COUNTRY } from '@/utils/locationUtils';
import MiniSearchSelect from '@/components/search/MiniSearchSelect';
import ContextSearchBar from '@/components/search/ContextSearchBar';
import HeroSection from '@/components/home/HeroSection';
import AdBanner from '@/components/ads/AdBanner';
import { ChevronDown as ChevronDownIcon } from 'lucide-react';
import FeaturesFilter from '@/components/search/FeaturesFilter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import VehicleTypeFilters from '@/components/search/VehicleTypeFilters';
import RecentActivityBlock from '@/components/home/RecentActivityBlock';
import QuickAccessPanel from '@/components/home/QuickAccessPanel';
import CaroBanner from '@/components/caro/CaroBanner';

const allBrands = [
'Abarth', 'Acura', 'Aiways', 'Alfa Romeo', 'Alpine', 'Arcfox', 'Ariel',
'Aston Martin', 'Audi', 'BAIC', 'Baojun', 'Bentley', 'BMW', 'Brilliance',
'Bugatti', 'Buick', 'BYD', 'BYTON', 'Cadillac', 'Changan', 'Chery',
'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Daihatsu', 'Datsun',
'DeLorean', 'Dodge', 'Dongfeng', 'DS', 'Exeed', 'FAW', 'Ferrari', 'Fiat',
'Fisker', 'Ford', 'Foton', 'GAC', 'Geely', 'Genesis', 'GMC', 'Great Wall',
'Haval', 'Honda', 'Hongqi', 'Hummer', 'Hyundai', 'Ineos', 'Infiniti',
'Isuzu', 'JAC', 'Jaguar', 'Jeep', 'Kia', 'Koenigsegg', 'Lada',
'Lamborghini', 'Lancia', 'Land Rover', 'Leapmotor', 'Lexus', 'Li Auto',
'Lifan', 'Lincoln', 'Lotus', 'Lucid', 'Mahindra', 'Maserati', 'Maybach',
'Mazda', 'McLaren', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi', 'NIO',
'Nissan', 'Oldsmobile', 'Opel', 'Pagani', 'Peugeot', 'Perodua', 'Polestar',
'Pontiac', 'Porsche', 'Proton', 'Ram', 'Renault', 'Rivian', 'Rolls-Royce',
'Saab', 'Scion', 'Seat', 'Skoda', 'Skywell', 'Smart', 'SsangYong',
'Subaru', 'Suzuki', 'Tata', 'Tesla', 'Toyota', 'Vauxhall', 'VinFast',
'Volkswagen', 'Volvo', 'Wey', 'XPeng', 'ZEEKR'];

const bodyTypes = [
{ value: 'sedan' },
{ value: 'suv' },
{ value: 'hatchback' },
{ value: 'wagon' },
{ value: 'coupe' }];

const fuelTypes = [
{ value: 'petrol' },
{ value: 'diesel' },
{ value: 'electric' },
{ value: 'hybrid' },
{ value: 'plugin_hybrid' },
{ value: 'gas' },
{ value: 'petrol_cng' },
{ value: 'petrol_lng' },
{ value: 'diesel_cng' },
{ value: 'diesel_lng' },
{ value: 'lpg' },
{ value: 'cng' },
{ value: 'lng' },
{ value: 'hydrogen' },
{ value: 'ethanol' }];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

const countryCities = CITIES_BY_COUNTRY;




export default function Home() {
  const { t } = useTranslation();
  const { addCar, removeCar, isInCompare } = useCompare();
  const { isFavorite, toggleFavorite } = useFavorites();
  const stats = [
  { value: '50 000+', labelKey: 'home.stats_listings', icon: Car },
  { value: '12 000+', labelKey: 'home.stats_happy_clients', icon: Users },
  { value: '500+', labelKey: 'home.stats_dealers', icon: Building2 },
  { value: '99%', labelKey: 'home.stats_verified', icon: Shield }];

  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [vehicleCategory, setVehicleCategory] = useState('car');
  const [vehicleTypeExpanded, setVehicleTypeExpanded] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [searchBrands, setSearchBrands] = useState([]);
  const [searchModel, setSearchModel] = useState('');
  const [searchBodyType, setSearchBodyType] = useState('');
  const [searchFuelType, setSearchFuelType] = useState('');
  const [searchYearFrom, setSearchYearFrom] = useState('');
  const [searchPriceFrom, setSearchPriceFrom] = useState('');
  const [searchPriceTo, setSearchPriceTo] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [powerRange, setPowerRange] = useState([0, 400]);
  const [searchPowerFrom, setSearchPowerFrom] = useState('');
  const [searchPowerTo, setSearchPowerTo] = useState('');
  const [usePriceSlider, setUsePriceSlider] = useState(false);
  const [usePowerSlider, setUsePowerSlider] = useState(false);
  const [searchPowerUnit, setSearchPowerUnit] = useState('hp');
  const [searchMileageTo, setSearchMileageTo] = useState('');
  const [searchTransmission, setSearchTransmission] = useState('');
  const [searchDriveType, setSearchDriveType] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchColor, setSearchColor] = useState('');
  const [searchCondition, setSearchCondition] = useState([]); // 'used' | 'new'
  const [searchFeatures, setSearchFeatures] = useState([]);
  const [searchNoVat, setSearchNoVat] = useState(false);
  const [vehicleFilters, setVehicleFilters] = useState({});

  const availableModels = searchBrands.length > 0 ?
  (() => {
    const allModels = searchBrands.flatMap((b) => {
      const csvModels = getModelsForBrand(b);
      const genModels = Object.keys(generationsDB[b] || {});
      return [...csvModels, ...genModels];
    });
    return [...new Set(allModels)].sort((a, b) => a.localeCompare(b));
  })() :
  [];

  const { data: brandCars = [] } = useQuery({
    queryKey: ['brandCarsForCount', searchBrands[0]],
    queryFn: () => entities.Car.filter({ status: 'active', brand: searchBrands[0] }, '-created_date', 100),
    enabled: searchBrands.length > 0,
    staleTime: 10 * 60 * 1000
  });

  const modelCounts = useMemo(() => {
    const counts = {};
    brandCars.forEach((car) => {
      if (car.model) counts[car.model] = (counts[car.model] || 0) + 1;
    });
    return counts;
  }, [brandCars]);
  const availableGenerations = searchBrands.length === 1 && searchModel ? generationsDB[searchBrands[0]]?.[searchModel] || [] : [];
  const [selectedGenerations, setSelectedGenerations] = useState([]);
  const [useGenerations, setUseGenerations] = useState(false); // true = показывать поколения, false = год от/до
  const [searchYearTo, setSearchYearTo] = useState('');

  const [featuredTab, setFeaturedTab] = useState('used');

  // Single merged query for home car listings — replaces 3 separate queries (promotedCars 60, dealerCarsHero 5, latestCars 80)
  const { data: activeCars = [], isLoading: loadingLatest } = useQuery({
    queryKey: ['homeActiveCars'],
    queryFn: () => entities.Car.filter({ status: 'active' }, '-created_date', 80),
    staleTime: 5 * 60 * 1000
  });

  const hasPhoto = (c) => Array.isArray(c.images) && typeof c.images[0] === 'string' && c.images[0].trim().startsWith('http');

  const { data: landingTopCar, isLoading: loadingTopCar } = useQuery({
    queryKey: ['homeTopCar', '6acc10916a11ff189c3417cc'],
    queryFn: () => entities.Car.get('6acc10916a11ff189c3417cc'),
    staleTime: 5 * 60 * 1000
  });

  const promotedCars = useMemo(() => {
    const candidates = [...(activeCars || []).filter(hasPhoto)].sort((a, b) => (b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0));
    if (landingTopCar?.status === 'active' && hasPhoto(landingTopCar)) {
      return [landingTopCar, ...candidates.filter(car => car.id !== landingTopCar.id)].slice(0, 5);
    }
    return candidates.slice(0, 5);
  }, [activeCars, landingTopCar]);

  const latestCars = useMemo(() =>
  [...(activeCars || []).filter(hasPhoto)].slice(0, 16),
  [activeCars]
  );

  const latestCarsMore = useMemo(() =>
  [...(activeCars || []).filter(hasPhoto)].slice(16, 32),
  [activeCars]
  );

  // Price rating + active promotion for the tiles shown below
  const tileCars = useMemo(() => [...latestCars, ...latestCarsMore], [latestCars, latestCarsMore]);
  const { ratings: tileRatings, promotions: tilePromotions } = useCardExtras(tileCars);

  // Price rating + active promotion for the hero "Top cars" block
  const { ratings: heroRatings, promotions: heroPromotions } = useCardExtras(promotedCars);

  const loadingPromoted = loadingLatest || loadingTopCar;

  const handleSearch = () => {
    // Non-car types go to VehicleCatalog
    if (selectedVehicleType && selectedVehicleType !== 'car') {
      const params = new URLSearchParams({ type: selectedVehicleType });
      Object.entries(vehicleFilters).forEach(([k, v]) => {
        if (!v || v === 'any') return;
        if (k === 'priceRange') {
          if (Array.isArray(v) && v[0] > 0) params.set('priceFrom', v[0].toString());
          if (Array.isArray(v) && v[1] < 200000) params.set('priceTo', v[1].toString());
        } else if (k === 'powerRange') {
          if (Array.isArray(v) && v[0] > 0) params.set('powerFrom', Math.round(v[0] * 1.36).toString());
          if (Array.isArray(v) && v[1] < 400) params.set('powerTo', Math.round(v[1] * 1.36).toString());
        } else {
          params.set(k, v);
        }
      });
      if (selectedVehicleType === 'moto') {
        if (priceRange[0] > 0) params.set('priceFrom', priceRange[0].toString());
        if (priceRange[1] < 200000) params.set('priceTo', priceRange[1].toString());
        if (powerRange[0] > 0) params.set('powerFrom', Math.round(powerRange[0] * 1.36).toString());
        if (powerRange[1] < 400) params.set('powerTo', Math.round(powerRange[1] * 1.36).toString());
        if (searchCountry && searchCountry !== 'any') params.set('country', searchCountry);
        if (searchColor && searchColor !== 'any') params.set('color', searchColor);
        if (searchTransmission && searchTransmission !== 'any') params.set('transmission', searchTransmission);
      }
      window.location.href = createPageUrl('VehicleCatalog') + '?' + params.toString();
      return;
    }

    let url = createPageUrl('Catalog');
    const params = new URLSearchParams();
    if (searchBrands.length > 1) {
      params.set('brands', searchBrands.join(','));
    } else if (searchBrands.length === 1) {
      params.set('brand', searchBrands[0]);
    } else if (searchBrand && searchBrand !== 'any') {
      params.set('brand', searchBrand);
    }
    if (searchModel && searchModel !== 'any') params.set('model', searchModel);
    if (searchBodyType && searchBodyType !== 'any') params.set('bodyType', searchBodyType);
    if (searchFuelType && searchFuelType !== 'any') params.set('fuelType', searchFuelType);
    if (!useGenerations || availableGenerations.length === 0) {
      if (searchYearFrom && searchYearFrom !== 'any') params.set('yearFrom', searchYearFrom);
      if (searchYearTo && searchYearTo !== 'any') params.set('yearTo', searchYearTo);
    } else if (selectedGenerations.length > 0) {
      // Find min/max years from selected generations
      const genData = availableGenerations.filter((g) => selectedGenerations.includes(g.code));
      const allYears = genData.flatMap((g) => {
        const parts = g.years.split('–').map((s) => s.trim());
        return parts.filter((p) => /^\d{4}$/.test(p)).map(Number);
      });
      if (allYears.length > 0) {
        params.set('yearFrom', Math.min(...allYears).toString());
        params.set('yearTo', Math.max(...allYears).toString());
      }
    }
    if (priceRange[0] > 0) params.set('priceFrom', priceRange[0].toString());
    if (priceRange[1] < 200000) params.set('priceTo', priceRange[1].toString());
    if (powerRange[0] > 0) params.set('powerFrom', Math.round(powerRange[0] * 1.36).toString());
    if (powerRange[1] < 400) params.set('powerTo', Math.round(powerRange[1] * 1.36).toString());
    if (searchMileageTo) params.set('mileageTo', searchMileageTo);
    if (searchColor && searchColor !== 'any') params.set('color', searchColor);
    if (searchCondition.length === 1) params.set('condition', searchCondition[0]);
    if (searchFeatures.length > 0) params.set('features', searchFeatures.join(','));
    if (searchNoVat) params.set('noVat', 'true');
    if (searchTransmission && searchTransmission !== 'any') params.set('transmission', searchTransmission);
    if (searchDriveType && searchDriveType !== 'any') params.set('driveType', searchDriveType);
    if (searchCountry && searchCountry !== 'any') params.set('country', searchCountry);
    if (searchCity && searchCity !== 'any') params.set('city', searchCity);
    if (params.toString()) url += '?' + params.toString();
    window.location.href = url;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price) + ' €';
  };

  return (
    <div className="min-h-screen dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-transparent mt-16 sm:mt-[104px] md:mt-[120px]">
        <HeroSection />

        {/* Search + Featured two-column layout */}
        <div className="relative z-10 -mt-8 sm:-mt-10 md:-mt-11 pb-2">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-2 lg:px-2">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:items-stretch">
            {/* Left: Search Card - narrow */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full lg:w-[26%] flex-shrink-0 flex flex-col">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl md:rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex-1">
                 {/* Vehicle type selector */}
                 {(() => {
                    const greenFilter = 'brightness(0) saturate(100%) invert(54%) sepia(93%) saturate(450%) hue-rotate(118deg) brightness(96%) contrast(101%)';
                    const vehicleTypes = [
                    { key: 'car', labelKey: 'home.vtype_car', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/3ed0c0079_sedaniconcu.png', blend: true },
                    { key: 'moto', labelKey: 'home.vtype_moto', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/f0312e09d_motocycleiconcu.png', blend: true },
                    { key: 'bus', labelKey: 'home.vtype_bus', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/25ce6f6a7_busiconcu.png', blend: true },
                    { key: 'special', labelKey: 'home.vtype_special', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/a935d278f_traktoriconcu.png', blend: true },
                    { key: 'truck', labelKey: 'home.vtype_truck', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/122985056_truckiconcu.png', blend: true },
                    { key: 'boat', labelKey: 'home.vtype_boat', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/3d51d9a96_boaticoncu.png', blend: true },
                    { key: 'motorhome', labelKey: 'home.vtype_motorhome', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/c42e06342_housetrailericoncu.png', blend: true },
                    { key: 'trailer', labelKey: 'home.vtype_trailer', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/d68253701_trailericoncu.png', blend: true }];

                    return (
                      <div className="mb-2">
                       <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                         <div className="flex gap-1">
                           {vehicleTypes.slice(0, 4).map(({ key, img, labelKey, blend }) =>
                            <button
                              key={key}
                              type="button"
                              title={t(labelKey)}
                              onClick={() => setSelectedVehicleType(selectedVehicleType === key ? '' : key)}
                              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${
                              selectedVehicleType === key ?
                              'bg-white dark:bg-slate-700 shadow-sm ring-1 ring-emerald-400' :
                              'hover:bg-slate-200 dark:hover:bg-slate-800'}`
                              }>

                               <img src={img} alt={t(labelKey)} className="w-8 h-5 object-contain" style={blend ? { mixBlendMode: 'screen' } : { filter: greenFilter }} />
                               </button>
                            )}
                               <button
                              type="button"
                              onClick={() => setVehicleTypeExpanded((v) => !v)}
                              className="flex items-center justify-center px-2 py-1.5 rounded-lg bg-transparent text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
                              
                             <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${vehicleTypeExpanded ? 'rotate-180' : ''}`} />
                           </button>
                         </div>
                         {vehicleTypeExpanded &&
                          <div className="flex gap-1 mt-1">
                               {vehicleTypes.slice(4).map(({ key, img, labelKey, blend }) =>
                            <button
                              key={key}
                              type="button"
                              title={t(labelKey)}
                              onClick={() => setSelectedVehicleType(selectedVehicleType === key ? '' : key)}
                              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${
                              selectedVehicleType === key ?
                              'bg-white dark:bg-slate-700 shadow-sm ring-1 ring-emerald-400' :
                              'hover:bg-slate-200 dark:hover:bg-slate-800'}`
                              }>

                                       <img src={img} alt={t(labelKey)} className="w-8 h-5 object-contain" style={blend ? { mixBlendMode: 'screen' } : { filter: greenFilter }} />
                                     </button>
                            )}
                               <div className="px-2 py-1.5 w-[calc(theme(spacing.2)*2+14px)]" />
                             </div>
                          }
                       </div>
                     </div>);

                  })()}

                {/* Non-car filters */}
                {selectedVehicleType && selectedVehicleType !== 'car' &&
                  <div className="mb-2">
                    <VehicleTypeFilters
                      vehicleType={selectedVehicleType}
                      filters={vehicleFilters}
                      setFilters={setVehicleFilters} />
                    
                  </div>
                  }

                {/* Car filters - shown only for car type or when no type selected */}
                {(!selectedVehicleType || selectedVehicleType === 'car') && <div className="flex flex-col gap-2 mb-2">
                    <MiniSearchSelect
                      value={searchBrand}
                      onChange={(v) => {
                        setSearchBrand(v);
                        setSearchModel('');
                        setSelectedGenerations([]);
                        if (v && v !== 'any') {
                          setSearchBrands((prev) => prev.includes(v) ? prev : [...prev, v]);
                          setSearchBrand('');
                        }
                      }}
                      options={allBrands}
                      placeholder={t('home.brand_any_label')}
                      anyLabel={t('common.any_brand')} />
                    
                    {searchBrands.length > 0 &&
                    <div className="flex flex-wrap gap-1">
                        {searchBrands.map((b) =>
                      <span key={b} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                            {b}
                            <button onClick={() => {setSearchBrands((prev) => prev.filter((x) => x !== b));setSearchModel('');}} className="hover:opacity-70 ml-0.5">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                      )}
                        {searchBrands.length > 1 &&
                      <button onClick={() => {setSearchBrands([]);setSearchModel('');}} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-1">
                            {t('catalog.reset_all', 'Сбросить')}
                          </button>
                      }
                      </div>
                    }

                    <MiniSearchSelect
                      value={searchModel}
                      onChange={(v) => {setSearchModel(v);setSelectedGenerations([]);setUseGenerations(false);}}
                      options={availableModels.map((m) => ({ value: m, label: modelCounts[m] ? `${m} (${modelCounts[m]})` : m }))}
                      placeholder={t('home.model_any_label')}
                      anyLabel={t('common.any_model')} />
                    

                    <Select value={searchFuelType} onValueChange={setSearchFuelType}>
                      <SelectTrigger className="h-11 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs py-2">
                        <SelectValue placeholder={t('home.search_fuel')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t('home.any_fuel')}</SelectItem>
                        {fuelTypes.map((type) => <SelectItem key={type.value} value={type.value}>{t('fuel_types.' + type.value)}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select value={searchBodyType} onValueChange={setSearchBodyType}>
                      <SelectTrigger className="h-11 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
                        <SelectValue placeholder={t('home.search_body')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t('home.any_body')}</SelectItem>
                        {bodyTypes.map((type) => <SelectItem key={type.value} value={type.value}>{t('body_types.' + type.value)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    </div>}

                {/* Year + Generation unified block - car only */}
                {(!selectedVehicleType || selectedVehicleType === 'car') && <div className="mb-2">
                  {availableGenerations.length > 0 ?
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl p-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-slate-500">{useGenerations ? t('home.generation_label') : t('home.year_label')}</p>
                        <button type="button" onClick={() => {setUseGenerations(!useGenerations);setSelectedGenerations([]);setSearchYearFrom('');setSearchYearTo('');}} className="text-xs text-emerald-600 hover:text-emerald-700 underline">
                          {useGenerations ? t('home.by_year') : t('home.by_generation')}
                          </button>
                      </div>
                      {useGenerations ?
                      <div className="flex flex-wrap gap-1.5">
                          {availableGenerations.map((gen) =>
                        <button key={gen.code} type="button"
                        onClick={() => setSelectedGenerations((prev) => prev.includes(gen.code) ? prev.filter((c) => c !== gen.code) : [...prev, gen.code])}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${selectedGenerations.includes(gen.code) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'}`}>
                              {gen.code} <span className="opacity-60">({gen.years})</span>
                            </button>
                        )}
                        </div> :

                      <div className="grid grid-cols-2 gap-1.5">
                          <Select value={searchYearFrom} onValueChange={setSearchYearFrom}>
                             <SelectTrigger className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs"><SelectValue placeholder={t('home.year_from')} /></SelectTrigger>
...
                             <SelectTrigger className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs"><SelectValue placeholder={t('home.year_to')} /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="any">{t('home.any_year')}</SelectItem>
                               {years.map((year) => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                             </SelectContent>
                           </Select>
                         </div>
                      }
                    </div> :

                    <div className="grid grid-cols-2 gap-2">
                      <Select value={searchYearFrom} onValueChange={setSearchYearFrom}>
                        <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs"><SelectValue placeholder={t('home.year_from')} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">{t('home.any_year')}</SelectItem>
                          {years.map((year) => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={searchYearTo} onValueChange={setSearchYearTo}>
                        <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs"><SelectValue placeholder={t('home.year_to')} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">{t('home.any_year')}</SelectItem>
                          {years.map((year) => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    }
                </div>}

                {/* Price range slider or inputs */}
                {(!selectedVehicleType || selectedVehicleType === 'car' || selectedVehicleType === 'moto') && <>

                <div className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 pt-2.5 pb-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('home.price_label', 'Цена')}</span>
                    <button type="button" onClick={() => setUsePriceSlider(!usePriceSlider)} className="text-xs text-emerald-600 hover:text-emerald-700 underline">
                      {usePriceSlider ? t('home.enter_manually', 'Ввести вручную') : t('home.use_slider', 'Ползунок')}
                    </button>
                  </div>
                  {usePriceSlider ?
                      <>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-2">
                        {priceRange[0] > 0 ? `${new Intl.NumberFormat('ru-RU').format(priceRange[0])} €` : '0'} — {priceRange[1] < 200000 ? `${new Intl.NumberFormat('ru-RU').format(priceRange[1])} €` : `200 000+ €`}
                      </span>
                      <Slider
                          min={0} max={200000} step={1000}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="w-full" />
                        
                    </> :

                      <div className="grid grid-cols-2 gap-1.5">
                      <Input type="text" inputMode="numeric" min="0" placeholder={t('home.price_from', 'От')} value={priceRange[0] || ''} onChange={(e) => setPriceRange([Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 0), priceRange[1]])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
                      <Input type="text" inputMode="numeric" min="0" placeholder={t('home.price_to', 'До')} value={priceRange[1] === 200000 ? '' : priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 200000)])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
                    </div>
                      }
                </div>

                {/* Power range slider or inputs */}
                <div className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 pt-2.5 pb-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('home.power_label', 'Мощность')}</span>
                    <button type="button" onClick={() => setUsePowerSlider(!usePowerSlider)} className="text-xs text-emerald-600 hover:text-emerald-700 underline">
                      {usePowerSlider ? t('home.enter_manually', 'Ввести вручную') : t('home.use_slider', 'Ползунок')}
                    </button>
                  </div>
                  {usePowerSlider ?
                      <>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-2">
                       {powerRange[0] > 0 ? `${powerRange[0]} ${t('car.kw', 'кВт')}` : '0'} — {powerRange[1] < 400 ? `${powerRange[1]} ${t('car.kw', 'кВт')}` : `400+ ${t('car.kw', 'кВт')}`}
                      </span>
                      <Slider
                          min={0} max={400} step={5}
                          value={powerRange}
                          onValueChange={setPowerRange}
                          className="w-full" />
                        
                    </> :

                      <div className="grid grid-cols-2 gap-1.5">
                      <Input type="text" inputMode="numeric" min="0" placeholder={t('home.price_from', 'От')} value={powerRange[0] || ''} onChange={(e) => setPowerRange([Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 0), powerRange[1]])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
                      <Input type="text" inputMode="numeric" min="0" placeholder={t('home.price_to', 'До')} value={powerRange[1] === 400 ? '' : powerRange[1]} onChange={(e) => setPowerRange([powerRange[0], Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 400)])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
                    </div>
                      }
                </div>

                 {/* Mileage + Transmission - HIDDEN */}
                 {false && <div className="grid grid-cols-2 gap-2 mb-2">
                   <Input type="number" placeholder={t('home.mileage_to_km')} value={searchMileageTo} onChange={(e) => setSearchMileageTo(e.target.value)} className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs font-sans" />
                   <Select value={searchTransmission} onValueChange={setSearchTransmission}>
                     <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
                       <SelectValue placeholder={t('home.transmission')} />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="any">{t('home.any_transmission')}</SelectItem>
                       <SelectItem value="manual">{t('transmission_types.manual')}</SelectItem>
                       <SelectItem value="automatic">{t('transmission_types.automatic')}</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>}

                 <div className="grid grid-cols-2 gap-2 mb-2">
                   <Select value={searchCountry} onValueChange={(v) => {setSearchCountry(v);setSearchCity('');}}>
                     <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
                       <SelectValue placeholder={t('home.search_country')} />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="any">{t('home.any_country')}</SelectItem>
                       {Object.keys(countryCities).map((c) => <SelectItem key={c} value={c}>{translateCountry(null, c)}</SelectItem>)}
                     </SelectContent>
                   </Select>
                   <Select value={searchCity} onValueChange={setSearchCity} disabled={!searchCountry || searchCountry === 'any'}>
                     <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
                       <SelectValue placeholder={t('home.search_city')} />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="any">{t('home.any_city')}</SelectItem>
                       {(countryCities[searchCountry] || []).map((c) => <SelectItem key={c} value={c}>{translateCity(null, c)}</SelectItem>)}
                     </SelectContent>
                   </Select>
                 </div>

                 {/* Color */}
                 <div className="mb-2">
                   <Select value={searchColor} onValueChange={setSearchColor}>
                     <SelectTrigger className="h-9 w-full bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs font-sans">
                       <SelectValue placeholder={t('home.color')} />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="any">{t('home.any_color')}</SelectItem>
                       {['white', 'black', 'gray', 'silver', 'blue', 'red', 'green', 'brown', 'beige', 'gold', 'orange', 'yellow', 'purple'].map((c) =>
                          <SelectItem key={c} value={t('colors.' + c)}>{t('colors.' + c)}</SelectItem>
                          )}
                     </SelectContent>
                   </Select>
                 </div>

                 {/* Drive type (under color, car only) */}
                 {selectedVehicleType !== 'moto' && <div className="mb-2">
                   <Select value={searchDriveType} onValueChange={setSearchDriveType}>
                     <SelectTrigger className="h-9 w-full bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
                       <SelectValue placeholder={t('home.drive')} />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="any">{t('home.any_drive')}</SelectItem>
                       <SelectItem value="fwd">{t('home.drive_fwd')}</SelectItem>
                       <SelectItem value="rwd">{t('home.drive_rwd')}</SelectItem>
                       <SelectItem value="awd">{t('home.drive_awd')}</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>}

                 </>}

                 {/* Transmission filter - car + moto */}
                 {(!selectedVehicleType || selectedVehicleType === 'car' || selectedVehicleType === 'moto') &&
                  <div className="mb-2">
                      <Select value={searchTransmission} onValueChange={setSearchTransmission}>
                       <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
                         <SelectValue placeholder={t('home.transmission', 'Коробка передач')} />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="any">{t('home.any_transmission', 'Любая КПП')}</SelectItem>
                         <SelectItem value="automatic">{t('transmission_types.automatic', 'Автомат')}</SelectItem>
                         <SelectItem value="manual">{t('transmission_types.manual', 'Механика')}</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                  }

                <div className="flex gap-3 mt-4">
                  <Button onClick={handleSearch} className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white gap-2 rounded-xl text-sm font-semibold">
                    <Search className="w-4 h-4" />
                    {t('home.search_button')}
                  </Button>
                  {(!selectedVehicleType || selectedVehicleType === 'car') &&
                    <Link to="/DetailedSearch" title={t('home.extended_search')} className="h-10 px-3 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl flex-shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </Link>
                    }
                  <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setSearchBrand('');
                        setSearchBrands([]);
                        setSearchModel('');
                        setSearchFuelType('');
                        setSearchBodyType('');
                        setSearchYearFrom('');
                        setSearchYearTo('');
                        setSearchPriceFrom('');
                        setSearchPriceTo('');
                        setPriceRange([0, 200000]);
                        setPowerRange([0, 400]);
                        setSearchMileageTo('');
                        setSearchCountry('');
                        setSearchCity('');
                        setSearchColor('');
                        setSearchTransmission('');
                        setSearchDriveType('');
                        setSearchPowerFrom('');
                        setSearchPowerTo('');
                        setSearchCondition([]);
                        setSearchFeatures([]);
                        setSelectedGenerations([]);
                        setSearchNoVat(false);
                        setVehicleFilters({});
                      }}
                      className="h-10 px-3 text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl whitespace-nowrap flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

            </motion.div>

            {/* Right: Featured listings with title */}
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="w-full lg:flex-1 flex flex-col">
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col flex-1">
                 {/* Header with title */}
                 <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                   <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                     {t('home.top_listings', 'Топ объявления')}
                   </h3>
                 </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                {(() => {
                      const cars = promotedCars;
                      const loading = loadingPromoted;
                      const topCars = cars.slice(0, 5);

                      if (loading) return <div className="flex items-center justify-center py-16 text-slate-400 text-sm">{t('home.loading')}</div>;
                      if (!topCars.length) return (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-sm gap-2">
                      <Car className="w-8 h-8 opacity-30" />
                       <span>{t('home.no_listings')}</span>
                    </div>);

                      const mainCar = topCars[0];
                      const smallCars = topCars.slice(1);

                      const SpecBadge = ({ icon: Icon, label }) => label ?
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Icon className="w-3 h-3 flex-shrink-0" />{label}
                    </span> :
                      null;

                      const carIcons = {
                        fuel: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/6feb2f9c7_gas-station1.png',
                        transmission: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/5bf7d42bf_gearbox3.png',
                        mileage: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/f3a09dd47_road-perspective.png',
                        speed: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/e4b346d84_speedometer1.png',
                        drive: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/acf090957_4wd.png',
                        body: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/04d21af6a_car.png',
                        volume: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/8312588b3_piston.png',
                        location: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/042a078cf_pin.png'
                      };
                      const heroFuel = mainCar.fuel_type ? fuelChip(mainCar.fuel_type, carIcons.fuel) : null;
                      const mainElectric = isElectricAccent(mainCar);

                      return (
                        <div className="flex flex-col flex-1 p-3 gap-2 bg-slate-100 dark:bg-slate-800">

                    {/* Main TOP PICK card — two column layout (image left, info right) */}
                     <Link to={getCarDetailsPath(mainCar)} className={`block bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors group/main ${mainElectric ? 'hover:border-[#465A90] dark:hover:border-[#465A90]' : 'hover:border-emerald-400 dark:hover:border-emerald-500'}`}>

                      {/* Image section (left column) with badge and gallery below */}
                      <div className="flex flex-col sm:flex-row gap-0">

                        {/* Left: Main image + thumbnails below */}
                        <div className="w-full sm:w-[40%] lg:w-[38%] flex flex-col">
                          {/* Main image */}
                            <PromoPhotoFrame
                              promotion={null}
                              exclusive={!!mainCar.exclusive_listing}
                              radiusClass="rounded-lg"
                              notchClass="bg-white dark:bg-slate-900"
                              className="flex-1 min-h-40 sm:min-h-48 lg:min-h-52 bg-slate-200 dark:bg-slate-700 ml-2 mt-2 mb-2">
                            <FeaturedCardImage car={mainCar} />
                          </PromoPhotoFrame>

                          {/* Gallery thumbnails below main image */}
                          {false && mainCar.images && mainCar.images.length > 1 &&
                                <div className="grid grid-cols-3 gap-1 p-2">
                              {mainCar.images.slice(1, 4).map((img, idx) =>
                                  <div key={idx} className="rounded-lg overflow-hidden bg-slate-300 dark:bg-slate-600 aspect-video">
                                  <img src={img} alt={`${mainCar.title} ${idx + 2}`} className="w-full h-full object-cover cursor-pointer" />
                                </div>
                                  )}
                            </div>
                                }
                        </div>

                        {/* Right: Info section */}
                        <div
                                className="flex-1 p-3 flex flex-col justify-between min-w-0">
                                
                          <div>
                            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight flex items-baseline gap-2 flex-wrap">
                              <span>{mainCar.brand} {mainCar.model}</span>
                              {mainCar.year && <span className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">{mainCar.year}</span>}
                            </div>

                            {/* Main specs row */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              {mainCar.mileage &&
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                                  <img src={carIcons.mileage} alt="mileage" className="w-3.5 h-3.5 flex-shrink-0 dark:invert" />{new Intl.NumberFormat().format(mainCar.mileage)} {t('car.km')}
                                </span>
                                    }
                              {mainCar.engine_power &&
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                                  <img src={carIcons.speed} alt="power" className="w-3.5 h-3.5 flex-shrink-0 dark:invert" />{Math.round(mainCar.engine_power * 0.735)} {t('car.kw')}
                                </span>
                                    }
                              {mainCar.fuel_type &&
                                    <span
                                      style={heroFuel?.style}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                                  <img src={heroFuel.icon} alt="fuel" className={`w-3.5 h-3.5 flex-shrink-0 ${heroFuel.iconClass}`} />{t('fuel_types.' + mainCar.fuel_type)}
                                </span>
                                    }
                              <TransmissionOrEnergy car={mainCar} size="lg">
                              {mainCar.transmission &&
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                                  <img src={carIcons.transmission} alt="transmission" className="w-3.5 h-3.5 flex-shrink-0 dark:invert" />{t('transmission_types.' + mainCar.transmission)}
                                </span>
                                    }
                              </TransmissionOrEnergy>
                            </div>

                            {/* Additional specs row */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {mainCar.drive_type &&
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                                  <img src={carIcons.drive} alt="drive" className="w-3.5 h-3.5 flex-shrink-0 invert" />
                                  {mainCar.drive_type === 'fwd' ? t('home.drive_fwd') : mainCar.drive_type === 'rwd' ? t('home.drive_rwd') : t('home.drive_awd')}
                                </span>
                                    }
                              {mainCar.body_type &&
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                                  <img src={carIcons.body} alt="body" className="w-3.5 h-3.5 flex-shrink-0 invert" />
                                  {t('body_types.' + mainCar.body_type)}
                                </span>
                                    }
                              {mainCar.engine_volume &&
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                                  <img src={carIcons.volume} alt="volume" className="w-3.5 h-3.5 flex-shrink-0 invert" />
                                  {mainCar.engine_volume} {t('car.liters', 'л')}
                                </span>
                                    }
                              {mainCar.country &&
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                                  <img src={carIcons.location} alt="location" className="w-3.5 h-3.5 flex-shrink-0 invert" />
                                  {translateCountry(null, mainCar.country)}
                                </span>
                                    }
                            </div>

                            




                                  
                          </div>

                          {/* Price and buttons */}
                          <div className="mt-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              {/* Цена + старая цена и бирка скидки в одной строке */}
                              <div className="min-w-0 flex items-center gap-2 flex-wrap">
                                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-none">{formatPrice(mainCar.price)}</span>
                                {mainCar.original_price && mainCar.original_price > mainCar.price &&
                                    <>
                                      <span className="text-[11px] sm:text-xs text-slate-400 line-through whitespace-nowrap">{formatPrice(mainCar.original_price)}</span>
                                      <DiscountTag label={`-${formatPrice(mainCar.original_price - mainCar.price)}`} electric={mainElectric} />
                                    </>
                                    }
                              </div>
                              {/* Показатель адекватности цены — справа на уровне цены, пояснение под ним */}
                              <PriceRatingBadge score={heroRatings[mainCar.id]?.score} className="items-end text-right mt-1" />
                            </div>

                           {/* Action buttons */}
                            <div className="flex gap-2">
                              <span className={`flex-1 ${mainElectric ? 'bg-[#465A90] group-hover/main:bg-[#5B72B0]' : 'bg-emerald-500 group-hover/main:bg-emerald-600'} text-white text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors text-center`}>
                                {t('home.view_details', 'Подробнее')}
                              </span>
                              <button
                                      type="button"
                                      onClick={(e) => {e.preventDefault();toggleFavorite(mainCar.id);}}
                                      className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors flex-shrink-0 ${isFavorite(mainCar.id) ? (mainElectric ? 'bg-[#465A90]/15 border-[#465A90] text-[#465A90] dark:bg-[#465A90]/25' : 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-700') : (mainElectric ? 'bg-slate-100 border-slate-200 text-slate-400 hover:text-[#465A90] dark:bg-slate-700 dark:border-slate-600' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-emerald-500 dark:bg-slate-700 dark:border-slate-600')}`}>

                                      <Heart className={`w-4 h-4 ${isFavorite(mainCar.id) ? (mainElectric ? 'fill-[#465A90]' : 'fill-emerald-600') : ''}`} />
                              </button>
                              <button
                                      type="button"
                                      onClick={(e) => {e.preventDefault();isInCompare(mainCar.id) ? removeCar(mainCar.id) : addCar(mainCar);}}
                                      className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors flex-shrink-0 ${isInCompare(mainCar.id) ? (mainElectric ? 'bg-[#465A90]/15 border-[#465A90] text-[#465A90] dark:bg-[#465A90]/25' : 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-700') : (mainElectric ? 'bg-slate-100 border-slate-200 text-slate-400 hover:text-[#465A90] dark:bg-slate-700 dark:border-slate-600' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-emerald-500 dark:bg-slate-700 dark:border-slate-600')}`}>
                                      
                                <GitCompare className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* 4 small cards in 2×2 grid with gap — stretches to fill remaining height */}
                     {smallCars.length > 0 &&
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 grid-rows-4 sm:grid-rows-2 min-h-0">
                         {smallCars.map((car) => {
                           const cardFuel = car.fuel_type ? fuelChip(car.fuel_type, carIcons.fuel) : null;
                           const cardElectric = isElectricAccent(car);
                           return (
                           <Link key={car.id} to={createPageUrl('CarDetails') + `?id=${car.id}`}
                           className="flex tile-card bg-white dark:bg-slate-900 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-500 transition-all group border border-slate-200 dark:border-slate-700 h-full min-h-0">

                             {/* Image */}
                             <PromoPhotoFrame
                               promotion={null}
                               exclusive={!!car.exclusive_listing}
                               radiusClass="rounded-none"
                               notchClass="bg-white dark:bg-slate-900"
                               className="w-[40%] flex-shrink-0 bg-slate-200 dark:bg-slate-700">
                               {car.images?.[0] ?
                                <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" /> :
                                <div className="w-full h-full flex items-center justify-center"><Car className="w-6 h-6 text-slate-400" /></div>}
                               {/* Compare + fav buttons: drop in from the top on hover, same as catalog tiles */}
                               <TileActions car={car} />
                             </PromoPhotoFrame>
                             {/* Info */}
                             <div className="flex-1 p-3 pb-0.5 min-w-0 flex flex-col justify-start overflow-hidden gap-1.5">
                               {/* Name + Year */}
                               <div className={`text-sm font-bold text-slate-900 dark:text-white leading-tight transition-colors truncate ${cardElectric ? 'group-hover:text-[#465A90] dark:group-hover:text-[#465A90]' : 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`}>
                                 {car.brand} {car.model}
                                 {car.year && <span className="ml-1 font-normal text-slate-400 dark:text-slate-500 text-sm">{car.year}</span>}
                               </div>
                               {/* Price + старая цена и бирка скидки в одной строке */}
                               <div className="flex items-center gap-1.5 flex-wrap">
                                 <span className="text-base font-bold text-slate-900 dark:text-white leading-tight">{formatPrice(car.price)}</span>
                                 {car.original_price && car.original_price > car.price &&
                                  <>
                                    <span className="text-[11px] text-slate-400 line-through leading-tight whitespace-nowrap">{formatPrice(car.original_price)}</span>
                                    <DiscountTag label={`-${formatPrice(car.original_price - car.price)}`} electric={cardElectric} />
                                  </>
                                 }
                                 <PriceRatingBadge score={heroRatings[car.id]?.score} showLabel={false} />
                               </div>
                               {/* Mileage chip */}
                               {car.mileage != null &&
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 self-start">
                                   <img src={carIcons.mileage} alt="" className="w-4 h-4 flex-shrink-0 dark:invert" />{new Intl.NumberFormat().format(car.mileage)} {t('car.km')}
                                 </span>
                                }
                               {/* Fuel + Transmission */}
                               <div className="flex items-center gap-1 flex-wrap">
                                 {cardFuel &&
                                  <span
                                    style={cardFuel.style}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                     <img src={cardFuel.icon} alt="" className={`w-4 h-4 flex-shrink-0 ${cardFuel.iconClass}`} />{t('fuel_types.' + car.fuel_type)}
                                   </span>
                                  }
                                 <TransmissionOrEnergy car={car} size="md" radius="rounded-lg">
                                 {car.transmission &&
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                     <img src={carIcons.transmission} alt="" className="w-4 h-4 flex-shrink-0 dark:invert" />{t('transmission_types.' + car.transmission)}
                                   </span>
                                  }
                                 </TransmissionOrEnergy>
                               </div>
                             </div>
                           </Link>
                           );
                           })}
                           </div>
                           }

                     </div>);

                    })()}
                     </div>
                     </div>

                     {/* "See all" button outside the white block, full width */}
                     <div className="mt-2">
                       <Link to={createPageUrl('Catalog')}
                  className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    
                         {t('home.see_all_listings')} <ChevronRight className="w-4 h-4" />
                       </Link>
                     </div>
                     </motion.div>
          </div>
        </div>

        </div>

        {/* Dark bg wrapper — starts below the hero overlap area */}
        <div className="bg-white dark:bg-slate-950">

        {/* Recent Activity Block — searches + viewed cars */}
        <RecentActivityBlock />

        {/* Recently Viewed - HIDDEN */}

        </div>
      </section>

      {/* Dealer Banner - HIDDEN */}
      {false && <section className="bg-white pt-10 pb-2 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="group flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-2xl px-6 py-2 overflow-visible relative" style={{ minHeight: '80px' }}>
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(ellipse at bottom, rgba(16,185,129,0.12) 0%, transparent 70%), linear-gradient(to right, rgba(16,185,129,0.08) 0%, transparent 30%), linear-gradient(to left, rgba(16,185,129,0.08) 0%, transparent 30%)' }} />
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0" style={{ width: '160px', height: '130px', marginTop: '-50px' }}>
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6973f00466c3a37f3d8e7e53/da51c96fe_carunity_car.png" alt="car" className="my-3 w-full h-full object-contain drop-shadow-md" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xl">{t('home.dealer_cars_title')}</div>
                <div className="text-base text-slate-500 dark:text-slate-400 mt-1">{t('home.dealer_cars_desc')}</div>
              </div>
            </div>
            <Link to={createPageUrl('Dealers')}>
              <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-400 whitespace-nowrap ml-4 rounded-xl text-base px-6 h-11 transition-colors">
                {t('home.dealer_choose_car')}
              </Button>
            </Link>
          </div>
        </div>
      </section>}

      {/* Quick Access Panel — between recently viewed and ads */}
      <QuickAccessPanel />
      <CaroBanner />

      {/* AD — между Hero и новыми объявлениями */}
      <div className="max-w-7xl mx-auto sm:px-4 md:px-6 pr-3 pl-3 pt-12 pb-20">
        <AdBanner size="billboard" slot="home-top" aspectRatio="10/3" />
      </div>

      {/* Latest Cars */}
      <section className="bg-white dark:bg-slate-900 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{t('home.new_listings')}</h2>
          </div>
          {loadingLatest ? (
            <CarGridSkeleton count={8} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {latestCars.map((car) =>
              <CompactCarCard key={car.id} car={car} rating={tileRatings[car.id]} promotion={tilePromotions[car.id]} />
              )}
            </div>
          )}
          <div className="mt-4 sm:mt-6 flex justify-center">
            <Link
              to={createPageUrl('Catalog')}
              className="flex items-center gap-2 border border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 dark:hover:border-emerald-400 dark:hover:text-emerald-400 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              
              {t('home.see_all_ads', 'Смотреть все объявления')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - HIDDEN */}
      {false && <section className="py-10 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.slice(0, 4).map((stat, index) =>
            <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{t(stat.labelKey)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>}

      {/* Luxury Section */}
      <LuxurySection />

      {/* Continuation of New Listings — same style as above */}
      <section className="bg-slate-950 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          {loadingLatest ? (
            <CarGridSkeleton count={8} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {latestCarsMore.map((car) =>
              <CompactCarCard key={car.id} car={car} rating={tileRatings[car.id]} promotion={tilePromotions[car.id]} />
              )}
            </div>
          )}
          <div className="mt-4 sm:mt-6 flex justify-center">
            <Link
              to={createPageUrl('Catalog')}
              className="flex items-center gap-2 border border-slate-600 text-slate-300 hover:border-emerald-400 hover:text-emerald-400 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              
              {t('home.see_all_ads', 'Смотреть все объявления')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Rental CTA Block - HIDDEN */}
      {false && <section className="py-12 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-emerald-100 text-sm font-medium mb-1">{t('home.dont_want_buy')}</div>
              <h2 className="text-2xl font-bold text-white">{t('home.rent_cars_title')}</h2>
              <p className="text-emerald-100 mt-1">{t('home.rent_cars_desc')}</p>
            </div>
            <Link to={createPageUrl('RentalCatalog')}>
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 gap-2 whitespace-nowrap rounded-xl">
                {t('home.rent_banner_button')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>}

      {/* AD — перед новостями */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2">
        <AdBanner size="billboard" slot="home-before-news" aspectRatio="10/3" />
      </div>

      <NewsSection />

      {false && <CarModelsSection />}

      {/* Why Choose Us - HIDDEN */}
      {false && <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">{t('home.why_us_title')}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t('home.why_us_p')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
            { icon: Shield, title: t('home.why_feature1_title'), description: t('home.why_feature1_desc') },
            { icon: CheckCircle, title: t('home.why_feature2_title'), description: t('home.why_feature2_desc') },
            { icon: TrendingUp, title: t('home.why_feature3_title'), description: t('home.why_feature3_desc') },
            { icon: Users, title: t('home.why_feature4_title'), description: t('home.why_feature4_desc') },
            { icon: Building2, title: t('home.why_feature5_title'), description: t('home.why_feature5_desc') },
            { icon: Star, title: t('home.why_feature6_title'), description: t('home.why_feature6_desc') }].
            map((feature, index) =>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-white/5 rounded-2xl p-8 border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 transition-colors shadow-sm dark:shadow-none">

                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>}

      {/* CTA Section - HIDDEN */}
      {false && <section className="py-6 sm:py-8 md:py-10 bg-slate-950">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

            {/* Left — for sellers */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-800 p-8 flex flex-col gap-6">
              <div className="absolute -top-16 -left-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  <Car className="w-3.5 h-3.5" />
                  {t('home.cta_seller_badge')}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 leading-snug">
                  {t('home.cta_seller_title')}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {t('home.cta_seller_desc')}
                </p>
              </div>
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex gap-3 sm:gap-6 text-xs sm:text-sm">
                  <div>
                    <div className="text-base sm:text-xl font-bold text-white">3 {t('home.cta_min')}</div>
                    <div className="text-xs text-slate-500">{t('home.cta_placement')}</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-xl font-bold text-white">0 €</div>
                    <div className="text-xs text-slate-500">{t('home.cta_free')}</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-xl font-bold text-white">50k+</div>
                    <div className="text-xs text-slate-500">{t('home.cta_buyers')}</div>
                  </div>
                </div>
                <Link to={createPageUrl('CreateListing')} className="w-full sm:w-auto">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-white gap-2 px-4 sm:px-5 h-9 sm:h-10 rounded-lg sm:rounded-xl whitespace-nowrap w-full sm:w-auto text-xs sm:text-sm">
                    {t('home.cta_post_btn')}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — for dealers */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-800 p-8 flex flex-col gap-6">
              <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-violet-500/15 text-violet-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  <Building2 className="w-3.5 h-3.5" />
                  {t('home.cta_dealer_badge')}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 leading-snug">
                  {t('home.cta_dealer_title')}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {t('home.cta_dealer_desc')}
                </p>
              </div>
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex gap-3 sm:gap-6 text-xs sm:text-sm">
                  <div>
                    <div className="text-base sm:text-xl font-bold text-white">AI</div>
                    <div className="text-xs text-slate-500">{t('home.cta_ai_leads')}</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-xl font-bold text-white">3</div>
                    <div className="text-xs text-slate-500">{t('home.cta_countries')}</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-xl font-bold text-white">24/7</div>
                    <div className="text-xs text-slate-500">{t('home.cta_support')}</div>
                  </div>
                </div>
                <Link to={createPageUrl('DealerRegister')} className="w-full sm:w-auto">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white gap-2 px-3 sm:px-5 h-9 sm:h-10 rounded-lg sm:rounded-xl whitespace-nowrap w-full sm:w-auto text-xs sm:text-sm">
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t('home.for_dealers_btn')}
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>}
    </div>);

}