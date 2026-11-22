import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { BODY_VALUES, FUEL_VALUES, TRANSMISSION_VALUES, DRIVE_VALUES, EXTERIOR_COLORS } from './constants';
import { SelectField, TextField, Field, inputCls } from './fields';
import ListingColorInterior from '@/components/listings/create/ListingColorInterior';

export default function StepModelDetails({ form, updateForm, t, showAppearance = true }) {
  const powerUnit = form.powerUnit || 'kw';
  const colorLabel = (c) => t(c.labelKey || 'colors.' + c.key, c.key);
  const opts = (values, prefix) => values.map(v => ({ value: v, label: t(prefix + v) }));

  return (
    <div>
      <div className="lc-fields">
        <SelectField label={t('listing.cr_body_type')} placeholder={t('listing.cr_any_type')} value={form.body_type} onChange={v => updateForm('body_type', v)} options={opts(BODY_VALUES, 'body_types.')} />
        <SelectField label={t('listing.cr_fuel_type')} placeholder={t('listing.cr_any_fuel')} value={form.fuel_type} onChange={v => updateForm('fuel_type', v)} options={opts(FUEL_VALUES, 'fuel_types.')} />
        <TextField label={t('listing.cr_engine_volume')} type="number" step="0.1" placeholder={t('listing.cr_volume_l')} value={form.engine_volume} onChange={v => updateForm('engine_volume', v)} />
        <SelectField label={t('listing.cr_transmission')} placeholder={t('listing.cr_any_gearbox')} value={form.transmission} onChange={v => updateForm('transmission', v)} options={opts(TRANSMISSION_VALUES, 'transmission_types.')} />
        <Field label={t('listing.cr_power')}>
          <div className="flex gap-2">
            <Input aria-label={t('listing.cr_power')} type="number" value={form.engine_power} onChange={e => updateForm('engine_power', e.target.value)} placeholder={t('listing.cr_power')} className={cn(inputCls, 'min-w-0 flex-1')} />
            <Select value={powerUnit} onValueChange={v => updateForm('powerUnit', v)}>
              <SelectTrigger aria-label={t('listing.cr_power_unit')} className={cn(inputCls, 'lc-power-unit')}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kw">{t('car.kw', 'kW')}</SelectItem>
                <SelectItem value="hp">{t('car.hp', 'hp')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Field>
        <SelectField label={t('listing.cr_drive')} placeholder={t('listing.cr_any_drive')} value={form.drive_type} onChange={v => updateForm('drive_type', v)} options={opts(DRIVE_VALUES, 'drive_types.')} />
        <TextField label={t('listing.cr_trim')} placeholder={t('listing.cr_trim_ph')} value={form.trim_level} onChange={v => updateForm('trim_level', v)} />
      </div>

      {showAppearance && <ListingColorInterior form={form} updateForm={updateForm} t={t} />}
    </div>
  );
}