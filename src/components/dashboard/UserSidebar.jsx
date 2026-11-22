import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, MessageSquare, Star, Heart, History, Car, Tag, Settings, Bell, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

const CARD = 'bg-[#1b1b22] border border-[#292a32]';

function NavRow({ item, active, onTabChange }) {
  const Icon = item.icon;
  const cls = cn(
    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
    active ? 'bg-[#292a32] text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-[#202024]'
  );
  const inner =
  <>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className={item.key === 'get-offers' ? 'min-w-0 whitespace-normal break-words text-left leading-snug' : 'truncate'}>
        {item.label}
        {item.badge > 0 && <span className="text-slate-500"> ({item.badge})</span>}
      </span>
    </>;

  return item.href ?
  <Link to={item.href} className={cls}>{inner}</Link> :
  <button type="button" onClick={() => onTabChange(item.key)} className={cls}>{inner}</button>;
}

function NavPill({ item, active, onTabChange }) {
  const Icon = item.icon;
  const cls = cn(
    'inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors',
    active ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-[#1b1b22] border-[#292a32] text-slate-300'
  );
  const inner =
  <>
      <Icon className="w-4 h-4 flex-shrink-0" />
      {item.label}
      {item.badge > 0 && <span className="opacity-80">({item.badge})</span>}
    </>;

  return item.href ?
  <Link to={item.href} className={cls}>{inner}</Link> :
  <button type="button" onClick={() => onTabChange(item.key)} className={cls}>{inner}</button>;
}

export default function UserSidebar({ user, activeTab, onTabChange, favoritesCount = 0 }) {
  const { t } = useTranslation();
  const fullName = user?.full_name || user?.email || '';
  const initials = fullName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const firstName = fullName.split(/\s+/)[0] || '';

  const groups = [
  {
    key: 'main',
    items: [
    { key: 'overview', icon: LayoutGrid, label: t('account.nav_overview') },
    { key: 'messages', icon: MessageSquare, label: t('account.nav_messages'), href: '/Messages' }]

  },
  {
    key: 'buying',
    label: t('account.group_buying'),
    items: [
    { key: 'searches', icon: Star, label: t('account.nav_searches') },
    { key: 'favorites', icon: Heart, label: t('account.nav_favorites'), badge: favoritesCount },
    { key: 'history', icon: History, label: t('account.nav_history') }]

  },
  {
    key: 'selling',
    label: t('account.group_selling'),
    items: [
    { key: 'listings', icon: Car, label: t('account.nav_listings') },
    { key: 'get-offers', icon: Tag, label: t('account.nav_offers') }]

  },
  {
    key: 'profile',
    label: t('account.group_profile'),
    items: [
    { key: 'settings', icon: Settings, label: t('account.nav_settings') },
    { key: 'notifications', icon: Bell, label: t('account.nav_notifications') }]

  }];

  const flatItems = groups.flatMap((g) => g.items);

  const ProfileBlock = () =>
  <div className="flex items-center gap-3 px-2.5 py-3">
      <div className="w-11 h-11 rounded-full text-slate-900 font-bold text-sm flex items-center justify-center flex-shrink-0 bg-[hsl(var(--primary))]">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-white text-sm truncate">{firstName}</p>
        <button
        type="button"
        onClick={() => onTabChange('settings')}
        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
        
          <Pencil className="w-3 h-3" />
          {t('account.edit_profile')}
        </button>
      </div>
    </div>;


  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-[136px]">
          <nav className={cn(CARD, 'rounded-xl p-2')}>
            <ProfileBlock />
            <div className="border-t border-[#292a32] mx-1" />
            {groups.map((group, index) =>
            <div key={group.key} className={index > 0 ? 'mt-1 pt-2 border-t border-[#292a32]' : 'pt-1'}>
                {group.label &&
              <p className="px-2.5 py-1.5 text-[11px] uppercase tracking-wide text-slate-500">{group.label}</p>
              }
                {group.items.map((item) =>
              <NavRow key={item.key} item={item} active={activeTab === item.key} onTabChange={onTabChange} />
              )}
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Mobile: profile block + horizontal nav */}
      <div className="lg:hidden space-y-3">
        <div className={cn(CARD, 'rounded-xl')}>
          <ProfileBlock />
        </div>
        <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-2 w-max pb-1">
            {flatItems.map((item) =>
            <NavPill key={item.key} item={item} active={activeTab === item.key} onTabChange={onTabChange} />
            )}
          </div>
        </div>
      </div>
    </>);

}