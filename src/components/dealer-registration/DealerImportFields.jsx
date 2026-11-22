import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export default function DealerImportFields({ form, update, t }) {
  return <div className="space-y-5">
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4"><Checkbox id="da-import" checked={form.import_requested} onCheckedChange={value => update('import_requested',value === true)} className="mt-0.5" /><span className="text-sm font-medium leading-relaxed">{t('import')}</span></label>
    <p className="text-sm leading-relaxed text-muted-foreground">{t('importHint')}</p>
    {form.import_requested && <div className="space-y-5 rounded-xl border border-border p-4 sm:p-5">
      <div><label htmlFor="da-import-url" className="lc-label">{t('importUrl')} *</label><Input id="da-import-url" name="import_url" type="url" required maxLength={300} placeholder="https://" className="lc-input w-full" value={form.import_url} onChange={e => update('import_url',e.target.value)} /></div>
      <p className="text-xs leading-relaxed text-muted-foreground">{t('importItems')}</p>
      <label className="flex cursor-pointer items-start gap-3"><Checkbox id="da-data-consent" checked={form.data_usage_consent} onCheckedChange={value => update('data_usage_consent',value === true)} className="mt-0.5" /><span className="text-xs leading-relaxed">{t('importConsent')}</span></label>
    </div>}
  </div>;
}