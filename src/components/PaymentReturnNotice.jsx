import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { consumePaymentResult } from '@/lib/stripeCheckout';

// Shows the result of a Stripe checkout once the buyer comes back to the app.
export default function PaymentReturnNotice() {
  const { t } = useTranslation();
  useEffect(() => {
    const result = consumePaymentResult();
    if (result === 'success') toast.success(t('payment.success'));
    if (result === 'cancelled') toast.info(t('payment.cancelled'));
  }, [t]);
  return null;
}