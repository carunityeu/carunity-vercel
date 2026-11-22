import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const buildPages = (page, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(totalPages - 1, page + 1);
  if (from > 2) pages.push('gap-start');
  for (let i = from; i <= to; i += 1) pages.push(i);
  if (to < totalPages - 1) pages.push('gap-end');
  pages.push(totalPages);
  return pages;
};

/**
 * Единая пагинация для всех списков: кнопки «Назад» и «Вперёд»,
 * номера страниц на десктопе и счётчик страниц на мобильных.
 */
export default function ListPagination({ page = 1, totalPages = 1, onPageChange, className }) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const goTo = (next) => {
    if (next < 1 || next > totalPages || next === page) return;
    onPageChange(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav aria-label="pagination" className={cn('mt-8 flex flex-col items-center gap-3', className)}>
      <span className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
        {t('pagination.page_of', { page, total: totalPages })}
      </span>

      <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => goTo(page - 1)}
          className="h-10 flex-1 gap-1.5 border-[#292a32] text-slate-200 hover:bg-[#292a32] hover:text-white sm:h-9 sm:flex-none"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('pagination.prev')}
        </Button>

        <div className="hidden items-center gap-1 sm:flex">
          {buildPages(page, totalPages).map((item) =>
            typeof item === 'number' ? (
              <button
                key={item}
                type="button"
                onClick={() => goTo(item)}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition-colors',
                  item === page
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-400 hover:bg-[#292a32] hover:text-white'
                )}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="px-1 text-slate-600">…</span>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => goTo(page + 1)}
          className="h-10 flex-1 gap-1.5 border-[#292a32] text-slate-200 hover:bg-[#292a32] hover:text-white sm:h-9 sm:flex-none"
        >
          {t('pagination.next')}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
}