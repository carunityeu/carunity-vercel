import React from 'react';
import { TextField } from './fields';
import ListingEquipment from '@/components/listings/create/ListingEquipment';

// [field, labelKey, suffix, type]
const SPEC_FIELDS = [
  ['length_mm', 'cr_length', 'mm'], ['width_mm', 'cr_width', 'mm'], ['height_mm', 'cr_height', 'mm'], ['wheelbase_mm', 'cr_wheelbase', 'mm'],
  ['clearance_mm', 'cr_clearance', 'mm'], ['weight_empty_kg', 'cr_curb_weight', 'kg'], ['weight_max_kg', 'cr_max_weight', 'kg'], ['trunk_volume', 'cr_trunk', 'l'],
  ['transmission_type', 'cr_transmission', '', 'text'], ['engine_code', 'cr_engine_code', '', 'text'], ['fuel_system', 'cr_fuel_system', '', 'text'], ['max_speed_kmh', 'cr_top_speed', 'km/h'],
  ['acceleration_0_100', 'cr_accel', 's'], ['doors', 'cr_doors', ''], ['seats', 'cr_seats', ''],
];

export default function StepAdditional({ form, updateForm, t, showEquipment = true }) {

  return (
    <div>
      <div className="lc-specs">
        {SPEC_FIELDS.map(([field, key, suffix, type]) => (
          <TextField key={field} label={t('listing.' + key)} placeholder={field === 'transmission_type' ? t('listing.cr_type') : undefined} type={type || 'number'} step={field === 'acceleration_0_100' ? '0.1' : undefined} suffix={suffix} value={form[field]} onChange={v => updateForm(field, v)} />
        ))}
      </div>

      {showEquipment && <ListingEquipment form={form} updateForm={updateForm} t={t} />}
    </div>
  );
}