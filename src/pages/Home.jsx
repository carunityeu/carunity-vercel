import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { entities } from '@/api/entities';
import useCardExtras from '@/hooks/useCardExtras';
import { Container } from '@/components/ds';
import CompactCarCard from '@/components/cars/CompactCarCard';
import CarGridSkeleton from '@/components/cars/CarGridSkeleton';
import LuxurySection from '@/components/cars/LuxurySection';
import MagazineSection from '@/components/home/MagazineSection';
import HeroSection from '@/components/home/HeroSection';
import HomeSearchPanel from '@/components/home/HomeSearchPanel';
import TopListings, { useTopCars } from '@/components/home/TopListings';
import RecentActivityBlock from '@/components/home/RecentActivityBlock';
import QuickAccessPanel from '@/components/home/QuickAccessPanel';
import AdBanner from '@/components/ads/AdBanner';
import CaroBanner from '@/components/caro/CaroBanner';

const hasPhoto = (c) => typeof c.images?.[0] === 'string' && c.images[0].trim().startsWith('http');

export default function Home() {
  const { t } = useTranslation();
  const { data: topCars = [] } = useTopCars();
  const { data: activeCars = [], isLoading: loadingLatest } = useQuery({
    queryKey: ['homeActiveCars'],
    queryFn: () => entities.Car.filter({ status: 'active' }, '-created_date', 80),
    staleTime: 5 * 60 * 1000,
  });

  // "New listings" skips the cars already shown in the Top block
  const latestPool = useMemo(() => {
    const top = new Set(topCars.map((c) => c.id));
    return activeCars.filter((c) => hasPhoto(c) && !top.has(c.id));
  }, [activeCars, topCars]);
  const latestCars = latestPool.slice(0, 16);
  const latestCarsMore = latestPool.slice(16, 32);
  const { ratings: tileRatings, promotions: tilePromotions } = useCardExtras(latestPool.slice(0, 32));

  return (
    <div className="min-h-screen bg-page">
      <section style={{ marginTop: 'var(--header-h)' }}>
        <HeroSection />

        {/* Phones: search sits under the banner; desktop: it covers the banner's bottom 96px */}
        <Container className="relative z-10 mt-3 sm:-mt-10 lg:-mt-24">
          <HomeSearchPanel />
        </Container>
        <TopListings />

        <div className="bg-page">
        <RecentActivityBlock />
        </div>
      </section>

      

      {/* Quick Access Panel — between recently viewed and ads */}
      <QuickAccessPanel />
      <CaroBanner />

      {/* AD — между Hero и новыми объявлениями */}
      <AdBanner size="billboard" slot="home-top" aspectRatio="10/3" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-10" />

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
        </div>
      </section>

      

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

      

      {/* AD — перед новостями */}
      <AdBanner size="billboard" slot="home-before-news" aspectRatio="10/3" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2" />

      <MagazineSection />

      

      

      
    </div>);

}