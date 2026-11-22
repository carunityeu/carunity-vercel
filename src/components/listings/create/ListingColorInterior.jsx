import React from 'react';
import { Check } from 'lucide-react';
import ListingColorSwatch from '@/components/listings/create/ListingColorSwatch';
import { EXTERIOR_COLORS, INTERIOR_MATERIALS, INTERIOR_COLORS, INTERIOR_SWATCHES } from '@/components/listings/create/constants';

export default function ListingColorInterior({ form, updateForm, t }) {
  return <div className="lc-colors">
    <h4>{t('listing.cr_color_interior')}</h4>
    <p>{t('listing.cr_body_color')}</p>
    <div className="lc-exterior-colors">
      {EXTERIOR_COLORS.map(c => <ListingColorSwatch key={c.key} color={c.swatch} label={t(c.labelKey || 'colors.' + c.key)} active={form.color === c.key} onClick={() => updateForm('color', c.key)} />)}
    </div>
    <div className="lc-interior-label"><p>{t('listing.cr_interior')}</p></div>
    <div className="lc-materials">
      {INTERIOR_MATERIALS.map(m => <button key={m} type="button" className="lc-material" aria-pressed={form.interior_material === m} onClick={() => updateForm('interior_material', m)}>
        <span className="lc-check-box">{form.interior_material === m && <Check />}</span>
        <span>{t(m === 'fabric' ? 'listing.cr_material' : 'interior_materials.' + m)}</span>
      </button>)}
    </div>
    <div className="lc-interior-colors">
      {INTERIOR_COLORS.map(c => <ListingColorSwatch key={c} color={INTERIOR_SWATCHES[c]} label={t('colors.' + c)} active={form.color_interior === c} onClick={() => updateForm('color_interior', c)} />)}
    </div>
  </div>;
}