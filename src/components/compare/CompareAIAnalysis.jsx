import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';
import useCompareCaro from '@/components/compare/useCompareCaro';

export default function CompareAIAnalysis({cars}) {
  const {t,i18n}=useTranslation();
  const [priorities,setPriorities]=useState([]);
  const {analyze,busy,error,analysis}=useCompareCaro(cars,i18n.resolvedLanguage||i18n.language,priorities);
  const toggle=key=>setPriorities(previous=>previous.includes(key)?previous.filter(value=>value!==key):[...previous,key]);
  return <details open className="mb-7 rounded-[20px] border border-border bg-card p-5 sm:p-6">
    <summary className="cursor-pointer text-base font-semibold">{t('comparePage.caro')}</summary>
    <div className="mt-5 space-y-4">
      <div><h2 className="text-sm font-medium">{t('comparePage.priorities')}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('comparePage.balanced')}</p></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{['economy','power','comfort','reliability','space','price'].map(key=><button key={key} type="button" aria-pressed={priorities.includes(key)} onClick={()=>toggle(key)} className={`min-h-11 rounded-xl border bg-background px-3 py-2 text-sm ${priorities.includes(key)?'border-primary text-primary':'border-border text-foreground hover:bg-secondary'}`}>{t('comparePage.'+key)}</button>)}</div>
      <button type="button" onClick={analyze} disabled={busy} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-secondary disabled:opacity-60">{busy&&<Loader2 className="h-4 w-4 animate-spin"/>}{t(busy?'comparePage.loading':'comparePage.analyze')}</button>
      {error&&<p role="alert" className="text-sm text-foreground">{t('comparePage.error')}</p>}
      {analysis&&<div className="compare-result rounded-xl border border-border bg-background p-4 text-sm leading-relaxed" aria-live="polite" aria-busy={busy}><ReactMarkdown>{analysis}</ReactMarkdown></div>}
      <p className="text-xs leading-relaxed text-muted-foreground">{t('comparePage.note')}</p>
    </div>
  </details>;
}