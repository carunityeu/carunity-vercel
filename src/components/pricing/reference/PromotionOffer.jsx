import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
const images = {
 boost: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/d80d39e5d_promo-boost.png',
 top: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/478c1270b_promo-topspot.png'
};
export default function PromotionOffer({ top = false, dealer = false }) {
  const { t } = useTranslation();
  const name = top ? 'Top Spot' : 'Boost';
  const offers = [[1,1.99],[3,4.99],[7,9.99],[14,17.99],[30,29.99]];
  const href = dealer ? '/DealerDashboard?tab=cars' : '/Dashboard?tab=listings';
  return <article className={`pr-promotion ${top ? 'pr-reverse' : ''}`}>
    <div className="pr-monitor"><img src={images[top ? 'top' : 'boost']} alt={name} loading="lazy" /></div>
    <div className="pr-promotion-copy"><span className="pr-purple-note">{t(top ? 'priceRef.topBadge' : 'priceRef.boostBadge')}</span>
      <div className="pr-offer-heading"><h3>{name}</h3><div>{!top && <small>{t('pricing.from_word')} </small>}<strong>{top ? '59.99€' : '1.99€'}</strong>{top && <small> / {t('priceRef.period')}<br />8.57€ / {t('pricing.day_one')}</small>}</div></div>
      <p className="pr-offer-text">{t(top ? 'priceRef.topText' : 'priceRef.boostText')}</p>
      {top ? <><ul className="pr-checks">{t('priceRef.topFeatures',{returnObjects:true}).map(text => <li key={text}>{text}</li>)}</ul><span className="pr-limited">{t('priceRef.limited')}</span></> : <div className="pr-boost-options">{offers.map(([days,price]) => <Link to={href} key={days} className={days === 7 ? 'pr-selected' : ''}><span>{days} {t(days === 1 ? 'pricing.day_one' : days === 3 ? 'pricing.day_few' : 'pricing.day_many')}</span><small>{price.toFixed(2)}€</small></Link>)}</div>}
      <p className="pr-how"><strong>{t('priceRef.how')}</strong> {t(dealer ? 'priceRef.pathDealer' : 'priceRef.path')} <Link to={href}>{name}</Link></p>
    </div>
  </article>;
}