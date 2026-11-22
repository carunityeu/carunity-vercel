import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function MessagesSidebarHeader({ searchQuery, onSearchChange }) {
  const { t } = useTranslation();
  return <div className="shrink-0 p-4 border-b border-border space-y-4">
    <div className="flex items-center justify-between gap-3">
      <h1 className="text-lg font-semibold text-foreground">{t('messages.title')}</h1>
      <Link to="/Dashboard?tab=overview" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ArrowLeft className="h-3.5 w-3.5" />{t('account.breadcrumb')}
      </Link>
    </div>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input placeholder={t('messages.search') + '...'} value={searchQuery} onChange={event => onSearchChange(event.target.value)} aria-label={t('messages.search')} className="pl-9 bg-background border-border rounded-lg h-10 text-sm text-foreground" />
    </div>
  </div>;
}