import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, User, Plus } from 'lucide-react';
import DealerEmployeeDialog from '@/components/dealer/DealerEmployeeDialog';

export default function DealerTeamAssignments({ employees, cars, companyEmail, onSave }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const team = Array.isArray(employees) ? employees : [];
  const listings = Array.isArray(cars) ? cars : [];
  const empty = { name: '', position: '', photo: '', email: '', phones: [], languages: [] };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">{t('dealerEmployees.team_title')}</h2>
        <p className="text-sm text-slate-500">{t('dealerEmployees.team_hint')}</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((employee, index) => {
            const assigned = listings.filter(car => car.assigned_employee && car.assigned_employee === employee.name).length;
            const phones = Array.isArray(employee.phones) ? employee.phones.filter(Boolean) : [];
            return (
              <button type="button" key={index} onClick={() => setSelected(index)} aria-label={`${t('dealerEmployees.edit')}: ${employee.name || t('dealerEmployees.employee')}`} className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-background p-3 text-left hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {employee.photo
                  ? <img src={employee.photo} alt="" className="h-11 w-11 shrink-0 rounded-full border border-border object-cover" />
                  : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card"><User className="h-5 w-5 text-slate-500" /></div>}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{employee.name || t('dealerEmployees.employee')}</p>
                  {employee.position && <p className="truncate text-xs text-slate-400">{employee.position}</p>}
                  {employee.email && (
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                      <Mail className="h-3 w-3 shrink-0" /> <span className="truncate">{employee.email}</span>
                    </p>
                  )}
                  {phones.length > 0 && (
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
                      <Phone className="h-3 w-3 shrink-0" /> <span className="truncate" dir="ltr">{phones.join(', ')}</span>
                    </p>
                  )}
                  <p className="mt-1.5 text-[11px] text-emerald-400">
                    {t('dealerEmployees.assigned_count', { count: assigned })}
                  </p>
                </div>
              </button>
            );
          })}
          <button type="button" onClick={() => setSelected(-1)} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-background p-4 text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Plus className="h-9 w-9" aria-hidden="true" />
            <span className="text-sm font-medium">{t('dealerEmployees.add')}</span>
          </button>
        </div>
      {selected !== null && <DealerEmployeeDialog key={selected} employee={selected < 0 ? empty : team[selected]} index={selected} companyEmail={companyEmail} onClose={() => setSelected(null)} onSave={draft => onSave(selected < 0 ? [...team, draft] : team.map((item, i) => i === selected ? draft : item))} onRemove={() => onSave(team.filter((_, i) => i !== selected))} />}

    </div>
  );
}