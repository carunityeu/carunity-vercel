import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';

/**
 * Bottom action buttons for filter panels — matches the landing page layout.
 * Three buttons: Find (search), Extended search (Link to /DetailedSearch), Reset.
 */
export default function FilterActionButtons({ onSearch, onReset }) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 py-1">
      <Button
        onClick={onSearch}
        className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white gap-2 rounded-xl text-sm font-semibold">
        
        <Search className="w-4 h-4" />
        {t('home.search_button')}
      </Button>
      <Link
        to="/DetailedSearch"
        title={t('home.extended_search')}
        className="h-10 px-3 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl flex-shrink-0">
        
        <SlidersHorizontal className="w-4 h-4" />
      </Link>
      <Button
        type="button"
        variant="ghost"
        onClick={onReset}
        title={t('catalog.reset_filters')}
        className="h-10 px-3 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl whitespace-nowrap flex-shrink-0">
        
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>);

}