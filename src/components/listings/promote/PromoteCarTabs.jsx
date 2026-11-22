import React from 'react';
import PromotionVehicleRow from '@/components/listings/promote/PromotionVehicleRow';
import usePromotionCopy from '@/components/listings/promote/usePromotionCopy';
import { EMPTY_SELECTION } from '@/lib/promoteOptions';
export default function PromoteCarTabs({ cars, activeId, onSelect, selections, enabled, onToggle, onToggleAll }) {
 const copy = usePromotionCopy();
 return <aside className="promo-sidebar">
  <div className="promo-sidebar-heading"><strong>{copy('cars')}</strong><span>{copy('selected', { n: enabled.size, total: cars.length })}</span><button onClick={onToggleAll}>{copy(enabled.size === cars.length && cars.length ? 'none' : 'all')}</button></div>
  <div className="promo-vehicle-list">{cars.map(car => <PromotionVehicleRow key={car.id} car={car} value={selections[car.id] || EMPTY_SELECTION} active={activeId === car.id} checked={enabled.has(car.id)} onSelect={() => onSelect(car.id)} onToggle={() => onToggle(car.id)} />)}</div>
 </aside>;
}