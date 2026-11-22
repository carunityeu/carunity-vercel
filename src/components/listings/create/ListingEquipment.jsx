import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FEATURE_GROUPS } from '@/components/listings/create/constants';
import { inputCls } from '@/components/listings/create/fields';

const GROUP_LABELS = { interior: 'equipment_interior', multimedia: 'equipment_multimedia', exterior: 'equipment_exterior', drivetrain: 'equipment_drivetrain', other: 'equipment_other' };
export default function ListingEquipment({ form, updateForm, t }) {
  const [open, setOpen] = useState({ interior: true });
  const [custom, setCustom] = useState('');
  const toggleFeature = f => updateForm('features', form.features.includes(f) ? form.features.filter(x => x !== f) : [...form.features, f]);
  const addCustom = () => { const v = custom.trim(); if (v && !form.features.includes(v)) toggleFeature(v); setCustom(''); };
  const customFeatures = form.features.filter(f => !Object.values(FEATURE_GROUPS).flat().includes(f));
  return <div className="lc-equipment">
    <h4>{t('listing.cr_equipment')}</h4>
    {Object.entries(FEATURE_GROUPS).map(([group, keys]) => <div key={group} className="lc-equipment-group">
      <button type="button" aria-expanded={!!open[group]} className="lc-equipment-heading" onClick={() => setOpen(o => ({ ...o, [group]: !o[group] }))}>
        {t('listing.' + GROUP_LABELS[group])}{open[group] ? <ChevronUp /> : <ChevronDown />}
      </button>
      {open[group] && <div className="lc-features">{keys.map(f => <button key={f} type="button" className="lc-feature" aria-pressed={form.features.includes(f)} onClick={() => toggleFeature(f)}>{t('feature_items.' + f, f)}</button>)}</div>}
    </div>)}
    {customFeatures.length > 0 && <div className="lc-features">{customFeatures.map(f => <button key={f} type="button" className="lc-feature" aria-pressed="true" onClick={() => toggleFeature(f)}>{f} ×</button>)}</div>}
    <div className="lc-add-option">
      <Input aria-label={t('listing.cr_add_option')} value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }} onBlur={addCustom} placeholder={t('listing.cr_add_option')} className={inputCls} />
      <button type="button" aria-label={t('listing.cr_add_option')} onMouseDown={e => e.preventDefault()} onClick={addCustom}><Plus size={18} /></button>
    </div>
  </div>;
}