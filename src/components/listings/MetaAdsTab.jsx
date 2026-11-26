import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Zap, Facebook, Instagram, Rocket, Star, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { META_ADS_PACKAGES } from '@/lib/metaAdsPackages';

function formatDate(dateStr, i18n) {
  const localeMap = { ru: 'ru-RU', en: 'en-GB', et: 'et-EE', lv: 'lv-LV', lt: 'lt-LT' };
  const locale = localeMap[i18n?.language?.slice(0, 2)] || 'ru-RU';
  return new Date(dateStr).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function MetaAdsTab({ car, sellerEmail, dealerId, onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(null);

  const handlePurchase = async () => {
    if (!selectedPackage || !car) return;
    setIsProcessing(true);
    try {
      const res = await base44.functions.invoke('createMetaAdsOrder', {
        packageId: selectedPackage.id,
        listingId: car.id,
        listingType: 'car',
        listingTitle: car.title,
        sellerEmail: sellerEmail || car.seller_id || '',
        dealerId: dealerId || car.dealer_id || null,
      });

      if (res.data?.error) throw new Error(res.data.error);

      setSuccess({
        packageName: selectedPackage.name,
        price: selectedPackage.price,
        platformUntil: res.data?.platform_promotion_until,
        metaBudget: selectedPackage.metaBudget,
      });
      toast.success(t('meta_ads.success_toast', 'Заказ принят! Реклама будет запущена в течение 24 часов.'));
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Meta Ads order error:', err);
      toast.error(t('meta_ads.error_toast', 'Ошибка при оформлении заказа'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-5 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">{t('meta_ads.success_title', 'Заказ принят!')}</h2>
        <p className="text-slate-400 text-sm mb-3">{success.packageName}</p>
        <p className="text-2xl font-bold text-white mb-3">{success.price}€</p>
        <div className="bg-[#101014] border border-[#292a32] rounded-xl p-3 mb-5 w-full max-w-xs">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
            <Facebook className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('meta_ads.meta_budget', 'Бюджет Meta Ads')}: <span className="text-white font-semibold">{success.metaBudget}€</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('meta_ads.platform_active', 'Платформенное продвижение активировано')}</span>
          </div>
          {success.platformUntil && (
            <p className="text-[11px] text-emerald-400 mt-1.5 ml-5">
              {t('meta_ads.active_until', 'Активно до')}: {formatDate(success.platformUntil, i18n)}
            </p>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-5 max-w-xs">
          {t('meta_ads.fulfillment_note', 'Наша команда настроит и запустит рекламу в Facebook и Instagram в течение 24 часов. Вы получите уведомление о запуске.')}
        </p>
        <Button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-600 px-8">
          {t('promote.done', 'Готово')}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex items-center gap-1">
            <Facebook className="w-4 h-4 text-blue-400" />
            <Instagram className="w-4 h-4 text-pink-400" />
          </div>
          <h3 className="font-semibold text-white text-sm">{t('meta_ads.section_title', 'Реклама в Facebook и Instagram')}</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t('meta_ads.section_desc', 'Мы настроим и запустим рекламу вашего автомобиля в Facebook и Instagram. Рекламу увидят тысячи потенциальных покупателей в Балтии.')}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">{t('meta_ads.forecast_note', 'Охват — прогноз: фактическое число показов зависит от аукциона Meta.')}</p>
      </div>

      {/* Package cards */}
      <div className="space-y-2.5">
        {META_ADS_PACKAGES.map((pkg) => {
          const isSelected = selectedPackage?.id === pkg.id;
          return (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={cn(
                "w-full rounded-xl border p-3.5 sm:p-4 text-left transition-all relative",
                isSelected
                  ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50"
                  : "border-[#292a32] bg-[#101014] hover:border-[#292a32]"
              )}
            >
              {pkg.highlight && (
                <span className="absolute -top-2 right-3 text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                  {t('meta_ads.popular', 'Популярный')}
                </span>
              )}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {pkg.id === 'meta_top' ? (
                    <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  ) : pkg.id === 'meta_premium' ? (
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  ) : (
                    <Rocket className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                  <span className="font-bold text-white text-sm">{pkg.name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-bold text-base sm:text-lg">{pkg.price}€</div>
                </div>
              </div>
              {/* What's included */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Facebook className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <span>{pkg.metaBudget}€</span>
                  <span className="text-slate-500">— {t('meta_ads.meta_budget_label', 'реклама в Meta')}</span>
                </div>
                {pkg.platformPromotionType === 'boost' && pkg.boostDays > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Rocket className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>{t('promote.boost_title', 'Буст')} {pkg.boostDays} {t('promote.days_word', 'дней')}</span>
                    <span className="text-slate-500">({pkg.boostPrice}€)</span>
                  </div>
                )}
                {pkg.platformPromotionType === 'top_spot' && pkg.topSpotDays > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span>TOP Spot {pkg.topSpotDays} {t('promote.days_word', 'дней')}</span>
                    <span className="text-slate-500">({pkg.topSpotPrice}€)</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Check className="w-3 h-3 text-emerald-500/60 flex-shrink-0" />
                  <span>CarUnity {t('meta_ads.service_fee', 'услуга')}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Total + pay */}
      <div className="pt-3 border-t border-[#292a32] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">{t('promote.total', 'Итого')}</span>
          <span className="text-2xl font-bold text-white">{selectedPackage ? `${selectedPackage.price}€` : '—'}</span>
        </div>
        <Button
          onClick={handlePurchase}
          disabled={!selectedPackage || isProcessing}
          className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white gap-2 disabled:opacity-40"
        >
          {isProcessing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {t('meta_ads.processing', 'Оформление...')}</>
          ) : (
            <><Zap className="w-4 h-4" /> {t('meta_ads.order_activate', 'Заказать и активировать')}</>
          )}
        </Button>
        <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <Check className="w-3 h-3 text-emerald-500/60" />
          {t('meta_ads.fulfillment_hint', 'Платформенное продвижение активируется сразу, реклама в Meta — в течение 24 часов')}
        </p>
      </div>
    </div>
  );
}