import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatPrice } from '@/utils/format';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Car, Filter, MessageSquare, Zap, RotateCcw, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import InfoBanner from '@/components/dealer/InfoBanner';

export default function DealerCarsToBuy({ dealer }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filterCountry, setFilterCountry] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [offerDialog, setOfferDialog] = useState(false);
  const [offerType, setOfferType] = useState('instant_buy');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('');
  const [message, setMessage] = useState('');
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

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['tradeInCars', filterCountry, filterBrand, filterMode],
    queryFn: async () => {
      const filters = { status: 'active', seller_type: 'private' };
      if (filterCountry) filters.country = filterCountry;
      if (filterBrand) filters.brand = filterBrand;
      const all = await base44.entities.Car.filter(filters, '-created_date', 50);
      return all.filter(c => {
        const m = c.dealer_distribution_mode;
        if (!m || m === 'none') return false;
        if (filterMode === 'instant_buy') return m === 'instant_buy' || m === 'both';
        if (filterMode === 'consignment') return m === 'consignment' || m === 'both';
        return true;
      });
    },
    enabled: !!dealer?.id
  });

  const { data: myOffers = [] } = useQuery({
    queryKey: ['dealerTradeInOffers', dealer?.id],
    queryFn: () => base44.entities.TradeInOffer.filter({ dealer_id: dealer.id }),
    enabled: !!dealer?.id
  });

  const offeredCarIds = new Set(myOffers.map(o => o.car_id));

  const handleOpenOffer = (car) => {
    setSelectedCar(car);
    const mode = car.dealer_distribution_mode;
    if (mode === 'instant_buy') setOfferType('instant_buy');
    else if (mode === 'consignment') setOfferType('consignment');
    else setOfferType('instant_buy');
    setOfferedPrice('');
    setCommissionPercent('');
    setMessage('');
    setOfferDialog(true);
  };

  const handleSubmitOffer = async () => {
    if (!selectedCar) return;
    if (offerType === 'instant_buy' && !offeredPrice) { toast.error(t('dealer.specify_price')); return; }
    if (offerType === 'consignment' && !commissionPercent) { toast.error(t('dealer.specify_commission')); return; }

    setSubmitting(true);
    await base44.entities.TradeInOffer.create({
      car_id: selectedCar.id,
      dealer_id: dealer.id,
      dealer_name: dealer.name,
      dealer_email: dealer.email,
      seller_email: selectedCar.seller_id,
      car_title: selectedCar.title,
      offer_type: offerType,
      offered_price: offerType === 'instant_buy' ? parseFloat(offeredPrice) : null,
      commission_percent: offerType === 'consignment' ? parseFloat(commissionPercent) : null,
      message,
      status: 'pending'
    });
    queryClient.invalidateQueries(['dealerTradeInOffers']);
    toast.success(t('dealer.offer_sent'));
    setSubmitting(false);
    setOfferDialog(false);
  };

  const getOfferForCar = (carId) => myOffers.find(o => o.car_id === carId);

  const statusBadge = (status) => {
    const map = {
      pending: { label: t('dealer.offer_pending'), cls: 'bg-yellow-100 text-yellow-700' },
      accepted: { label: t('dealer.offer_accepted'), cls: 'bg-emerald-100 text-emerald-700' },
      rejected: { label: t('dealer.offer_rejected'), cls: 'bg-red-100 text-red-700' },
      more_info_requested: { label: t('dealer.offer_more_info'), cls: 'bg-blue-100 text-blue-700' },
    };
    const s = map[status] || map.pending;
    return <Badge className={s.cls}>{s.label}</Badge>;
  };

  const modeBadge = (mode) => {
    if (mode === 'instant_buy') return <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium"><Zap className="w-3 h-3" /> {t('dealer.instant_buy')}</span>;
    if (mode === 'consignment') return <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium"><RotateCcw className="w-3 h-3" /> {t('dealer.consignment')}</span>;
    return <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{t('dealer.both')}</span>;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <InfoBanner titleKey="dealer.info_buy_title" descKey="dealer.info_buy_desc" storageKey="dealer_info_buy_dismissed" />
      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-end">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">{t('dealer.filters')}:</span>
        </div>
        <div className="flex-1 min-w-[120px]">
          <Label className="text-xs mb-1">{t('dealer.country')}</Label>
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={t('dealer.all_countries')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>{t('dealer.all_countries')}</SelectItem>
              <SelectItem value="Латвия">{t('countries.Latvia') || t('listing.country_latvia')}</SelectItem>
              <SelectItem value="Литва">{t('countries.Lithuania') || t('listing.country_lithuania')}</SelectItem>
              <SelectItem value="Эстония">{t('countries.Estonia') || t('listing.country_estonia')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <Label className="text-xs mb-1">{t('dealer.brand')}</Label>
          <Input value={filterBrand} onChange={e => setFilterBrand(e.target.value)} placeholder={t('dealer.brand_placeholder')} className="h-9 text-sm" />
        </div>
        <div className="flex-1 min-w-[140px]">
          <Label className="text-xs mb-1">{t('dealer.deal_type')}</Label>
          <Select value={filterMode} onValueChange={setFilterMode}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={t('dealer.all_types')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>{t('dealer.all_types')}</SelectItem>
              <SelectItem value="instant_buy">{t('dealer.instant_buy')}</SelectItem>
              <SelectItem value="consignment">{t('dealer.consignment')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(filterCountry || filterBrand || filterMode) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterCountry(''); setFilterBrand(''); setFilterMode(''); }}>
            {t('dealer.reset')}
          </Button>
        )}
      </div>

      {/* Cars grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : cars.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-12 text-center border border-slate-100 dark:border-slate-800">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('dealer.no_cars_available')}</h3>
          <p className="text-sm text-slate-500">{t('dealer.no_offers_cars')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {cars.map(car => {
            const existingOffer = getOfferForCar(car.id);
            return (
              <div key={car.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                <div className="h-40 sm:h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {car.images?.[0] ? (
                    <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Car className="w-10 h-10 text-slate-300" /></div>
                  )}
                  <div className="absolute top-2 left-2">{modeBadge(car.dealer_distribution_mode)}</div>
                </div>

                <div className="p-3 sm:p-4 flex-1 flex flex-col gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{car.brand} {car.model} {car.year}</h3>
                    <p className="text-emerald-600 font-semibold text-lg">{formatPrice(car.price)}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {car.mileage && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{car.mileage.toLocaleString()} {t('dealer.km')}</span>}
                    {car.fuel_type && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{FUEL_LABELS[car.fuel_type]}</span>}
                    {car.transmission && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{TRANS_LABELS[car.transmission]}</span>}
                    {car.country && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{car.country}</span>}
                  </div>

                  <div className="mt-auto pt-2">
                    {existingOffer ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">{t('dealer.your_offer')}:</span>
                        {statusBadge(existingOffer.status)}
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleOpenOffer(car)}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 gap-2"
                        size="sm"
                      >
                        <MessageSquare className="w-4 h-4" /> {t('dealer.make_offer')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Offer Dialog */}
      <Dialog open={offerDialog} onOpenChange={setOfferDialog}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>{t('dealer.offer_for')} {selectedCar?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {selectedCar?.dealer_distribution_mode === 'both' && (
              <div>
                <Label className="mb-2 block">{t('dealer.deal_type')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'instant_buy', label: t('dealer.instant_buy'), icon: Zap, desc: t('dealer.instant_buy_desc') },
                    { value: 'consignment', label: t('dealer.consignment'), icon: RotateCcw, desc: t('dealer.consignment_desc') }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setOfferType(opt.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${offerType === opt.value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                    >
                      <opt.icon className={`w-4 h-4 mb-1 ${offerType === opt.value ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {offerType === 'instant_buy' && (
              <div>
                <Label>{t('dealer.offered_price')}</Label>
                <Input
                  type="number"
                  value={offeredPrice}
                  onChange={e => setOfferedPrice(e.target.value)}
                  placeholder={selectedCar ? Math.round(selectedCar.price * 0.85).toString() : ''}
                  className="mt-1"
                />
                {selectedCar && <p className="text-xs text-slate-400 mt-1">{t('dealer.asked_price')}: {formatPrice(selectedCar.price)}</p>}
              </div>
            )}

            {offerType === 'consignment' && (
              <div>
                <Label>{t('dealer.commission_pct')}</Label>
                <Input
                  type="number"
                  value={commissionPercent}
                  onChange={e => setCommissionPercent(e.target.value)}
                  placeholder="5"
                  min="1" max="30"
                  className="mt-1"
                />
                <p className="text-xs text-slate-400 mt-1">{t('dealer.commission_desc')}</p>
              </div>
            )}

            <div>
              <Label>{t('dealer.msg_seller')}</Label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={offerType === 'instant_buy'
                  ? t('dealer.msg_placeholder_buy')
                  : t('dealer.msg_placeholder_consignment')
                }
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setOfferDialog(false)} className="flex-1">{t('dealer.cancel')}</Button>
              <Button onClick={handleSubmitOffer} disabled={submitting} className="flex-1 bg-emerald-500 hover:bg-emerald-600 gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                {t('dealer.send_offer')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}