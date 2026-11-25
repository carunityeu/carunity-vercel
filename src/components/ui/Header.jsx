import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, User, Heart, MessageSquare, LogOut, Menu, X, Building2, Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { auth } from '@/api/auth';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { resolveViewAsUser } from '@/lib/adminViewAs';
import { Button } from '@/components/ui/button';
import { Container, navLinkClass } from '@/components/ds';
import ContextSearchBar from '@/components/search/ContextSearchBar';
import AccountMenu from '@/components/account/AccountMenu';
import LanguagePills, { LanguageSwitcherDropdown } from '@/components/ui/LanguageSwitcherMenu';

const LOGO_URL = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/fc09a8e55_culogo.png';

// Main sections: shown in the header bar on desktop and at the top of the phone menu.
const NAV = [
  { labelKey: 'nav.catalog', to: createPageUrl('Catalog') },
  { labelKey: 'nav.partners', to: createPageUrl('Dealers') },
  { labelKey: 'nav.news', to: createPageUrl('AutoNews') },
];
const MENU_EXTRA = [{ labelKey: 'nav.help', to: createPageUrl('Help') }];

// Account links of the phone menu (desktop has them in the account dropdown).
const accountLinks = (isDealer) => [
  isDealer
    ? { labelKey: 'nav.dealer_panel', to: createPageUrl('DealerDashboard'), icon: Building2 }
    : { labelKey: 'nav.dashboard', to: createPageUrl('Dashboard'), icon: User },
  { labelKey: 'nav.messages', to: createPageUrl('Messages'), icon: MessageSquare, unread: true },
  { labelKey: 'nav.notifications', to: '/Notifications', icon: Bell },
  !isDealer && { labelKey: 'nav.favorites', to: createPageUrl('Dashboard') + '?tab=favorites', icon: Heart },
].filter(Boolean);

const login = () => auth.redirectToLogin();

function useHeaderUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    auth.isAuthenticated()
      .then((isAuth) => (isAuth ? auth.me().then(resolveViewAsUser).then(({ user: u }) => setUser(u)) : null))
      .catch(() => {});
  }, []);
  return user;
}

// Unread messages and recent notifications, refreshed by realtime events instead of polling.
function useInbox(email) {
  const queryClient = useQueryClient();
  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['unreadMessages', email],
    queryFn: () => entities.Message.filter({ receiver_email: email, is_read: false }),
    enabled: !!email,
    staleTime: 60000,
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ['headerNotifications', email],
    queryFn: () => entities.Notification.filter({ user_email: email }, '-created_date', 8),
    enabled: !!email,
    staleTime: 60000,
  });
  useEffect(() => {
    if (!email) return;
    const offMessages = entities.Message.subscribe(() => queryClient.invalidateQueries({ queryKey: ['unreadMessages', email] }));
    const offNotifications = entities.Notification.subscribe(() => queryClient.invalidateQueries({ queryKey: ['headerNotifications', email] }));
    return () => { offMessages(); offNotifications(); };
  }, [email, queryClient]);

  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const markNotificationsRead = async () => {
    if (!unreadNotifications.length) return;
    await entities.Notification.updateMany({ id: { $in: unreadNotifications.map((n) => n.id) } }, { $set: { is_read: true } });
    queryClient.invalidateQueries({ queryKey: ['headerNotifications', email] });
  };
  return { unreadMessages, notifications, unreadNotifications, markNotificationsRead };
}

/** "Post an ad": icon square on phones, labelled button from lg. Guests go to sign-in first. */
function PostAdButton({ user, className, full = false, onNavigate }) {
  const { t } = useTranslation();
  return (
    <Button asChild size={full ? 'lg' : 'default'} className={cn(!full && 'w-10 px-0 lg:w-auto lg:px-4', className)}>
      <Link
        to={user ? createPageUrl('CreateListing') : '#'}
        aria-label={t('nav.post_ad')}
        onClick={(e) => { onNavigate?.(); if (!user) { e.preventDefault(); login(); } }}>
        <Plus />
        <span className={cn(!full && 'hidden lg:inline')}>{t(full ? 'nav.post_listing' : 'nav.post_ad')}</span>
      </Link>
    </Button>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const user = useHeaderUser();
  const { unreadMessages, notifications, unreadNotifications, markNotificationsRead } = useInbox(user?.email);
  const [menuOpen, setMenuOpen] = useState(false);
  const isDealer = user?.user_type === 'dealer' || !!user?.dealer_id;
  const hasUnread = unreadMessages.length > 0 || unreadNotifications.length > 0;
  const closeMenu = () => setMenuOpen(false);

  // A route change always closes the phone menu
  useEffect(closeMenu, [pathname]);

  return (
    <header className="relative w-full border-b border-line bg-surface">
      <Container className="flex items-center gap-2 sm:gap-3" style={{ height: 'var(--cu-header-row)' }}>
        <Link to="/" className="flex-shrink-0" aria-label="CarUnity">
          <img src={LOGO_URL} alt="CarUnity" className="h-7 w-auto sm:h-8" />
        </Link>

        <div className="hidden min-w-0 flex-1 sm:flex lg:max-w-md xl:max-w-lg">
          <ContextSearchBar className="w-full" />
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className={navLinkClass}>{t(item.labelKey)}</Link>
          ))}
        </nav>

        <div className="ml-auto flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden md:block">
            <LanguageSwitcherDropdown placement="bottom" />
          </div>
          <PostAdButton user={user} />
          {user ? (
            <AccountMenu
              user={user}
              hasUnread={hasUnread}
              unreadMessages={unreadMessages.length}
              notifications={notifications}
              unreadNotifications={unreadNotifications.length}
              onRead={markNotificationsRead}
              onLogout={() => auth.logout()}
              referralEnabled={false}
              className="inline-flex" />
          ) : (
            <Button variant="ghost" onClick={login} aria-label={t('nav.login')} className="w-10 px-0 md:w-auto md:px-3">
              <User className="md:hidden" />
              <span className="hidden md:inline">{t('nav.login')}</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" aria-expanded={menuOpen} aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </Container>

      {/* Phones: search gets its own row */}
      <Container className="pb-2.5 sm:hidden">
        <ContextSearchBar className="w-full" />
      </Container>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={closeMenu} />
          <nav className="absolute inset-x-0 top-full z-50 max-h-[80vh] overflow-y-auto border-t border-line bg-surface shadow-xl lg:hidden">
            <Container className="flex flex-col gap-1 py-4">
              {[...NAV, ...MENU_EXTRA].map((item) => (
                <Link key={item.to} to={item.to} onClick={closeMenu} className={navLinkClass}>{t(item.labelKey)}</Link>
              ))}

              <div className="my-2 border-t border-line" />
              <p className="px-3 pb-1 text-xs text-ink-3">{t('nav.language', 'Язык')}</p>
              <LanguagePills className="px-3 pb-2" />
              <div className="my-2 border-t border-line" />

              {user ? accountLinks(isDealer).map(({ labelKey, to, icon: Icon, unread }) => (
                <Link key={to} to={to} onClick={closeMenu} className={cn(navLinkClass, 'flex items-center gap-2.5')}>
                  <Icon className="h-4 w-4" />
                  {t(labelKey)}
                  {unread && hasUnread && <span className="h-2 w-2 rounded-full bg-brand" />}
                </Link>
              )) : (
                <button type="button" onClick={() => { closeMenu(); login(); }} className={cn(navLinkClass, 'flex items-center gap-2.5 text-left')}>
                  <User className="h-4 w-4" />{t('nav.login')}
                </button>
              )}

              <PostAdButton user={user} full className="mt-3 w-full" onNavigate={closeMenu} />

              {user && (
                <button type="button" onClick={() => { closeMenu(); auth.logout(); }}
                  className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10">
                  <LogOut className="h-4 w-4" />{t('nav.logout')}
                </button>
              )}
            </Container>
          </nav>
        </>
      )}
    </header>
  );
}
