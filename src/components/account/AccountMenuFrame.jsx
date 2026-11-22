import React from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function AccountMenuFrame({ user, hasUnread, onLogout, className, children }) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label={t('nav.account')} className={cn('relative items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background', className)}>
          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
          {hasUnread && <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-card" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} collisionPadding={12} aria-label={t('nav.account')} data-account-menu className="w-64 max-w-[calc(100vw-1.5rem)] max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto rounded-[20px] border-border bg-card text-card-foreground p-3 shadow-2xl">
        {children}
        <div className="px-2 pt-3 pb-2.5 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">{t('nav.logged_in_as')}</p>
          <p className="text-sm font-medium truncate" title={user.full_name || undefined}>{user.full_name || '—'}</p>

        </div>
        <DropdownMenuItem onSelect={onLogout} className="min-h-10 w-full cursor-pointer justify-center gap-2 rounded-xl border border-foreground/70 text-foreground font-semibold focus:bg-foreground/10 focus:text-foreground">
          <LogOut className="h-4 w-4" strokeWidth={1.8} />{t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}