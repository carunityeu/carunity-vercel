import React from 'react';
export default function CountryPriceScale({ prices, price, format, labels }) {
  const sorted = [...prices].sort((a, b) => a.price - b.price);
  const min = sorted[0].price, span = sorted[2].price - min || 1;
  const position = value => 16 + (value - min) / span * 68;
  return <div className="country-scale">
    <div className="country-scale-line" />
    {sorted.map(p => <div key={p.code} className="country-scale-pin" style={{ left: `${position(p.price)}%` }}>
      <span title={p.name} className={`country-flag country-flag-${p.code}`} /><span className="country-pin-stem" /><span className="country-pin-dot" />
    </div>)}
    <div className="country-car-marker" style={{ left: `${position(price)}%` }}><span className="country-diamond" /><strong>{labels[10]} · {format(price)}</strong></div>
    <div className="country-scale-captions"><span>{labels[8]}</span><span>{labels[9]}</span></div>
  </div>;
}