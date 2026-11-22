import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
export default function SocialAdPackages({ dealer }) {
  const { t } = useTranslation();
  const packages = [['Meta Boost','49.99',45,'6.40','7 000','18 000','150','400'],['Meta Premium','89.99',80,'11.40','10 000','20 000','260','700'],['Meta TOP','139.99',130,'18.50','15 000','35 000','430','1150']];
  return <><div className="pr-plan-grid">{packages.map(([name,price,budget,daily,v1,v2,c1,c2],i) => <article key={name} className={`pr-plan pr-meta ${i === 1 ? 'pr-popular' : ''}`}>
    {i === 1 && <span className="pr-popular-label">{t('priceRef.popular')}</span>}<h3>{name}</h3><p className="pr-price"><span className="pr-price-value">{price}€</span><small>/ {t('priceRef.period')}</small></p>
    <p className="pr-budget">{t('priceRef.budget')}: <strong>{budget}€</strong><span>{daily}€ / {t('pricing.day_one')}</span></p>
    <div className="pr-estimate"><p><span>{v1}</span><span className="pr-range-divider">–</span><span>{v2}</span></p><small>{t('priceRef.views')}</small></div>
    <div className="pr-estimate"><p><span>{c1}</span><span className="pr-range-divider">–</span><span>{c2}</span></p><small>{t('priceRef.clicks')}</small></div><div className="pr-meta-bar" />
    <ul className="pr-checks"><li>{t('priceRef.target')}</li>{dealer && <li>{t('priceRef.carLimits',{returnObjects:true})[0]}</li>}<li>{t('priceRef.audience')}</li><li>{t(i === 2 ? 'priceRef.topIncluded' : 'priceRef.boostIncluded')}</li></ul>
  </article>)}</div><p className="pr-disclaimer">{t('priceRef.estimate')}</p><p className="pr-how"><strong>{t('priceRef.how')}</strong> {t(dealer ? 'priceRef.pathDealer' : 'priceRef.path')} <Link to={dealer ? '/DealerDashboard?tab=cars' : '/Dashboard?tab=listings'}>{t('priceRef.social')}</Link></p></>;
}