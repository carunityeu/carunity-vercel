import React, { useState } from 'react';
import { carBrands, years, getModelsForBrand } from './constants';
import { SelectField, TextField, Field, inputCls } from './fields';
import { Input } from '@/components/ui/input';

export default function StepBasicInfo({ form, updateForm, t }) {
  const [customModel, setCustomModel] = useState(false);
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].map((m, i) => ({ value: String(i + 1), label: t('months.' + m) }));
  const models = getModelsForBrand(form.brand);
  const showCustom = customModel || (!!form.model && models.length > 0 && !models.includes(form.model));
  const modelOptions = [...models.map(m => ({ value: m, label: m })), { value: '__custom__', label: '✏️ ' + t('listing.enter_manual') }];

  return (
    <div className="lc-fields">
      <SelectField label={t('listing.cr_make')} placeholder={t('listing.cr_any_make')} value={form.brand} onChange={v => { updateForm('brand', v); updateForm('model', ''); setCustomModel(false); }} options={carBrands.map(b => ({ value: b, label: b }))} />

      {models.length > 0 ? (
        <SelectField label={t('listing.cr_model')} placeholder={t('listing.cr_any_model')} value={showCustom ? '__custom__' : form.model} onChange={v => { if (v === '__custom__') { setCustomModel(true); updateForm('model', ''); } else { setCustomModel(false); updateForm('model', v); } }} options={modelOptions} />
      ) : (
        <Field label={t('listing.cr_model')}>
          <Input aria-label={t('listing.cr_model')} value={form.model} onChange={e => updateForm('model', e.target.value)} placeholder={t('listing.cr_any_model')} className={inputCls} />
        </Field>
      )}

      <SelectField label={t('listing.cr_year')} placeholder={t('listing.cr_any_year')} value={form.year} onChange={v => updateForm('year', v)} options={years.map(y => ({ value: String(y), label: String(y) }))} />
      <SelectField label={t('listing.cr_month')} placeholder={t('listing.cr_any_month')} value={form.month_of_manufacture?.toString()} onChange={v => updateForm('month_of_manufacture', v)} options={months} />

      {models.length > 0 && showCustom && (
        <Field className="col-span-2">
          <Input aria-label={t('listing.cr_model')} value={form.model} onChange={e => updateForm('model', e.target.value)} placeholder={t('listing.model_placeholder')} className={inputCls} />
        </Field>
      )}

      <TextField label={t('listing.cr_mileage')} type="number" placeholder={'0 ' + t('listing.cr_km')} value={form.mileage} onChange={v => updateForm('mileage', v)} />
    </div>
  );
}