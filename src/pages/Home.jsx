import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { entities } from '@/api/entities';
import useCardExtras from '@/hooks/useCardExtras';
import { Container } from '@/components/ds';
import { Button } from '@/components/ui/button';
import ListingTile from '@/components/cars/ListingTile';
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
import { checkIfPremiumCar } from '@/utils/premiumCarMatcher';

// Phones: one tile per row (the fact pills need the width); then 2 / 3 / 4 columns.
const TILE_GRID = 'grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
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

  // Under the premium brands: premium cars for sale (same rule as the premium catalog), up to two rows
  const { data: premiumPool = [] } = useQuery({
    queryKey: ['activeCarsForPremium'],
    queryFn: () => entities.Car.filter({ status: 'active' }, '-created_date', 1000),
    staleTime: 5 * 60 * 1000,
  });
  const premiumCars = useMemo(() => premiumPool.filter((c) => hasPhoto(c) && checkIfPremiumCar(c)).slice(0, 8), [premiumPool]);
  const { ratings: tileRatings, promotions } = useCardExtras([...latestCars, ...premiumCars]);

  return (
    <div className="min-h-screen bg-page">
      <section>
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

      {/* New listings: tiles straight on the page (no panel), then the premium brands and premium cars */}
      <Container as="section" className="py-6 sm:py-8" aria-labelledby="new-listings-title">
        <h2 id="new-listings-title" className="mb-4 text-xl font-bold text-ink sm:text-2xl">{t('home.new_listings')}</h2>
        {loadingLatest ? <CarGridSkeleton count={8} className={TILE_GRID} /> : (
          <div className={TILE_GRID}>
            {latestCars.map((car) => <ListingTile key={car.id} car={car} rating={tileRatings[car.id]} promotion={promotions[car.id]} />)}
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Button asChild variant="secondary" size="lg">
            <Link to={createPageUrl('Catalog')}>{t('home.see_all_ads', 'Смотреть все объявления')}<ArrowRight /></Link>
          </Button>
        </div>
      </Container>

      <LuxurySection />

      {premiumCars.length > 0 && (
        <Container as="section" className="py-6 sm:py-8" aria-labelledby="premium-cars-title">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 id="premium-cars-title" className="text-xl font-bold text-ink sm:text-2xl">{t('home.premium_for_sale', 'Премиум автомобили в продаже')}</h2>
            <Link to="/LuxuryCatalog" className="flex-shrink-0 text-sm font-medium text-brand-text">{t('home.see_all', 'Все')}</Link>
          </div>
          <div className={TILE_GRID}>
            {premiumCars.map((car) => <ListingTile key={car.id} car={car} rating={tileRatings[car.id]} promotion={promotions[car.id]} />)}
          </div>
        </Container>
      )}

      {/* AD — перед новостями */}
      <AdBanner size="billboard" slot="home-before-news" aspectRatio="10/3" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2" />

      <MagazineSection />

      

      

      
    </div>);

}