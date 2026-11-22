import React from 'react';
import { TextField, SelectField, Field } from '@/components/listings/create/fields';
import CityAutocomplete from '@/components/listings/CityAutocomplete';
import { translateCountry } from '@/utils/locationUtils';

const COUNTRIES = ['Estonia', 'Latvia', 'Lithuania'];

export default function ListingContactSection({ form, updateForm, dealerId, t }) {
  const options = COUNTRIES.map(c => ({ value: c, label: t('listing.country_' + c.toLowerCase(), c) }));
  if (form.country && !COUNTRIES.includes(form.country)) {
    options.push({ value: form.country, label: translateCountry(null, form.country) });
  }

  return <div className="lc-fields">
    <SelectField
      label={t('listing.wizard_country')}
      value={form.country}
      onChange={v => { updateForm('country', v); updateForm('location', ''); }}
      placeholder={t('listing.select_country', 'Выберите страну')}
      options={options}
    />
    <Field label={t('listing.wizard_location')}>
      <CityAutocomplete
        value={form.location}
        country={form.country}
        onChange={v => updateForm('location', v)}
        placeholder={t('listing.city_placeholder')}
        className="lc-city-input"
      />
    </Field>
    <TextField label={t('listing.wizard_phone')} type="tel" value={form.seller_phone} onChange={v => updateForm('seller_phone', v)} />
  </div>;
}