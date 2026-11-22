import React from 'react';
import { EMISSION_CLASSES } from './constants';
import { SelectField, TextField, Field } from './fields';
import { Check } from 'lucide-react';

export default function StepEcology({ form, updateForm, t }) {
  return (
    <div className="lc-ecology">
      <div className="lc-eco-top">
        <SelectField label={t('listing.cr_emission_class')} placeholder={t('listing.cr_select')} value={form.emission_class} onChange={v => updateForm('emission_class', v)} options={EMISSION_CLASSES.map(e => ({ value: e, label: e }))} />
        <TextField label={t('listing.cr_co2')} type="number" suffix="g/km" value={form.co2_emissions} onChange={v => updateForm('co2_emissions', v)} />
        <Field label={t('listing.cr_add_equipment')} className="lc-eco-equipment">
          <div className="lc-eco-toggles">
            {[['particulate_filter', 'cr_particle_filter'], ['auto_start_stop', 'cr_start_stop']].map(([field, key]) => <button type="button" key={field} className="lc-toggle" aria-pressed={!!form[field]} onClick={() => updateForm(field, !form[field])}>
              <span>{t('listing.' + key)}</span><span className="lc-check-box">{form[field] && <Check />}</span>
            </button>)}
          </div>
        </Field>
      </div>
      <div className="lc-consumption">
        <TextField label={t('listing.cr_fc_urban')} type="number" step="0.1" suffix="l/100km" value={form.fuel_consumption_city} onChange={v => updateForm('fuel_consumption_city', v)} />
        <TextField label={t('listing.cr_fc_highway')} type="number" step="0.1" suffix="l/100km" value={form.fuel_consumption_highway} onChange={v => updateForm('fuel_consumption_highway', v)} />
        <TextField label={t('listing.cr_fc_combined')} type="number" step="0.1" suffix="l/100km" value={form.fuel_consumption_combined} onChange={v => updateForm('fuel_consumption_combined', v)} />
      </div>
      {form.fuel_type === 'electric' && (
        <TextField label={t('car.energy_consumption', 'Energy consumption (kWh/100km)')} type="number" step="0.1" suffix="kWh/100km" value={form.energy_consumption} onChange={v => updateForm('energy_consumption', v)} />
      )}
    </div>
  );
}