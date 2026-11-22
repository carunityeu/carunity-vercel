import { base44 } from '@/api/base44Client';

// Starts a Stripe Checkout for server-priced items and sends the buyer there.
// Called from a click handler: the tab opens before the first await so popup
// blockers keep the user activation when the app runs framed in the preview.
export async function startCheckout(payload) {
  const isFramed = window.self !== window.top;
  const tab = isFramed ? window.open('', '_blank') : null;
  if (isFramed && !tab) throw new Error('popup_blocked');
  if (tab) tab.opener = null;

  try {
    const response = await base44.functions.invoke('createCheckoutSession', payload);
    const url = response?.data?.url;
    if (response?.data?.error) throw new Error(response.data.error);
    if (!url) throw new Error('checkout_failed');
    if (tab) tab.location.replace(url);
    else window.location.assign(url);
    return true;
  } catch (error) {
    if (tab) tab.close();
    throw error;
  }
}

// Reads ?payment=success|cancelled once, cleans the URL and reports the result.
export function consumePaymentResult() {
  const url = new URL(window.location.href);
  const result = url.searchParams.get('payment');
  if (result !== 'success' && result !== 'cancelled') return null;
  url.searchParams.delete('payment');
  window.history.replaceState({}, '', url.pathname + (url.search || '') + url.hash);
  return result;
}