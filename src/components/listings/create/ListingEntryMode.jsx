import React from 'react';

export default function ListingEntryMode({ value, onChange, t }) {
  return <div className="lc-intro">
    <h2>{t('listing.how_to_fill')}</h2>
    <div className="lc-fill-modes">
      <button type="button" aria-pressed={value === 'manual'} onClick={() => onChange('manual')}>{t('listing.enter_manually')}</button>
      <button type="button" disabled>{t('listing.use_reg_mark')}</button>
    </div>
  </div>;
}