import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Rocket, Crown, Sparkles, Star, Check, Target, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { META_ADS_PACKAGES } from '@/lib/metaAdsPackages';

export default function TargetAdsSection({ ctaLink }) {
  const { t } = useTranslation();

  return (
    <div className="mt-8 sm:mt-12 rounded-3xl overflow-hidden shadow-xl border border-emerald-500/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-white/20 rounded-xl p-2.5">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Facebook className="w-4 h-4 text-white" />
              <Instagram className="w-4 h-4 text-white" />
              <div className="text-white font-bold text-base sm:text-lg leading-tight">
                {t('pricing.target_section_title')}
              </div>
            </div>
            <div className="text-emerald-100 text-sm">{t('pricing.target_section_desc')}</div>
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className="bg-slate-900 px-5 sm:px-8 pt-4 pb-2">
        <p className="text-xs text-slate-400 flex items-start gap-1.5">
          <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-400" />
          <span>{t('pricing.target_hint')}</span>
        </p>
      </div>

      {/* Package cards */}
      <div className="bg-slate-900 px-5 sm:px-8 pb-6 pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {META_ADS_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "rounded-2xl p-4 border-2 transition-all relative flex flex-col",
                pkg.highlight
                  ? "border-emerald-500 bg-emerald-900/20 ring-1 ring-emerald-500/30"
                  : "border-slate-700 bg-slate-800"
              )}
            >
              {pkg.highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] bg-emerald-500 text-white px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                  {t('pricing.target_popular')}
                </span>
              )}
              <div className="flex items-center gap-2 mb-2.5">
                {pkg.id === 'meta_top' ? (
                  <Crown className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                ) : pkg.id === 'meta_premium' ? (
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Rocket className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
                <span className="font-bold text-white text-sm">{pkg.name}</span>
              </div>

              <div className="mb-3">
                <span className="text-2xl font-bold text-white">{pkg.price}€</span>
              </div>

              <div className="space-y-1.5 mb-4 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <Facebook className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold text-white">{pkg.metaBudget}€</span>
                  <span className="text-slate-500">— {t('pricing.target_meta_budget')}</span>
                </div>
                {pkg.platformPromotionType === 'boost' && pkg.boostDays > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <Rocket className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>{t('pricing.target_boost')} {pkg.boostDays} {t('pricing.target_days')}</span>
                  </div>
                )}
                {pkg.platformPromotionType === 'top_spot' && pkg.topSpotDays > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <Star className="w-3 h-3 text-emerald-300 flex-shrink-0" />
                    <span>{t('pricing.target_top_spot')} {pkg.topSpotDays} {t('pricing.target_days')}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Check className="w-3 h-3 text-emerald-500/60 flex-shrink-0" />
                  <span>{t('pricing.target_service_fee')}</span>
                </div>
              </div>

              <Link to={ctaLink}>
                <Button
                  className={cn(
                    "w-full h-9 text-xs gap-1",
                    pkg.highlight
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-slate-700 hover:bg-slate-600"
                  )}
                >
                  {t('pricing.target_order_btn')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}