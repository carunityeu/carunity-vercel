import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';

export default function CatalogHeader({
  title,
  count,
  countLabel,
  sortBy,
  setSortBy,
  sortOptions = [],
  onShowFilters,
  showFilterButton = true,
  filterCount = 0,
  icon,
  breadcrumbLabel,
  viewMode,
  onViewModeChange
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors text-sm flex-shrink-0">
          
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('common.back', 'Назад')}</span>
        </button>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <nav className="flex items-center gap-2 text-sm text-slate-400 min-w-0">
          <Link to="/" className="hover:text-white transition-colors flex-shrink-0">{t('breadcrumb.home', 'Главная')}</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-white truncate">{breadcrumbLabel || title}</span>
        </nav>
      </div>

      {/* Title + Sort */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span className="truncate">{title}</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {count} {countLabel || t('catalog.listings', 'объявлений')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showFilterButton &&
          <button
            onClick={onShowFilters}
            className="flex lg:hidden items-center gap-2 bg-slate-800/80 border border-slate-700 text-white text-sm px-3 py-2 rounded-xl relative">
            
              <SlidersHorizontal className="w-4 h-4" />
              {filterCount > 0 &&
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {filterCount}
                </span>
            }
            </button>
          }
          {viewMode && onViewModeChange &&
          <div className="flex items-center gap-0.5 bg-slate-800/80 border border-slate-700 rounded-xl p-0.5">
              <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
              title={t('catalog.view_grid', 'Сетка')}
              aria-label={t('catalog.view_grid', 'Сетка')}>
              
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`w-8 h-8 flex items-center justify-center transition-colors rounded-[10px] ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
              title={t('catalog.view_list', 'Список')}
              aria-label={t('catalog.view_list', 'Список')}>
              
                <List className="w-4 h-4" />
              </button>
            </div>
          }
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-800/80 border border-slate-700 text-white text-sm rounded-xl pl-3 sm:pl-4 pr-9 py-2 outline-none cursor-pointer min-w-[120px]">
              
              {sortOptions.map((opt) =>
              <option key={opt.value} value={opt.value}>{opt.label}</option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </>);

}