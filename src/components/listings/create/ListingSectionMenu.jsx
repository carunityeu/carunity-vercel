import React from 'react';
import { Check } from 'lucide-react';

const SECTION_ICONS = {
  vehicle: 'https://base44.app/api/apps/6973f00466c3a37f3d8e7e53/files/mp/public/6973f00466c3a37f3d8e7e53/ece7d5e32_vehicle.png',
  equipment: 'https://base44.app/api/apps/6973f00466c3a37f3d8e7e53/files/mp/public/6973f00466c3a37f3d8e7e53/c95ced6d1_equipment.png',
  details: 'https://base44.app/api/apps/6973f00466c3a37f3d8e7e53/files/mp/public/6973f00466c3a37f3d8e7e53/c100172c3_details.png',
  contact: 'https://base44.app/api/apps/6973f00466c3a37f3d8e7e53/files/mp/public/6973f00466c3a37f3d8e7e53/67beaf117_contact.png',
};

export default function ListingSectionMenu({ form, completed, onOpen, onContinue, t }) {
  const sections = Object.keys(SECTION_ICONS);
  const count = sections.filter(key => !completed[key]).length;
  return <div className="lc-section-menu">
    <h1>{t('listing.wizard_heading', { count })}</h1>
    <p className="lc-menu-vehicle">{[form.brand, form.model, form.year].filter(Boolean).join(' ') || t('listing.cr_vehicle_car')}</p>
    <div>{sections.map((key, index) => <button type="button" key={key} className="lc-menu-row" onClick={() => onOpen(key)}>
      <span className="lc-menu-image" aria-hidden="true"><img src={SECTION_ICONS[key]} alt="" /></span>
      <span className="lc-menu-copy"><strong>{index + 1}. {t('listing.wizard_' + key)}</strong><span>{t('listing.wizard_' + key + '_hint')}</span></span>
      <span className={'lc-menu-edit' + (completed[key] ? ' is-saved' : '')}>{completed[key] && <Check size={14} />}{t(completed[key] ? 'listing.wizard_edit' : 'listing.wizard_add')}</span>
    </button>)}</div>
    <p className="lc-menu-note">{t('listing.wizard_autosave')}</p>
    <div className="lc-actions"><button type="button" className="lc-next" disabled={count > 0} onClick={onContinue}>{t('listing.wizard_plan')}</button></div>
  </div>;
}