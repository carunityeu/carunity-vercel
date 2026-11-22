import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Car, Plus, Edit2, Trash2, Eye, Tag, Check, X, Loader2, RefreshCw, Clock, Rocket, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import RemoveListingDialog from '@/components/listings/RemoveListingDialog';
import PromoteListingModal, { isPromotionActive } from '@/components/listings/PromoteListingModal';
import PromoteListingPicker from '@/components/dealer/PromoteListingPicker';
import RenewalInsights from '@/components/dashboard/RenewalInsights';
import SaleCheckPrompt from '@/components/dashboard/SaleCheckPrompt';
import { cn } from '@/lib/utils';
import ListPagination from '@/components/ui/ListPagination';

const CARD = 'bg-[#1b1b22] border border-[#292a32]';

export default function MyListingsPanel({ user, cars = [], isLoading = false, locale }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [editPriceCarId, setEditPriceCarId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [showPriceConfirm, setShowPriceConfirm] = useState(false);
  const [pendingPriceCar, setPendingPriceCar] = useState(null);
  const [showCooldownDialog, setShowCooldownDialog] = useState(false);
  const [cooldownCar, setCooldownCar] = useState(null);
  const [removeDialogCar, setRemoveDialogCar] = useState(null);
  const [promoteCars, setPromoteCars] = useState([]);
  const [promotePickerOpen, setPromotePickerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(cars.length / PAGE_SIZE));
  const pagedCars = cars.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const refresh = () => queryClient.invalidateQueries(['myListings']);

  const { data: renewals = [] } = useQuery({
    queryKey: ['listingRenewals', user?.email],
    queryFn: async () => {
      const { items } = await base44.entities.ListingRenewal.filter({ seller_email: user.email }, { sort: '-created_date', limit: 200 });
      return items;
    },
    enabled: !!user?.email,
  });
  const { data: saleFeedback = [] } = useQuery({
    queryKey: ['saleFeedback', user?.email],
    queryFn: async () => {
      const { items } = await base44.entities.SaleFeedback.filter({ seller_email: user.email }, { sort: '-created_date', limit: 200 });
      return items;
    },
    enabled: !!user?.email,
  });
  const feedbackMap = saleFeedback.reduce((map, item) => {
    if (!map[item.listing_id]) map[item.listing_id] = item;
    return map;
  }, {});
  const renewalMap = renewals.reduce((map, renewal) => {
    const current = map[renewal.car_id];
    if (!current || new Date(renewal.expires_at) > new Date(current)) map[renewal.car_id] = renewal.expires_at;
    return map;
  }, {});
  const money = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value || 0);

  const statusStyles = {
    active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    sold: 'bg-slate-500/15 text-slate-400 border border-slate-500/25',
    rejected: 'bg-red-500/15 text-red-400 border border-red-500/25'
  };

  const formatDateTime = (dateStr) =>
    new Date(dateStr).toLocaleString(locale, {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  const getUnlockDate = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 3);
    return formatDateTime(date.toISOString());
  };

  const handleOpenPriceEdit = (car) => {
    setEditPriceCarId(car.id);
    setNewPrice(car.price.toString());
  };

  const handleSavePrice = async (car) => {
    const parsed = parseFloat(newPrice);
    if (!parsed || parsed <= 0) return;
    if (car.price_updated_at) {
      const daysSince = (Date.now() - new Date(car.price_updated_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) {
        setCooldownCar(car);
        setShowCooldownDialog(true);
        return;
      }
    }
    setSavingPrice(true);
    const updates = { price: parsed, price_updated_at: new Date().toISOString() };
    updates.original_price = parsed < car.price ? (car.original_price || car.price) : null;
    await base44.entities.Car.update(car.id, updates);
    refresh();
    toast.success(t('dashboard.price_updated'));
    setEditPriceCarId(null);
    setSavingPrice(false);
  };

  const handleRemoveConfirm = async (carId, reason) => {
    if (reason === 'sold') {
      await base44.entities.Car.update(carId, { status: 'sold' });
      toast.success(t('dashboard.marked_sold'));
    } else {
      await base44.entities.Car.delete(carId);
      // Снятое объявление не должно оставаться в просмотренных
      base44.entities.ViewHistory.deleteMany({ car_id: carId }).catch(() => {});
      try {
        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        localStorage.setItem('recentlyViewed', JSON.stringify(recent.filter((id) => id !== carId)));
      } catch {}
      toast.success(t('dashboard.listing_removed'));
    }
    refresh();
  };

  const handlePickerPromote = (selectedCars) => {
    if (selectedCars.length === 0) return;
    setPromoteCars(selectedCars);
  };

  const handlePromoteModalClose = () => setPromoteCars([]);

  const isPriceIncrease = pendingPriceCar && parseFloat(newPrice) > pendingPriceCar.price;
  const localeMap = { ru: 'ru-RU', en: 'en-GB', et: 'et-EE', lv: 'lv-LV', lt: 'lt-LT' };
  const carLocale = localeMap[i18n.language?.slice(0, 2)] || locale;

  return (
    <div className="space-y-4">
      <AlertDialog open={showCooldownDialog} onOpenChange={setShowCooldownDialog}>
        <AlertDialogContent className="bg-[#1b1b22] border-[#292a32]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t('dashboard.cooldown_title')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-slate-400">
                <p>🕐 {t('dashboard.cooldown_desc')}</p>
                {cooldownCar?.price_updated_at && (
                  <>
                    <p>{t('dashboard.cooldown_changed')}: <strong className="text-slate-200">{formatDateTime(cooldownCar.price_updated_at)}</strong></p>
                    <p>{t('dashboard.cooldown_unlock')}: <strong className="text-slate-200">{getUnlockDate(cooldownCar.price_updated_at)}</strong></p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowCooldownDialog(false)} className="bg-secondary hover:bg-accent border border-border text-foreground">
              {t('dashboard.got_it')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPriceConfirm} onOpenChange={setShowPriceConfirm}>
        <AlertDialogContent className="bg-[#1b1b22] border-[#292a32]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t('dashboard.confirm_price_title')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-slate-400">
                <p>{t('dashboard.confirm_price_desc', { from: pendingPriceCar ? money(pendingPriceCar.price) : '', to: newPrice ? money(parseFloat(newPrice)) : '' })}</p>
                <p>⏱ {t('dashboard.confirm_price_cooldown')}</p>
                {isPriceIncrease && <p>📈 {t('dashboard.confirm_price_increase')}</p>}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#292a32] border-[#292a32] text-white">{t('dashboard.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-secondary hover:bg-accent border border-border text-foreground"
              onClick={() => { setShowPriceConfirm(false); handleSavePrice(pendingPriceCar); }}
            >
              {t('dashboard.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RemoveListingDialog
        car={removeDialogCar}
        open={!!removeDialogCar}
        onClose={() => setRemoveDialogCar(null)}
        onConfirm={handleRemoveConfirm}
      />
      <PromoteListingModal
        cars={promoteCars}
        open={promoteCars.length > 0}
        onClose={handlePromoteModalClose}
        onSuccess={refresh}
        sellerEmail={user?.email}
      />
      <PromoteListingPicker
        open={promotePickerOpen}
        onClose={() => setPromotePickerOpen(false)}
        dealerCars={cars}
        preselectedCarIds={[]}
        onPromoteSelected={handlePickerPromote}
      />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-white">{t('account.nav_listings')}</h1>
        <Button
          onClick={() => setPromotePickerOpen(true)}
          className="gap-2 bg-secondary border border-border text-foreground hover:bg-accent text-sm h-9 px-3"
        >
          <Rocket className="w-4 h-4" />
          <span>{t('promote.button', 'Продвинуть')}</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
        </div>
      ) : cars.length === 0 ? (
        <div className={cn(CARD, 'rounded-xl p-10 text-center')}>
          <div className="w-14 h-14 bg-[#292a32] rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.no_listings_title')}</h3>
          <p className="text-slate-500 mb-6">{t('dashboard.no_listings_desc')}</p>
          <Link to="/CreateListing">
            <Button className="gap-2 bg-secondary hover:bg-accent border border-border text-foreground">
              <Plus className="w-4 h-4" />
              {t('dashboard.add_listing')}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t('dashboard.total'), value: cars.length, color: 'text-white' },
              { label: t('dashboard.status_active'), value: cars.filter((c) => c.status === 'active').length, color: 'text-emerald-400' },
              { label: t('dashboard.status_sold'), value: cars.filter((c) => c.status === 'sold').length, color: 'text-slate-400' },
              { label: t('dashboard.status_pending'), value: cars.filter((c) => c.status === 'pending').length, color: 'text-foreground' }
            ].map((stat, index) => (
              <div key={index} className={cn(CARD, 'rounded-xl p-3 text-center')}>
                <p className={cn('text-xl sm:text-2xl font-bold', stat.color)}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {pagedCars.map((car) => {
              const carExpiresAt = renewalMap[car.id]
                ? new Date(renewalMap[car.id])
                : new Date(new Date(car.created_date).getTime() + 30 * 24 * 60 * 60 * 1000);
              const isCarExpired = car.status === 'active' && carExpiresAt < new Date();
              const daysLeft = Math.ceil((carExpiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
              const feedback = feedbackMap[car.id];
              const isPrivateListing = car.seller_type !== 'dealer' && (!car.seller_id || car.seller_id === user?.email);
              const showSaleCheck = isPrivateListing && car.status === 'active' && daysLeft <= 3 && !feedback;
              const showRenewal = isPrivateListing && car.status === 'active' && daysLeft <= 7 && !showSaleCheck;
              return (
                <div key={car.id} className={cn(CARD, 'rounded-xl p-4 flex flex-col sm:flex-row gap-4', isCarExpired && 'opacity-70')}>
                  <div className="w-full sm:w-36 h-24 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                    {car.images?.[0] ? (
                      <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">{t('car.no_photo')}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={cn('font-semibold text-sm sm:text-base', isCarExpired ? 'text-slate-500' : 'text-white')}>
                        {car.brand} {car.model} {car.year}
                      </h3>
                      <Badge className={cn(statusStyles[car.status] || statusStyles.pending, 'text-xs')}>
                        {t('dashboard.status_' + car.status, car.status)}
                      </Badge>
                      {isPromotionActive(car) && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs gap-1">
                          <Sparkles className="w-3 h-3" />
                          {t('promote.premium_until_short', 'Премиум')} {new Date(car.promotion_until).toLocaleDateString(carLocale)}
                        </Badge>
                      )}
                    </div>
                    {car.original_price && car.original_price > car.price && (
                      <p className="text-xs text-slate-600 line-through mt-0.5">{money(car.original_price)}</p>
                    )}
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">{money(car.price)}</p>
                    {editPriceCarId === car.id && (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          value={newPrice}
                          onChange={(event) => setNewPrice(event.target.value)}
                          className="h-8 w-28 text-sm bg-[#101014] border-[#292a32] text-white"
                          autoFocus
                        />
                        <span className="text-sm text-slate-500">EUR</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-foreground"
                          disabled={savingPrice}
                          onClick={() => { setPendingPriceCar(car); setShowPriceConfirm(true); }}
                        >
                          {savingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500" onClick={() => setEditPriceCarId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {car.views_count || 0} {t('car.views')}</span>
                      <span>{new Date(car.created_date).toLocaleDateString(carLocale)}</span>
                      <span className={cn('flex items-center gap-1', isCarExpired && 'text-slate-600')}>
                        <Clock className="w-3.5 h-3.5" />
                        {t('dashboard.listing_expires')}: {carExpiresAt.toLocaleDateString(carLocale)}
                        {isCarExpired && <span className="ml-1">({t('dashboard.expired')})</span>}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button variant="outline" size="sm" className="gap-1 text-foreground bg-secondary border-border hover:bg-accent h-8" onClick={() => setPromoteCars([car])}>
                        <Rocket className="w-3.5 h-3.5" /> {t('promote.button', 'Продвинуть')}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-foreground bg-secondary border-border hover:bg-accent h-8" onClick={() => handleOpenPriceEdit(car)}>
                        <Tag className="w-3.5 h-3.5" /> {t('dashboard.edit_price')}
                      </Button>
                      <Link to={`/EditListing?id=${car.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-foreground bg-secondary border-border hover:bg-accent h-8">
                          <Edit2 className="w-3.5 h-3.5" /> {t('dashboard.edit_listing', 'Редактировать')}
                        </Button>
                      </Link>
                      <Link to={getCarDetailsPath(car)}>
                        <Button variant="outline" size="sm" className="gap-1 text-foreground bg-secondary border-border hover:bg-accent h-8">
                          <Eye className="w-3.5 h-3.5" /> {t('dashboard.preview')}
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="gap-1 text-foreground bg-secondary border-border hover:bg-accent h-8" onClick={() => setRemoveDialogCar(car)}>
                        <Trash2 className="w-3.5 h-3.5" /> {t('dashboard.remove')}
                      </Button>
                    </div>
                    {showSaleCheck && (
                      <SaleCheckPrompt
                        car={car}
                        sellerEmail={user?.email}
                        daysLeft={daysLeft}
                        onAnswered={() => {
                          queryClient.invalidateQueries(['saleFeedback']);
                          refresh();
                        }}
                      />
                    )}
                    {showRenewal && (
                      <RenewalInsights car={car} onRenewed={refresh} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}