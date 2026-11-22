import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  Car,
  Plus,
  User,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronDown,
  KeyRound,
  Sun,
  Moon,
  Globe,
  Shield,
  Bell,
  Check,
  Gift } from
'lucide-react';
import { cn } from '@/lib/utils';
import ContextSearchBar from '@/components/search/ContextSearchBar';
import AccountMenu from '@/components/account/AccountMenu';
import { resolveViewAsUser } from '@/lib/adminViewAs';
import LanguagePills from '@/components/ui/LanguageSwitcherMenu';


function LanguageSwitcherDropdown({ currentLang, languages, onSelect }) {
  const [open, setOpen] = React.useState(false);
  const current = languages.find((l) => l.code === currentLang);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span className="uppercase tracking-wide text-sm font-semibold">{current?.code}</span>
        <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open &&
      <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-[9999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[150px] py-1">
            {languages.map((lang) =>
          <button
            key={lang.code}
            onClick={() => {onSelect(lang.code);setOpen(false);}}
            className={cn(
              "w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/60",
              currentLang === lang.code
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-700 dark:text-slate-300'
            )}>
              <span>{lang.label}</span>
              {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </button>
          )}
          </div>
        </>
      }
    </div>);

}

const languages = [
{ code: 'ru', label: 'RU — Русский' },
{ code: 'en', label: 'EN — English' },
{ code: 'et', label: 'ET — Eesti' },
{ code: 'lv', label: 'LV — Latviešu' },
{ code: 'lt', label: 'LT — Lietuvių' }];



export default function Header() {
  const { t } = useTranslation();
  // Referral / invite-friends feature — disabled (not deleted). Set true to re-enable.
  const REFERRAL_ENABLED = false;
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.slice(0, 2) || 'ru';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          const { user: effectiveUser } = await resolveViewAsUser(userData);
          setUser(effectiveUser);
        }
      } catch (e) {}
    };
    loadUser();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['unreadMessages', user?.email],
    queryFn: () => base44.entities.Message.filter({ receiver_email: user.email, is_read: false }),
    enabled: !!user,
    staleTime: 60000
  });

  const { data: recentNotifications = [] } = useQuery({
    queryKey: ['headerNotifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 8),
    enabled: !!user,
    staleTime: 60000
  });

  // Counters refresh on realtime events instead of frequent polling
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribeMessages = base44.entities.Message.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['unreadMessages', user.email] });
    });
    const unsubscribeNotifications = base44.entities.Notification.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['headerNotifications', user.email] });
    });
    return () => {
      unsubscribeMessages();
      unsubscribeNotifications();
    };
  }, [user?.email, queryClient]);

  const isDealer = user?.user_type === 'dealer' || !!user?.dealer_id;
  const unreadNotifications = recentNotifications.filter((n) => !n.is_read);
  const hasUnread = unreadMessages.length > 0 || unreadNotifications.length > 0;

  const markNotificationsRead = async () => {
    for (const n of unreadNotifications) {
      await base44.entities.Notification.update(n.id, { is_read: true });
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  const handleLogout = () => base44.auth.logout();

  return (
    <header className="w-full bg-white dark:bg-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
         <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2 sm:gap-3">
           {/* Logo */}
           <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center group flex-shrink-0">
             <img src="https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/fc09a8e55_culogo.png"
                           alt="CarUnity" className="h-7 sm:h-8 md:h-9 w-auto" />

            
          </Link>

          {/* Context Search Bar - center */}
          <div className="hidden sm:flex flex-1 max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg">
            <ContextSearchBar className="w-full" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
            <Link
              to={createPageUrl('Catalog')}
              className="px-4 py-2 rounded-lg text-base font-medium transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">

              {t('nav.catalog')}
            </Link>
            
            <Link
              to={createPageUrl('Dealers')}
              className="px-4 py-2 rounded-lg text-base font-medium transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              {t('nav.partners')}
            </Link>

            <Link
              to={createPageUrl('AutoNews')}
              className="px-4 py-2 rounded-lg text-base font-medium transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              {t('nav.news')}
            </Link>

          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
            {/* Language switcher - visible on tablet and desktop */}
            <div className="hidden md:block relative">
              <LanguageSwitcherDropdown currentLang={currentLang} languages={languages} onSelect={changeLanguage} />
            </div>

            {user ?
            <>
                <Link to={createPageUrl('CreateListing')} className="hidden md:block">
                  <Button size="sm" className="bg-emerald-600 text-white px-3 text-sm md:text-base font-medium rounded-lg md:rounded-xl h-8 md:h-10 gap-2 hover:bg-emerald-700 whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('nav.post_ad')}</span>
                  </Button>
                </Link>

                <AccountMenu user={user} hasUnread={hasUnread} unreadMessages={unreadMessages.length} notifications={recentNotifications} unreadNotifications={unreadNotifications.length} onRead={markNotificationsRead} onLogout={handleLogout} referralEnabled={REFERRAL_ENABLED} className="hidden md:inline-flex" />
              </> :

            <>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => base44.auth.redirectToLogin()}
                className="hidden md:flex text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm md:text-base h-8 md:h-10">

                  {t('nav.login')}
                </Button>
                <Button
                size="sm"
                className="hidden md:flex gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm md:text-base h-8 md:h-10 px-3"
                onClick={() => base44.auth.redirectToLogin()}>

                  <Plus className="w-4 h-4" />
                  <span className="hidden lg:inline">{t('nav.post_ad')}</span>
                </Button>
              </>
            }

            {/* Mobile: Add listing button */}
            <Link
              to={user ? createPageUrl('CreateListing') : '#'}
              onClick={(e) => { if (!user) { e.preventDefault(); base44.auth.redirectToLogin(); } }}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white active:scale-95 transition-transform"
              aria-label={t('nav.post_ad')}>
              <Plus className="w-5 h-5" />
            </Link>

            {/* Mobile: Account button */}
            {user ? (
              <AccountMenu user={user} hasUnread={hasUnread} unreadMessages={unreadMessages.length} notifications={recentNotifications} unreadNotifications={unreadNotifications.length} onRead={markNotificationsRead} onLogout={handleLogout} referralEnabled={REFERRAL_ENABLED} className="inline-flex md:hidden" />
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
                aria-label={t('nav.login')}>
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>

              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar - below header row, always visible on mobile */}
        <div className="sm:hidden px-3 pb-2.5 border-b border-slate-200 dark:border-slate-800">
          <ContextSearchBar className="w-full" />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 shadow-lg border-t dark:border-slate-800 max-h-[80vh] overflow-y-auto z-50">
            <nav className="flex flex-col p-4 gap-1">
              {/* Mobile Search */}
              <div className="mb-2">
                <ContextSearchBar className="w-full" />
              </div>
              <Link
              to={createPageUrl('Catalog')}
              className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm"
              onClick={() => setMobileMenuOpen(false)}>
                {t('nav.catalog')}
              </Link>
              <Link
              to={createPageUrl('Dealers')}
              className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm"
              onClick={() => setMobileMenuOpen(false)}>
              {t('nav.partners')}
              </Link>
              <Link
              to={createPageUrl('AutoNews')}
              className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm"
              onClick={() => setMobileMenuOpen(false)}>
                {t('nav.news')}
              </Link>
              <Link
              to={createPageUrl('Help')}
              className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm"
              onClick={() => setMobileMenuOpen(false)}>
                {t('nav.help')}
              </Link>

              <div className="border-t border-slate-200 dark:border-slate-700 my-2" />

              {/* Language switcher - mobile */}
              <div className="px-1 pb-1">
                <p className="text-xs text-slate-400 mb-2 px-2">{t('nav.language', 'Язык')}</p>
                <LanguagePills />
              </div>

              {user ?
            <>
                  {isDealer ?
                  <Link
                to={createPageUrl('DealerDashboard')}
                className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm flex items-center gap-2.5"
                onClick={() => setMobileMenuOpen(false)}>
                    <Building2 className="w-4 h-4" />
                    {t('nav.dealer_panel')}
                  </Link> :
                  <Link
                to={createPageUrl('Dashboard')}
                className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm flex items-center gap-2.5"
                onClick={() => setMobileMenuOpen(false)}>
                    <User className="w-4 h-4" />
                    {t('nav.dashboard')}
                  </Link>}
                  <Link
                to={createPageUrl('Messages')}
                className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm flex items-center gap-2.5"
                onClick={() => setMobileMenuOpen(false)}>
                    <MessageSquare className="w-4 h-4" />
                    {t('nav.messages')}
                    {hasUnread && <span className="w-2 h-2 bg-emerald-600 rounded-full" />}
                  </Link>
                  {REFERRAL_ENABLED && !isDealer &&
                  <Link
                to={createPageUrl('Referral')}
                className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm flex items-center gap-2.5"
                onClick={() => setMobileMenuOpen(false)}>
                    <Gift className="w-4 h-4 text-emerald-500" />
                    {t('nav.referral')}
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">+7d</span>
                  </Link>
                  }
                  <Link
                to="/Notifications"
                className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm flex items-center gap-2.5"
                onClick={() => setMobileMenuOpen(false)}>
                    <Bell className="w-4 h-4" />
                    {t('nav.notifications')}
                  </Link>
                  {!isDealer &&
                  <Link
                to={createPageUrl('Dashboard') + '?tab=favorites'}
                className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm flex items-center gap-2.5"
                onClick={() => setMobileMenuOpen(false)}>
                    <Heart className="w-4 h-4" />
                    {t('nav.favorites')}
                  </Link>}
                </> :

            <button
              onClick={() => {setMobileMenuOpen(false);base44.auth.redirectToLogin();}}
              className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm flex items-center gap-2.5 text-left">
                   <User className="w-4 h-4" />
                   {t('nav.login')}
                </button>
            }

              <div className="mt-3">
                <Link
                to={user ? createPageUrl('CreateListing') : '#'}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (!user) {e.preventDefault();base44.auth.redirectToLogin();}
                }}>
                  <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 h-10 text-sm">
                    <Plus className="w-4 h-4" />
                     {t('nav.post_listing')}
                  </Button>
                </Link>
              </div>

              {user &&
            <button
              onClick={() => {setMobileMenuOpen(false);handleLogout();}}
              className="mt-1 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm flex items-center gap-2.5">
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                  </button>
            }
            </nav>
            </div>
            </>
            )}
      </div>
    </header>);

}