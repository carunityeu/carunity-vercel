import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Store, User as UserIcon, Search, Check, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { readViewAs, setViewAsDealer, setViewAsPrivate, clearViewAs } from '@/lib/adminViewAs';

// The directory is built server-side, so every admin sees the same full list
// (reading other accounts directly is reserved to the app owner).
const loadDirectory = async () => {
  const response = await base44.functions.invoke('adminViewAsAccounts', {});
  return response.data || { dealers: [], accounts: [] };
};

const ROW = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent focus:bg-accent focus:outline-none';

export default function AdminViewAsDialog({ open, onOpenChange }) {
  const { t } = useTranslation();
  const active = readViewAs();
  const [mode, setMode] = useState(active?.type === 'private' ? 'private' : 'dealer');
  const [search, setSearch] = useState('');

  const { data: directory, isLoading } = useQuery({
    queryKey: ['viewAsDirectory'],
    queryFn: loadDirectory,
    enabled: open,
  });
  const dealers = directory?.dealers || [];
  const accounts = directory?.accounts || [];

  const term = search.trim().toLowerCase();
  const source = mode === 'dealer' ? dealers : accounts;
  const filtered = term
    ? source.filter((item) => `${item.name || ''} ${item.email || ''}`.toLowerCase().includes(term))
    : source;

  const go = (url) => {
    onOpenChange(false);
    window.location.href = url;
  };
  const pickDealer = (dealer) => {
    if (!dealer.email) return;
    setViewAsDealer(dealer.email, dealer.name, dealer.id);
    go('/DealerDashboard');
  };
  const pickPrivate = (account) => {
    if (!account.email) return;
    setViewAsPrivate(account.email, account.name, account.id);
    go('/Dashboard');
  };
  const reset = () => {
    clearViewAs();
    go('/x9-admin');
  };

  const tabs = [
    { key: 'dealer', label: t('viewAs.dealers'), icon: Store },
    { key: 'private', label: t('viewAs.privates'), icon: UserIcon },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md overflow-hidden">
        <DialogHeader className="space-y-1 px-4 pb-3 pt-5 sm:px-5">
          <DialogTitle className="text-base sm:text-lg">{t('viewAs.title')}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">{t('viewAs.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-5">
          <button type="button" onClick={reset} className={cn(ROW, 'border border-border', !active && 'border-primary/60 bg-primary/10')}>
            <ShieldCheck className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.8} />
            <span className="min-w-0 flex-1 text-sm font-medium">
              {active ? t('viewAs.exit') : t('viewAs.admin_mode')}
            </span>
            {!active && <Check className="h-4 w-4 shrink-0 text-primary" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 px-4 pt-3 sm:px-5">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setMode(key); setSearch(''); }}
              className={cn(
                'flex min-h-10 items-center justify-center gap-2 rounded-xl border px-2 text-sm font-medium transition-colors',
                mode === key
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        <div className="px-4 pt-3 sm:px-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={mode === 'dealer' ? t('viewAs.search_dealer') : t('viewAs.search_private')}
              className="h-10 pl-9 text-sm"
            />
          </div>
        </div>

        <div className="mt-3 max-h-[50vh] overflow-y-auto px-2 pb-2 sm:px-3">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />{t('viewAs.loading')}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('viewAs.empty')}</p>
          ) : filtered.map((item) => {
            const isActive = active?.id ? active.id === item.id : !!active?.email && active.email === item.email;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => (mode === 'dealer' ? pickDealer(item) : pickPrivate(item))}
                className={cn(ROW, isActive && 'bg-primary/10')}
              >
                {mode === 'dealer' && item.logo ? (
                  <img src={item.logo} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                    {(item.name || '?')[0]?.toUpperCase()}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.email || t('viewAs.no_email')}</span>
                </span>
                {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>

        <p className="border-t border-border px-4 py-3 text-[11px] leading-snug text-muted-foreground sm:px-5 sm:text-xs">
          {t('viewAs.hint')}
        </p>
      </DialogContent>
    </Dialog>
  );
}