import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { Search, Star, Heart, MessageSquare, Tag, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CabinetNotifications from '@/components/dashboard/CabinetNotifications';
import { cn } from '@/lib/utils';

const CARD = 'bg-[#1b1b22] border border-[#292a32]';

function ActionTile({ title, desc, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(CARD, 'rounded-xl p-4 text-left flex flex-col justify-between min-h-[104px] transition-colors hover:border-emerald-500/40')}
    >
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{desc}</p>
      </div>
      <Icon className="w-5 h-5 text-slate-500 mt-3" />
    </button>
  );
}

export default function OverviewPanel({ user, myListings = [], favoritesCount = 0, searchesCount = 0, onTabChange, locale }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: activeCars = 0 } = useQuery({
    queryKey: ['overviewActiveCars'],
    staleTime: 5 * 60 * 1000,
    queryFn: () => entities.Car.count({ status: 'active' })
  });

  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ['overviewUnread', user?.email],
    enabled: !!user?.email,
    staleTime: 60 * 1000,
    queryFn: () => entities.Message.count({ receiver_email: user.email, is_read: false })
  });

  const money = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value || 0);
  const firstName = (user?.full_name || user?.email || '').split(/\s+/)[0] || '';
  const recent = myListings.slice(0, 3);

  const statusStyles = {
    active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    sold: 'bg-slate-500/15 text-slate-400 border border-slate-500/25',
    rejected: 'bg-red-500/15 text-red-400 border border-red-500/25'
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-slate-500 mb-1.5">{t('account.breadcrumb')} <span className="text-slate-600">›</span> {t('account.nav_overview')}</p>
        <h1 className="text-xl sm:text-2xl font-bold text-white">{t('account.greeting', { name: firstName })}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <ActionTile
          title={t('account.tile_search_title')}
          desc={t('account.tile_search_desc', { count: activeCars })}
          icon={Search}
          onClick={() => navigate('/Catalog')}
        />
        <ActionTile
          title={t('account.tile_searches_title')}
          desc={searchesCount > 0 ? t('account.tile_searches_desc', { count: searchesCount }) : t('account.tile_searches_empty')}
          icon={Star}
          onClick={() => onTabChange('searches')}
        />
        <ActionTile
          title={t('account.tile_favorites_title')}
          desc={favoritesCount > 0 ? t('account.tile_favorites_desc', { count: favoritesCount }) : t('account.tile_favorites_empty')}
          icon={Heart}
          onClick={() => onTabChange('favorites')}
        />
        <ActionTile
          title={t('account.tile_messages_title')}
          desc={unreadMessages > 0 ? t('account.tile_messages_desc', { count: unreadMessages }) : t('account.tile_messages_empty')}
          icon={MessageSquare}
          onClick={() => navigate('/Messages')}
        />
        <ActionTile
          title={t('account.tile_sell_title')}
          desc={t('account.tile_sell_desc')}
          icon={Tag}
          onClick={() => navigate('/CreateListing')}
        />
      </div>

      <CabinetNotifications user={user} />

      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-base sm:text-lg font-semibold text-white">{t('account.my_listings')}</h2>
          {myListings.length > 0 && (
            <button
              type="button"
              onClick={() => onTabChange('listings')}
              className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {t('account.view_all')}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className={cn(CARD, 'rounded-xl p-6 text-center')}>
            <p className="text-slate-400 mb-4">{t('account.no_listings')}</p>
            <Button onClick={() => navigate('/CreateListing')} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4" />
              {t('account.add_listing')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((car) => (
              <Link
                key={car.id}
                to={getCarDetailsPath(car)}
                className={cn(CARD, 'rounded-xl p-3 flex items-center gap-3 hover:border-emerald-500/40 transition-colors')}
              >
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                  {car.images?.[0] ? (
                    <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {car.brand} {car.model} {car.year && <span className="text-slate-400">({car.year})</span>}
                  </p>
                  <p className="text-sm text-slate-300 mt-0.5">{money(car.price)}</p>
                </div>
                <span className={cn('text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0', statusStyles[car.status] || statusStyles.pending)}>
                  {t('dashboard.status_' + car.status, car.status)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}