import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS, et, lv, lt } from 'date-fns/locale';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { translateNotification } from '@/utils/notificationI18n';
import { cn } from '@/lib/utils';

const locales = { ru, en: enUS, et, lv, lt };
export default function AccountMenuNotificationItem({ notification, onRead }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2);
  const { title, content } = translateNotification(notification, lang);
  return (
    <DropdownMenuItem asChild>
      <Link to="/Notifications" onClick={onRead} className={cn('block cursor-pointer px-2 py-3 rounded-none border-b border-border last:border-0 focus:bg-accent focus:text-foreground', !notification.is_read && 'bg-primary/5')}>
        <div className="flex items-start gap-2">
          {!notification.is_read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />}
          <div className={notification.is_read ? 'pl-3.5' : ''}>
            <p className="text-sm font-medium leading-snug text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{content}</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">{formatDistanceToNow(new Date(notification.created_date), { addSuffix: true, locale: locales[lang] || ru })}</p>
          </div>
        </div>
      </Link>
    </DropdownMenuItem>
  );
}