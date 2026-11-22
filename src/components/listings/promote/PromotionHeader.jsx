import React from 'react';
import { Rocket, Sparkles, X } from 'lucide-react';
import { DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { isPromotionActive } from '@/lib/promoteOptions';
import { formatPromoteDate } from '@/lib/promoteFormat';
import { useTranslation } from 'react-i18next';
import usePromotionCopy from '@/components/listings/promote/usePromotionCopy';
export default function PromotionHeader({ car, processing }) {
 const copy = usePromotionCopy();
 const { i18n } = useTranslation();
 return <header className="promo-header">
  <span className="promo-rocket"><Rocket size={19} strokeWidth={1.5} /></span>
  <div className="promo-heading"><DialogTitle>{copy('title')}</DialogTitle><DialogDescription>{copy('subtitle')}</DialogDescription></div>
  {isPromotionActive(car) && <span className="promo-premium"><Sparkles size={12} />{copy('premium', { date: formatPromoteDate(car.promotion_until, i18n) })}</span>}
  <DialogClose asChild><button className="promo-close" disabled={processing} aria-label={copy('close')}><X size={16} /></button></DialogClose>
 </header>;
}