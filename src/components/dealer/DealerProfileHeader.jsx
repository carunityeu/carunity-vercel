import React, { useState } from 'react';
import { BadgeCheck, MapPin, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateLocation } from '@/utils/locationUtils';

export default function DealerProfileHeader({ dealer, rating, reviewCount }) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const description = dealer[`description_${i18n.language?.slice(0, 2)}`] || dealer.description;
  const location = translateLocation(t, dealer.city, dealer.country);
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      {dealer.cover_image && <div className="h-28 overflow-hidden sm:h-36 lg:h-44"><img src={dealer.cover_image} alt={t('dealerProfile.cover_alt', { name: dealer.name })} style={{ objectPosition: dealer.cover_image_position || '50% 50%' }} className="h-full w-full object-cover" fetchPriority="high" /></div>}
      <div className="space-y-2 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-3">
          {dealer.logo && <div className={`relative z-10 flex h-24 w-24 shrink-0 self-start items-center justify-start sm:h-28 sm:w-28 ${dealer.cover_image ? '-mt-8 sm:-mt-10' : ''}`}><img src={dealer.logo} alt={dealer.name} className="h-full w-full object-contain object-left" /></div>}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h1 className="min-w-0 break-words text-xl font-bold leading-tight text-foreground sm:text-2xl">{dealer.name}</h1>
              {dealer.is_verified && <span title={t('dealerProfile.verified')} aria-label={t('dealerProfile.verified')} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary"><BadgeCheck className="h-5 w-5" strokeWidth={2} /></span>}
            </div>
            {location && <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span className="break-words">{location}</span></p>}
          </div>
          {rating && <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm"><Star className="h-4 w-4 fill-primary text-primary" /><span className="font-semibold text-foreground">{rating}</span><span className="text-muted-foreground">({reviewCount})</span></div>}
        </div>
        {description && <div className="text-sm leading-relaxed text-muted-foreground"><p className={expanded ? 'whitespace-pre-wrap break-words' : 'line-clamp-2 break-words'}>{description}</p>{description.length > 200 && <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="min-h-11 font-medium text-primary hover:underline">{t(expanded ? 'dealer.collapse' : 'dealer.read_more')}</button>}</div>}
      </div>
    </section>
  );
}