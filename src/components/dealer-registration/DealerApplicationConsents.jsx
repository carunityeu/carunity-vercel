import React from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

export default function DealerApplicationConsents({ form, update, t }) {
  return <div className="mt-7 space-y-5 border-t border-border pt-6">
    <p className="text-sm leading-relaxed text-muted-foreground">{t('confirmHint')}</p>
    {[['gdpr_consent','gdpr','/PrivacyPolicy','privacy'],['terms_consent','terms','/Terms','termsLink']].map(([key,text,to,link]) => <div key={key} className="flex items-start gap-3"><Checkbox id={'da-'+key} checked={form[key]} onCheckedChange={value => update(key,value === true)} className="mt-0.5" /><label htmlFor={'da-'+key} className="text-xs leading-relaxed">{t(text)} <Link to={to} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{t(link)}</Link>.</label></div>)}
  </div>;
}