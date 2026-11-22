import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export default function DealerApplicationReview({ application:app, notes, setNotes, onClose, onApprove, onReject, busy }) {
  const {t:translate}=useTranslation();
  const t=key=>translate('dealerApply.'+key);
  if(!app) return null;
  const fields=[['name',app.dealer_name],['person',app.applicant_name],['account',app.applicant_email],['contactEmail',app.contact_email || app.applicant_email],['phone',app.phone],['country',({'Латвия':t('Latvia'),'Литва':t('Lithuania'),'Эстония':t('Estonia')})[app.country] || app.country],['city',app.city],['address',app.address],['website',app.website],['importRequested',t(app.import_requested?'yes':'no')],['importUrl',app.import_url]];
  return <Dialog open={!!app} onOpenChange={open=>{if(!open&&!busy)onClose();}}><DialogContent className="max-h-[88dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-2xl border-border bg-card p-5 sm:p-7">
    <DialogHeader><DialogTitle className="pr-6 text-xl">{app.dealer_name}</DialogTitle><DialogDescription>{t('status_'+app.status)}</DialogDescription></DialogHeader>
    <dl className="grid min-w-0 grid-cols-1 gap-4 text-sm sm:grid-cols-2">{fields.map(([key,value])=>value ? <div key={key} className="min-w-0"><dt className="mb-1 text-xs text-muted-foreground">{t(key)}</dt><dd className="break-words">{value}</dd></div> : null)}</dl>
    {app.description && <div className="min-w-0"><h3 className="mb-2 text-xs text-muted-foreground">{t('description')}</h3><p className="whitespace-pre-wrap break-words text-sm">{app.description}</p></div>}
    {app.brands?.length>0 && <p className="break-words text-sm">{app.brands.join(', ')}</p>}
    <div><label htmlFor="da-review-notes" className="mb-2 block text-sm">{t('notes')}</label><Textarea id="da-review-notes" value={notes} onChange={e=>setNotes(e.target.value)} maxLength={3000} disabled={!!busy || app.status!=='pending'} placeholder={t('notesHint')} className="min-h-24 bg-background" /></div>
    {app.status==='pending' && <div className="flex flex-col gap-3 sm:flex-row"><Button className="min-h-11 flex-1" disabled={!!busy} onClick={()=>onApprove(app)}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('approve')}</Button><Button className="min-h-11 flex-1" variant="outline" disabled={!!busy} onClick={()=>onReject(app)}>{t('reject')}</Button></div>}
  </DialogContent></Dialog>;
}