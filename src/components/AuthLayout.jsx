import React from "react";
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { safeReturnTo } from '@/lib/authReturnTo';
import '@/components/auth/auth.css';

const LOGO_URL = "https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/fc09a8e55_culogo.png";

export default function AuthLayout({ title, subtitle, footer, children, reference = false }) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const suffix = safeReturnTo() !== '/' ? '?returnTo=' + encodeURIComponent(safeReturnTo()) : '';
  if (reference) return <div className="dark auth-reference min-h-screen bg-background text-foreground px-4 py-6 sm:py-10">
    <Link to="/" className="auth-logo" aria-label="CarUnity">
      <img src={LOGO_URL} alt="CarUnity" />
    </Link>
    <div className="auth-shell">
      <div className="auth-column">
        <section className="auth-panel">
          <nav className="auth-tabs">
            <Link to={'/login' + suffix} aria-current={pathname === '/login' ? 'page' : undefined}>{t('authVisual.login')}</Link>
            <Link to={'/register' + suffix} aria-current={pathname === '/register' ? 'page' : undefined}>{t('authVisual.register')}</Link>
          </nav>
          <div className="auth-body">
            <h1 className="text-base sm:text-lg font-bold tracking-tight leading-tight">{t(pathname === '/login' ? 'authVisual.welcome' : 'authVisual.create')}</h1>
            {children}
          </div>
        </section>
        <p className="auth-dealer">
          {t('authVisual.dealer')}{' '}<Link to="/login?returnTo=%2FDealerDashboard">{t('authVisual.dealerLink')}</Link>
        </p>
      </div>
    </div>
  </div>;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-5">
          <Link to="/" aria-label="CarUnity">
            <img src={LOGO_URL} alt="CarUnity" className="h-9 w-auto mx-auto" />
          </Link>
          {title && <h1 className="text-lg font-bold tracking-tight text-foreground mt-3">{title}</h1>}
          {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-4">{footer}</p>
        )}
      </div>
    </div>
  );
}