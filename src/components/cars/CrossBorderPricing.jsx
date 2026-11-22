import React from 'react';
import { useTranslation } from 'react-i18next';
import CollapsibleCard from '@/components/car-details/CollapsibleCard';
import { Info } from 'lucide-react';
import CountryPriceScale from '@/components/cars/CountryPriceScale';
import countryPriceLabels from '@/lib/countryPriceLabels';
import '@/components/cars/countryPricing.css';

const COUNTRIES = [
  { code: 'EE', key: 'countries.ee', fallback: 'Эстония', bar: 'bg-indigo-700' },
  { code: 'LV', key: 'countries.lv', fallback: 'Латвия', bar: 'bg-red-700' },
  { code: 'LT', key: 'countries.lt', fallback: 'Литва', bar: 'bg-emerald-500' }
];

// Regional market coefficients relative to the listing price (listing is in Latvia)
const COEFFICIENTS = {
  economy: { LT: 0.95, EE: 1.03 },
  premium: { LT: 0.92, EE: 1.06 },
  suv: { LT: 0.94, EE: 1.07 },
  ev: { LT: 0.98, EE: 1.01 },
  old_diesel: { LT: 0.9, EE: 1.05 }
};

const getVehicleType = (car) => {
  if (car.fuel_type === 'electric') return 'ev';
  if (['SUV', 'suv', 'crossover'].includes(car.body_type)) return 'suv';
  if (car.fuel_type === 'diesel' && car.year && car.year < 2015) return 'old_diesel';
  if (['BMW', 'Mercedes', 'Audi', 'Porsche', 'Lexus', 'Tesla', 'Jaguar', 'Range Rover'].includes(car.brand)) return 'premium';
  return 'economy';
};

const formatPrice = (p) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);

// "Prices by country": one coloured bar per country, scaled to the highest price
export default function CrossBorderPricing({ car }) {
  const { t, i18n } = useTranslation();
  const l = countryPriceLabels(i18n.resolvedLanguage || i18n.language);
  const coeff = COEFFICIENTS[getVehicleType(car)];
  const price = Number(car.price) || 0;
  const prices = COUNTRIES.map(c => ({ ...c, name: t(c.key, c.fallback), price: c.code === 'LV' ? price : Math.round(price * coeff[c.code]) }));
  const average = prices.reduce((sum, p) => sum + p.price, 0) / 3;
  const difference = average ? (price / average - 1) * 100 : 0;
  const score = Math.round(Math.max(10, Math.min(99, 80 - difference * 10)));
  const format = value => `${new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 }).format(value)} €`;
  return (
    <div className="country-pricing">
      <CollapsibleCard title={<>{t('pricing.cross_border_title', 'Цены по странам')}<span className="country-market">{l[0]}</span></>}>
        <div className="country-verdict">
          <div className="country-score"><svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="25" strokeDasharray={`${score * 1.57} 157`} /></svg>{score}</div>
          <div><h3>{l[difference > 3 ? 3 : difference < -3 ? 2 : 1]}</h3><p>{l[4]} — <b>{format(average)}</b>. {l[difference >= 0 ? 5 : 6]} {l[7]} <b>{Math.abs(difference).toLocaleString(i18n.language, { maximumFractionDigits: 1 })}%</b>.</p></div>
        </div>
        <CountryPriceScale prices={prices} price={price} format={format} labels={l} />
        <div className="country-price-grid">{prices.map(p => {
          const delta = p.price - price;
          return <div key={p.code} className={`country-price-card country-price-card-${p.code}`}>
            <div className="country-price-heading"><span>{p.name}</span>{p.code === 'LV' ? <span className="country-seller">{l[11]}</span> : <span className="country-price-code">{p.code}</span>}</div>
            <strong className="country-price-value">{format(p.price)}</strong>
            <span className={`country-price-diff ${delta < 0 ? 'good' : delta > 0 ? 'costly' : ''}`}>{delta ? `${delta < 0 ? '↓' : '↑'} ${l[delta < 0 ? 12 : 13]} ${format(Math.abs(delta))}` : l[14]}</span>
          </div>;
        })}</div>
        <p className="country-price-note"><Info size={13} /><span>{l[15]}</span></p>
      </CollapsibleCard>
    </div>
  );
}