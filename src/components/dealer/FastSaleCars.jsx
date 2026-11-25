import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Car, Clock, X, Send, History, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/format';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { fieldClass } from '@/components/ds';
import { Card, Segmented, EmptyState } from '@/components/dealer-panel/ui';
import { TILE_GRID, DIALOG, LABEL, SourcingTile, Loading, Thumb, OfferStatus, useRatings } from '@/components/dealer-panel/sourcingParts';
import FastSaleFilters from './FastSaleFilters';

/** Buy-out of private cars (Premium): matching cars, offers waiting for an answer, history. */
export default function FastSaleCars({ dealer }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('matching');
  const [offerDialog, setOfferDialog] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerConditions, setOfferConditions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filteredCars, setFilteredCars] = useState([]);

  // Dealer purchase criteria (when enabled, only matching cars are offered)
  const { data: criteria } = useQuery({
    queryKey: ['dealerCriteria', dealer?.id],
    queryFn: async () => (await entities.DealerPurchaseCriteria.filter({ dealer_id: dealer.id }))?.[0] || null,
    enabled: !!dealer?.id,
  });

  const { data: myOffers = [], isLoading: loadingOffers } = useQuery({
    queryKey: ['fastSaleOffers', dealer?.id],
    queryFn: () => entities.TradeInOffer.filter({ dealer_id: dealer.id, fast_sale: true }, '-created_date', 200),
    enabled: !!dealer?.id,
  });

  const { data: allCars = [], isLoading: loadingCars } = useQuery({
    queryKey: ['fastSaleCars'],
    queryFn: () => entities.Car.filter({ status: 'active', seller_type: 'private' }, '-created_date', 100),
    enabled: !!dealer?.id,
  });

  const respondedCarIds = useMemo(() => new Set(myOffers.map((o) => o.car_id)), [myOffers]);

  const matchingCars = useMemo(() => {
    const available = allCars.filter((c) => !respondedCarIds.has(c.id));
    if (!criteria?.enabled) return available;
    return available.filter((car) => {
      if (criteria.brands?.length > 0 && !criteria.brands.some((b) => b.toLowerCase() === car.brand?.toLowerCase())) return false;
      if (criteria.body_types?.length > 0 && !criteria.body_types.includes(car.body_type)) return false;
      if (criteria.fuel_types?.length > 0 && !criteria.fuel_types.includes(car.fuel_type)) return false;
      if (criteria.price_min && car.price < criteria.price_min) return false;
      if (criteria.price_max && car.price > criteria.price_max) return false;
      if (criteria.year_min && car.year < criteria.year_min) return false;
      if (criteria.year_max && car.year > criteria.year_max) return false;
      if (criteria.mileage_max && car.mileage > criteria.mileage_max) return false;
      if (criteria.countries?.length > 0 && !criteria.countries.includes(car.country)) return false;
      return true;
    });
  }, [allCars, criteria, respondedCarIds]);
  const ratings = useRatings(filteredCars);

  const activeOffers = useMemo(() => myOffers.filter((o) => o.status === 'pending'), [myOffers]);
  const historyOffers = useMemo(() => myOffers.filter((o) => o.status !== 'pending'), [myOffers]);

  const openOffer = (car) => {
    setSelectedCar(car);
    setOfferPrice(Math.round(car.price * 0.85).toString());
    setOfferMessage('');
    setOfferConditions('');
    setOfferDialog(true);
  };

  const carFields = (car) => ({
    car_id: car.id, car_title: `${car.brand} ${car.model} ${car.year || ''}`.trim(),
    car_brand: car.brand, car_model: car.model, car_year: car.year, car_price: car.price,
    car_image: car.images?.[0] || '', car_country: car.country, car_mileage: car.mileage,
    dealer_id: dealer.id, dealer_name: dealer.name, dealer_email: dealer.email,
    seller_email: car.seller_id || '', offer_type: 'instant_buy', fast_sale: true,
  });

  const submitOffer = async () => {
    if (!selectedCar || !offerPrice) { toast.error(t('fast_sale.specify_price')); return; }
    setSubmitting(true);
    try {
      await entities.TradeInOffer.create({
        ...carFields(selectedCar),
        dealer_phone: dealer.phone || '',
        offered_price: parseFloat(offerPrice),
        message: offerMessage, additional_conditions: offerConditions,
        status: 'pending', expires_at: new Date(Date.now() + 48 * 3600000).toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['fastSaleOffers', dealer?.id] });
      toast.success(t('fast_sale.offer_sent'));
      setOfferDialog(false);
    } catch (e) { toast.error(e.message); }
    setSubmitting(false);
  };

  const markNotInterested = async (car) => {
    try {
      await entities.TradeInOffer.create({ ...carFields(car), not_interested: true, status: 'rejected' });
      queryClient.invalidateQueries({ queryKey: ['fastSaleOffers', dealer?.id] });
      toast.success(t('fast_sale.not_interested_saved'));
    } catch (e) { toast.error(e.message); }
  };

  const timeRemaining = (expiresAt) => {
    if (!expiresAt) return '';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return t('fast_sale.expired');
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  };

  const statusLabel = (status) => t(`fast_sale.status_${status}`, status);

  const tabs = [
    { value: 'matching', label: t('fast_sale.matching_cars'), count: matchingCars.length },
    { value: 'active', label: t('fast_sale.active_offers'), count: activeOffers.length },
    { value: 'history', label: t('fast_sale.history'), count: historyOffers.length },
  ];

  return (
    <div className="space-y-5">
      <Segmented value={tab} onChange={setTab} items={tabs} />

      {tab === 'matching' && (loadingCars ? <Loading /> : matchingCars.length === 0 ? (
        <Card><EmptyState icon={Car} title={t('fast_sale.no_matching_cars')} /></Card>
      ) : (
        <>
          <FastSaleFilters cars={matchingCars} onFiltered={setFilteredCars} />
          {filteredCars.length === 0 ? (
            <Card><EmptyState icon={Car} title={t('fast_sale.no_matching_cars')} /></Card>
          ) : (
            <div className={TILE_GRID}>
              {filteredCars.map((car) => (
                <SourcingTile key={car.id} car={car} rating={ratings[car.id]}>
                  <Button className="flex-1" onClick={() => openOffer(car)}><Send />{t('fast_sale.make_offer')}</Button>
                  <Button variant="secondary" size="icon" onClick={() => markNotInterested(car)}
                    title={t('fast_sale.not_interested')} aria-label={t('fast_sale.not_interested')}><X /></Button>
                </SourcingTile>
              ))}
            </div>
          )}
        </>
      ))}

      {tab === 'active' && (loadingOffers ? <Loading /> : activeOffers.length === 0 ? (
        <Card><EmptyState icon={Clock} title={t('fast_sale.no_active_offers')} /></Card>
      ) : (
        <Card bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {activeOffers.map((offer) => (
              <li key={offer.id} className="flex items-center gap-4 px-5 py-4">
                <Thumb src={offer.car_image} to={getCarDetailsPath({ id: offer.car_id })} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{offer.car_title}</p>
                  <p className="text-base font-bold text-ink">{formatPrice(offer.offered_price)} <span className="text-xs font-normal text-ink-3">/ {formatPrice(offer.car_price)}</span></p>
                  {offer.message && <p className="mt-0.5 truncate text-xs text-ink-3">«{offer.message}»</p>}
                </div>
                <span className="flex flex-shrink-0 items-center gap-1 text-xs font-medium text-amber-300"><Clock className="h-3.5 w-3.5" />{timeRemaining(offer.expires_at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      {tab === 'history' && (historyOffers.length === 0 ? (
        <Card><EmptyState icon={History} title={t('fast_sale.no_history')} /></Card>
      ) : (
        <Card bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {historyOffers.map((offer) => (
              <li key={offer.id} className="flex items-center gap-4 px-5 py-4">
                <Thumb src={offer.car_image} to={offer.not_interested ? undefined : getCarDetailsPath({ id: offer.car_id })} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{offer.car_title}</p>
                  <p className="text-sm text-ink-2">{offer.not_interested ? t('fast_sale.not_interested') : formatPrice(offer.offered_price)}</p>
                  {offer.status === 'accepted' && offer.deal_status && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-2"><Phone className="h-3.5 w-3.5" />{t('fast_sale.contact_info')}: {offer.seller_phone || '—'}</p>
                  )}
                </div>
                {!offer.not_interested && <OfferStatus status={offer.status} label={statusLabel(offer.status)} />}
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Dialog open={offerDialog} onOpenChange={setOfferDialog}>
        <DialogContent className={DIALOG}>
          <DialogHeader><DialogTitle className="text-ink">{t('fast_sale.make_offer')}</DialogTitle></DialogHeader>
          {selectedCar && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3 rounded-xl bg-raised p-3">
                <Thumb src={selectedCar.images?.[0]} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{selectedCar.brand} {selectedCar.model} {selectedCar.year}</p>
                  <p className="text-sm text-ink-2">{t('fast_sale.asking_price')}: {formatPrice(selectedCar.price)}</p>
                </div>
              </div>
              <label className="block"><span className={LABEL}>{t('fast_sale.offer_price')}, €</span>
                <Input type="number" inputMode="numeric" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} className={fieldClass} />
              </label>
              <label className="block"><span className={LABEL}>{t('fast_sale.additional_conditions')}</span>
                <Textarea value={offerConditions} onChange={(e) => setOfferConditions(e.target.value)} rows={2} placeholder={t('fast_sale.conditions_placeholder')} className="rounded-xl border-0 bg-raised text-ink" />
              </label>
              <label className="block"><span className={LABEL}>{t('fast_sale.message')}</span>
                <Textarea value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} rows={2} placeholder={t('fast_sale.message_placeholder')} className="rounded-xl border-0 bg-raised text-ink" />
              </label>
              <p className="flex items-center gap-1.5 text-xs text-ink-3"><Clock className="h-3.5 w-3.5" />{t('fast_sale.offer_validity_48h')}</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setOfferDialog(false)} className="flex-1">{t('fast_sale.cancel')}</Button>
                <Button onClick={submitOffer} disabled={submitting || !offerPrice} className="flex-1">
                  {submitting ? <Loader2 className="animate-spin" /> : <Send />}{t('fast_sale.send_offer')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
