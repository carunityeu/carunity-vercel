import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import ListPagination from '@/components/ui/ListPagination';
import { Bell, Heart, Search, Zap, ZapOff, MessageSquare, Tag, CheckCheck, Trash2, ArrowLeft, TrendingDown, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS, et, lv, lt } from 'date-fns/locale';
import { translateNotification } from '@/utils/notificationI18n';

const dateFnsLocales = { ru, en: enUS, et, lv, lt };

const typeConfig = {
  car_favorited: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  saved_search_match: { icon: Search, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  promotion_ending: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  promotion_ended: { icon: ZapOff, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
  price_drop: { icon: Tag, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  new_message: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  offer_received: { icon: Tag, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  offer_accepted: { icon: CheckCheck, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  view_decline: { icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  fast_sale_match: { icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  listing_expiring: { icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
};

export default function Notifications() {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dateFnsLocale = dateFnsLocales[i18n.language] || ru;

  const FILTERS = [
    { key: 'all', label: t('notifications.filter_all') },
    { key: 'car_favorited', label: t('notifications.filter_favorites') },
    { key: 'saved_search_match', label: t('notifications.filter_search') },
    { key: 'promotion_ending', label: t('notifications.filter_promotion') },
    { key: 'price_drop', label: t('notifications.filter_price') },
    { key: 'view_decline', label: t('notifications.filter_view_decline', 'Падение просмотров') },
  ];

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications-page', user?.email],
    queryFn: () => entities.Notification.filter({ user_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter ||
    (filter === 'promotion_ending' && (n.type === 'promotion_ending' || n.type === 'promotion_ended' || n.type === 'listing_expiring'))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedNotifications = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filter]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id) => entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email] });
    },
  });

  const handleClick = async (n) => {
    if (!n.is_read) {
      await entities.Notification.update(n.id, { is_read: true });
      queryClient.invalidateQueries({ queryKey: ['notifications-page', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email] });
    }
    const link = n.type === 'view_decline' ? '/DealerDashboard' : (n.link || (n.car_id ? `/CarDetails?id=${n.car_id}` : null));
    if (link) navigate(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-slate-600 dark:text-slate-300 flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 flex-shrink-0" />
              {t('notifications.title')}
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} className="gap-1.5 flex-shrink-0">
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{t('notifications.mark_all_read')}</span>
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filter === f.key
                  ? "bg-emerald-500 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 animate-pulse flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{t('notifications.empty_title')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('notifications.empty_desc')}</p>
            </div>
          ) : (
            <>
            {pagedNotifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.car_favorited;
              const Icon = cfg.icon;
              const { title: translatedTitle, content: translatedContent } = translateNotification(n, i18n.language?.slice(0, 2));
              return (
                <div
                  key={n.id}
                  className={cn(
                    "bg-white dark:bg-slate-900 rounded-2xl border transition-all group",
                    !n.is_read
                      ? "border-blue-200 dark:border-blue-800 shadow-sm"
                      : "border-slate-200 dark:border-slate-800"
                  )}
                >
                  <button
                    onClick={() => handleClick(n)}
                    className="w-full text-left p-4 flex gap-3 sm:gap-4 items-start cursor-pointer"
                  >
                    <div className={cn("w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center", cfg.bg)}>
                      <Icon className={cn("w-5 h-5", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                           "text-sm",
                           !n.is_read ? "font-semibold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                         )}>
                          {translatedTitle}
                         </p>
                         {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{translatedContent}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                        {formatDistanceToNow(new Date(n.created_date), { addSuffix: true, locale: dateFnsLocale })}
                      </p>
                    </div>
                  </button>
                  {n.type === 'view_decline' && (
                    <div className="px-4 pb-2 flex items-center gap-2 -mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!n.is_read) {
                            entities.Notification.update(n.id, { is_read: true });
                            queryClient.invalidateQueries({ queryKey: ['notifications-page', user?.email] });
                          }
                          navigate(`/DealerDashboard?promote=${n.car_id}`);
                        }}
                        className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        {t('view_decline.promote_btn', 'Продвинуть')}
                      </button>
                    </div>
                  )}
                  <div className="px-4 pb-3 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity -mt-1">
                    <button
                      onClick={() => deleteNotification.mutate(n.id)}
                      className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('notifications.delete')}
                    </button>
                  </div>
                </div>
              );
            })}
            <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}