import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { translateNotification } from '@/utils/notificationI18n';
import { cn } from '@/lib/utils';

const CARD = 'bg-[#1b1b22] border border-[#292a32]';

export default function CabinetNotifications({ user }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['cabinetNotifications', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { items } = await base44.entities.Notification.filter(
        { user_email: user.email },
        { sort: '-created_date', limit: 4 }
      );
      return items;
    },
  });

  if (notifications.length === 0) return null;

  const open = async (notification) => {
    if (!notification.is_read) {
      await base44.entities.Notification.update(notification.id, { is_read: true });
      queryClient.invalidateQueries(['cabinetNotifications', user?.email]);
      queryClient.invalidateQueries(['notifications', user?.email]);
    }
    navigate(notification.link || '/Notifications');
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white sm:text-lg">{t('notifications.title')}</h2>
        <button
          type="button"
          onClick={() => navigate('/Notifications')}
          className="text-sm text-emerald-400 transition-colors hover:text-emerald-300"
        >
          {t('account.view_all')}
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map((notification) => {
          const { title, content } = translateNotification(notification, i18n.language?.slice(0, 2));
          return (
            <button
              key={notification.id}
              type="button"
              onClick={() => open(notification)}
              className={cn(
                CARD,
                'w-full rounded-xl p-3 text-left transition-colors hover:border-emerald-500/40',
                !notification.is_read && 'border-emerald-500/25'
              )}
            >
              <p className={cn('text-[13px] leading-snug sm:text-sm', notification.is_read ? 'font-medium text-slate-300' : 'font-semibold text-white')}>
                {title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{content}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}