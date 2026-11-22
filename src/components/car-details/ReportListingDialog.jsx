import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const REASONS = ['fraud', 'wrong_info', 'duplicate', 'sold', 'inappropriate', 'other'];

export default function ReportListingDialog({ open, onOpenChange, reason, onReasonChange, description, onDescriptionChange, onSubmit }) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('car.report')}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-4">
          <select value={reason} onChange={(e) => onReasonChange(e.target.value)} className="h-10 w-full rounded-md border border-slate-200 px-3">
            <option value="">{t('car.report_select_reason')}</option>
            {REASONS.map((r) => <option key={r} value={r}>{t('car.report_' + r)}</option>)}
          </select>
          <Textarea placeholder={t('car.report_placeholder')} value={description} onChange={(e) => onDescriptionChange(e.target.value)} rows={3} />
          <Button onClick={onSubmit} className="w-full" variant="destructive">{t('car.report_submit')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}