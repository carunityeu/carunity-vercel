import React from 'react';
import { useTranslation } from 'react-i18next';
import '@/components/pricing/reference/pricingReference.css';

const FORMATS = [
  { id: 'between', price: 49, from: false, limited: false, image: 'https://base44.app/api/apps/6973f00466c3a37f3d8e7e53/files/mp/public/6973f00466c3a37f3d8e7e53/df6f1bfd8_infeedbanner.png' },
  { id: 'afterlisting', price: 99, from: false, limited: false, image: 'https://base44.app/api/apps/6973f00466c3a37f3d8e7e53/files/mp/public/6973f00466c3a37f3d8e7e53/bbb12a6c8_listingspotlight.png' },
  { id: 'hero', price: 119, from: false, limited: true, image: 'https://base44.app/api/apps/6973f00466c3a37f3d8e7e53/files/mp/public/6973f00466c3a37f3d8e7e53/588734f38_homepageherobanner.png' },
];

export default function AdvertisingFormats() {
  const { t } = useTranslation();
  return (
    <div className="pr-promotion-list">
      {FORMATS.map(({ id, price, from, limited, image }, index) => (
        <article key={id} className={`pr-promotion ${index % 2 === 1 ? 'pr-reverse' : ''}`}>
          <div className="pr-monitor">
            <img
              src={image}
              alt={t(`advertising.plan_${id}_title`)}
              loading="lazy"
              className="aspect-[16/10] w-full bg-[#16181c] object-contain"
            />
          </div>
          <div className="pr-promotion-copy">
            {limited && <span className="pr-purple-note">{t('advertising.limited_spots')}</span>}
            <div className="pr-offer-heading">
              <h3>{t(`advertising.plan_${id}_title`)}</h3>
              <div>
                {from && <small>{t('advertising.from')} </small>}
                <strong>{price}€</strong>
                <small> / {t('advertising.period_30')}</small>
              </div>
            </div>
            <p className="pr-offer-text">{t(`advertising.plan_${id}_subtitle`)}</p>
            <ul className="pr-checks">
              {[1, 2, 3].map(n => <li key={n}>{t(`advertising.plan_${id}_f${n}`)}</li>)}
            </ul>
            <p className="pr-how"><strong>{t('advertising.for_whom')}</strong>{t(`advertising.plan_${id}_for`)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}