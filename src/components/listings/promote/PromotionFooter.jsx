import React from 'react';
import { Loader2, Zap } from 'lucide-react';
import usePromotionCopy from '@/components/listings/promote/usePromotionCopy';
export default function PromotionFooter({ ready, selections, total, activeCar, same, onSame, processing, onPay }) {
 const copy = usePromotionCopy();
 const counts = ready.reduce((acc, car) => {
  const s = selections[car.id];
  if (s.boostOpt) acc.boost = (acc.boost || 0) + 1;
  if (s.topSpot) acc['TOP SPOT'] = (acc['TOP SPOT'] || 0) + 1;
  if (s.metaPkg) acc[s.metaPkg.name] = (acc[s.metaPkg.name] || 0) + 1;
  return acc;
 }, {});
 return <footer className="promo-footer">
  <div className="promo-footer-label"><small>{copy('choice')}</small><strong>{copy('toPay', { n: ready.length })}</strong></div>
  <div className="promo-summary-tags">{Object.entries(counts).map(([name, n]) => <span key={name}>{name === 'boost' ? copy('boost').split(' ')[0] : name} <b>×{n}</b></span>)}</div>
  <button className="promo-same" role="switch" aria-checked={same} onClick={onSame} disabled={!activeCar || processing}>
   <span className={`promo-toggle${same ? ' is-on' : ''}`}><i /></span><span><strong>{copy('same')}</strong><small>{copy('take', { name: activeCar ? `${activeCar.brand} ${activeCar.model}` : '' })}</small></span>
  </button>
  <div className="promo-pay-area"><div className="promo-total"><span>{copy('total')}</span><strong>{total.toFixed(2)}€</strong></div>
   <button className="promo-pay" disabled={!ready.length || processing} onClick={onPay}>{processing ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}{copy(processing ? 'processing' : 'pay')}</button>
  </div>
 </footer>;
}