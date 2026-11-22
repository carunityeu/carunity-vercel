import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import QuickNavBar from '@/components/ui/QuickNavBar';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';
import { CompareProvider } from '@/components/compare/CompareContext';
import CompareBar from '@/components/compare/CompareBar';
import { FavoritesProvider } from '@/components/favorites/FavoritesContext';
import CarValuationModal from '@/components/cars/CarValuationModal';
import PaymentReturnNotice from '@/components/PaymentReturnNotice';
import requireAccount from '@/components/auth/requireAccount';

export default function Layout({ children, currentPageName }) {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [showValuation, setShowValuation] = useState(false);
  const { t } = useTranslation();
  const headerRef = useRef(null);
  const openValuation = async () => {
    if (await requireAccount()) setShowValuation(true);
  };
  useEffect(() => {
    if (currentPageName !== 'Caro' || !headerRef.current) return;
    const update = () => document.documentElement.style.setProperty('--caro-header-height', `${headerRef.current.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(headerRef.current);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--caro-header-height'); };
  }, [currentPageName]);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookie_consent');
    if (!cookieConsent) {
      setShowCookieBanner(true);
    }
    // Dark theme is now the default; light theme is disabled
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    // Capture referral code from URL (?ref=CU-XXXXXX)
    import('@/lib/referralUtils').then(m => m.captureReferralCode());

    // Listen for valuation open event (from nav bar)
    const handleOpenValuation = openValuation;
    window.addEventListener('open-valuation', handleOpenValuation);
    return () => window.removeEventListener('open-valuation', handleOpenValuation);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowCookieBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShowCookieBanner(false);
  };

  const transparentHeaderPages = ['Home'];
  const hasTransparentHeader = transparentHeaderPages.includes(currentPageName);
  const isMessagesPage = currentPageName === 'Messages';
  const isDealerDashboard = currentPageName === 'DealerDashboard';

  return (
    <CompareProvider>
     <FavoritesProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap');
          body {
            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .dark { color-scheme: dark; }
          .dark body { background-color: #101014; color: #f1f5f9; }
        `}</style>

        <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50 shadow-md">
          <Header />
          <QuickNavBar onValuationClick={openValuation} />
        </div>

        <main style={currentPageName === 'Caro' ? { paddingTop: 'var(--caro-header-height, 120px)' } : undefined} className={hasTransparentHeader ? '' : 'pt-[64px] sm:pt-[104px] md:pt-[120px]'}>
          {children}
        </main>

        {!isMessagesPage && !isDealerDashboard && currentPageName !== 'Caro' && <Footer />}


        <CompareBar />

        <PaymentReturnNotice />

        <CarValuationModal open={showValuation} onOpenChange={setShowValuation} />

        {showCookieBanner && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{t('cookie.title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('cookie.body')}
                  </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    onClick={declineCookies}
                    className="flex-1 md:flex-none dark:border-slate-600 dark:text-slate-300"
                  >
                    {t('cookie.decline')}
                  </Button>
                  <Button
                    onClick={acceptCookies}
                    className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600"
                  >
                    {t('cookie.accept')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
     </FavoritesProvider>
    </CompareProvider>
  );
}