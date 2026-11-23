import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { isDealerUser, syncAccountType } from '@/lib/accountType';
import { resolveViewAsUser } from '@/lib/adminViewAs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { Loader2, Bookmark, History } from 'lucide-react';
import { toast } from 'sonner';
import UserSidebar from '@/components/dashboard/UserSidebar';
import OverviewPanel from '@/components/dashboard/OverviewPanel';
import MyListingsPanel from '@/components/dashboard/MyListingsPanel';
import FavoritesPanel from '@/components/dashboard/FavoritesPanel';
import AccountSettingsPanel from '@/components/dashboard/AccountSettingsPanel';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import DashboardTabHeader from '@/components/dashboard/DashboardTabHeader';
import SavedSearchesTab from '@/components/dashboard/SavedSearchesTab';
import ViewHistoryTab from '@/components/dashboard/ViewHistoryTab';
import FastSaleOffers from '@/components/dashboard/FastSaleOffers';

const TABS = ['overview', 'listings', 'favorites', 'searches', 'history', 'get-offers', 'settings', 'notifications'];

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    return TABS.includes(tab) ? tab : 'overview';
  });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const localeMap = { ru: 'ru-RU', en: 'en-GB', et: 'et-EE', lv: 'lv-LV', lt: 'lt-LT' };
  const locale = localeMap[i18n.language?.slice(0, 2)] || 'ru-RU';

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab && TABS.includes(tab)) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    const loadUser = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin();
        return;
      }
      const currentUser = await base44.auth.me();
      const { user: effectiveUser, viewAs } = await resolveViewAsUser(currentUser);
      // Admin previewing a dealer belongs in the dealer panel
      if (viewAs?.type === 'dealer') { navigate(createPageUrl('DealerDashboard'), { replace: true }); return; }
      const me = effectiveUser.id !== currentUser.id
        ? effectiveUser
        : await syncAccountType(currentUser).catch(() => currentUser);
      // Dealers live entirely in the dealer panel — no personal cabinet
      if (me.role !== 'admin' && isDealerUser(me)) {
        navigate(createPageUrl('DealerDashboard'), { replace: true });
        return;
      }
      setUser(me);
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const { data: myListings = [], isLoading: loadingListings } = useQuery({
    queryKey: ['myListings', user?.email],
    queryFn: () => entities.Car.filter(
      { $or: [{ created_by_id: user.id }, { seller_id: user.email }] },
      '-created_date',
      100
    ),
    enabled: !!user
  });

  const { data: favorites = [], isLoading: loadingFavorites } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => entities.Favorite.filter({ user_email: user.email }, '-created_date'),
    enabled: !!user
  });

  // Fetch all favourite cars in a single query instead of one Car.get() per favourite
  const { data: favoriteCars = [], isLoading: loadingFavoriteCars } = useQuery({
    queryKey: ['favoriteCars', favorites],
    queryFn: async () => {
      const ids = [...new Set(favorites.map(f => f.car_id))].slice(0, 50);
      const { items } = await entities.Car.filter({ id: { $in: ids } }, { limit: 50 });
      const byId = new Map(items.map(car => [car.id, car]));
      return ids.map(id => byId.get(id) || { id, status: 'inactive', is_missing: true });
    },
    enabled: favorites.length > 0
  });



  const { data: savedSearches = [] } = useQuery({
    queryKey: ['savedSearches', user?.email],
    queryFn: () => entities.SavedSearch.filter({ user_email: user.email }, '-created_date'),
    enabled: !!user
  });

  const handleUserUpdate = (patch) => setUser((prev) => ({ ...prev, ...patch }));

  const deleteSavedSearch = async (id) => {
    await entities.SavedSearch.delete(id);
    queryClient.invalidateQueries(['savedSearches']);
    toast.success(t('dashboard.search_deleted'));
  };

  const toggleIamLooking = async (id, currentValue) => {
    await entities.SavedSearch.update(id, { is_i_am_looking: !currentValue });
    queryClient.invalidateQueries(['savedSearches']);
    toast.success(currentValue ? t('dashboard.iam_looking_removed') : t('dashboard.iam_looking_added'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const panels = {
    overview: (
      <OverviewPanel
        user={user}
        myListings={myListings}
        favoritesCount={favorites.length}
        searchesCount={savedSearches.length}
        onTabChange={setActiveTab}
        locale={locale}
      />
    ),
    listings: <MyListingsPanel user={user} cars={myListings} isLoading={loadingListings} locale={locale} />,
    favorites: (
      <FavoritesPanel
        user={user}
        cars={favoriteCars}
        isLoading={loadingFavorites || loadingFavoriteCars}
      />
    ),
    searches: (
      <div className="space-y-4">
        <DashboardTabHeader icon={Bookmark} title={t('account.nav_searches')} count={savedSearches.length} />
        <SavedSearchesTab
          savedSearches={savedSearches}
          onDelete={deleteSavedSearch}
          onToggleIamLooking={toggleIamLooking}
        />
      </div>
    ),
    history: <ViewHistoryTab user={user} />,
    'get-offers': <FastSaleOffers user={user} />,
    settings: <AccountSettingsPanel user={user} onUserUpdate={handleUserUpdate} locale={locale} />,
    notifications: <NotificationsPanel user={user} onUserUpdate={handleUserUpdate} />
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-6 lg:items-start">
          <UserSidebar
            user={user}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            favoritesCount={favorites.length}
          />
          <main className="min-w-0 mt-5 lg:mt-0">{panels[activeTab] || panels.overview}</main>
        </div>
      </div>
    </div>
  );
}