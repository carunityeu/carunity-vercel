import React from 'react';
import { Check } from 'lucide-react';

export default function ListingPlanOption({ active, onClick, title, description, features = [], children, className = '' }) {
  const Tag = onClick ? 'button' : 'div';
  return <Tag className={`lc-plan ${active ? 'lc-plan-selected' : ''} ${className}`} {...(onClick ? { type: 'button', onClick, 'aria-pressed': active } : {})}>
    <span className={`lc-radio ${active ? 'is-on' : ''}`} aria-hidden="true" />
    <div>
      <p className="lc-plan-title">{title}</p>
      <p className="lc-plan-desc">{description}</p>
      {features.length > 0 && <div className="lc-plan-features">{features.map(text => <div className="lc-plan-feature" key={text}><Check /><span>{text}</span></div>)}</div>}
      {children}
    </div>
  </Tag>;
}