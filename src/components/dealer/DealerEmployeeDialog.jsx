import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DealerEmployeeCard from '@/components/dealer/DealerEmployeeCard';

export default function DealerEmployeeDialog({ employee, index, companyEmail, onSave, onRemove, onClose }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState({ ...employee });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (remove = false) => {
    setBusy(true); setError('');
    try {
      await (remove ? onRemove() : onSave(draft));
      onClose();
    } catch (e) {
      setError(e.message || t('dealerEmployees.save_error'));
    } finally { setBusy(false); }
  };
  return (
    <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
      <DialogContent className="mx-0 w-[calc(100%-2rem)] max-w-2xl bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>{t(index < 0 ? 'dealerEmployees.add' : 'dealerEmployees.edit')}</DialogTitle>
          <DialogDescription>{t('dealerEmployees.subtitle')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); submit(); }} className="min-w-0 space-y-4">
          <fieldset disabled={busy} className="min-w-0">
            <DealerEmployeeCard employee={draft} index={Math.max(0, index)} companyEmail={companyEmail} onChange={(key, value) => setDraft(p => ({ ...p, [key]: value }))} onRemove={index < 0 ? onClose : () => submit(true)} />
          </fieldset>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>{t('dashboard.cancel')}</Button>
            <Button type="submit" disabled={busy}>{t('dealer.save')}{busy ? '…' : ''}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}