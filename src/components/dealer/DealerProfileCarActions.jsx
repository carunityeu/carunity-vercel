import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { useAuth } from '@/lib/AuthContext';
import { redirectToAccount } from '@/components/auth/requireAccount';

export default function DealerProfileCarActions({ car, dealer }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [showPhone, setShowPhone] = useState(false);
  const phone = car.seller_phone || car.phone || dealer.phone;
  const href = getCarDetailsPath(car);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {phone && (showPhone ? <Button asChild size="sm" className="min-h-11 gap-1.5 rounded-xl"><a href={`tel:${phone.replace(/[^\d+]/g, '')}`}><Phone className="h-4 w-4 shrink-0" /><span dir="ltr">{phone}</span></a></Button> : <Button size="sm" onClick={() => setShowPhone(true)} className="min-h-11 gap-1.5 rounded-xl"><Phone className="h-4 w-4 shrink-0" />{t('dealer.show_phone')}</Button>)}
      <Button asChild variant="outline" size="icon" className="h-11 w-11 rounded-xl"><Link to={`${href}${href.includes('?') ? '&' : '?'}contact=1`} onClick={(e) => { if (!isAuthenticated) { e.preventDefault(); redirectToAccount(`${href}${href.includes('?') ? '&' : '?'}contact=1`); } }} aria-label={t('car.write_seller')}><MessageSquare className="h-4 w-4" /></Link></Button>
      <Button asChild variant="ghost" size="icon" className="ml-auto h-11 w-11 rounded-xl"><Link to={href} aria-label={t('dealerProfile.listing_details')}><MoreHorizontal className="h-5 w-5" /></Link></Button>
    </div>
  );
}