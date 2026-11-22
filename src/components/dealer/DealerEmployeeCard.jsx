import React, { useState } from 'react';
import { Image, Trash2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EMPLOYEE_LANGUAGES, EMPLOYEE_LANGUAGE_LABELS, MAX_EMPLOYEE_LANGUAGES, employeeFlagUrl } from '@/lib/employeeLanguages';
import { cn } from '@/lib/utils';

export default function DealerEmployeeCard({ employee, index, companyEmail, onChange, onRemove }) {
  const { t } = useTranslation();
  const [phoneText, setPhoneText] = useState((employee.phones || []).join(', '));
  const [uploading, setUploading] = useState(false);
  const languages = Array.isArray(employee.languages) ? employee.languages : [];

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      onChange('photo', file_url);
    } finally {
      setUploading(false);
    }
  };

  const languagesFull = languages.length >= MAX_EMPLOYEE_LANGUAGES;

  const toggleLanguage = (code) => {
    if (languages.includes(code)) {
      onChange('languages', languages.filter(item => item !== code));
      return;
    }
    if (languagesFull) return;
    onChange('languages', [...languages, code]);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-background p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{employee.name || t('dealerEmployees.employee')} {index + 1}</p>
        <Button type="button" variant="outline" size="sm" onClick={onRemove} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
          <Trash2 className="mr-1.5 h-4 w-4" /> {t('dealerEmployees.remove')}
        </Button>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {employee.photo
          ? <img src={employee.photo} alt="" className="h-16 w-16 shrink-0 rounded-full border border-border object-cover" />
          : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-card"><User className="h-7 w-7 text-slate-500" /></div>}
        <label className="min-w-0 cursor-pointer">
          <span className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-slate-400 transition-colors hover:border-emerald-400 hover:text-emerald-400">
            <Image className="h-4 w-4 shrink-0" /> {uploading ? t('dealerEmployees.upload') + '…' : t('dealerEmployees.upload')}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label className="mb-1 block text-slate-400">{t('dealerEmployees.name')}</Label>
          <Input value={employee.name || ''} onChange={e => onChange('name', e.target.value)} placeholder={t('dealerEmployees.name_placeholder')} maxLength={120} className="border-border bg-card text-white" />
        </div>
        <div>
          <Label className="mb-1 block text-slate-400">{t('dealerEmployees.position')}</Label>
          <Input value={employee.position || ''} onChange={e => onChange('position', e.target.value)} placeholder={t('dealerEmployees.position_placeholder')} maxLength={120} className="border-border bg-card text-white" />
        </div>
        <div>
          <Label className="mb-1 block text-slate-400">{t('dealerEmployees.email')}</Label>
          <Input type="email" value={employee.email || ''} onChange={e => onChange('email', e.target.value)} placeholder={t('dealerEmployees.email_placeholder')} className="border-border bg-card text-white" />
        </div>
        <div>
          <Label className="mb-1 block text-slate-400">{t('dealerEmployees.phones')}</Label>
          <Input
            value={phoneText}
            onChange={e => {
              setPhoneText(e.target.value);
              onChange('phones', e.target.value.split(',').map(part => part.trim()).filter(Boolean));
            }}
            placeholder={t('dealerEmployees.phones_placeholder')}
            dir="ltr"
            className="border-border bg-card text-white"
          />
          <p className="mt-1 text-xs text-slate-500">{t('dealerEmployees.phones_hint')}</p>
        </div>
        <div className="md:col-span-2">
          <Label className="mb-1 block text-slate-400">{t('dealerEmployees.company_email')}</Label>
          <p className="break-all text-sm text-slate-400">{companyEmail || '—'}</p>
        </div>
        <div className="md:col-span-2">
          <Label className="mb-1 block text-slate-400">
            {t('dealerEmployees.languages')}
            <span className="ml-1.5 font-normal text-slate-500">{languages.length}/{MAX_EMPLOYEE_LANGUAGES}</span>
          </Label>
          <p className="mb-2 text-xs text-slate-500">{t('dealerEmployees.languages_hint')}</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {EMPLOYEE_LANGUAGES.map(code => {
              const selected = languages.includes(code);
              const disabled = !selected && languagesFull;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleLanguage(code)}
                  disabled={disabled}
                  aria-pressed={selected}
                  className={cn(
                    'flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors sm:px-3',
                    selected
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-border bg-card text-slate-400',
                    disabled ? 'cursor-not-allowed opacity-40' : 'hover:text-white'
                  )}
                >
                  <img
                    src={employeeFlagUrl(code, 40)}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10 dark:ring-white/20"
                  />
                  {EMPLOYEE_LANGUAGE_LABELS[code]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}