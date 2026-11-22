import React, { useState } from 'react';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import WorkingHoursDisplay from '@/components/dealer/WorkingHoursDisplay';
import { translateLocation } from '@/utils/locationUtils';

export default function DealerProfileContacts({ dealer }) {
  const { t } = useTranslation();
  const [showPhone, setShowPhone] = useState(false);
  const fullAddress = [dealer.address, dealer.city, dealer.country].filter(Boolean).join(', ');
  const region = translateLocation(t, dealer.city, dealer.country);
  const hasMap = !!(dealer.address || dealer.city);
  const websiteHref = dealer.website ? (dealer.website.startsWith('http') ? dealer.website : `https://${dealer.website}`) : '';
  if (!hasMap && !dealer.phone && !dealer.working_hours && !dealer.email && !dealer.website) return null;
  return (
    <section className={`overflow-hidden rounded-2xl border border-border bg-card ${hasMap ? 'grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]' : ''}`}>
      <div className="min-w-0 space-y-3 p-3 sm:p-4">
        <h2 className="text-sm font-semibold text-foreground">{t('dealerProfile.contacts')}</h2>
        {region && <div className="flex gap-2 text-sm leading-relaxed"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><p className="min-w-0 break-words font-medium text-foreground">{region}</p></div>}
        {dealer.website && <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"><Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 break-all">{dealer.website.replace(/^https?:\/\//, '')}</span></a>}
        {dealer.email && <a href={`mailto:${dealer.email}`} className="flex items-start gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 break-all">{dealer.email}</span></a>}
        {dealer.phone && (showPhone ? <Button asChild variant="outline" className="min-h-11 w-full rounded-xl sm:w-auto"><a href={`tel:${dealer.phone.replace(/[^\d+]/g, '')}`}><Phone className="mr-2 h-4 w-4 shrink-0" /><span dir="ltr">{dealer.phone}</span></a></Button> : <Button onClick={() => setShowPhone(true)} className="min-h-11 w-full gap-2 rounded-xl sm:w-auto"><Phone className="h-4 w-4 shrink-0" />{t('dealer.show_phone')}</Button>)}
        {dealer.working_hours && <div className="border-t border-border pt-3"><WorkingHoursDisplay value={typeof dealer.working_hours === 'string' ? dealer.working_hours : JSON.stringify(dealer.working_hours)} /></div>}
      </div>
      {hasMap && (
        <div className="flex min-w-0 flex-col border-t border-border md:border-l md:border-t-0">
          <div className="flex items-start gap-2 border-b border-border bg-background px-3 py-2.5 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 break-words text-foreground">{fullAddress}</span>
          </div>
          <iframe title={t('dealerProfile.map_title', { name: dealer.name })} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed&z=15`} className="block h-40 w-full flex-1 border-0 md:h-full md:min-h-44" />
        </div>
      )}
    </section>
  );
}