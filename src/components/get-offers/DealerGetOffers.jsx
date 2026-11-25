import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPrice } from '@/utils/format';
import { Car, Loader2, Send, Search } from 'lucide-react';
import { toast } from 'sonner';
import { fieldClass, NativeSelect } from '@/components/ds';
import { Card, EmptyState } from '@/components/dealer-panel/ui';
import { TILE_GRID, DIALOG, LABEL, SourcingTile, Loading, Thumb, OfferStatus, useRatings } from '@/components/dealer-panel/sourcingParts';

/** Commission (Pro and Premium): private sellers who asked dealers for offers. */
export default function DealerGetOffers({ dealer }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [offerDialog, setOfferDialog] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [commissionPct, setCommissionPct] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: allCars = [], isLoading } = useQuery({
    queryKey: ['getOffersCarsDealer'],
    queryFn: () => entities.Car.filter({ status: 'active', seller_type: 'private' }, '-created_date', 200),
  });

  const cars = allCars.filter(c => c.features?.includes('get_offers'));

  const { data: myOffers = [] } = useQuery({
    queryKey: ['dealerSentOffers', dealer?.id],
    queryFn: () => entities.TradeInOffer.filter({ dealer_id: dealer.id }, '-created_date'),
    enabled: !!dealer?.id,
  });

  const sentCarIds = new Set(myOffers.map(o => o.car_id));

  const filtered = cars
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (c.brand + ' ' + c.model + ' ' + c.title).toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return 0;
    });

  const openOffer = (car) => {
    setSelectedCar(car);
    setCommissionPct('');
    setOfferMessage('');
    setOfferDialog(true);
  };

  const submitOffer = async () => {
    if (!selectedCar || !dealer) return;
    setSubmitting(true);
    try {
      await entities.TradeInOffer.create({
        car_id: selectedCar.id,
        car_title: selectedCar.title || `${selectedCar.brand} ${selectedCar.model} ${selectedCar.year || ''}`.trim(),
        dealer_id: dealer.id,
        dealer_name: dealer.name,
        dealer_email: dealer.email,
        seller_email: selectedCar.created_by,
        offer_type: 'consignment',
        commission_percent: parseFloat(commissionPct),
        message: offerMessage,
        status: 'pending',
      });
      queryClient.invalidateQueries({ queryKey: ['dealerSentOffers'] });
      toast.success(t('dealer.proposal_sent'));
      setOfferDialog(false);
    } catch (e) { toast.error(e.message); }
    setSubmitting(false);
  };

  const ratings = useRatings(filtered);
  const countBy = (st) => myOffers.filter((o) => o.status === st).length;
  const offerLabel = (st) => (st === 'accepted' ? t('dealer.offer_accepted') : st === 'rejected' ? t('dealer.offer_rejected') : t('dealer.offer_sent_status'));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('dealer.search_brand_model')} className={`${fieldClass} pl-9`} />
        </div>
        <NativeSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label={t('dp.sort', 'Сортировка')} wrapperClassName="w-56">
          <option value="newest">{t('dealer.sort_newest')}</option>
          <option value="price_asc">{t('dealer.price_asc')}</option>
          <option value="price_desc">{t('dealer.price_desc')}</option>
        </NativeSelect>
      </div>

      {myOffers.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-3">
          <span>{t('dp.offers_sent', 'Отправлено предложений')}: <b className="text-ink">{myOffers.length}</b></span>
          <span>{t('dealer.accepted')}: <b className="text-brand-text">{countBy('accepted')}</b></span>
          <span>{t('dealer.pending')}: <b className="text-amber-300">{countBy('pending')}</b></span>
          <span>{t('dealer.rejected')}: <b className="text-red-300">{countBy('rejected')}</b></span>
        </div>
      )}

      {isLoading ? <Loading /> : filtered.length === 0 ? (
        <Card><EmptyState icon={Car} title={t('dealer.no_cars_get_offers')} /></Card>
      ) : (
        <div className={TILE_GRID}>
          {filtered.map((car) => {
            const myOffer = myOffers.find((o) => o.car_id === car.id);
            return (
              <SourcingTile key={car.id} car={car} rating={ratings[car.id]}>
                {sentCarIds.has(car.id)
                  ? <OfferStatus status={myOffer?.status} label={offerLabel(myOffer?.status)} className="h-10 flex-1 justify-center rounded-xl text-sm" />
                  : <Button className="flex-1" onClick={() => openOffer(car)}><Send />{t('dealer.offer_btn')}</Button>}
              </SourcingTile>
            );
          })}
        </div>
      )}

      <Dialog open={offerDialog} onOpenChange={setOfferDialog}>
        <DialogContent className={DIALOG}>
          <DialogHeader><DialogTitle className="text-ink">{t('dealer.send_proposal')}</DialogTitle></DialogHeader>
          {selectedCar && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3 rounded-xl bg-raised p-3">
                <Thumb src={selectedCar.images?.[0]} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{selectedCar.brand} {selectedCar.model} {selectedCar.year}</p>
                  <p className="text-sm text-ink-2">{t('dealer.seller_price')}: {formatPrice(selectedCar.price)}</p>
                </div>
              </div>
              <p className="text-sm text-ink-2">{t('dealer.proposal_type')}: <b className="text-ink">{t('dealer.commission_label')}</b></p>
              <label className="block"><span className={LABEL}>{t('dealer.commission_pct_label')}</span>
                <Input type="number" inputMode="decimal" value={commissionPct} onChange={(e) => setCommissionPct(e.target.value)} placeholder="5" className={fieldClass} />
              </label>
              <label className="block"><span className={LABEL}>{t('dealer.msg_seller_optional')}</span>
                <Textarea value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} placeholder={t('dealer.msg_seller_placeholder')} rows={3} className="rounded-xl border-0 bg-raised text-ink" />
              </label>
              <div className="flex gap-2 pt-1">
                <Button variant="secondary" onClick={() => setOfferDialog(false)} className="flex-1">{t('dealer.cancel')}</Button>
                <Button onClick={submitOffer} disabled={submitting || !commissionPct} className="flex-1">
                  {submitting ? <Loader2 className="animate-spin" /> : <Send />}{t('dealer.send')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
