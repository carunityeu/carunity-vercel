import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DealerCompanyFields({ form, update, t }) {
  return <div className="lc-fields">
    <div className="lc-field sm:col-span-2"><label className="lc-label" htmlFor="da-name">{t('name')} *</label><Input id="da-name" name="dealer_name" required maxLength={300} autoComplete="organization" value={form.dealer_name} onChange={e => update('dealer_name', e.target.value)} className="lc-input w-full" /></div>
    <div className="lc-field"><label id="da-country-label" className="lc-label">{t('country')} *</label>
      <Select required value={form.country} onValueChange={value => update('country', value)}><SelectTrigger aria-labelledby="da-country-label" className="lc-input w-full"><SelectValue placeholder={t('country')} /></SelectTrigger><SelectContent>{[['Латвия','Latvia'],['Литва','Lithuania'],['Эстония','Estonia']].map(([value,key]) => <SelectItem key={value} value={value}>{t(key)}</SelectItem>)}</SelectContent></Select>
    </div>
    {[['city','city','address-level2'],['address','address','street-address'],['website','website','url']].map(([key,label,autocomplete]) => <div key={key} className={`lc-field ${key !== 'city' ? 'sm:col-span-2' : ''}`}><label className="lc-label" htmlFor={'da-'+key}>{t(label)}{key === 'city' && ' *'}</label><Input id={'da-'+key} name={key} type={key === 'website' ? 'url' : 'text'} required={key === 'city'} maxLength={300} autoComplete={autocomplete} placeholder={key === 'website' ? 'https://' : undefined} className="lc-input w-full" value={form[key]} onChange={e => update(key,e.target.value)} /></div>)}
    <div className="lc-field sm:col-span-2"><label className="lc-label" htmlFor="da-description">{t('description')}</label><Textarea id="da-description" value={form.description} maxLength={3000} onChange={e => update('description',e.target.value)} className="da-description w-full" /><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t('descriptionHint')}</p></div>
  </div>;
}