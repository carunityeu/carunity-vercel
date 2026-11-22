import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/utils/format';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import {
  RefreshCw, Car, Loader2, Gauge, Fuel, Settings2, MapPin,
  Eye, CheckCircle2, Send, ChevronDown, Search
} from 'lucide-react';
import { toast } from 'sonner';

export default function DealerGetOffers({ dealer }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [offerDialog, setOfferDialog] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [offerType, setOfferType] = useState('consignment');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [commissionPct, setCommissionPct] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const FUEL_LABELS = {
    petrol: t('dealer.fuel_petrol'),
    diesel: t('dealer.fuel_diesel'),
    electric: t('dealer.fuel_electric'),
    hybrid: t('dealer.fuel_hybrid'),
    plugin_hybrid: t('dealer.fuel_plugin_hybrid'),
    gas: t('dealer.fuel_gas'),
  };
  const TRANS_LABELS = { manual: t('dealer.trans_manual'), automatic: t('dealer.trans_auto') };

  const { data: allCars = [], isLoading } = useQuery({
    queryKey: ['getOffersCarsDealer'],
    queryFn: () => base44.entities.Car.filter({ status: 'active', seller_type: 'private' }, '-created_date', 200),
  });

  const cars = allCars.filter(c => c.features?.includes('get_offers'));

  const { data: myOffers = [] } = useQuery({
    queryKey: ['dealerSentOffers', dealer?.id],
    queryFn: () => base44.entities.TradeInOffer.filter({ dealer_id: dealer.id }, '-created_date'),
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
    setOfferType('consignment');
    setOfferedPrice('');
    setCommissionPct('');
    setOfferMessage('');
    setOfferDialog(true);
  };

  const submitOffer = async () => {
    if (!selectedCar || !dealer) return;
    setSubmitting(true);
    await base44.entities.TradeInOffer.create({
      car_id: selectedCar.id,
      car_title: selectedCar.title,
      dealer_id: dealer.id,
      dealer_name: dealer.name,
      dealer_email: dealer.email,
      seller_email: selectedCar.created_by,
      offer_type: offerType,
      offered_price: offerType === 'instant_buy' ? parseFloat(offeredPrice) : undefined,
      commission_percent: offerType === 'consignment' ? parseFloat(commissionPct) : undefined,
      message: offerMessage,
      status: 'pending',
    });
    queryClient.invalidateQueries(['dealerSentOffers']);
    toast.success(t('dealer.proposal_sent'));
    setSubmitting(false);
    setOfferDialog(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Info block */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-4 sm:p-6 border border-emerald-100 dark:border-emerald-900/40">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">{t('dealer.get_offers_title')}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {t('dealer.get_offers_desc')}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> {t('dealer.motivated_sellers')}
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> {t('dealer.buy_or_commission')}
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> {t('dealer.direct_contact')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My sent offers summary */}
      {myOffers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('dealer.sent_offers_count')} <strong className="text-slate-900 dark:text-white">{myOffers.length}</strong> {t('dealer.offers_word')}
            {t('dealer.accepted')}: <strong className="text-emerald-600">{myOffers.filter(o => o.status === 'accepted').length}</strong> •
            {t('dealer.pending')}: <strong className="text-yellow-600">{myOffers.filter(o => o.status === 'pending').length}</strong> •
            {t('dealer.rejected')}: <strong className="text-red-600">{myOffers.filter(o => o.status === 'rejected').length}</strong>
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('dealer.search_brand_model')}
            className="pl-9"
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm rounded-xl pl-4 pr-8 py-2 outline-none cursor-pointer h-10 w-full sm:w-auto"
          >
            <option value="newest">{t('dealer.sort_newest')}</option>
            <option value="price_asc">{t('dealer.price_asc')}</option>
            <option value="price_desc">{t('dealer.price_desc')}</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Cars list */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-12 text-center border border-slate-100 dark:border-slate-800">
          <Car className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{t('dealer.no_cars_get_offers')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map(car => {
            const alreadySent = sentCarIds.has(car.id);
            const myOffer = myOffers.find(o => o.car_id === car.id);
            return (
              <div key={car.id} className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                <div className="w-full sm:w-32 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  {car.images?.[0]
                    ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Car className="w-6 h-6 text-slate-400" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{car.brand} {car.model} {car.year}</h3>
                  <p className="text-emerald-600 font-bold">{formatPrice(car.price)}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {car.mileage && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Gauge className="w-3 h-3" />{car.mileage.toLocaleString()} {t('dealer.km')}
                      </span>
                    )}
                    {car.fuel_type && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Fuel className="w-3 h-3" />{FUEL_LABELS[car.fuel_type] || car.fuel_type}
                      </span>
                    )}
                    {car.transmission && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Settings2 className="w-3 h-3" />{TRANS_LABELS[car.transmission] || car.transmission}
                      </span>
                    )}
                    {car.location && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3" />{car.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={getCarDetailsPath(car)} target="_blank">
                    <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                  </Link>
                  {alreadySent ? (
                    <Badge className={
                      myOffer?.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      myOffer?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {myOffer?.status === 'accepted' ? t('dealer.offer_accepted') : myOffer?.status === 'rejected' ? t('dealer.offer_rejected') : t('dealer.offer_sent_status')}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      className="gap-1.5 bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => openOffer(car)}
                    >
                      <Send className="w-3.5 h-3.5" /> {t('dealer.offer_btn')}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Offer Dialog */}
      <Dialog open={offerDialog} onOpenChange={setOfferDialog}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('dealer.send_proposal')}</DialogTitle>
          </DialogHeader>
          {selectedCar && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-sm">
                <p className="font-medium text-slate-900 dark:text-white">{selectedCar.brand} {selectedCar.model} {selectedCar.year}</p>
                <p className="text-slate-500 dark:text-slate-400">{t('dealer.seller_price')}: {formatPrice(selectedCar.price)}</p>
              </div>

              <div>
                <Label className="mb-2 block">{t('dealer.proposal_type')}</Label>
                <div className="p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  🤝 {t('dealer.commission_label')}
                </div>
              </div>

              <div>
                <Label>{t('dealer.commission_pct_label')}</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={commissionPct}
                  onChange={e => setCommissionPct(e.target.value)}
                  placeholder="5"
                />
              </div>

              <div>
                <Label>{t('dealer.msg_seller_optional')}</Label>
                <Textarea
                  value={offerMessage}
                  onChange={e => setOfferMessage(e.target.value)}
                  placeholder={t('dealer.msg_seller_placeholder')}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={() => setOfferDialog(false)} className="flex-1">{t('dealer.cancel')}</Button>
                <Button
                  onClick={submitOffer}
                  disabled={submitting || !commissionPct}
                  className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {t('dealer.send')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}