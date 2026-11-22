import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Car, Clock, Check, X, Zap, Phone, Mail, Handshake, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/format';

export default function FastSaleOffers({ user }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [acceptDialog, setAcceptDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [accepting, setAccepting] = useState(false);

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['fastSaleSellerOffers', user?.email],
    queryFn: () => base44.entities.TradeInOffer.filter({ seller_email: user.email, fast_sale: true }, '-created_date', 200),
    enabled: !!user
  });

  // Group offers
  const pendingOffers = useMemo(() => offers.filter(o => o.status === 'pending' && !o.not_interested), [offers]);
  const activeDeals = useMemo(() => offers.filter(o => o.status === 'accepted' || o.status === 'deal_in_progress' || o.status === 'completed'), [offers]);
  const historyOffers = useMemo(() => offers.filter(o => o.status === 'expired' || o.status === 'rejected' || o.status === 'cancelled'), [offers]);

  // Group pending offers by car
  const offersByCar = useMemo(() => {
    const map = {};
    pendingOffers.forEach(o => {
      if (!map[o.car_id]) map[o.car_id] = [];
      map[o.car_id].push(o);
    });
    return map;
  }, [pendingOffers]);

  const handleAccept = async () => {
    if (!selectedOffer) return;
    setAccepting(true);
    try {
      // 1. Accept the offer
      await base44.entities.TradeInOffer.update(selectedOffer.id, {
        status: 'accepted', deal_status: 'in_contact', seller_phone: user.phone || ''
      });
      // 2. Reject all other pending offers for the same car
      await base44.entities.TradeInOffer.updateMany(
        { car_id: selectedOffer.car_id, status: 'pending', fast_sale: true },
        { $set: { status: 'rejected' } }
      );
      // 3. Notify dealer
      await base44.entities.Notification.create({
        user_email: selectedOffer.dealer_email, type: 'offer_accepted',
        title: t('fast_sale.dealer_notif_title', { car: selectedOffer.car_title }),
        content: `${selectedOffer.car_title} — ${formatPrice(selectedOffer.offered_price)}`,
        data: { carTitle: selectedOffer.car_title },
        car_id: selectedOffer.car_id, car_title: selectedOffer.car_title,
        link: '/DealerDashboard', is_read: false
      });
      queryClient.invalidateQueries(['fastSaleSellerOffers', user?.email]);
      toast.success(t('fast_sale.offer_accepted_success'));
      setAcceptDialog(false);
    } catch (e) { toast.error(e.message); }
    setAccepting(false);
  };

  const handleReject = async (offer) => {
    try {
      await base44.entities.TradeInOffer.update(offer.id, { status: 'rejected', seller_response: 'rejected' });
      queryClient.invalidateQueries(['fastSaleSellerOffers', user?.email]);
      toast.success(t('fast_sale.offer_rejected_success'));
    } catch (e) { toast.error(e.message); }
  };

  const handleUpdateDealStatus = async (offer, status) => {
    try {
      await base44.entities.TradeInOffer.update(offer.id, { deal_status: status, status: status === 'completed' ? 'completed' : offer.status });
      queryClient.invalidateQueries(['fastSaleSellerOffers', user?.email]);
      toast.success(t('fast_sale.deal_status_updated'));
    } catch (e) { toast.error(e.message); }
  };

  const timeRemaining = (expiresAt) => {
    if (!expiresAt) return '';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return t('fast_sale.expired');
    const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const dealStatusLabel = (status) => {
    const map = {
      in_contact: { label: t('fast_sale.deal_in_contact'), icon: Phone },
      inspection_scheduled: { label: t('fast_sale.deal_inspection'), icon: Clock },
      completed: { label: t('fast_sale.deal_completed'), icon: Check },
      cancelled: { label: t('fast_sale.deal_cancelled'), icon: X },
    };
    return map[status] || map.in_contact;
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">{t('fast_sale.seller_title')}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{t('fast_sale.seller_desc')}</p>
          </div>
        </div>
      </div>

      {/* PENDING OFFERS - grouped by car */}
      {pendingOffers.length === 0 ? (
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-10 text-center">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">{t('fast_sale.no_offers_yet')}</p>
        </div>
      ) : (
        Object.entries(offersByCar).map(([carId, carOffers]) => {
          const sorted = [...carOffers].sort((a, b) => (b.offered_price || 0) - (a.offered_price || 0));
          const best = sorted[0];
          return (
            <div key={carId} className="bg-[#1b1b22] border border-[#292a32] rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-[#292a32] flex items-center gap-3">
                <div className="w-14 h-10 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                  {best.car_image ? <img src={best.car_image} alt="" className="w-full h-full object-cover" /> : <Car className="w-5 h-5 text-slate-600 m-auto" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm truncate">{best.car_title}</h3>
                  <p className="text-slate-500 text-xs">{t('fast_sale.asking_price')}: {formatPrice(best.car_price)}</p>
                </div>
                <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30">{sorted.length} {t('fast_sale.offers')}</Badge>
              </div>
              <div className="divide-y divide-[#292a32]">
                {sorted.map((offer, i) => (
                  <div key={offer.id} className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {i === 0 && <Award className="w-4 h-4 text-amber-400" />}
                      <span className="text-xs text-slate-500 hidden sm:inline">{i + 1}.</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-emerald-400 text-base">{formatPrice(offer.offered_price)}</p>
                        {i === 0 && <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1"><TrendingUp className="w-3 h-3" /> {t('fast_sale.best_price')}</Badge>}
                        <span className="flex items-center gap-1 text-xs text-yellow-400"><Clock className="w-3 h-3" /> {timeRemaining(offer.expires_at)}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{t('fast_sale.from_dealer')}: {offer.dealer_name}</p>
                      {offer.message && <p className="text-xs text-slate-500 mt-1 italic">"{offer.message}"</p>}
                      {offer.additional_conditions && <p className="text-xs text-slate-500 mt-0.5">📋 {offer.additional_conditions}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 gap-1.5" onClick={() => { setSelectedOffer(offer); setAcceptDialog(true); }}>
                        <Check className="w-3.5 h-3.5" /> {t('fast_sale.accept')}
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#292a32] text-slate-400 hover:text-red-400 hover:border-red-500/30" onClick={() => handleReject(offer)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* ACTIVE DEALS */}
      {activeDeals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Handshake className="w-4 h-4 text-emerald-400" /> {t('fast_sale.active_deals')}</h3>
          {activeDeals.map(offer => {
            const ds = dealStatusLabel(offer.deal_status);
            return (
              <div key={offer.id} className="bg-[#1b1b22] border border-emerald-500/30 rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                    {offer.car_image ? <img src={offer.car_image} alt="" className="w-full h-full object-cover" /> : <Car className="w-5 h-5 text-slate-600 m-auto" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm">{offer.car_title}</h3>
                    <p className="text-emerald-400 font-bold">{formatPrice(offer.offered_price)} <span className="text-slate-500 text-xs font-normal">· {offer.dealer_name}</span></p>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1"><ds.icon className="w-3 h-3" /> {ds.label}</Badge>
                </div>
                {/* Contact info */}
                <div className="bg-[#101014] rounded-xl p-3 mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300"><Phone className="w-4 h-4 text-emerald-400" /> {t('fast_sale.dealer_phone')}: <span className="text-white font-medium">{offer.dealer_phone || offer.dealer_email}</span></div>
                  <div className="flex items-center gap-2 text-slate-300"><Mail className="w-4 h-4 text-emerald-400" /> {offer.dealer_email}</div>
                </div>
                {/* Deal status actions */}
                {offer.deal_status !== 'completed' && offer.deal_status !== 'cancelled' && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="border-[#292a32] text-slate-300" onClick={() => handleUpdateDealStatus(offer, 'inspection_scheduled')}><Clock className="w-3.5 h-3.5" /> {t('fast_sale.mark_inspection')}</Button>
                    <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-400" onClick={() => handleUpdateDealStatus(offer, 'completed')}><Check className="w-3.5 h-3.5" /> {t('fast_sale.mark_completed')}</Button>
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400" onClick={() => handleUpdateDealStatus(offer, 'cancelled')}><X className="w-3.5 h-3.5" /> {t('fast_sale.cancel_deal')}</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* HISTORY */}
      {historyOffers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">{t('fast_sale.history')}</h3>
          <div className="space-y-2">
            {historyOffers.map(offer => (
              <div key={offer.id} className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-3 flex items-center gap-3 opacity-70">
                <div className="w-12 h-9 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                  {offer.car_image ? <img src={offer.car_image} alt="" className="w-full h-full object-cover" /> : <Car className="w-4 h-4 text-slate-600 m-auto" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{offer.car_title}</p>
                  <p className="text-slate-500 text-xs">{formatPrice(offer.offered_price)} · {offer.dealer_name}</p>
                </div>
                <Badge className={offer.status === 'expired' ? 'bg-slate-500/15 text-slate-400 border-slate-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}>
                  {offer.status === 'expired' ? t('fast_sale.expired') : t('fast_sale.rejected')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACCEPT DIALOG */}
      <Dialog open={acceptDialog} onOpenChange={setAcceptDialog}>
        <DialogContent className="max-w-md mx-4 bg-[#1b1b22] border-[#292a32]">
          <DialogHeader><DialogTitle className="text-white">{t('fast_sale.accept_confirm')}</DialogTitle></DialogHeader>
          {selectedOffer && (
            <div className="space-y-3 pt-2">
              <div className="bg-[#101014] rounded-xl p-3">
                <p className="text-white font-medium">{selectedOffer.dealer_name}</p>
                <p className="text-emerald-400 font-bold text-lg">{formatPrice(selectedOffer.offered_price)}</p>
                <p className="text-slate-500 text-xs mt-1">{selectedOffer.car_title}</p>
              </div>
              <p className="text-sm text-slate-400">{t('fast_sale.accept_caution')}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setAcceptDialog(false)} className="flex-1 border-[#292a32] text-slate-300">{t('fast_sale.cancel')}</Button>
                <Button onClick={handleAccept} disabled={accepting} className="flex-1 bg-emerald-500 hover:bg-emerald-600 gap-2">
                  {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {t('fast_sale.confirm_accept')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}