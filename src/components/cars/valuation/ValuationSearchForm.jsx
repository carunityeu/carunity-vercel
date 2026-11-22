import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function ValuationSearchForm({ plate, vin, status, onPlateChange, onVinChange, onKeyDown, onSearch }) {
  const { t } = useTranslation();
  const id = useId();
  return (
    <div>
      <p className="subtitle">{t('valuation.subtitle')}</p>
      <div className="fields">
        <div className="field-card">
          <label className="label" htmlFor={`${id}-plate`}>{t('valuation.plate_label')}</label>
          <input className="field" id={`${id}-plate`} type="text" value={plate}
            onChange={onPlateChange} onKeyDown={onKeyDown}
            placeholder={t('valuation.plate_placeholder')} maxLength={7} disabled={status === 'loading'} />
        </div>
        <div className="or-row">{t('valuation.or')}</div>
        <div className="field-card">
          <label className="label" htmlFor={`${id}-vin`}>{t('valuation.vin_label')}</label>
          <input className="field" id={`${id}-vin`} type="text" value={vin}
            onChange={onVinChange} onKeyDown={onKeyDown}
            placeholder={t('valuation.vin_placeholder')} maxLength={17} disabled={status === 'loading'} />
        </div>
      </div>
      <button className="submit" type="button" onClick={onSearch}
        disabled={status === 'loading' || (!plate.trim() && !vin.trim())}>
        {status === 'loading' ? <><Loader2 className="animate-spin" aria-hidden="true" />{t('valuation.searching')}</>
          : <>{t('valuation.search_btn')}<ArrowRight aria-hidden="true" strokeWidth={1.7} /></>}
      </button>
    </div>
  );
}