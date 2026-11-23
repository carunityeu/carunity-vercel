import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { entities, countView } from '@/api/entities';
import { useAuth } from '@/lib/AuthContext';
import { redirectToAccount } from '@/components/auth/requireAccount';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronLeft } from 'lucide-react';
import { ensureShortId, getShareUrl } from '@/lib/shortIdUtils';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '@/components/favorites/FavoritesContext';
import CompactCarCard from '@/components/cars/CompactCarCard';
import MakeOfferModal from '@/components/offers/MakeOfferModal';
import ShareModal from '@/components/cars/ShareModal';
import FeaturesDisplay from '@/components/cars/FeaturesDisplay';
import ServiceBook from '@/components/cars/ServiceBook';
import DescriptionSection from '@/components/cars/DescriptionSection';
import CarSpecsGrouped from '@/components/cars/CarSpecsGrouped';
import CrossBorderPricing from '@/components/cars/CrossBorderPricing';
import CollapsibleCard from '@/components/car-details/CollapsibleCard';
import CarTaxBlock from '@/components/car-details/CarTaxBlock';
import CarGallery from '@/components/car-details/CarGallery';
import PhotoViewer from '@/components/car-details/PhotoViewer';
import CarSummaryCard from '@/components/car-details/CarSummaryCard';
import SellerSection from '@/components/car-details/SellerSection';
import ContactSellerDialog from '@/components/car-details/ContactSellerDialog';


export default function CarDetails() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const { shortId } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  let carId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const { isFavorite: isFavoriteInCtx, toggleFavorite } = useFavorites();
  const [showContactForm, setShowContactForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [plateRevealed, setPlateRevealed] = useState(false);
  const lang = i18n?.language?.slice(0, 2) || 'ru';

  useEffect(() => {
    const loadUser = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) setUser(await base44.auth.me());
    };
    loadUser();
  }, []);

  const viewIncremented = useRef(false);
  // Reset view tracking when navigating to a different car
  useEffect(() => { viewIncremented.current = false; }, [carId]);

  const { data: car, isLoading, isError, error } = useQuery({
    queryKey: ['car', carId, shortId],
    queryFn: async () => {
      try {
        if (shortId) {
          const cars = await entities.Car.filter({ short_id: Number(shortId) });
          return cars[0] || null;
        }
        return await entities.Car.get(carId);
      } catch (error) {
        if (error.status === 404 || error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!(carId || shortId),
    staleTime: 0,
    refetchOnMount: 'always'
  });

  const isClosed = !!car && car.status !== 'active';

  useEffect(() => {
    if (isLoading || isError || car) return;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [isLoading, isError, car]);

  useEffect(() => entities.Car.subscribe(event => {
    if (event.id !== carId) return;
    if (event.type === 'delete') {
      queryClient.setQueryData(['car', urlParams.get('id'), shortId], null);
    } else if (event.type === 'update' && event.data?.status && event.data.status !== car?.status) {
      queryClient.setQueryData(['car', urlParams.get('id'), shortId], current => current ? { ...current, status: event.data.status } : current);
    }
  }), [carId, shortId, car?.status, queryClient]);

  useEffect(() => {
    if (!isClosed) return;
    setShowContactForm(false);
    setShowOfferForm(false);
    setShowShareModal(false);
  }, [isClosed]);

  // When navigating via short URL, resolve the actual car ID
  if (!carId && car) carId = car.id;
  const isFavorite = isFavoriteInCtx(carId);

  // Redirect old ?id= format to clean /cardetails/:shortId format
  useEffect(() => {
    if (car && car.short_id && !shortId) {
      const params = new URLSearchParams(window.location.search);
      params.delete('id');
      const query = params.toString();
      navigate(`/cardetails/${car.short_id}${query ? '?' + query : ''}`, { replace: true });
    }
  }, [car, shortId, navigate]);

  const { data: dealer } = useQuery({
    queryKey: ['dealer', car?.dealer_id],
    queryFn: async () => {
      if (!car?.dealer_id) return null;
      const dealers = await entities.Dealer.filter({ id: car.dealer_id });
      return dealers[0] || null;
    },
    enabled: !!car?.dealer_id,
    staleTime: 5 * 60 * 1000
  });

  // A dealer listing belongs to the salon owner, a private one to its author.
  const sellerEmailOf = (listing) => (listing?.seller_type === 'dealer'
    ? dealer?.owner_email
    : (listing?.seller_id || listing?.created_by));

  // Open the contact dialog when arriving from the catalog "write to seller" button
  useEffect(() => {
    if (urlParams.get('contact') !== '1' || !car || car.status !== 'active' || isLoadingAuth) return;
    if (!isAuthenticated) { redirectToAccount(); return; }
    if (!user) return;
    const sellerEmail = sellerEmailOf(car);
    if (!sellerEmail || sellerEmail === user.email) return;
    setShowContactForm(true);
  }, [car, user, dealer, isLoadingAuth, isAuthenticated]);

  // Ensure the car has a short_id for shareable links
  useEffect(() => {
    if (car && car.status === 'active' && !car.short_id) {
      ensureShortId(car).then(() => queryClient.invalidateQueries({ queryKey: ['car', carId, shortId] }));
    }
  }, [car]);

  // Side effects: increment views + save to history — runs ONCE per car visit
  useEffect(() => {
    if (!carId || !car || viewIncremented.current || car.id !== carId) return;
    viewIncremented.current = true;
    const prev = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    localStorage.setItem('recentlyViewed', JSON.stringify([carId, ...prev.filter((id) => id !== carId)].slice(0, 10)));
    countView('Car', carId);
  }, [carId, car]);

  // Add to view history — runs once when user is available
  useEffect(() => {
    if (!carId || !user) return;
    entities.ViewHistory.create({ user_email: user.email, car_id: carId, viewed_at: new Date().toISOString() })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['recentViews'] });
        queryClient.invalidateQueries({ queryKey: ['recentViewCars'] });
      }).catch(() => {});
  }, [carId, user]);

  const { data: similarCars = [] } = useQuery({
    queryKey: ['similarCars', car?.brand],
    queryFn: async () => {
      if (!car) return [];
      const cars = await entities.Car.filter({ brand: car.brand, status: 'active' }, '-created_date', 4);
      return cars.filter((c) => c.id !== carId);
    },
    enabled: !!car,
    staleTime: 5 * 60 * 1000
  });

  const requireLogin = () => {
    if (user) return false;
    redirectToAccount();
    return true;
  };

  const handleFavoriteToggle = async () => {
    if (isClosed || requireLogin()) return;
    const wasFavorite = isFavorite;
    await toggleFavorite(carId);
    toast.success(wasFavorite ? t('car.removed_favorite') : t('car.added_favorite'));
  };

  const handleSendMessage = async () => {
    if (isClosed || requireLogin()) return;
    const available = await entities.Car.filter({ id: carId, status: 'active' }, '-created_date', 1);
    if (!available.length) {
      setShowContactForm(false);
      queryClient.invalidateQueries({ queryKey: ['car'] });
      return;
    }
    const sellerEmail = sellerEmailOf(car) || car.created_by || dealer?.owner_email;
    if (!sellerEmail) { toast.error(t('car.seller_not_found')); return; }
    if (sellerEmail === user.email) { toast.error(t('car.cant_message_self')); return; }

    await entities.Message.create({
      chat_id: [user.email, sellerEmail, carId].join('-').replace(/[^a-zA-Z0-9]/g, '_'),
      sender_email: user.email,
      receiver_email: sellerEmail,
      car_id: carId,
      content: message || t('car.default_message', { brand: car.brand, model: car.model })
    });
    setShowContactForm(false);
    setMessage('');
    toast.success(t('car.message_sent'), { icon: '✉️', duration: 3000 });
  };

  if (isError) throw error;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">{t('car.not_found_title')}</h1>
          <p className="mb-6 text-slate-400">{t('car.not_found_desc')}</p>
          <Link to={createPageUrl('Catalog')}><Button>{t('car.back_to_catalog')}</Button></Link>
        </div>
      </div>
    );
  }

  const images = car.images || [];
  const isOwner = !!(user && sellerEmailOf(car) === user.email);
  // Объявление закрыто (продано, снято или на модерации) — писать продавцу и предлагать цену нельзя
  const blockIfClosed = () => {
    if (!isClosed) return false;
    toast.error(t(car.status === 'sold' ? 'car.status_sold' : 'car.listing_closed'));
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-7xl px-5 pb-1 pt-6 sm:px-8 sm:pt-8 md:px-10 lg:px-14">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-emerald-400">
          <ChevronLeft className="h-4 w-4" />
          {t('common.back', 'Назад')}
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-14">
        {isClosed && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3" role="status">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t('car.inactive')}</p>
              <p className="text-xs text-muted-foreground">{t('car.inactive_view_only')}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[7fr_4fr] lg:items-start">
          <div className="lg:col-start-1 lg:row-start-1">
            <CarGallery
              images={images}
              readOnly={isClosed}
              title={car.title}
              index={selectedImageIndex}
              onIndexChange={setSelectedImageIndex}
              onOpen={() => setShowViewer(true)}
              lang={lang} />
          </div>

          <div className="lg:sticky lg:top-[140px] lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <CarSummaryCard
              car={car}
              readOnly={isClosed}
              dealer={dealer}
              isOwner={isOwner}
              isFavorite={isFavorite}
              onContact={() => { if (!blockIfClosed() && !requireLogin()) setShowContactForm(true); }}
              onOffer={() => { if (!blockIfClosed() && !requireLogin()) setShowOfferForm(true); }}
              onFavorite={handleFavoriteToggle}
              onShare={() => setShowShareModal(true)} />
          </div>

          {!isClosed && <div className="space-y-4 md:space-y-6 lg:col-start-1 lg:row-start-2">
            <CollapsibleCard title={t('car.specs')}>
              <CarSpecsGrouped car={car} plateRevealed={plateRevealed} onRevealPlate={() => setPlateRevealed(true)} />
            </CollapsibleCard>

            {car.brand && car.model && car.year && car.price && <CrossBorderPricing car={car} />}

            {car.features?.length > 0 && (
              <CollapsibleCard title={t('car.equipment')}>
                <FeaturesDisplay features={car.features} />
              </CollapsibleCard>
            )}

            <CarTaxBlock />

            <DescriptionSection text={car[`description_${lang}`] || car.description} />

            {car.seller_type === 'dealer' && dealer && <SellerSection car={car} dealer={dealer} />}

            <ServiceBook
              carId={carId}
              isOwner={isOwner}
              ownerId={car.created_by} />
          </div>}
        </div>

        {!isClosed && similarCars.length > 0 && (
          <div className="mt-8 sm:mt-10 md:mt-12">
            <h2 className="mb-4 text-xl font-bold text-white md:mb-6 md:text-2xl">{t('car.similar_cars')}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {similarCars.slice(0, 4).map((c) => <CompactCarCard key={c.id} car={c} />)}
            </div>
          </div>
        )}
      </div>

      <ContactSellerDialog open={!isClosed && showContactForm} onOpenChange={setShowContactForm} message={message} onMessageChange={setMessage} onSend={handleSendMessage} />
      <MakeOfferModal open={!isClosed && showOfferForm} onOpenChange={setShowOfferForm} car={car} user={user} dealer={dealer} />
      <ShareModal
        open={!isClosed && showShareModal}
        onClose={() => setShowShareModal(false)}
        car={car}
        shareUrl={car.short_id ? getShareUrl(car.short_id) : window.location.href} />

      {showViewer && images.length > 0 && (
        <PhotoViewer images={images} title={`${car.brand} ${car.model} ${car.year}`} onClose={() => setShowViewer(false)} />
      )}
    </div>
  );
}