import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EMPLOYEE_LANGUAGE_LABELS, MAX_EMPLOYEE_LANGUAGES, employeeFlagUrl } from '@/lib/employeeLanguages';

const toList = value => (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);

export default function SellerTeamMember({ employee, companyEmail }) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const phones = toList(employee.phones);
  const email = employee.email || companyEmail;
  return (
    <article className="flex min-w-0 items-stretch gap-3 sm:gap-4">
      <div className="relative aspect-square w-24 shrink-0 self-start overflow-hidden bg-background">
        {employee.photo ? <img src={employee.photo} alt={employee.name || ''} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><User className="h-8 w-8" /></div>}
      </div>
      <div className="min-w-0 text-sm leading-snug">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {employee.name && <h3 className="break-words font-semibold text-foreground">{employee.name}</h3>}
          {toList(employee.languages).slice(0, MAX_EMPLOYEE_LANGUAGES).map(code => {
            const label = EMPLOYEE_LANGUAGE_LABELS[code] || code;
            const src = employeeFlagUrl(code, 40);
            return src ? (
              <img
                key={code}
                src={src}
                alt={label}
                title={label}
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10 dark:ring-white/20"
              />
            ) : null;
          })}
        </div>
        {employee.position && <p className="break-words text-foreground">{employee.position}</p>}
        <div className="mt-2 text-foreground">
          {phones.length > 0 && (revealed ? phones.map(phone => <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="block break-all hover:text-primary">{phone}</a>) : <button type="button" onClick={() => setRevealed(true)} className="min-h-8 text-left hover:text-primary">{t('car.show_phone')}</button>)}
          {email && <a href={`mailto:${email}`} className="block break-all underline underline-offset-2 hover:text-primary">{email}</a>}
        </div>
      </div>
    </article>
  );
}