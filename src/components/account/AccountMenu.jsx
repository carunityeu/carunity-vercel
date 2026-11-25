import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, CarFront, Heart, MessagesSquare, Settings2, Store, ShieldCheck, Gift, Eye, Bell, LogOut, User, ChevronRight } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import AccountMenuFrame from '@/components/account/AccountMenuFrame';
import AccountMenuNotifications from '@/components/account/AccountMenuNotifications';
import AdminViewAsDialog from '@/components/account/AdminViewAsDialog';
import LanguagePills from '@/components/ui/LanguageSwitcherMenu';
import { readViewAs } from '@/lib/adminViewAs';

const ROW = 'min-h-11 cursor-pointer gap-3 px-2 py-2.5 rounded-none border-b border-border text-sm font-normal text-foreground focus:bg-accent [&>svg]:size-[19px]';

/** Account links, the same for the desktop dropdown and the phone sheet. */
function accountLinks(user, { unreadMessages, referralEnabled }) {
  const isAdmin = user.role === 'admin';
  const viewAs = isAdmin ? readViewAs() : null;
  const isDealer = user.user_type === 'dealer' || !!user.dealer_id;
  // Dealers work only inside the dealer panel — no personal cabinet, favorites, listings or settings
  const items = [
    ...(isDealer ? [] : [
      { label: 'dashboard', to: createPageUrl('Dashboard'), icon: LayoutDashboard },
      { label: 'my_listings', to: createPageUrl('Dashboard') + '?tab=listings', icon: CarFront },
      { label: 'favorites', to: createPageUrl('Dashboard') + '?tab=favorites', icon: Heart },
      ...(referralEnabled ? [{ label: 'referral', to: createPageUrl('Referral'), icon: Gift, reward: true }] : []),
    ]),
    { label: 'messages', to: createPageUrl('Messages'), icon: MessagesSquare, unread: unreadMessages > 0 },
  ];
  const settings = [
    ...(isDealer ? [] : [{ label: 'settings', to: createPageUrl('Dashboard') + '?tab=settings', icon: Settings2 }]),
    ...(isDealer ? [{ label: 'dealer_panel', to: createPageUrl('DealerDashboard'), icon: Store }] : []),
    // While previewing another account the admin panel is out of reach for that account
    ...(isAdmin && !viewAs ? [{ label: 'admin_panel', to: '/x9-admin', icon: ShieldCheck }] : []),
  ];
  return { items, settings, isAdmin, viewAs, isDealer };
}

function useViewAsLabel(viewAs) {
  const { t } = useTranslation();
  return viewAs
    ? t(viewAs.type === 'dealer' ? 'viewAs.active_dealer' : 'viewAs.active_private', { name: viewAs.name || viewAs.email })
    : t('viewAs.menu_item');
}

/** True below the lg breakpoint, where the header has no section links and the phone sheet is used. */
export function useCompactHeader() {
  const query = '(max-width: 1023px)';
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setCompact(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return compact;
}

function Avatar({ user, hasUnread, className }) {
  return (
    <span className={cn('relative flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white', className)}>
      {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
      {hasUnread && <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-red-500" />}
    </span>
  );
}

const SHEET_ROW = 'flex min-h-12 items-center gap-3 px-5 text-[15px] text-ink';

/**
 * Phone / tablet version of the account menu: a panel from the right with the account links,
 * notifications, the site sections and the language. Guests get the same panel with a sign-in button.
 */
export function AccountSheet({ user, hasUnread, unreadMessages = 0, unreadNotifications = 0, onRead, onLogout, onLogin, referralEnabled, links = [] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [viewAsOpen, setViewAsOpen] = useState(false);
  const acc = user ? accountLinks(user, { unreadMessages, referralEnabled }) : null;
  const viewAsLabel = useViewAsLabel(acc?.viewAs);
  const close = () => setOpen(false);
  const rowLink = (key, to, Icon, label, extra) => (
    <Link key={key} to={to} onClick={close} className={SHEET_ROW}>
      <Icon className="h-5 w-5 flex-shrink-0 text-ink-3" strokeWidth={1.8} />
      <span className="flex-1">{label}</span>
      {extra}
    </Link>
  );

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button type="button" aria-label={t('nav.account')} className="flex h-10 w-10 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand">
            {user ? <Avatar user={user} hasUnread={hasUnread} /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-raised text-ink"><User className="h-[18px] w-[18px]" /></span>}
          </button>
        </SheetTrigger>
        <SheetContent side="right" onOpenAutoFocus={(e) => e.preventDefault()} className="flex w-[88vw] max-w-sm flex-col gap-0 overflow-y-auto border-line bg-surface p-0 text-ink">
          <SheetTitle className="sr-only">{t('nav.account')}</SheetTitle>

          <div className="border-b border-line px-5 pb-5 pt-6 pr-12">
            {user ? (
              <div className="flex min-w-0 items-center gap-3">
                <Avatar user={user} className="h-11 w-11 text-base" />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-ink">{user.full_name || user.email}</p>
                  {user.full_name && <p className="truncate text-sm text-ink-3">{user.email}</p>}
                </div>
              </div>
            ) : (
              <Button className="w-full" size="lg" onClick={() => { close(); onLogin(); }}>{t('nav.login')}</Button>
            )}
          </div>

          {acc && (
            <nav className="border-b border-line py-2">
              {acc.items.map(({ label, to, icon, unread, reward }) => rowLink(label, to, icon, t('nav.' + label), (
                <>
                  {unread && <span className="h-2 w-2 rounded-full bg-red-500" />}
                  {reward && <span className="rounded bg-brand/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-text">+7d</span>}
                </>
              )))}
              <Link to="/Notifications" onClick={() => { onRead?.(); close(); }} className={SHEET_ROW}>
                <Bell className="h-5 w-5 flex-shrink-0 text-ink-3" strokeWidth={1.8} />
                <span className="flex-1">{t('nav.notifications')}</span>
                {unreadNotifications > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
              </Link>
              {acc.settings.map(({ label, to, icon }) => rowLink(label, to, icon, t('nav.' + label)))}
              {acc.isAdmin && (
                <button type="button" onClick={() => { close(); setViewAsOpen(true); }} className={cn(SHEET_ROW, 'w-full text-left')}>
                  <Eye className={cn('h-5 w-5 flex-shrink-0', acc.viewAs ? 'text-brand-text' : 'text-ink-3')} strokeWidth={1.8} />
                  <span className="min-w-0 flex-1 truncate">{viewAsLabel}</span>
                </button>
              )}
            </nav>
          )}

          <nav className="border-b border-line py-2">
            {links.map((item) => (
              <Link key={item.to} to={item.to} onClick={close} className={SHEET_ROW}>
                <span className="flex-1">{t(item.labelKey)}</span>
                <ChevronRight className="h-4 w-4 text-ink-3" />
              </Link>
            ))}
          </nav>

          <div className="px-5 py-4">
            <p className="mb-2 text-xs text-ink-3">{t('nav.language', 'Язык')}</p>
            <LanguagePills />
          </div>

          {user && (
            <div className="mt-auto px-5 pb-6 pt-2">
              <Button variant="secondary" className="w-full" onClick={() => { close(); onLogout(); }}><LogOut />{t('nav.logout')}</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
      {acc?.isAdmin && <AdminViewAsDialog open={viewAsOpen} onOpenChange={setViewAsOpen} />}
    </>
  );
}

/** Desktop account dropdown. */
export default function AccountMenu({ user, hasUnread, unreadMessages, notifications, unreadNotifications, onRead, onLogout, referralEnabled, className }) {
  const { t } = useTranslation();
  const [viewAsOpen, setViewAsOpen] = useState(false);
  const { items, settings, isAdmin, viewAs } = accountLinks(user, { unreadMessages, referralEnabled });
  const viewAsLabel = useViewAsLabel(viewAs);
  return (
    <>
      <AccountMenuFrame user={user} hasUnread={hasUnread} onLogout={onLogout} className={className}>
        {items.map(({ label, to, icon: Icon, unread, reward }) => (
          <DropdownMenuItem asChild key={label}>
            <Link to={to} className={ROW}>
              <Icon className="text-muted-foreground" strokeWidth={1.8} /><span className="flex-1">{t('nav.' + label)}</span>
              {unread && <span className="h-2 w-2 rounded-full bg-red-500" />}
              {reward && <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">+7d</span>}
            </Link>
          </DropdownMenuItem>
        ))}
        <AccountMenuNotifications notifications={notifications} unread={unreadNotifications} onRead={onRead} />
        {settings.map(({ label, to, icon: Icon }) => (
          <DropdownMenuItem asChild key={label}>
            <Link to={to} className={ROW}><Icon className="text-muted-foreground" strokeWidth={1.8} /><span>{t('nav.' + label)}</span></Link>
          </DropdownMenuItem>
        ))}
        {isAdmin && (
          <DropdownMenuItem onSelect={(event) => { event.preventDefault(); setViewAsOpen(true); }} className={ROW}>
            <Eye className={viewAs ? 'text-primary' : 'text-muted-foreground'} strokeWidth={1.8} />
            <span className="min-w-0 flex-1 truncate">{viewAsLabel}</span>
          </DropdownMenuItem>
        )}
      </AccountMenuFrame>
      {isAdmin && <AdminViewAsDialog open={viewAsOpen} onOpenChange={setViewAsOpen} />}
    </>
  );
}
