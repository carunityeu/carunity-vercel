import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
export default function PrivateListingPlan() {
  const { t } = useTranslation();
  const features = t('priceRef.placeFeatures', { returnObjects: true });
  return <div className="pr-standard">
    <div><h3>{t('priceRef.standard')}</h3><p className="pr-price"><span className="pr-price-value">4.99€</span><small>/ {t('priceRef.days30')}</small></p><Link className="pr-button" to="/CreateListing">{t('priceRef.post')}</Link></div>
    <div><p className="pr-small-label">{t('priceRef.included')}</p><ul className="pr-included">{features.map(text => <li key={text}>{text}</li>)}</ul></div>
  </div>;
}