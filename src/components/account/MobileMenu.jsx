import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X, User, ChevronRight, MessagesSquare, Bell, Heart, Store, Plus, CarFront, Settings2,
  ShieldCheck, Eye, LogOut, Search, Building2, Newspaper, LifeBuoy,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { readViewAs } from '@/lib/adminViewAs';
import { LANGUAGES } from '@/components/ui/LanguageSwitcherMenu';
import { QUICK_NAV } from '@/components/ui/QuickNavBar';
import AdminViewAsDialog from '@/components/account/AdminViewAsDialog';

/*
 * Phone & tablet menu (below lg), opened from the account icon in the header.
 * Layers follow the design code: the panel is the page layer, groups are surface cards.
 *   profile (or sign-in for guests) → quick tiles → post an ad → cabinet → vehicles → site → language → log out
 */

const SECTIONS = [
  { labelKey: 'nav.catalog', to: createPageUrl('Catalog'), icon: Search },
  { labelKey: 'nav.partners', to: createPageUrl('Dealers'), icon: Building2 },
  { labelKey: 'nav.news', to: createPageUrl('AutoNews'), icon: Newspaper },
  { labelKey: 'nav.help', to: createPageUrl('Help'), icon: LifeBuoy },
];

const GROUP = 'overflow-hidden rounded-2xl border border-line bg-surface';
const ROW = 'flex min-h-[52px] items-center gap-3 px-4 text-[15px] text-ink';
const ICON = 'h-5 w-5 flex-shrink-0 text-ink-3';

function Count({ n, className }) {
  if (!n) return null;
  return <span className={cn('flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white', className)}>{n > 9 ? '9+' : n}</span>;
}

function Initial({ user, className }) {
  return (
    <span className={cn('flex flex-shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-white', className)}>
      {(user.full_name || user.email || '?')[0].toUpperCase()}
    </span>
  );
}

function GroupTitle({ children }) {
  return <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-3">{children}</p>;
}

/** Is this link the page we are on (path and, if the link has one, the query too). */
function useIsCurrent() {
  const { pathname, search } = useLocation();
  return (to) => {
    const [path, query] = to.split('?');
    return path.toLowerCase() === pathname.toLowerCase() && (!query || search.includes(query));
  };
}

function Row({ to, icon: Icon, label, current, children, onClick }) {
  const inner = (
    <>
      {Icon && <Icon className={cn(ICON, current && 'text-brand-text')} strokeWidth={1.8} />}
      <span className={cn('min-w-0 flex-1 truncate', current && 'font-semibold text-brand-text')}>{label}</span>
      {children ?? <ChevronRight className="h-4 w-4 text-ink-3" />}
    </>
  );
  return to
    ? <Link to={to} onClick={onClick} aria-current={current ? 'page' : undefined} className={ROW}>{inner}</Link>
    : <button type="button" onClick={onClick} className={cn(ROW, 'w-full text-left')}>{inner}</button>;
}

/** Big tap target for the most used places. */
function Tile({ to, icon: Icon, label, count, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="relative flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-raised"><Icon className="h-[18px] w-[18px] text-ink" strokeWidth={1.8} /></span>
      <span className="text-sm font-medium leading-tight text-ink">{label}</span>
      <Count n={count} className="absolute right-3 top-3" />
    </Link>
  );
}

export default function MobileMenu({ user, unreadMessages = 0, unreadNotifications = 0, onReadNotifications, onLogin, onLogout }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isCurrent = useIsCurrent();
  const [open, setOpen] = useState(false);
  const [viewAsOpen, setViewAsOpen] = useState(false);

  // Any navigation closes the menu (links, browser back, redirects)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setOpen(false);
  }, [location.pathname, location.search]);

  const isAdmin = user?.role === 'admin';
  const viewAs = isAdmin ? readViewAs() : null;
  const isDealer = !!user && (user.user_type === 'dealer' || !!user.dealer_id);
  const home = isDealer ? createPageUrl('DealerDashboard') : createPageUrl('Dashboard');
  const lang = i18n.language?.slice(0, 2) || 'ru';
  const hasUnread = unreadMessages > 0 || unreadNotifications > 0;

  const cabinet = !user ? [] : isDealer ? [
    { labelKey: 'dp.nav_listings', fallback: 'Объявления', to: createPageUrl('DealerDashboard') + '?tab=cars', icon: CarFront },
    { labelKey: 'dp.nav_salon', fallback: 'Салон', to: createPageUrl('DealerDashboard') + '?tab=profile', icon: Settings2 },
  ] : [
    { labelKey: 'nav.my_listings', to: createPageUrl('Dashboard') + '?tab=listings', icon: CarFront },
    { labelKey: 'nav.settings', to: createPageUrl('Dashboard') + '?tab=settings', icon: Settings2 },
  ];
  if (isAdmin && !viewAs) cabinet.push({ labelKey: 'nav.admin_panel', to: '/x9-admin', icon: ShieldCheck });

  const postAd = (e) => { if (!user) { e.preventDefault(); setOpen(false); onLogin(); } };
  const roleLabel = isAdmin ? t('menu.role_admin', 'Администратор') : isDealer ? t('menu.role_dealer', 'Дилер') : t('menu.role_private', 'Частное лицо');

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button type="button" aria-label={t('nav.account')}
            className="relative flex h-10 w-10 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand">
            {user
              ? <Initial user={user} className="h-9 w-9 text-sm" />
              : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-raised text-ink"><User className="h-[18px] w-[18px]" /></span>}
            {hasUnread && <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-red-500" />}
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-page text-ink shadow-2xl outline-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-md sm:border-l sm:border-line">

            {/* Top bar: same height as the site header, so the menu reads as the header unfolding */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-line bg-surface px-4" style={{ height: 'var(--cu-header-row)' }}>
              <Dialog.Title className="text-lg font-bold">{t('menu.title', 'Меню')}</Dialog.Title>
              <Dialog.Close className="flex h-10 w-10 items-center justify-center rounded-full bg-raised text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label={t('menu.close', 'Закрыть')}>
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">{t('menu.description', 'Аккаунт, разделы сайта и язык')}</Dialog.Description>

            <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">

              {/* Who is signed in — or an invitation to sign in */}
              {user ? (
                <Link to={home} className={cn(GROUP, 'flex items-center gap-3 p-4')}>
                  <Initial user={user} className="h-12 w-12 text-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold">{user.full_name || user.email}</p>
                    {user.full_name && <p className="truncate text-sm text-ink-3">{user.email}</p>}
                    <span className="mt-1.5 inline-flex h-6 items-center rounded-md bg-raised px-2 text-xs font-medium text-ink-2">{roleLabel}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-ink-3" />
                </Link>
              ) : (
                <div className={cn(GROUP, 'p-5')}>
                  <p className="text-lg font-bold">{t('menu.guest_title', 'Добро пожаловать в CarUnity')}</p>
                  <p className="mt-1 text-sm text-ink-3">{t('menu.guest_text', 'Войдите, чтобы сохранять машины, писать продавцам и размещать объявления.')}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => { setOpen(false); onLogin(); }} className="h-11 rounded-xl bg-brand text-sm font-semibold text-white">{t('nav.login')}</button>
                    <Link to="/register" className="flex h-11 items-center justify-center rounded-xl bg-raised text-sm font-semibold text-ink">{t('menu.register', 'Регистрация')}</Link>
                  </div>
                </div>
              )}

              {user && (
                <div className="grid auto-rows-fr grid-cols-3 gap-2">
                  <Tile to={createPageUrl('Messages')} icon={MessagesSquare} label={t('nav.messages')} count={unreadMessages} />
                  <Tile to="/Notifications" icon={Bell} label={t('nav.notifications')} count={unreadNotifications} onClick={() => onReadNotifications?.()} />
                  {isDealer
                    ? <Tile to={createPageUrl('DealerDashboard')} icon={Store} label={t('nav.dealer_panel')} />
                    : <Tile to={createPageUrl('Dashboard') + '?tab=favorites'} icon={Heart} label={t('nav.favorites')} />}
                </div>
              )}

              <Link to={user ? createPageUrl('CreateListing') : '#'} onClick={postAd}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-semibold text-white">
                <Plus className="h-5 w-5" />{t('nav.post_listing')}
              </Link>

              {cabinet.length > 0 && (
                <section>
                  <GroupTitle>{isDealer ? t('menu.salon', 'Салон') : t('menu.cabinet', 'Кабинет')}</GroupTitle>
                  <div className={cn(GROUP, 'divide-y divide-line')}>
                    {cabinet.map((it) => <Row key={it.to} to={it.to} icon={it.icon} label={t(it.labelKey, it.fallback)} current={isCurrent(it.to)} />)}
                    {isAdmin && (
                      <Row icon={Eye} onClick={() => { setOpen(false); setViewAsOpen(true); }}
                        label={viewAs
                          ? t(viewAs.type === 'dealer' ? 'viewAs.active_dealer' : 'viewAs.active_private', { name: viewAs.name || viewAs.email })
                          : t('viewAs.menu_item')} />
                    )}
                  </div>
                </section>
              )}

              {/* Vehicle categories: on bigger screens this is the green bar under the header */}
              <section>
                <GroupTitle>{t('menu.vehicles', 'Транспорт')}</GroupTitle>
                <div className="grid auto-rows-fr grid-cols-3 gap-2">
                  {QUICK_NAV.map(({ labelKey, icon: Icon, to, onClick }) => {
                    const cls = 'flex flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-1.5 py-3.5 text-center text-[13px] [text-wrap:balance] font-medium leading-tight text-ink';
                    const content = <><Icon className="h-6 w-6 text-brand-text" /><span>{t(labelKey)}</span></>;
                    return to
                      ? <Link key={labelKey} to={to} className={cls}>{content}</Link>
                      : <button key={labelKey} type="button" className={cls} onClick={() => { setOpen(false); onClick(); }}>{content}</button>;
                  })}
                </div>
              </section>

              <section>
                <GroupTitle>CarUnity</GroupTitle>
                <div className={cn(GROUP, 'divide-y divide-line')}>
                  {SECTIONS.map((it) => <Row key={it.to} to={it.to} icon={it.icon} label={t(it.labelKey)} current={isCurrent(it.to)} />)}
                </div>
              </section>

              <section>
                <GroupTitle>{t('nav.language', 'Язык')}</GroupTitle>
                <div role="radiogroup" aria-label={t('nav.language', 'Язык')} className="grid grid-cols-5 gap-1 rounded-2xl border border-line bg-surface p-1">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} type="button" role="radio" aria-checked={lang === l.code} onClick={() => i18n.changeLanguage(l.code)}
                      className={cn('flex h-11 flex-col items-center justify-center rounded-xl text-xs font-semibold',
                        lang === l.code ? 'bg-brand text-white' : 'text-ink-2')}>
                      <span className="text-base leading-none">{l.flag}</span>
                      <span className="mt-0.5">{l.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </section>

              {user && (
                <button type="button" onClick={() => { setOpen(false); onLogout(); }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line text-[15px] font-medium text-red-300">
                  <LogOut className="h-[18px] w-[18px]" />{t('nav.logout')}
                </button>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {isAdmin && <AdminViewAsDialog open={viewAsOpen} onOpenChange={setViewAsOpen} />}
    </>
  );
}
