import React from 'react';
import { Mail, Phone, Languages, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EMPLOYEE_LANGUAGE_LABELS } from '@/lib/employeeLanguages';
import SellerTeamMember from '@/components/car-details/SellerTeamMember';

const toList = (value) => (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);

export default function DealerProfileEmployees({ dealer, embedded = false }) {
  const { t } = useTranslation();

  const stored = Array.isArray(dealer.employees) ? dealer.employees.filter(e => e && (e.name || e.photo)) : [];
  const employees = stored.length > 0 ? stored : dealer.contact_person ? [{
    name: dealer.contact_person,
    position: dealer.contact_person_role,
    photo: dealer.contact_person_photo,
    email: dealer.contact_person_email,
    phones: toList(dealer.contact_person_phone),
    languages: [],
  }] : [];

  if (employees.length === 0) return null;

  const companyEmail = dealer.email;

  if (embedded) return (
    <div aria-label={t('dealerProfile.team')} className="min-w-0 flex-1 basis-64 space-y-5">
      {employees.map((employee, index) => <SellerTeamMember key={index} employee={employee} companyEmail={companyEmail} />)}
    </div>
  );

  return (
    <section className={embedded ? 'mt-5 min-w-0 border-t border-border pt-5' : 'rounded-2xl border border-border bg-card p-3 sm:p-4'}>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Users className="h-4 w-4 text-primary" />
        {t('dealerProfile.team')}
      </h2>
      <div className={embedded ? 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-3' : 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'}>
        {employees.map((employee, index) => {
          const phones = toList(employee.phones);
          const languages = toList(employee.languages);
          return (
            <article key={index} className="min-w-0 rounded-xl border border-border bg-background p-3">
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-card">
                  {employee.photo
                    ? <img src={employee.photo} alt={employee.name || ''} loading="lazy" className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><Users className="h-6 w-6" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  {employee.name && <p className="break-words font-semibold leading-tight text-foreground">{employee.name}</p>}
                  {employee.position && <p className="mt-0.5 break-words text-xs text-muted-foreground">{employee.position}</p>}
                  {languages.length > 0 && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
                      <Languages className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="break-words">{languages.map(code => EMPLOYEE_LANGUAGE_LABELS[code] || code).join(' · ')}</span>
                    </p>
                  )}
                </div>
              </div>

              {(employee.email || companyEmail || phones.length > 0) && (
                <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
                  {employee.email && (
                    <a href={`mailto:${employee.email}`} className="flex items-start gap-2 text-muted-foreground transition-colors hover:text-primary">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="min-w-0 break-all">{employee.email}</span>
                    </a>
                  )}
                  {companyEmail && companyEmail !== employee.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-[11px] leading-tight text-muted-foreground">{t('dealerProfile.company_email')}</p>
                        <a href={`mailto:${companyEmail}`} className="break-all text-foreground transition-colors hover:text-primary">{companyEmail}</a>
                      </div>
                    </div>
                  )}
                  {phones.map(phone => (
                    <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="flex items-start gap-2 text-muted-foreground transition-colors hover:text-primary">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                      <span dir="ltr" className="min-w-0 break-all">{phone}</span>
                    </a>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}