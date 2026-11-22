import React from 'react';
import { Input } from '@/components/ui/input';

export default function DealerContactFields({ form, update, t }) {
  return <div className="space-y-6">
    <p className="text-sm leading-relaxed text-muted-foreground">{t('contactHint')}</p>
    <div className="lc-fields">{[['applicant_name','person','text','name'],['phone','phone','tel','tel'],['contact_email','email','email','email']].map(([key,label,type,autocomplete]) => <div key={key} className={`lc-field ${key === 'applicant_name' ? 'sm:col-span-2' : ''}`}>
      <label className="lc-label" htmlFor={'da-'+key}>{t(label)} *</label><Input id={'da-'+key} name={key} type={type} required maxLength={300} autoComplete={autocomplete} value={form[key]} onChange={e => update(key,e.target.value)} className="lc-input w-full" />
    </div>)}</div>
  </div>;
}