import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Check, User, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { PRICING_MODAL_CONTENT } from '@/lib/pricingModalContent';

const HOW_ICONS = [User, Zap, TrendingUp];

function getGridClass(count) {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count === 3) return 'grid-cols-1 sm:grid-cols-3';
  if (count === 4) return 'grid-cols-1 sm:grid-cols-2';
  if (count === 5) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
}

function getCompactGridClass(count) {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-2';
  if (count === 3) return 'grid-cols-3';
  if (count === 4) return 'grid-cols-2 sm:grid-cols-4';
  return 'grid-cols-3 sm:grid-cols-5';
}

export default function PricingDetailModal({ service, onClose }) {
  const { i18n } = useTranslation();
  if (!service) return null;

  const { icon: Icon, title, tiers, link, id } = service;
  const lang = (i18n.language || 'ru').split('-')[0];
  const content = PRICING_MODAL_CONTENT[lang] || PRICING_MODAL_CONTENT.ru;
  const serviceContent = content.services[id] || content.services.target;
  const isVariant = id === 'boost' || id === 'highlight';

  return (
    <Dialog open={!!service} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#1B1B22] border-[#292A32] text-white max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#292a32]">
          <div className="flex items-start gap-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight">{title}</h2>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{serviceContent.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto" style={{ maxHeight: '55vh' }}>
          {isVariant ? (
            <div className="p-5 sm:p-6">
              <h3 className="text-white font-semibold text-sm mb-3">{content.included_title}</h3>
              <div className="space-y-2 mb-5">
                {serviceContent.features.map((feat, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300 leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
              <h3 className="text-white font-semibold text-sm mb-3">{content.choose_title}</h3>
              <div className={`grid ${getCompactGridClass(tiers.length)} gap-2`}>
                {tiers.map((tier, i) => (
                  <div key={i} className="rounded-xl border border-[#292a32] bg-[#101014] p-3 flex flex-col items-center text-center hover:border-emerald-500/40 transition-colors">
                    <div className="text-slate-400 text-xs leading-tight">{tier.label}</div>
                    <div className="text-lg sm:text-xl font-bold text-white mt-1">{tier.price}</div>
                    {tier.sublabel && <div className="text-xs text-slate-500 mt-0.5">{tier.sublabel}</div>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6 pb-2">
              <div className={`grid ${getGridClass(tiers.length)} gap-3`}>
                {tiers.map((tier, i) => (
                  <div key={i} className="rounded-xl border border-[#292a32] bg-[#101014] p-4 flex flex-col">
                    <h3 className="text-white font-bold text-sm sm:text-base leading-tight">{tier.label}</h3>
                    <div className="text-xl sm:text-2xl font-bold text-white mt-1">{tier.price}</div>
                    {tier.sublabel && (
                      <div className="text-xs text-slate-500 mt-0.5">{tier.sublabel}</div>
                    )}
                    <div className="mt-3 space-y-2">
                      {(serviceContent.tierFeatures?.[i] || serviceContent.features).map((feat, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-300 leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-4">
            <h3 className="text-white font-bold text-base sm:text-lg mb-4">{content.how_title}</h3>
            <div className="space-y-4">
              {serviceContent.how.map((item, i) => {
                const HowIcon = HOW_ICONS[i] || User;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#2A2B33] flex items-center justify-center flex-shrink-0">
                      <HowIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                      <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        {link && (
          <div className="p-5 sm:p-6 border-t border-[#292a32]">
            <Link to={link} onClick={onClose}>
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 text-base">
                {content.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}