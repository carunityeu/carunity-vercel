import React from 'react';
import { Share2 } from 'lucide-react';
import { META_ADS_PACKAGES } from '@/lib/metaAdsPackages';
import usePromotionCopy from '@/components/listings/promote/usePromotionCopy';
export default function PromotionMetaOptions({ value, onChange }) {
 const copy = usePromotionCopy();
 return <div className="promo-meta-section">
  <div className="promo-section-heading"><h3><Share2 size={14} />{copy('social')}</h3><span>{copy('socialHint')}</span></div>
  <div className="promo-meta-options">{META_ADS_PACKAGES.map(pkg => <button key={pkg.id} aria-pressed={value.metaPkg?.id === pkg.id} className={`promo-meta-card${value.metaPkg?.id === pkg.id ? ' is-selected' : ''}`} onClick={() => onChange({ ...value, metaPkg: value.metaPkg?.id === pkg.id ? null : pkg })}>
   {pkg.highlight && <em>{copy('popular')}</em>}
   <span><strong>{pkg.name}</strong><b>{pkg.price.toFixed(2)}€</b></span>
   <small><b>{pkg.metaBudget}€</b> {copy('budget')} · {pkg.platformPromotionType === 'top_spot' ? `Top Spot ${copy('days7')}` : copy('gift')}</small>
  </button>)}</div>
 </div>;
}