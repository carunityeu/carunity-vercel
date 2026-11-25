import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Newspaper } from 'lucide-react';
import { entities } from '@/api/entities';
import { Container } from '@/components/ds';

// Home news block laid out like a magazine: one lead story (photo half, big title, teaser)
// and four smaller stories in a 2×2 list (thumbnail + title).
const localized = (article, field, lang) => article[`${field}_${lang}`] || article[field] || '';
const teaser = (text, max = 180) => {
  const plain = String(text).replace(/<[^>]+>/g, ' ').replace(/[#*_>`[\]]/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > max ? `${plain.slice(0, max).replace(/\s+\S*$/, '')}…` : plain;
};
const articleUrl = (a) => `/ArticleDetail?id=${a.id}`;

function Cover({ article, className }) {
  return article.cover_image
    ? <img src={article.cover_image} alt="" loading="lazy" className={`h-full w-full object-cover ${className || ''}`} />
    : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/40 to-raised"><Newspaper className="h-8 w-8 text-ink-2" /></div>;
}

function Meta({ article }) {
  const label = article.car_tags?.[0] || article.source_name;
  return label ? <p className="truncate text-xs font-medium text-ink-3">{label}</p> : null;
}

export default function MagazineSection() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'ru').slice(0, 2);
  const date = (a) => (a.published_at ? new Date(a.published_at).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['homeMagazine'],
    queryFn: () => entities.Article.filter({ is_published: true }, '-published_at', 5),
    staleTime: 10 * 60 * 1000,
  });
  if (isLoading || !articles.length) return null;
  const [lead, ...rest] = articles;

  return (
    <Container as="section" className="py-6 sm:py-8" aria-labelledby="magazine-title">
      {/* Straight on the page: no panel, no divider */}
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 id="magazine-title" className="text-xl font-bold text-ink sm:text-2xl">{t('news.magazine_title', 'Журнал CarUnity')}</h2>
        <Link to="/AutoNews" className="flex flex-shrink-0 items-center gap-0.5 text-sm font-medium text-brand-text">
          {t('news.see_all')}<ChevronRight className="h-4 w-4" />
        </Link>
      </div>
        {/* Lead story */}
        <Link to={articleUrl(lead)} className="group grid gap-4 md:grid-cols-2 md:gap-6">
          <div className="aspect-video overflow-hidden rounded-xl bg-raised"><Cover article={lead} /></div>
          <div className="flex min-w-0 flex-col justify-center gap-2">
            <Meta article={lead} />
            <h3 className="text-xl font-bold leading-tight text-ink sm:text-2xl lg:text-3xl">
              {localized(lead, 'title', lang)}
            </h3>
            <p className="line-clamp-3 text-sm leading-relaxed text-ink-2 sm:text-base">{teaser(localized(lead, 'content', lang))}</p>
            <p className="text-xs text-ink-3">{date(lead)}</p>
          </div>
        </Link>

        {/* Four more */}
        {rest.length > 0 && (
          <div className="mt-6 grid gap-x-6 gap-y-4 md:grid-cols-2">
            {rest.map((a) => (
              <Link key={a.id} to={articleUrl(a)} className="group flex gap-3">
                <div className="aspect-video w-32 flex-shrink-0 overflow-hidden rounded-lg bg-raised sm:w-40"><Cover article={a} /></div>
                <div className="flex min-w-0 flex-col gap-1">
                  <Meta article={a} />
                  <h4 className="line-clamp-2 text-sm font-bold leading-snug text-ink sm:text-base">
                    {localized(a, 'title', lang)}
                  </h4>
                  <p className="text-xs text-ink-3">{date(a)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
    </Container>
  );
}
