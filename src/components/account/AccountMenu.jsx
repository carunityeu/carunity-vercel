import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, CarFront, Heart, MessagesSquare, Settings2, Store, ShieldCheck, Gift, Eye } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { createPageUrl } from '@/utils';
import AccountMenuFrame from '@/components/account/AccountMenuFrame';
import AccountMenuNotifications from '@/components/account/AccountMenuNotifications';
import AdminViewAsDialog from '@/components/account/AdminViewAsDialog';
import { readViewAs } from '@/lib/adminViewAs';

const ROW = 'min-h-11 cursor-pointer gap-3 px-2 py-2.5 rounded-none border-b border-border text-sm font-normal text-foreground focus:bg-accent [&>svg]:size-[19px]';
export default function AccountMenu({ user, hasUnread, unreadMessages, notifications, unreadNotifications, onRead, onLogout, referralEnabled, className }) {
  const { t } = useTranslation();
  const [viewAsOpen, setViewAsOpen] = useState(false);
  const isAdmin = user.role === 'admin';
  const viewAs = isAdmin ? readViewAs() : null;
  const isDealer = user.user_type === 'dealer' || !!user.dealer_id;
  // Dealers work only inside the dealer panel — no personal cabinet, favorites, listings or settings
  const items = [
    ...(isDealer ? [] : [
      { label: 'dashboard', to: createPageUrl('Dashboard'), icon: LayoutDashboard },
      { label: 'my_listings', to: createPageUrl('Dashboard') + '?tab=listings', icon: CarFront },
      { label: 'favorites', to: createPageUrl('Dashboard') + '?tab=favorites', icon: Heart },
      ...(referralEnabled ? [{ label: 'referral', to: createPageUrl('Referral'), icon: Gift, reward: true }] : [])
    ]),
    { label: 'messages', to: createPageUrl('Messages'), icon: MessagesSquare, unread: unreadMessages > 0 }
  ];
  const settings = [
    ...(isDealer ? [] : [{ label: 'settings', to: createPageUrl('Dashboard') + '?tab=settings', icon: Settings2 }]),
    ...(isDealer ? [{ label: 'dealer_panel', to: createPageUrl('DealerDashboard'), icon: Store }] : []),
    // While previewing another account the admin panel is out of reach for that account
    ...(isAdmin && !viewAs ? [{ label: 'admin_panel', to: '/x9-admin', icon: ShieldCheck }] : [])
  ];
  const viewAsLabel = viewAs
    ? t(viewAs.type === 'dealer' ? 'viewAs.active_dealer' : 'viewAs.active_private', { name: viewAs.name || viewAs.email })
    : t('viewAs.menu_item');
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
          <DropdownMenuItem
            onSelect={(event) => { event.preventDefault(); setViewAsOpen(true); }}
            className={ROW}
          >
            <Eye className={viewAs ? 'text-primary' : 'text-muted-foreground'} strokeWidth={1.8} />
            <span className="min-w-0 flex-1 truncate">{viewAsLabel}</span>
          </DropdownMenuItem>
        )}
      </AccountMenuFrame>
      {isAdmin && <AdminViewAsDialog open={viewAsOpen} onOpenChange={setViewAsOpen} />}
    </>
  );
}