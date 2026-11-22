import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru, enUS, et, lv, lt } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import AdBanner from '@/components/ads/AdBanner';

function renderBlocks(content) {
  let blocks;
  try {
    blocks = JSON.parse(content);
    if (!Array.isArray(blocks)) throw new Error();
  } catch {
    return (
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-base">
        {content}
      </p>
    );
  }

  return blocks.map((block, idx) => {
    if (block.type === 'image') {
      return (
        <figure key={idx} className="my-6">
          <img src={block.url} alt={block.caption || ''} className="w-full rounded-xl object-cover max-h-[500px]" />
          {block.caption && (
            <figcaption className="text-sm text-slate-400 mt-2 text-center">{block.caption}</figcaption>
          )}
        </figure>
      );
    }
    return (
      <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-base mb-4">
        {block.value}
      </p>
    );
  });
}

export default function ArticleDetail() {
  const { i18n, t } = useTranslation();
  const lang = i18n.language?.slice(0, 2);
  const dateLocale = ({ ru, en: enUS, et, lv, lt }[lang]) || enUS;
  const navigate = useNavigate();
  const location = useLocation();

  const articleId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [articleId]);

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => base44.entities.Article.filter({ id: articleId }),
    enabled: !!articleId,
    select: (data) => data[0]
  });

  const { data: relatedCars = [] } = useQuery({
    queryKey: ['articleRelatedCars', articleId],
    queryFn: async () => {
      if (!article?.car_tags?.length) return [];
      const tag = article.car_tags[0];
      const parts = tag.split(' ');
      const brand = parts[0];
      const model = parts.slice(1).join(' ');
      const cars = await base44.entities.Car.filter({ status: 'active', brand }, '-created_date', 6);
      if (model) return cars.filter(c => c.model?.toLowerCase().includes(model.toLowerCase())).slice(0, 6);
      return cars.slice(0, 6);
    },
    enabled: !!article?.car_tags?.length
  });

  const { data: moreArticles = [] } = useQuery({
    queryKey: ['moreArticles', articleId],
    queryFn: () => base44.entities.Article.filter({ is_published: true }, '-published_at', 6),
    select: (data) => data.filter(a => a.id !== articleId).slice(0, 3),
    enabled: !!articleId
  });

  if (isLoading || !articleId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">{t('news.article_not_found')}</p>
        <Link to="/AutoNews" className="text-emerald-600 hover:underline">← {t('news.back_to_news')}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-white mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('news.title', 'Новости')}
        </button>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
          {(lang === 'ru' && article.title_ru) ? article.title_ru
            : (lang === 'et' && article.title_et) ? article.title_et
            : (lang === 'lv' && article.title_lv) ? article.title_lv
            : (lang === 'lt' && article.title_lt) ? article.title_lt
            : article.title}
        </h1>

        {/* Subtitle */}
        {article.subtitle && (
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4 leading-snug">{article.subtitle}</p>
        )}



        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-slate-400 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <span className="text-emerald-500 font-medium">{t('news.label')}</span>
          {article.published_at && (
            <span>{format(new Date(article.published_at), 'H:mm · d MMM yyyy', { locale: dateLocale })}</span>
          )}
        </div>

        {/* AD — под мета-строкой, перед обложкой */}
        <AdBanner size="leaderboard" slot="article-top" className="mb-6" />

        {/* Cover image */}
        {article.cover_image && (
          <div className="mb-6 rounded-2xl overflow-hidden">
            <img src={article.cover_image} alt={article.title} className="w-full max-h-[480px] object-cover" />
          </div>
        )}

        {/* Article content blocks */}
        <div className="mb-8">
          {lang === 'ru' && article.content_ru
            ? <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-base">{article.content_ru}</p>
            : lang === 'et' && article.content_et
            ? <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-base">{article.content_et}</p>
            : lang === 'lv' && article.content_lv
            ? <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-base">{article.content_lv}</p>
            : lang === 'lt' && article.content_lt
            ? <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-base">{article.content_lt}</p>
            : renderBlocks(article.content)
          }
        </div>

        {/* Related cars */}
        {relatedCars.length > 0 && (
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {article.car_tags?.[0]} {t('news.for_sale')}
            </h2>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {relatedCars.slice(0, 3).map(car => (
                <Link key={car.id} to={getCarDetailsPath(car)} className="group block">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2">
                    {car.images?.[0] ? (
                      <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-2xl">🚗</div>
                    )}
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : lang).format(car.price)} €</p>
                  <p className="text-xs text-slate-500">{car.brand} {car.model} {car.year && `${car.year}–${new Date().getFullYear()}`}</p>
                  {car.mileage != null && <p className="text-xs text-slate-400">{car.year} / {new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : lang).format(car.mileage)} {t('car.km')}</p>}
                </Link>
              ))}
            </div>
            <Link to={`/Catalog${article.car_tags?.[0] ? `?brand=${article.car_tags[0].split(' ')[0]}` : ''}`}
              className="mt-4 block text-center py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              {t('news.all_listings')}
            </Link>
          </div>
        )}

        {/* AD — перед блоком "Читайте также" */}
        <AdBanner size="leaderboard" slot="article-bottom" className="mb-6" />

        {/* More articles */}
        {moreArticles.length > 0 && (
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">{t('news.read_also', 'Читайте также')}</h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {moreArticles.map(a => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/ArticleDetail?id=${a.id}`, { replace: true })}
                  className="group flex gap-4 py-4 w-full text-left"
                >
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {a.cover_image ? (
                      <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 line-clamp-2 leading-snug">
                      {(lang === 'ru' && a.title_ru) ? a.title_ru
                        : (lang === 'et' && a.title_et) ? a.title_et
                        : (lang === 'lv' && a.title_lv) ? a.title_lv
                        : (lang === 'lt' && a.title_lt) ? a.title_lt
                        : a.title}
                    </p>
                    {a.published_at && (
                      <p className="text-xs text-slate-400 mt-1">{format(new Date(a.published_at), 'd MMM', { locale: dateLocale })}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}