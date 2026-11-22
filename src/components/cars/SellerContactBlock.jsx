import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2, User, Phone, Mail, MapPin,
  MessageSquare, CheckCircle, ExternalLink
} from 'lucide-react';
import { translateCity, translateAddressText, translateRole } from '@/utils/locationUtils';

export default function SellerContactBlock({ car, dealer, user, onWriteSeller }) {
  const { t } = useTranslation();
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);

  const isDealer = car.seller_type === 'dealer' && dealer;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 md:px-6 pt-5 md:pt-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          {t('car.seller_contact_title', 'Контактные данные продавца')}
        </h3>
      </div>

      <div className="p-5 md:p-6 space-y-5">
        {isDealer ? (
          <>
            {/* Top row: logo/name + write button */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Left: logo + name + "other listings" link inline */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {dealer.logo ? (
                    <img src={dealer.logo} alt={dealer.name} className="h-10 object-contain flex-shrink-0" />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">{dealer.name}</p>
                    {dealer.is_verified && (
                      <Badge className="mt-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 gap-1 w-fit text-[10px] px-1.5 py-0">
                        <CheckCircle className="w-2.5 h-2.5" />
                        {t('car.verified')}
                      </Badge>
                    )}
                  </div>
                  {/* Other listings button — right of logo */}
                  <Link to={createPageUrl('DealerProfile') + `?id=${dealer.id}`} className="ml-auto flex-shrink-0">
                    <Button variant="outline" className="h-11 gap-2 px-4 text-sm whitespace-nowrap">
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden xs:inline">{t('car.seller_other_listings', 'Посмотреть другие объявления')}</span>
                      <span className="xs:hidden">{t('car.seller_all_listings', 'Все объявления')}</span>
                    </Button>
                  </Link>
                </div>

                {/* Info rows */}
                <div className="space-y-1.5 text-sm mt-1">
                  {dealer.address && (
                    <div className="flex gap-2">
                      <span className="text-slate-500 dark:text-slate-400 min-w-[80px] shrink-0">{t('car.seller_address', 'Адрес')}:</span>
                      <span className="text-slate-800 dark:text-slate-200">{translateAddressText(t, dealer.address)}</span>
                    </div>
                  )}
                  {dealer.city && (!dealer.address || !dealer.address.toLowerCase().includes(dealer.city.toLowerCase())) && (
                    <div className="flex gap-2">
                      <span className="text-slate-500 dark:text-slate-400 min-w-[80px] shrink-0">{t('car.seller_city', 'Город')}:</span>
                      <span className="text-slate-800 dark:text-slate-200">{translateCity(t, dealer.city) || dealer.city}</span>
                    </div>
                  )}

                  {dealer.phone && (
                    <div className="flex gap-2 items-center">
                      <span className="text-slate-500 dark:text-slate-400 min-w-[80px] shrink-0">{t('car.seller_phone', 'Телефон')}:</span>
                      {phoneRevealed ? (
                        <a href={`tel:${dealer.phone}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">{dealer.phone}</a>
                      ) : (
                        <button onClick={() => setPhoneRevealed(true)} className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm">
                          {t('car.show_phone', 'Показать номер')}
                        </button>
                      )}
                    </div>
                  )}

                  {dealer.email && (
                    <div className="flex gap-2 items-center">
                      <span className="text-slate-500 dark:text-slate-400 min-w-[80px] shrink-0">{t('car.seller_email', 'Эл. почта')}:</span>
                      {emailRevealed ? (
                        <a href={`mailto:${dealer.email}`} className="text-emerald-600 dark:text-emerald-400 hover:underline truncate">{dealer.email}</a>
                      ) : (
                        <button onClick={() => setEmailRevealed(true)} className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm">
                          {t('car.show_email', 'Показать эл. почту')}
                        </button>
                      )}
                    </div>
                  )}

                  {dealer.website && (
                    <div className="flex gap-2">
                      <span className="text-slate-500 dark:text-slate-400 min-w-[80px] shrink-0">{t('car.seller_website', 'Веб-сайт')}:</span>
                      <a
                        href={dealer.website.startsWith('http') ? dealer.website : `https://${dealer.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline truncate"
                      >
                        {dealer.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: write seller button */}
              <div className="sm:w-48 flex-shrink-0">
                <Button
                  className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white h-11"
                  onClick={onWriteSeller}
                >
                  <Mail className="w-4 h-4" />
                  {t('car.write_seller')}
                </Button>
              </div>
            </div>

            {/* Contact person card — full width, below main row */}
            {dealer.contact_person && (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {dealer.contact_person_photo ? (
                    <img src={dealer.contact_person_photo} alt={dealer.contact_person} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                {/* Name + role — left */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <p className="font-bold text-slate-900 dark:text-white text-base leading-tight">{dealer.contact_person}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {translateRole(t, dealer.contact_person_role) || t('car.seller_consultant', 'Консультант')}
                  </p>
                </div>

                {/* Phone + Email — right side, stacked rows */}
                <div className="flex flex-col gap-2 flex-shrink-0 sm:mr-16">
                  {(dealer.contact_person_phone || dealer.phone) && (
                    <a
                      href={`tel:${dealer.contact_person_phone || dealer.phone}`}
                      className="flex items-center gap-2.5 hover:text-emerald-600 dark:hover:text-emerald-400 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-base font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 whitespace-nowrap">
                        {dealer.contact_person_phone || dealer.phone}
                      </span>
                    </a>
                  )}
                  {(dealer.contact_person_email || dealer.email) && (
                    <a
                      href={`mailto:${dealer.contact_person_email || dealer.email}`}
                      className="flex items-center gap-2.5 hover:text-emerald-600 dark:hover:text-emerald-400 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline whitespace-nowrap">
                        {dealer.contact_person_email || dealer.email}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Private seller */
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {t('car.private_label', 'Частный продавец')}
                </p>
                {car.location && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {translateCity(t, car.location) || car.location}
                  </p>
                )}
              </div>
            </div>

            {car.seller_phone && (
              phoneRevealed ? (
                <a
                  href={`tel:${car.seller_phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-100 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {car.seller_phone}
                </a>
              ) : (
                <button
                  onClick={() => setPhoneRevealed(true)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {t('car.show_phone', 'Показать номер')}
                </button>
              )
            )}

            <Button
              className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 h-11"
              onClick={onWriteSeller}
              disabled={!!(user && car && user.email === car.created_by)}
            >
              <MessageSquare className="w-4 h-4" />
              {t('car.write_seller')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}