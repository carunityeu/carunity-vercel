// Cookie consent: 'accepted' | 'declined' | null (not asked yet). Anything that tracks visitors
// (analytics, ad pixels) must check hasAnalyticsConsent() first and listen to onConsentChange.
const KEY = 'cookie_consent';
const EVENT = 'cookie-consent-change';
export const OPEN_SETTINGS_EVENT = 'open-cookie-settings';

export function getConsent() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
export function setConsent(value) {
  try { localStorage.setItem(KEY, value); } catch { /* storage blocked */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}
export const hasAnalyticsConsent = () => getConsent() === 'accepted';
export function onConsentChange(fn) {
  const handler = (e) => fn(e.detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
/** Opens the banner again (the "Cookie settings" link in the footer). */
export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
