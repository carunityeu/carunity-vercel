import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DealerRegistrationIntro from '@/components/dealer-registration/DealerRegistrationIntro';
import DealerApplicationForm from '@/components/dealer-registration/DealerApplicationForm';
import DealerApplicationStatus from '@/components/dealer-registration/DealerApplicationStatus';
import useDealerApplication from '@/components/dealer-registration/useDealerApplication';
import '@/components/listings/create/createListing.css';
import '@/components/dealer-registration/dealerRegistration.css';

export default function DealerRegister() {
  const { t: translate } = useTranslation();
  const t = key => translate('dealerApply.'+key);
  const state = useDealerApplication();
  const [started,setStarted] = useState(new URLSearchParams(window.location.search).get('apply') === '1');
  const start = () => {
    if (!state.user) {base44.auth.redirectToLogin(window.location.origin+'/DealerRegister?apply=1'); return;}
    setStarted(true); window.scrollTo({top:0});
  };
  return <div className="dealer-registration min-h-screen bg-background text-foreground">
    {state.loading ? <div role="status" className="flex min-h-[40vh] items-center justify-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />{t('load')}</div> : state.loadError ? <div role="alert" className="mx-auto max-w-xl px-4 py-16 text-center"><p>{t('failed')}</p><button onClick={state.load} className="mt-5 min-h-11 rounded-xl border border-border px-6">{t('retry')}</button></div> : started && state.application && !state.editing ? <DealerApplicationStatus application={state.application} t={t} onBack={() => setStarted(false)} onEdit={() => {state.setEditing(true);setStarted(true);}} /> : started ? <DealerApplicationForm {...state} onSubmit={state.submit} t={t} onBack={() => {setStarted(false);state.setEditing(false);}} /> : <DealerRegistrationIntro t={t} onStart={start} />}
  </div>;
}