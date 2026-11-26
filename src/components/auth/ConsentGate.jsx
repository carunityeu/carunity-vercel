import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { auth } from '@/api/auth';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Set on the sign-up page when the box is ticked before "Continue with Google"
export const CONSENT_PENDING_KEY = 'cu_consent_pending';

export const consentFields = () => ({ terms_consent: true, gdpr_consent: true, gdpr_consent_date: new Date().toISOString() });

/** "I am 18+ and accept the Terms" + links, shared by sign-up and this gate. */
export function ConsentText() {
  const { t } = useTranslation();
  return (
    <>
      {t('authVisual.consentAge', 'Мне есть 18 лет, я принимаю')}{' '}
      <a href="/Terms" target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-2">{t('authVisual.termsLink')}</a>{' '}
      {t('authVisual.and', 'и')}{' '}
      <a href="/PrivacyPolicy" target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-2">{t('authVisual.privacyLinkAcc', t('authVisual.privacyLink'))}</a>
    </>
  );
}

/**
 * Accounts without a recorded consent (first sign-in with Google, imported accounts) confirm
 * 18+ and the Terms once before using the site. If the box was ticked on the sign-up page just
 * before going to Google, the consent is saved silently.
 */
export default function ConsentGate() {
  const { t } = useTranslation();
  const { user, checkAppState } = useAuth();
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const needs = !!user && user.terms_consent !== true && !done;

  useEffect(() => {
    if (!needs) return;
    let pending = null;
    try { pending = localStorage.getItem(CONSENT_PENDING_KEY); } catch { /* storage blocked */ }
    if (pending) {
      auth.updateMe(consentFields()).then(() => { setDone(true); localStorage.removeItem(CONSENT_PENDING_KEY); checkAppState?.(); }).catch(() => {});
    }
  }, [needs]);

  if (!needs) return null;
  const accept = async () => {
    setSaving(true);
    try { await auth.updateMe(consentFields()); setDone(true); checkAppState?.(); } catch { /* keep the dialog open */ }
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent className="max-w-md border-line bg-surface text-ink [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('authVisual.consentGateTitle', 'Подтвердите условия')}</DialogTitle>
          <DialogDescription className="text-ink-2">{t('authVisual.consentGateText', 'Чтобы пользоваться аккаунтом CarUnity, подтвердите возраст и согласие с условиями.')}</DialogDescription>
        </DialogHeader>
        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-raised p-3 text-sm leading-relaxed text-ink-2">
          <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} className="mt-0.5 shrink-0" />
          <span><ConsentText /></span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => auth.logout()}>{t('nav.logout')}</Button>
          <Button disabled={!checked || saving} onClick={accept}>{saving && <Loader2 className="animate-spin" />}{t('authVisual.continue', 'Продолжить')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
