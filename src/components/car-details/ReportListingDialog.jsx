import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NativeSelect } from '@/components/ds';
import ContactSupportModal from '@/components/ui/ContactSupportModal';

const REASONS = ['fraud', 'wrong_info', 'duplicate', 'sold', 'inappropriate', 'other'];

/**
 * "Report a violation" under the listing summary. Signed-in users file a report (admins see it in the
 * reports list); guests get the contact form with the listing already named in the subject.
 */
export default function ReportListing({ car, user }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const label = t('footer.report', 'Сообщить о нарушении');

  const submit = async () => {
    if (!reason) { toast.error(t('car.report_select_reason')); return; }
    setSending(true);
    try {
      await entities.Report.create({ reporter_email: user.email, created_by: user.email, target_type: 'car', target_id: car.id, reason, description, status: 'pending' });
      toast.success(t('car.report_sent'));
      setOpen(false); setReason(''); setDescription('');
    } catch (e) { toast.error(e.message); }
    setSending(false);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mt-3 flex items-center gap-1.5 text-sm text-ink-3">
        <Flag className="h-4 w-4" />{label}
      </button>
      {user ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md border-line bg-surface text-ink">
            <DialogHeader>
              <DialogTitle>{label}</DialogTitle>
              <DialogDescription className="text-ink-3">{car.brand} {car.model} {car.year}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <NativeSelect value={reason} onChange={(e) => setReason(e.target.value)} aria-label={t('car.report_select_reason')}>
                <option value="">{t('car.report_select_reason')}</option>
                {REASONS.map((r) => <option key={r} value={r}>{t('car.report_' + r)}</option>)}
              </NativeSelect>
              <Textarea placeholder={t('car.report_placeholder')} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="rounded-xl border-0 bg-raised text-ink" />
              <Button onClick={submit} disabled={sending} className="w-full">{sending && <Loader2 className="animate-spin" />}{t('car.report_submit')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <ContactSupportModal open={open} onOpenChange={setOpen}
          initialSubject={`${label}: ${car.brand || ''} ${car.model || ''} — ${typeof window !== 'undefined' ? window.location.href : ''}`} />
      )}
    </>
  );
}
