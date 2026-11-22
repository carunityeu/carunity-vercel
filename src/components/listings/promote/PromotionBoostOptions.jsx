import React from 'react';
import { ArrowUp, Star } from 'lucide-react';
import { BOOST_OPTIONS, TOP_SPOT } from '@/lib/promoteOptions';
import usePromotionCopy from '@/components/listings/promote/usePromotionCopy';
export default function PromotionBoostOptions({ value, onChange }) {
 const copy = usePromotionCopy();
 return <>
  <div className="promo-section-heading"><h3><ArrowUp size={14} />{copy('boost')}</h3><span>{copy('longer')}</span></div>
  <div className="promo-durations">{BOOST_OPTIONS.map(opt => {
   const discount = Math.round((1 - opt.price / opt.days / BOOST_OPTIONS[0].price) * 100);
   return <button key={opt.days} className={`promo-duration${value.boostOpt?.days === opt.days ? ' is-selected' : ''}`} aria-pressed={value.boostOpt?.days === opt.days} onClick={() => onChange({ ...value, boostOpt: value.boostOpt?.days === opt.days ? null : opt, topSpot: false })}>
    {(opt.days === 7 || opt.days === 30) && <em>{copy(opt.days === 7 ? 'best' : 'max')}</em>}
    <span>{copy(`days${opt.days}`)}</span><strong>{opt.price.toFixed(2)}€</strong>
    <small>{(opt.price / opt.days).toFixed(2)}€ / {copy('perDay')} {discount > 0 && <b>−{discount}%</b>}</small>
   </button>;
  })}</div>
  <button className={`promo-topspot${value.topSpot ? ' is-selected' : ''}`} role="switch" aria-checked={value.topSpot} onClick={() => onChange({ ...value, topSpot: !value.topSpot, boostOpt: null })}>
   <span className="promo-star"><Star size={16} /></span><span className="promo-top-label"><strong>TOP SPOT</strong><small>{copy('top')}</small></span><b>{TOP_SPOT.price.toFixed(2)}€</b><span className={`promo-toggle${value.topSpot ? ' is-on' : ''}`}><i /></span>
  </button>
 </>;
}