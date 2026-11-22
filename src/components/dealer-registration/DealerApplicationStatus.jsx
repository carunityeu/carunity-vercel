import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, RotateCcw } from 'lucide-react';

export default function DealerApplicationStatus({ application, t, onEdit, onBack }) {
  const status = application.status;
  const Icon = status === 'approved' ? Check : status === 'rejected' ? RotateCcw : Clock;
  return <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20"><button type="button" onClick={onBack} className="mb-4 min-h-11 text-sm text-muted-foreground">{t('back')}</button><section className="rounded-[17px] border border-border bg-card p-6 sm:p-10" aria-live="polite">
    <Icon className="mb-6 h-10 w-10 text-primary" strokeWidth={1.5} />
    <h1 className="text-2xl font-bold">{t(status)}</h1><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t(status+'Text')}</p>
    <p className="mt-6 break-words rounded-xl border border-border bg-background p-4 text-sm font-medium">{application.dealer_name}</p>
    {application.admin_notes && <div className="mt-5"><h2 className="mb-2 text-sm font-semibold">{t('comment')}</h2><p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{application.admin_notes}</p></div>}
    {status === 'approved' && <Link to="/DealerDashboard" className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">{t('panel')}</Link>}
    {status === 'rejected' && <button type="button" onClick={onEdit} className="mt-7 min-h-11 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">{t('edit')}</button>}
  </section></div>;
}