import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { format } from 'date-fns';
import NewsGridSkeleton from '@/components/news/NewsGridSkeleton';
import { ru, enUS, et, lv, lt } from 'date-fns/locale';

export default function NewsSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2);
  const dateLocale = ({ ru, en: enUS, et, lv, lt }[lang]) || enUS; // localized news dates follow i18n.language

  const getTitle = (article) => {
    if (lang === 'ru' && article.title_ru) return article.title_ru;
    if (lang === 'et' && article.title_et) return article.title_et;
    if (lang === 'lv' && article.title_lv) return article.title_lv;
    if (lang === 'lt' && article.title_lt) return article.title_lt;
    return article.title;
  };
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['latestArticles'],
    queryFn: () => entities.Article.filter({ is_published: true }, '-published_at', 6),
    staleTime: 10 * 60 * 1000,
  });

  if (!isLoading && articles.length === 0) return null;

  const totalCount = articles.length;

  return (
    <section className="py-12 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-baseline gap-3 mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">{t('news.title')}</h2>
          <Link to="/AutoNews" className="text-2xl lg:text-3xl font-bold text-slate-600 hover:text-slate-400 transition-colors">
            {totalCount > 0 ? totalCount.toLocaleString('ru-RU') : ''}
          </Link>
        </div>

        {isLoading ? (
          <NewsGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
            {articles.map((article, index) => (
              <Link key={article.id} to={`/ArticleDetail?id=${article.id}`} className="group block">
                {/* Image */}
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-800 mb-3">
                  {article.cover_image ? (
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                      {article.published_at && (
                        <span className="text-white font-bold text-4xl opacity-80">
                          {format(new Date(article.published_at), 'dd.MM', { locale: dateLocale })}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors leading-snug mb-2 line-clamp-2">
                  {getTitle(article)}
                </h3>

                {/* Meta */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  {article.published_at && (
                    <span>{format(new Date(article.published_at), 'd MMM yyyy', { locale: dateLocale })}</span>
                  )}
                  <span className="text-slate-600">•</span>
                  <span>{t('news.label')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Show all link */}
        {articles.length > 0 && (
          <div className="mt-8 text-center">
            <Link to="/AutoNews" className="text-sm text-white hover:underline font-medium">
              {t('news.see_all')}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}