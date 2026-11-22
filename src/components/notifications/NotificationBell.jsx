import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Heart, Search, Zap, ZapOff, MessageSquare, Tag, CheckCheck, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS, et, lv, lt } from 'date-fns/locale';
import { translateNotification } from '@/utils/notificationI18n';

const dateFnsLocales = { ru, en: enUS, et, lv, lt };

const typeConfig = {
  car_favorited: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  saved_search_match: { icon: Search, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  promotion_ending: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  promotion_ended: { icon: ZapOff, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
  price_drop: { icon: Tag, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  new_message: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  offer_received: { icon: Tag, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  offer_accepted: { icon: CheckCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  view_decline: { icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  fast_sale_match: { icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  listing_expiring: { icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
};

export default function NotificationBell({ userEmail }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dateFnsLocale = dateFnsLocales[i18n.language] || ru;

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ user_email: userEmail }, '-created_date', 20),
    enabled: !!userEmail,
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userEmail] }),
  });

  const markOneRead = async (notification) => {
    if (!notification.is_read) {
      await base44.entities.Notification.update(notification.id, { is_read: true });
      queryClient.invalidateQueries({ queryKey: ['notifications', userEmail] });
    }
    const link = notification.link || (notification.car_id ? `/CarDetails?id=${notification.car_id}` : '/Notifications');
    setOpen(false);
    navigate(link);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
              {unreadCount > 9 && <span className="sr-only">{unreadCount}</span>}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 sm:w-80 p-0 shadow-xl border dark:border-slate-700" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-slate-700">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {t('notifications.mark_all_read')}
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('notifications.empty_short')}</p>
            </div>
          ) : (
            notifications.slice(0, 6).map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.car_favorited;
              const Icon = cfg.icon;
              const { title: translatedTitle, content: translatedContent } = translateNotification(n, i18n.language?.slice(0, 2));
              return (
                <button
                  key={n.id}
                  onClick={() => markOneRead(n)}
                  className={cn(
                    "w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b dark:border-slate-800 last:border-b-0 cursor-pointer",
                    !n.is_read && "bg-blue-50/50 dark:bg-blue-900/10"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center", cfg.bg)}>
                    <Icon className={cn("w-4 h-4", cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm leading-tight", !n.is_read ? "font-semibold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                      {translatedTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{translatedContent}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(n.created_date), { addSuffix: true, locale: dateFnsLocale })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t dark:border-slate-700">
            <Link
              to="/Notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              {t('notifications.view_all')}
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}