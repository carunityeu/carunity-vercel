import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { auth } from '@/api/auth';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { resolveViewAsUser } from '@/lib/adminViewAs';
import { Button } from '@/components/ui/button';
import { Container, navLinkClass } from '@/components/ds';
import ContextSearchBar from '@/components/search/ContextSearchBar';
import AccountMenu, { AccountSheet, useCompactHeader } from '@/components/account/AccountMenu';
import { LanguageSwitcherDropdown } from '@/components/ui/LanguageSwitcherMenu';

const LOGO_URL = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/fc09a8e55_culogo.png';

// Main sections: in the header bar on desktop, in the account panel on phones and tablets.
const NAV = [
  { labelKey: 'nav.catalog', to: createPageUrl('Catalog') },
  { labelKey: 'nav.partners', to: createPageUrl('Dealers') },
  { labelKey: 'nav.news', to: createPageUrl('AutoNews') },
];
const SHEET_LINKS = [...NAV, { labelKey: 'nav.help', to: createPageUrl('Help') }];

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
function PostAdButton({ user }) {
  const { t } = useTranslation();
  return (
    <Button asChild className="w-10 px-0 lg:w-auto lg:px-4">
      <Link to={user ? createPageUrl('CreateListing') : '#'} aria-label={t('nav.post_ad')}
        onClick={(e) => { if (!user) { e.preventDefault(); login(); } }}>
        <Plus />
        <span className="hidden lg:inline">{t('nav.post_ad')}</span>
      </Link>
    </Button>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const user = useHeaderUser();
  const compact = useCompactHeader();
  const { unreadMessages, notifications, unreadNotifications, markNotificationsRead } = useInbox(user?.email);
  const hasUnread = unreadMessages.length > 0 || unreadNotifications.length > 0;

  return (
    <header className="relative w-full border-b border-line bg-surface">
      <Container className="flex items-center gap-2 sm:gap-3" style={{ height: 'var(--cu-header-row)' }}>
        <Link to="/" className="flex-shrink-0" aria-label="CarUnity">
          <img src={LOGO_URL} alt="CarUnity" className="h-7 w-auto sm:h-8" />
        </Link>

        {/* Search in the bar from sm; phones search from the home page and the catalog */}
        <div className="hidden min-w-0 flex-1 sm:flex lg:max-w-md xl:max-w-lg">
          <ContextSearchBar className="w-full" />
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className={navLinkClass}>{t(item.labelKey)}</Link>
          ))}
        </nav>

        <div className="ml-auto flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden lg:block">
            <LanguageSwitcherDropdown placement="bottom" />
          </div>
          <PostAdButton user={user} />
          {compact ? (
            <AccountSheet
              user={user}
              hasUnread={hasUnread}
              unreadMessages={unreadMessages.length}
              unreadNotifications={unreadNotifications.length}
              onRead={markNotificationsRead}
              onLogout={() => auth.logout()}
              onLogin={login}
              links={SHEET_LINKS} />
          ) : user ? (
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
            <Button variant="ghost" onClick={login}>{t('nav.login')}</Button>
          )}
        </div>
      </Container>
    </header>
  );
}
