import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function ListingSellerSelect({ car, employees, onAssign }) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const team = [...new Set((employees || []).map(e => (e.name || e.email || '').trim()).filter(Boolean))];
  const assign = async (event) => {
    const value = event.target.value;
    setSaving(true);
    try { await onAssign(car, value); }
    catch (error) { toast.error(error.message); }
    finally { setSaving(false); }
  };
  return <label className="mt-2 flex w-full min-w-0 flex-col gap-1 sm:max-w-64">
    <span className="text-xs text-muted-foreground">{t('dealerEmployees.assign_title')}</span>
    <select value={car.assigned_employee || ''} onChange={assign} disabled={saving} aria-busy={saving} className="h-10 w-full min-w-0 rounded-md border border-border bg-background px-2 text-sm text-foreground disabled:opacity-50">
      <option value="">{t('dealerEmployees.assign_none')}</option>
      {car.assigned_employee && !team.includes(car.assigned_employee) && <option value={car.assigned_employee}>{car.assigned_employee}</option>}
      {team.map(name => <option key={name} value={name}>{name}</option>)}
    </select>
  </label>;
}