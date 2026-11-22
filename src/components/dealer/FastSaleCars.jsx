import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { Loader2, Car, Clock, Check, X, Send, History, Eye, Zap, Handshake, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/format';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import FastSaleFilters from './FastSaleFilters';

const FUEL_LABELS_KEY = { petrol: 'fast_sale.fuel_petrol', diesel: 'fast_sale.fuel_diesel', electric: 'fast_sale.fuel_electric', hybrid: 'fast_sale.fuel_hybrid', plugin_hybrid: 'fast_sale.fuel_plugin_hybrid', gas: 'fast_sale.fuel_gas' };

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

  // Fetch dealer criteria
  const { data: criteria } = useQuery({
    queryKey: ['dealerCriteria', dealer?.id],
    queryFn: async () => {
      if (!dealer?.id) return null;
      const existing = await base44.entities.DealerPurchaseCriteria.filter({ dealer_id: dealer.id });
      return existing?.[0] || null;
    },
    enabled: !!dealer?.id
  });

  // Fetch all fast-sale offers for this dealer
  const { data: myOffers = [], isLoading: loadingOffers } = useQuery({
    queryKey: ['fastSaleOffers', dealer?.id],
    queryFn: () => base44.entities.TradeInOffer.filter({ dealer_id: dealer.id, fast_sale: true }, '-created_date', 200),
    enabled: !!dealer?.id
  });

  // Fetch active private seller cars
  const { data: allCars = [], isLoading: loadingCars } = useQuery({
    queryKey: ['fastSaleCars'],
    queryFn: () => base44.entities.Car.filter({ status: 'active', seller_type: 'private' }, '-created_date', 100),
    enabled: !!dealer?.id
  });

  const respondedCarIds = useMemo(() => new Set(myOffers.map(o => o.car_id)), [myOffers]);

  // Filter cars by criteria
  const matchingCars = useMemo(() => {
    const available = allCars.filter(c => !respondedCarIds.has(c.id));
    if (!criteria?.enabled) return available;
    return available.filter(car => {
      if (criteria.brands?.length > 0 && !criteria.brands.some(b => b.toLowerCase() === car.brand?.toLowerCase())) return false;
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

  const activeOffers = useMemo(() => myOffers.filter(o => o.status === 'pending'), [myOffers]);
  const historyOffers = useMemo(() => myOffers.filter(o => o.status !== 'pending'), [myOffers]);

  const openOffer = (car) => {
    setSelectedCar(car);
    setOfferPrice(Math.round(car.price * 0.85).toString());
    setOfferMessage('');
    setOfferConditions('');
    setOfferDialog(true);
  };

  const submitOffer = async () => {
    if (!selectedCar || !offerPrice) { toast.error(t('fast_sale.specify_price')); return; }
    setSubmitting(true);
    try {
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      await base44.entities.TradeInOffer.create({
        car_id: selectedCar.id,
        car_title: `${selectedCar.brand} ${selectedCar.model} ${selectedCar.year || ''}`.trim(),
        car_brand: selectedCar.brand, car_model: selectedCar.model, car_year: selectedCar.year,
        car_price: selectedCar.price, car_image: selectedCar.images?.[0] || '', car_country: selectedCar.country, car_mileage: selectedCar.mileage,
        dealer_id: dealer.id, dealer_name: dealer.name, dealer_email: dealer.email, dealer_phone: dealer.phone || '',
        seller_email: selectedCar.seller_id || '',
        offer_type: 'instant_buy', offered_price: parseFloat(offerPrice),
        message: offerMessage, additional_conditions: offerConditions,
        status: 'pending', fast_sale: true, expires_at: expiresAt
      });
      queryClient.invalidateQueries(['fastSaleOffers', dealer?.id]);
      toast.success(t('fast_sale.offer_sent'));
      setOfferDialog(false);
    } catch (e) { toast.error(e.message); }
    setSubmitting(false);
  };

  const markNotInterested = async (car) => {
    try {
      await base44.entities.TradeInOffer.create({
        car_id: car.id, car_title: `${car.brand} ${car.model} ${car.year || ''}`.trim(),
        car_brand: car.brand, car_model: car.model, car_year: car.year, car_price: car.price,
        car_image: car.images?.[0] || '', car_country: car.country, car_mileage: car.mileage,
        dealer_id: dealer.id, dealer_name: dealer.name, dealer_email: dealer.email,
        seller_email: car.seller_id || '', offer_type: 'instant_buy',
        not_interested: true, status: 'rejected', fast_sale: true
      });
      queryClient.invalidateQueries(['fastSaleOffers', dealer?.id]);
      toast.success(t('fast_sale.not_interested_saved'));
    } catch (e) { toast.error(e.message); }
  };

  const timeRemaining = (expiresAt) => {
    if (!expiresAt) return '';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return t('fast_sale.expired');
    const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const statusBadge = (status) => {
    const map = {
      pending: { label: t('fast_sale.status_pending'), cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
      accepted: { label: t('fast_sale.status_accepted'), cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
      deal_in_progress: { label: t('fast_sale.status_deal_in_progress'), cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
      completed: { label: t('fast_sale.status_completed'), cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
      expired: { label: t('fast_sale.status_expired'), cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
      rejected: { label: t('fast_sale.status_rejected'), cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
      cancelled: { label: t('fast_sale.status_cancelled'), cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
    };
    const s = map[status] || map.pending;
    return <Badge className={s.cls}>{s.label}</Badge>;
  };

  const tabs = [
    { key: 'matching', label: t('fast_sale.matching_cars'), icon: Car },
    { key: 'active', label: t('fast_sale.active_offers'), icon: Clock },
    { key: 'history', label: t('fast_sale.history'), icon: History },
  ];

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">{t('fast_sale.title')}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{t('fast_sale.dealer_desc')}</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[#101014] border border-[#292a32] rounded-xl p-1 overflow-x-auto scrollbar-hide">
        {tabs.map(item => (
          <button key={item.key} onClick={() => setTab(item.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === item.key ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            <item.icon className="w-4 h-4" /> {item.label}
          </button>
        ))}
      </div>

      {/* MATCHING CARS */}
      {tab === 'matching' && (
        <>
          {loadingCars ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          ) : matchingCars.length === 0 ? (
            <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-12 text-center">
              <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">{t('fast_sale.no_matching_cars')}</p>
            </div>
          ) : (
            <>
              <FastSaleFilters cars={matchingCars} onFiltered={setFilteredCars} />
              {filteredCars.length === 0 ? (
                <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-12 text-center">
                  <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">{t('fast_sale.no_matching_cars')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {filteredCars.map(car => (
                    <div key={car.id} className="bg-[#1b1b22] border border-[#292a32] rounded-2xl overflow-hidden flex flex-col">
                      <Link to={getCarDetailsPath(car)} className="h-36 sm:h-40 bg-[#292a32] relative block">
                        {car.images?.[0] ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Car className="w-8 h-8 text-slate-600" /></div>}
                      </Link>
                      <div className="p-3 flex-1 flex flex-col gap-2">
                        <div>
                          <h3 className="font-medium text-white text-sm truncate">{car.brand} {car.model} {car.year}</h3>
                          <p className="text-emerald-400 font-bold">{formatPrice(car.price)}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 text-xs text-slate-400">
                          {car.mileage && <span className="bg-[#292a32] px-1.5 py-0.5 rounded">{car.mileage.toLocaleString()} {t('dealer.km')}</span>}
                          {car.fuel_type && <span className="bg-[#292a32] px-1.5 py-0.5 rounded">{t(FUEL_LABELS_KEY[car.fuel_type] || car.fuel_type)}</span>}
                          {car.country && <span className="bg-[#292a32] px-1.5 py-0.5 rounded">{car.country}</span>}
                        </div>
                        <div className="mt-auto pt-1 flex gap-2">
                          <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600 gap-1.5" onClick={() => openOffer(car)}>
                            <Send className="w-3.5 h-3.5" /> {t('fast_sale.make_offer')}
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#292a32] text-slate-400 hover:text-red-400 hover:border-red-500/30" onClick={() => markNotInterested(car)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ACTIVE OFFERS */}
      {tab === 'active' && (
        <>
          {loadingOffers ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          ) : activeOffers.length === 0 ? (
            <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-12 text-center">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">{t('fast_sale.no_active_offers')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOffers.map(offer => (
                <div key={offer.id} className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <div className="w-full sm:w-24 h-20 rounded-xl overflow-hidden bg-[#292a32] flex-shrink-0">
                    {offer.car_image ? <img src={offer.car_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Car className="w-6 h-6 text-slate-600" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm">{offer.car_title}</h3>
                    <p className="text-emerald-400 font-bold">{formatPrice(offer.offered_price)} <span className="text-slate-500 text-xs font-normal">/ {formatPrice(offer.car_price)}</span></p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-yellow-400"><Clock className="w-3 h-3" /> {timeRemaining(offer.expires_at)}</span>
                      {offer.message && <span className="text-xs text-slate-500 truncate">"{offer.message}"</span>}
                    </div>
                  </div>
                  <Link to={`/CarDetails?id=${offer.car_id}`}>
                    <Button variant="outline" size="sm" className="border-[#292a32] text-slate-300"><Eye className="w-4 h-4" /></Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* HISTORY */}
      {tab === 'history' && (
        <>
          {historyOffers.length === 0 ? (
            <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-12 text-center">
              <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">{t('fast_sale.no_history')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyOffers.map(offer => (
                <div key={offer.id} className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <div className="w-full sm:w-20 h-16 rounded-xl overflow-hidden bg-[#292a32] flex-shrink-0">
                    {offer.car_image ? <img src={offer.car_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Car className="w-5 h-5 text-slate-600" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-white text-sm">{offer.car_title}</h3>
                      {statusBadge(offer.status)}
                    </div>
                    <p className="text-slate-400 text-sm">{formatPrice(offer.offered_price)} {offer.not_interested ? `· ${t('fast_sale.not_interested')}` : ''}</p>
                    {offer.status === 'accepted' && offer.deal_status && (
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="text-slate-500">{t('fast_sale.contact_info')}:</span>
                        <span className="flex items-center gap-1 text-slate-300"><Phone className="w-3 h-3" /> {offer.seller_phone || '—'}</span>
                      </div>
                    )}
                  </div>
                  {!offer.not_interested && <Link to={`/CarDetails?id=${offer.car_id}`}><Button variant="outline" size="sm" className="border-[#292a32] text-slate-300"><Eye className="w-4 h-4" /></Button></Link>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* OFFER DIALOG */}
      <Dialog open={offerDialog} onOpenChange={setOfferDialog}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto bg-[#1b1b22] border-[#292a32]">
          <DialogHeader><DialogTitle className="text-white">{t('fast_sale.make_offer')}</DialogTitle></DialogHeader>
          {selectedCar && (
            <div className="space-y-4 pt-2">
              <div className="bg-[#101014] rounded-xl p-3 flex gap-3">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                  {selectedCar.images?.[0] ? <img src={selectedCar.images[0]} alt="" className="w-full h-full object-cover" /> : <Car className="w-5 h-5 text-slate-600 m-auto" />}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{selectedCar.brand} {selectedCar.model} {selectedCar.year}</p>
                  <p className="text-slate-400 text-sm">{t('fast_sale.asking_price')}: {formatPrice(selectedCar.price)}</p>
                </div>
              </div>
              <div>
                <Label className="text-slate-400 mb-1 block">{t('fast_sale.offer_price')} €</Label>
                <Input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="bg-[#101014] border-[#292a32] text-white" />
              </div>
              <div>
                <Label className="text-slate-400 mb-1 block">{t('fast_sale.additional_conditions')}</Label>
                <Textarea value={offerConditions} onChange={e => setOfferConditions(e.target.value)} rows={2} placeholder={t('fast_sale.conditions_placeholder')} className="bg-[#101014] border-[#292a32] text-white" />
              </div>
              <div>
                <Label className="text-slate-400 mb-1 block">{t('fast_sale.message')}</Label>
                <Textarea value={offerMessage} onChange={e => setOfferMessage(e.target.value)} rows={2} placeholder={t('fast_sale.message_placeholder')} className="bg-[#101014] border-[#292a32] text-white" />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {t('fast_sale.offer_validity_48h')}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOfferDialog(false)} className="flex-1 border-[#292a32] text-slate-300">{t('fast_sale.cancel')}</Button>
                <Button onClick={submitOffer} disabled={submitting || !offerPrice} className="flex-1 bg-emerald-500 hover:bg-emerald-600 gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {t('fast_sale.send_offer')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}