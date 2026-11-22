import React from 'react';
import { Car, Check } from 'lucide-react';
import { selectionTotal, hasSelection, formatPrice } from '@/lib/promoteOptions';
import usePromotionCopy from '@/components/listings/promote/usePromotionCopy';
export default function PromotionVehicleRow({ car, value, active, checked, onSelect, onToggle }) {
 const copy = usePromotionCopy();
 const parts = [value.boostOpt && copy(`days${value.boostOpt.days}`), value.topSpot && 'TOP SPOT', value.metaPkg?.name].filter(Boolean);
 return <div className={`promo-vehicle${active ? ' is-active' : ''}${!checked ? ' is-skipped' : ''}`}>
  <button className="promo-check" role="checkbox" aria-checked={checked} aria-label={`${copy('selected', { n: checked ? 1 : 0, total: 1 })}: ${car.brand} ${car.model}`} onClick={onToggle}>{checked && <Check size={12} strokeWidth={3} />}</button>
  <button className="promo-vehicle-select" onClick={onSelect} aria-current={active ? 'true' : undefined}>
   <span className="promo-thumb">{car.images?.[0] ? <img src={car.images[0]} alt="" /> : <Car size={19} />}</span>
   <span className="promo-vehicle-text"><strong>{car.brand} {car.model}</strong><small className={checked && !hasSelection(value) ? 'needs-plan' : ''}>{!checked ? copy('skipped') : parts.join(' + ') || copy('noPlan')}</small></span>
   <b className="promo-row-price">{checked && hasSelection(value) ? formatPrice(selectionTotal(value)) : '—'}</b>
  </button>
 </div>;
}