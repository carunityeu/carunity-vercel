import React from 'react';
import { Plus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import DealerEmployeeCard from '@/components/dealer/DealerEmployeeCard';

export default function DealerEmployeesEditor({ employees, companyEmail, onChange }) {
  const { t } = useTranslation();
  const list = Array.isArray(employees) ? employees : [];

  const updateEmployee = (index, key, value) => {
    onChange(list.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const removeEmployee = (index) => {
    onChange(list.filter((_, i) => i !== index));
  };

  const addEmployee = () => {
    onChange([...list, { name: '', position: '', photo: '', email: '', phones: [], languages: [] }]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{t('dealerEmployees.title')}</h2>
        <p className="text-sm text-slate-500">{t('dealerEmployees.subtitle')}</p>
      </div>

      {list.length === 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-4 text-sm text-slate-500">
          <Users className="h-4 w-4 shrink-0" /> {t('dealerEmployees.empty')}
        </div>
      )}

      {list.map((employee, index) => (
        <DealerEmployeeCard
          key={index}
          employee={employee}
          index={index}
          companyEmail={companyEmail}
          onChange={(key, value) => updateEmployee(index, key, value)}
          onRemove={() => removeEmployee(index)}
        />
      ))}

      <Button type="button" variant="outline" onClick={addEmployee} className="w-full gap-2 border-dashed border-border text-slate-300 hover:bg-border sm:w-auto">
        <Plus className="h-4 w-4" /> {t('dealerEmployees.add')}
      </Button>
    </div>
  );
}