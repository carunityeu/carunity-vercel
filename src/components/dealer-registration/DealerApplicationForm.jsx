import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import DealerCompanyFields from '@/components/dealer-registration/DealerCompanyFields';
import DealerContactFields from '@/components/dealer-registration/DealerContactFields';
import DealerImportFields from '@/components/dealer-registration/DealerImportFields';
import DealerApplicationConsents from '@/components/dealer-registration/DealerApplicationConsents';

export default function DealerApplicationForm({ form, update, onSubmit, busy, error, t, onBack }) {
  const [step,setStep] = useState(0);
  const titles = ['company','contact','finish'];
  const next = event => { event.preventDefault(); if (step < 2) { setStep(step+1); document.getElementById('da-form-top')?.scrollIntoView({block:'start'}); } else onSubmit(); };
  return <div className="listing-create da-form">
    <div id="da-form-top" className="lc-shell lc-content">
      <div><button type="button" onClick={onBack} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />{t('back')}</button><h1 className="text-2xl font-bold sm:text-3xl">{t('formTitle')}</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('formHint')}</p></div>
      <ol className="grid grid-cols-3 gap-2 text-xs sm:text-sm">{titles.map((title,index) => <li key={title} aria-current={step === index ? 'step' : undefined} className={`flex min-w-0 items-start gap-2 ${step === index ? 'text-foreground' : 'text-muted-foreground'}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${step >= index ? 'border-primary text-primary' : 'border-border'}`}>{index+1}</span><span className="pt-1 leading-tight">{t(title)}</span></li>)}</ol>
      <form className="lc-card" onSubmit={next}>
        <fieldset disabled={busy} className="min-w-0"><section className="lc-step"><h3>{step+1}. {t(titles[step])}</h3>
          {step === 0 && <DealerCompanyFields form={form} update={update} t={t} />}
          {step === 1 && <DealerContactFields form={form} update={update} t={t} />}
          {step === 2 && <><DealerImportFields form={form} update={update} t={t} /><DealerApplicationConsents form={form} update={update} t={t} /></>}
        </section>
        {error && <p role="alert" className="mt-5 text-sm text-destructive">{t(error)}</p>}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">{step > 0 && <button type="button" onClick={() => setStep(step-1)} className="min-h-11 rounded-xl border border-border px-6 text-sm">{t('back')}</button>}<button type="submit" className="lc-next sm:ml-auto" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{t(busy ? 'sending' : step === 2 ? 'send' : 'next')}</button></div>
        </fieldset>
      </form>
    </div>
  </div>;
}