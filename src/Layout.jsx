import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import QuickNavBar from '@/components/ui/QuickNavBar';
import CookieBanner from '@/components/ui/CookieBanner';
import ConsentGate from '@/components/auth/ConsentGate';
import { CompareProvider } from '@/components/compare/CompareContext';
import CompareBar from '@/components/compare/CompareBar';
import { FavoritesProvider } from '@/components/favorites/FavoritesContext';
import CarValuationModal from '@/components/cars/CarValuationModal';
import PaymentReturnNotice from '@/components/PaymentReturnNotice';
import requireAccount from '@/components/auth/requireAccount';

export default function Layout({ children, currentPageName }) {
  const [showValuation, setShowValuation] = useState(false);
  const headerRef = useRef(null);
  const openValuation = async () => {
    if (await requireAccount()) setShowValuation(true);
  };
  // The header scrolls away with the page (not sticky). Its height is still published as
  // --header-h for full-screen layouts (Caro, messages) that fill the rest of the viewport.
  useEffect(() => {
    if (!headerRef.current) return;
    const root = document.documentElement.style;
    const update = () => {
      const h = `${headerRef.current.getBoundingClientRect().height}px`;
      root.setProperty('--header-h', h);
      root.setProperty('--caro-header-height', h);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);


  useEffect(() => {
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
          :root { --header-h: 105px; }
          @media (min-width: 640px) { :root { --header-h: 104px; } }
          @media (min-width: 768px) { :root { --header-h: 112px; } }
        `}</style>

        <div ref={headerRef} className="relative z-50">
          <Header />
          <QuickNavBar />
        </div>

        <main>
          {children}
        </main>

        {!isMessagesPage && !isDealerDashboard && currentPageName !== 'Caro' && <Footer />}


        <CompareBar />

        <PaymentReturnNotice />

        <CarValuationModal open={showValuation} onOpenChange={setShowValuation} />

        <CookieBanner />
        <ConsentGate />
      </div>
     </FavoritesProvider>
    </CompareProvider>
  );
}