import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { translateCity, translateAddressText } from '@/utils/locationUtils';
import { translateCountry } from '@/utils/locationUtils';
import { parseHours, groupHours, DAY_KEYS } from '@/lib/workingHoursSummary';
import SellerMap from '@/components/car-details/SellerMap';
import DealerProfileEmployees from '@/components/dealer/DealerProfileEmployees';

function HoursList({ value }) {
  const { t } = useTranslation();
  const hours = parseHours(value);
  if (!hours) return null;
  const day = (i) => t('carPage.day_' + DAY_KEYS[i]);
  return (
    <div>
      <p className="text-sm font-bold text-white">{t('carPage.business_hours')}</p>
      {groupHours(hours).map((g) => (
        <p key={g.from} className="text-sm text-slate-300">
          {g.from === g.to ? day(g.from) : `${day(g.from)} - ${day(g.to)}`}{' '}
          {g.closed ? t('carPage.closed') : `${g.open} h - ${g.close} h`}
        </p>
      ))}
    </div>
  );
}

// Seller block: logo, name, address, phone, business hours and the map
export default function SellerSection({ car, dealer }) {
  const { t } = useTranslation();
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const isDealer = car.seller_type === 'dealer' && !!dealer;
  const cityLine = isDealer
    ? [translateCity(t, dealer.city) || dealer.city, dealer.country && translateCountry(t, dealer.country)].filter(Boolean).join(', ')
    : [translateCity(t, car.location) || car.location, car.country && translateCountry(t, car.country)].filter(Boolean).join(', ');
  const mapQuery = isDealer
    ? [dealer.address, dealer.city, dealer.country].filter(Boolean).join(', ')
    : [car.location, car.country].filter(Boolean).join(', ');
  const phone = isDealer ? dealer.phone : car.seller_phone;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 md:p-7">
      <h2 className="mb-6 text-xl font-semibold text-foreground sm:mb-7">{t('carPage.seller')}</h2>
      <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="min-w-0">
          <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden bg-white sm:h-24 sm:w-24">
            {isDealer && dealer.logo ? (
              <img src={dealer.logo} alt={dealer.name} className="h-full w-full object-contain p-1" />
            ) : isDealer ? <Building2 className="h-7 w-7 text-slate-400" /> : <User className="h-7 w-7 text-slate-400" />}
          </div>
          <p className="text-sm font-bold text-white">{isDealer ? dealer.name : t('car.private_label', 'Частный продавец')}</p>
          {isDealer && dealer.address && <p className="text-sm text-slate-300">{translateAddressText(t, dealer.address)}</p>}
          {cityLine && <p className="text-sm text-slate-300">{cityLine}</p>}
        </div>

        <div className="space-y-3 sm:text-right">
          {phone && (
            <div>
              <p className="text-sm font-bold text-white">{t('carPage.phone')}</p>
              {isDealer || phoneRevealed ? (
                <a href={`tel:${phone}`} className="text-sm text-slate-300 hover:text-emerald-400">{phone}</a>
              ) : (
                <button type="button" onClick={() => setPhoneRevealed(true)} className="text-sm text-emerald-400 hover:underline">
                  {t('car.show_phone', 'Показать номер')}
                </button>
              )}
            </div>
          )}
          {isDealer && dealer.website && (
            <div>
              <p className="text-sm font-bold text-foreground">{t('dealerProfile.website')}</p>
              <a href={/^https?:\/\//i.test(dealer.website) ? dealer.website : `https://${dealer.website}`} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-foreground hover:text-primary">
                {dealer.website.replace(/^https?:\/\//i, '').replace(/\/$/, '')}
              </a>
            </div>
          )}
          {isDealer && <HoursList value={dealer.working_hours} />}
        </div>
      </div>
      <SellerMap query={mapQuery} />
      {isDealer && (
        <div className="mt-6 flex flex-wrap items-end gap-5 sm:mt-8">
          <DealerProfileEmployees dealer={dealer} embedded />
          <Link to={createPageUrl('DealerProfile') + `?id=${dealer.id}`} className="block w-full shrink-0 sm:ml-auto sm:w-auto">
            <Button className="h-10 w-full rounded-xl border-0 bg-slate-800 px-5 text-sm font-medium text-foreground hover:bg-slate-700 sm:w-auto">
              {t('carPage.visit_dealer_page')}
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}