import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ru, enUS, et, lv, lt } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import AdBanner from '@/components/ads/AdBanner';
import ListPagination from '@/components/ui/ListPagination';

export default function AutoNews() {
  const { i18n, t } = useTranslation();
  const lang = i18n.language?.slice(0, 2);
  const dateLocale = ({ ru, en: enUS, et, lv, lt }[lang]) || enUS;
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => base44.entities.Article.filter({ is_published: true }, '-published_at', 50)
  });

  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const pagedArticles = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getTitle = (article) => {
    if (lang === 'ru' && article.title_ru) return article.title_ru;
    if (lang === 'et' && article.title_et) return article.title_et;
    if (lang === 'lv' && article.title_lv) return article.title_lv;
    if (lang === 'lt' && article.title_lt) return article.title_lt;
    return article.title;
  };

  const getPreview = (article) => {
    let text = '';
    if (lang === 'ru' && article.content_ru) text = article.content_ru;
    else if (lang === 'et' && article.content_et) text = article.content_et;
    else if (lang === 'lv' && article.content_lv) text = article.content_lv;
    else if (lang === 'lt' && article.content_lt) text = article.content_lt;
    else {
      try {
        const blocks = JSON.parse(article.content);
        const textBlock = blocks.find(b => b.type === 'text');
        text = textBlock?.value || article.content || '';
      } catch {
        text = article.content || '';
      }
    }
    return text.slice(0, 120);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.back', 'Назад')}
        </button>
        <div className="flex items-baseline gap-3 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('news.title', 'Новости')}</h1>
          {articles.length > 0 && (
            <span className="text-3xl font-bold text-slate-300 dark:text-slate-600">{articles.length}</span>
          )}
        </div>

        {/* AD — под заголовком списка новостей */}
        <AdBanner size="billboard" slot="news-list-top" className="mb-6" />

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-slate-500">{t('news.no_articles', 'No articles yet')}</div>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedArticles.map(article => (
              <Link
                key={article.id}
                to={`/ArticleDetail?id=${article.id}`}
                className="group flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-slate-900"
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {article.cover_image ? (
                    <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600" />
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-emerald-500 font-medium">{t('news.label')}</span>
                    {article.published_at && (
                      <span className="text-xs text-slate-400">{format(new Date(article.published_at), 'd MMM yyyy', { locale: dateLocale })}</span>
                    )}
                  </div>
                  <h2 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug mb-2 flex-1">
                    {getTitle(article)}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{getPreview(article)}</p>
                </div>
              </Link>
            ))}
          </div>
          <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}