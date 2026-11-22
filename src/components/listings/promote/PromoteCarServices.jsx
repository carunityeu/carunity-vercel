import React from 'react';
import { Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PromotionBoostOptions from '@/components/listings/promote/PromotionBoostOptions';
import PromotionMetaOptions from '@/components/listings/promote/PromotionMetaOptions';
import usePromotionCopy from '@/components/listings/promote/usePromotionCopy';
export default function PromoteCarServices({ car, value, onChange, onSkip }) {
 const copy = usePromotionCopy();
 const { t } = useTranslation();
 return <>
  <div className="promo-car-heading">
   <span className="promo-thumb">{car.images?.[0] ? <img src={car.images[0]} alt="" /> : <Car size={25} strokeWidth={1.4} />}</span>
   <div><span className="promo-eyebrow">{copy('forCar')}</span><h3>{car.brand} {car.model}</h3><p>{[car.year, car.engine_volume && `${Number(car.engine_volume).toFixed(1)}${car.trim_level ? ` ${car.trim_level}` : ''}`, car.mileage != null && `${car.mileage.toLocaleString()} ${t('car.km')}`].filter(Boolean).join(' · ')}</p></div>
   <button className="promo-skip" onClick={onSkip}>{copy('skip')}</button>
  </div>
  <div className="promo-services"><PromotionBoostOptions value={value} onChange={onChange} /><PromotionMetaOptions value={value} onChange={onChange} /></div>
 </>;
}