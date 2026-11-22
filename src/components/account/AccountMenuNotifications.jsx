import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import AccountMenuNotificationItem from '@/components/account/AccountMenuNotificationItem';

export default function AccountMenuNotifications({ notifications, unread, onRead }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger onClick={() => { onRead(); navigate('/Notifications'); }} className="min-h-11 cursor-pointer gap-3 px-2 py-2.5 rounded-none border-b border-border text-sm font-normal text-foreground focus:bg-accent [&>svg]:size-[19px]">
        <Bell className="text-muted-foreground" strokeWidth={1.8} />
        <span className="flex-1">{t('nav.notifications')}</span>
        {unread > 0 && <span className="min-w-5 h-5 rounded-full bg-red-500 px-1 text-[10px] text-white font-semibold flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent collisionPadding={12} className="w-80 max-w-[calc(100vw-1.5rem)] max-h-[min(30rem,70dvh)] overflow-y-auto rounded-[20px] border-border bg-card text-card-foreground p-3 shadow-2xl">
        <div className="px-2 pt-1 pb-3 border-b border-border flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-medium"><Bell className="h-[19px] w-[19px] shrink-0 text-muted-foreground" strokeWidth={1.8} />{t('nav.notifications')}</span>
          <DropdownMenuItem asChild><Link to="/Notifications" onClick={onRead} className="min-h-8 shrink-0 rounded-lg border border-border bg-secondary px-2.5 text-xs text-foreground cursor-pointer focus:bg-accent">{t('nav.notifications_all')}</Link></DropdownMenuItem>
        </div>
        {notifications.length === 0 ? <div className="py-6 text-center text-sm text-muted-foreground"><Bell className="w-7 h-7 mx-auto mb-2 opacity-40" />{t('nav.notifications_empty')}</div> : notifications.map(notification => <AccountMenuNotificationItem key={notification.id} notification={notification} onRead={onRead} />)}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}