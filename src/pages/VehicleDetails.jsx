import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { entities, countView } from '@/api/entities';
import { redirectToAccount } from '@/components/auth/requireAccount';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart, Share2, MessageSquare, MapPin, Calendar,
  Gauge, Fuel, Palette, Flag, ArrowLeft,
  ChevronLeft, ChevronRight, User, Clock, Eye, Send,
  Copy, Facebook, Twitter, Mail, CheckCircle, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '@/components/favorites/FavoritesContext';

const ENTITY_MAP = {
  moto: 'Motorcycle',
  bus: 'Bus',
  special: 'SpecialEquipment',
  truck: 'Truck',
  boat: 'Boat',
  motorhome: 'Motorhome',
  trailer: 'Trailer',
};

const formatPrice = (price) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

export default function VehicleDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('id');
  const vehicleType = params.get('type') || 'moto';
  const entityName = ENTITY_MAP[vehicleType];

  const [user, setUser] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { isFavorite: isFavoriteInCtx, toggleFavorite } = useFavorites();
  const isFavorite = isFavoriteInCtx(itemId);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [message, setMessage] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) setUser(await base44.auth.me());
    });
  }, []);

  const { data: item, isLoading } = useQuery({
    queryKey: [entityName, itemId],
    queryFn: async () => {
      const items = await entities[entityName].filter({ id: itemId });
      if (items[0]) {
        countView(entityName, itemId);
      }
      return items[0] || null;
    },
    enabled: !!itemId && !!entityName,
  });

  const { data: dealer } = useQuery({
    queryKey: ['dealer', item?.dealer_id],
    queryFn: async () => {
      if (!item?.dealer_id) return null;
      const dealers = await entities.Dealer.filter({ id: item.dealer_id });
      return dealers[0] || null;
    },
    enabled: !!item?.dealer_id,
  });

  const handleFavoriteToggle = async () => {
    if (!user) { redirectToAccount(); return; }
    const wasFavorite = isFavorite;
    await toggleFavorite(itemId);
    toast.success(wasFavorite ? t('car.removed_favorite') : t('car.added_favorite'));
  };

  const handleSendMessage = async () => {
    if (!user) { redirectToAccount(); return; }
    const sellerEmail = item.created_by;
    if (!sellerEmail || sellerEmail === user.email) {
      toast.error(t('car.cant_message_self')); return;
    }
    const chatId = [user.email, sellerEmail, itemId].join('-').replace(/[^a-zA-Z0-9]/g, '_');
    await entities.Message.create({
      chat_id: chatId,
      sender_email: user.email,
      receiver_email: sellerEmail,
      car_id: itemId,
      content: message || `${t('car.interested_in')} ${item.brand} ${item.model}`,
    });
    setMessageSent(true);
    setShowContactForm(false);
    setMessage('');
    toast.success(t('car.message_sent'), { icon: '✉️' });
  };

  const handleReport = async () => {
    if (!user) { redirectToAccount(); return; }
    await entities.Report.create({
      reporter_email: user.email,
      target_type: vehicleType,
      target_id: itemId,
      reason: reportReason,
      description: reportDescription,
    });
    toast.success(t('car.report_sent'));
    setShowReportForm(false);
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = `${item.brand} ${item.model} ${item.year} — ${formatPrice(item.price)}`;
    if (platform === 'copy') { await navigator.clipboard.writeText(url); toast.success(t('car.link_copied')); }
    else if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    else if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    else if (platform === 'email') window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!item) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('car.not_found_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{t('car.not_found_desc')}</p>
        <Link to={`/VehicleCatalog?type=${vehicleType}`}>
          <Button>{t('car.back_to_catalog')}</Button>
        </Link>
      </div>
    </div>
  );

  // Build spec rows from available fields
  const specRows = [
    item.year && { label: t('car.spec_year', 'Год'), value: item.year },
    item.mileage != null && { label: t('car.spec_mileage', 'Пробег'), value: `${new Intl.NumberFormat().format(item.mileage)} ${t('car.km', 'км')}` },
    item.engine_power && { label: t('car.spec_power', 'Мощность'), value: `${Math.round(item.engine_power * 0.7355)} ${t('car.kw', 'кВт')}` },
    item.engine_volume && { label: t('car.spec_engine_vol', 'Объём'), value: `${item.engine_volume} ${t('car.liters', 'л')}` },
    item.fuel_type && { label: t('car.spec_fuel', 'Топливо'), value: t(`fuel_types.${item.fuel_type}`, item.fuel_type) },
    item.transmission && { label: t('car.spec_gearbox', 'КПП'), value: t(`transmission_types.${item.transmission}`, item.transmission) },
    item.color && { label: t('car.spec_color', 'Цвет'), value: item.color },
    item.condition && { label: t('car.spec_condition', 'Состояние'), value: t(`conditions.${item.condition}`, item.condition) },
    item.seats != null && { label: t('vehicle.seats', 'Мест'), value: item.seats },
    item.length_m && { label: t('vehicle.length', 'Длина'), value: `${item.length_m} ${t('vehicle.length_m', 'м')}` },
    item.axles != null && { label: t('vehicle.axles', 'Осей'), value: item.axles },
    item.payload_kg != null && { label: t('vehicle.payload', 'Грузоподъёмность'), value: `${new Intl.NumberFormat().format(item.payload_kg)} ${t('car.kg', 'кг')}` },
    item.berths != null && { label: t('vehicle.berths', 'Спальных мест'), value: item.berths },
    item.country && { label: t('car.spec_country', 'Страна'), value: item.country },
    item.location && { label: t('car.location', 'Город'), value: item.location },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Back nav */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            {t('car.back_to_catalog', 'Назад к каталогу')}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                {item.images?.length > 0 ? (
                  <>
                    <img src={item.images[selectedImageIndex]} alt={item.title} className="w-full h-full object-cover" />
                    {item.images.length > 1 && (
                      <>
                        <button onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                          disabled={selectedImageIndex === 0}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black flex items-center justify-center transition-colors disabled:opacity-30">
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button onClick={() => setSelectedImageIndex(Math.min(item.images.length - 1, selectedImageIndex + 1))}
                          disabled={selectedImageIndex === item.images.length - 1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black flex items-center justify-center transition-colors disabled:opacity-30">
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                          {selectedImageIndex + 1} / {item.images.length}
                        </div>
                      </>
                    )}
                    {item.is_premium && (
                      <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase">Premium</div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">{t('car.no_photos', 'Нет фото')}</div>
                )}
              </div>

              {/* Thumbnails */}
              {item.images?.length > 1 && (
                <div className="p-3">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {item.images.map((img, idx) => (
                      <button key={idx} onClick={() => setSelectedImageIndex(idx)}
                        className={cn("flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all",
                          idx === selectedImageIndex ? "border-emerald-500" : "border-transparent opacity-60 hover:opacity-100")}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-3">{t('car.description', 'Описание')}</h2>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {item.description || t('car.no_description', 'Описание отсутствует')}
              </p>
            </div>

            {/* Specs */}
            {specRows.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('car.specs', 'Характеристики')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 divide-y divide-slate-100 dark:divide-slate-800">
                  {specRows.map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2.5">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{row.label}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {item.features?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('car.equipment', 'Оснащение')}</h2>
                <div className="flex flex-wrap gap-2">
                  {item.features.map((f, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:self-start lg:sticky lg:top-4">
            {/* Price & Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="mb-4">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1 leading-tight">
                  {item.brand} {item.model} {item.year && <span className="text-slate-400 font-normal text-base">{item.year}</span>}
                </h1>
                {item.original_price && item.original_price > item.price && (
                  <p className="text-sm text-slate-400 line-through">{formatPrice(item.original_price)}</p>
                )}
                <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatPrice(item.price)}
                </p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4 flex-wrap">
                {user?.email === item.created_by && (
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.views_count || 0} {t('car.views', 'просмотров')}</span>
                )}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(item.created_date).toLocaleDateString('ru-RU')}</span>
              </div>

              {/* Location */}
              {(item.location || item.country) && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{item.location}{item.country && `, ${item.country}`}</span>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2.5">
                <Button
                  className="w-full gap-2 h-11 bg-emerald-500 hover:bg-emerald-600 text-sm"
                  disabled={!!(user && user.email === item.created_by) || messageSent}
                  onClick={() => { if (!user) { redirectToAccount(); return; } setShowContactForm(true); }}
                >
                  <MessageSquare className="w-4 h-4" />
                  {user?.email === item.created_by ? t('car.your_listing', 'Ваше объявление') : messageSent ? t('car.message_sent', 'Сообщение отправлено') : t('car.write_seller', 'Написать продавцу')}
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline"
                    className={cn("flex-1 gap-2 h-10 text-sm", isFavorite && "bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-400")}
                    onClick={handleFavoriteToggle}>
                    <Heart className={cn("w-4 h-4 flex-shrink-0", isFavorite && "fill-current")} />
                    <span className="hidden sm:inline">{isFavorite ? t('car.in_favorites', 'В избранном') : t('car.add_favorite', 'В избранное')}</span>
                  </Button>
                  <Button variant="outline" className="gap-2 h-10 px-3" onClick={() => setShowShareDialog(true)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Report */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => { if (!user) { redirectToAccount(); return; } setShowReportForm(true); }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors">
                  <Flag className="w-4 h-4" />{t('car.report', 'Пожаловаться')}
                </button>
              </div>
            </div>

            {/* Seller */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">{t('car.seller', 'Продавец')}</h3>
              {item.seller_type === 'dealer' && dealer ? (
                <Link to={`/DealerProfile?id=${dealer.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      {dealer.logo ? <img src={dealer.logo} alt={dealer.name} className="w-full h-full object-cover rounded-xl" /> : <Building2 className="w-6 h-6 text-blue-600" />}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white text-sm">{dealer.name}</div>
                      <div className="text-xs text-slate-500">{dealer.city}</div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white text-sm">{item.seller_type === 'dealer' ? t('car.dealer', 'Дилер') : t('car.private', 'Частное лицо')}</div>
                    {item.location && <div className="text-xs text-slate-500">{item.location}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('car.write_seller', 'Написать продавцу')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea placeholder={t('car.message_placeholder', 'Ваше сообщение...')} value={message} onChange={e => setMessage(e.target.value)} rows={4} className="resize-none" />
            <Button onClick={handleSendMessage} className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600">
              <Send className="w-4 h-4" />{t('car.send', 'Отправить')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('car.report', 'Жалоба')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <select value={reportReason} onChange={e => setReportReason(e.target.value)} className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 px-3 bg-white dark:bg-slate-800 text-sm">
              <option value="">{t('car.report_select_reason', 'Выберите причину')}</option>
              <option value="fraud">{t('car.report_fraud', 'Мошенничество')}</option>
              <option value="wrong_info">{t('car.report_wrong_info', 'Неверная информация')}</option>
              <option value="duplicate">{t('car.report_duplicate', 'Дубликат')}</option>
              <option value="sold">{t('car.report_sold', 'Уже продано')}</option>
              <option value="inappropriate">{t('car.report_inappropriate', 'Неподходящий контент')}</option>
            </select>
            <Textarea placeholder={t('car.report_placeholder', 'Подробнее...')} value={reportDescription} onChange={e => setReportDescription(e.target.value)} rows={3} />
            <Button onClick={handleReport} variant="destructive" className="w-full">{t('car.report_submit', 'Отправить жалобу')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle>{t('car.share', 'Поделиться')}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-4 gap-3 pt-2">
            {[
              { icon: Copy, label: t('car.copy_link', 'Копировать'), action: 'copy', color: 'text-slate-600' },
              { icon: Facebook, label: 'Facebook', action: 'facebook', color: 'text-blue-600' },
              { icon: Twitter, label: 'Twitter', action: 'twitter', color: 'text-sky-500' },
              { icon: Mail, label: 'Email', action: 'email', color: 'text-slate-600' },
            ].map(({ icon: Icon, label, action, color }) => (
              <button key={action} onClick={() => handleShare(action)} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Icon className={cn("w-6 h-6", color)} />
                <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}