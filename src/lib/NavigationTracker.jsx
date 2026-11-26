import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Every page opens at the top. (Page-view logging to Base44 was removed: no tracking without
// cookie consent, see lib/cookieConsent.js.)
export default function NavigationTracker() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return null;
}
