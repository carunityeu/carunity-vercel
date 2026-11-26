import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { EMPTY_SELECTION, selectionTotal, roundPrice } from '@/lib/promoteOptions';
import { purchasePromotion } from '@/lib/promotePurchase';
import PromoteCarTabs from '@/components/listings/promote/PromoteCarTabs';
import PromoteCarServices from '@/components/listings/promote/PromoteCarServices';
import PromotionHeader from '@/components/listings/promote/PromotionHeader';
import PromotionFooter from '@/components/listings/promote/PromotionFooter';
import usePromotionWorkspace from '@/components/listings/promote/usePromotionWorkspace';
import usePromotionCopy from '@/components/listings/promote/usePromotionCopy';
import PaymentConsent from '@/components/PaymentConsent';
import '@/components/listings/promote/promotionWorkspace.css';
export { isPromotionActive } from '@/lib/promoteOptions';

export default function PromoteListingModal({
  cars, car, open, onClose, onSuccess, sellerEmail, dealerId, initialSelectedIds,
}) {
  const { t } = useTranslation();
  const list = useMemo(() => (cars?.length ? cars : car ? [car] : []), [cars, car]);
  const workspace = usePromotionWorkspace(list, open, initialSelectedIds);
  const { selections, activeCar, ready } = workspace;
  const copy = usePromotionCopy();
  const [isProcessing, setIsProcessing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentHighlight, setConsentHighlight] = useState(false);
  useEffect(() => { if (open) { setIsProcessing(false); setConsent(false); setConsentHighlight(false); } }, [open]);
  const selFor = id => selections[id] || EMPTY_SELECTION;
  const total = roundPrice(ready.reduce((sum, c) => sum + selectionTotal(selections[c.id]), 0));

  const handlePay = async () => {
    if (!ready.length || isProcessing) return;
    if (total > 0 && !consent) { setConsentHighlight(true); toast.error(t('payment.consent_required', 'Отметьте согласие перед оплатой')); return; }
    setIsProcessing(true);
    try {
      await purchasePromotion({ cars: ready, selections, dealerId });
      if (onSuccess) onSuccess(ready.map(c => ({ carId: c.id })));
    } catch (err) {
      console.error('Promotion checkout error:', err);
      setIsProcessing(false);
      toast.error(err?.message === 'popup_blocked' ? t('payment.popup_blocked') : copy('error_toast'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isProcessing && onClose()}>
      <DialogContent aria-label={copy('title')} className="promo-workspace !m-0 !w-[calc(100vw-2rem)] !max-w-[1010px] !flex flex-col !gap-0 !rounded-2xl !p-0 !h-[650px] !max-h-[92dvh] !overflow-hidden max-[700px]:!w-[calc(100vw-1rem)] max-[700px]:!h-[94dvh] max-[700px]:!max-h-[94dvh] [&>button:last-child>span]:hidden">
        <PromotionHeader car={activeCar} processing={isProcessing} />
        <div className="promo-body" aria-busy={isProcessing}>
          <fieldset disabled={isProcessing} className="contents">
            <PromoteCarTabs cars={list} activeId={activeCar?.id} selections={selections} onSelect={workspace.setActiveId} enabled={workspace.enabled} onToggle={workspace.toggle} onToggleAll={workspace.toggleAll} />
            <div className="promo-editor">{activeCar ? <PromoteCarServices car={activeCar} value={selFor(activeCar.id)} onChange={workspace.change} onSkip={workspace.skip} /> : <p className="promo-empty">{copy('empty')}</p>}</div>
          </fieldset>
        </div>
        {total > 0 && <div className="px-4 pt-3"><PaymentConsent checked={consent} onChange={(v) => { setConsent(v); setConsentHighlight(false); }} highlight={consentHighlight} className="text-xs" /></div>}
        <PromotionFooter ready={ready} selections={selections} total={total} activeCar={activeCar} same={workspace.same} onSame={workspace.toggleSame} processing={isProcessing} onPay={handlePay} />
      </DialogContent>
    </Dialog>
  );
}