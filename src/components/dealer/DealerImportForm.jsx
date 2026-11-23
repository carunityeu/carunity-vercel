import React, { useState } from 'react';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CloudUpload, Globe, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function DealerImportForm({ dealer }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [importSiteUrl, setImportSiteUrl] = useState('');
  const [importConsent, setImportConsent] = useState(false);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [importSubmitted, setImportSubmitted] = useState(false);
  const [importError, setImportError] = useState('');

  const handleSubmit = async () => {
    if (!importSiteUrl || !importConsent) return;
    setImportSubmitting(true);
    setImportError('');
    try {
      await entities.ImportRequest.create({
        url: importSiteUrl,
        dealer_id: dealer.id,
        dealer_name: dealer.name,
        dealer_email: dealer.email,
        status: 'pending',
      });
      setImportSubmitted(true);
      queryClient.invalidateQueries(['importRequests']);
      toast.success(t('dealer.auto_import_sent', 'Заявка отправлена!'));
    } catch (e) {
      setImportError(e?.response?.data?.error || e?.message || t('dealer.auto_import_error', 'Ошибка отправки заявки'));
    }
    setImportSubmitting(false);
  };

  const resetForm = () => {
    setImportSubmitted(false);
    setImportError('');
    setImportSiteUrl('');
    setImportConsent(false);
  };

  return (
    <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <CloudUpload className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white">{t('dealer.auto_import_title', 'Импорт объявления по ссылке')}</h2>
          <p className="text-sm text-slate-500">{t('dealer.auto_import_desc', 'Вставьте ссылку на объявление — данные импортируются автоматически')}</p>
        </div>
      </div>
      {importSubmitted ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{t('dealer.auto_import_sent', 'Заявка отправлена!')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('dealer.auto_import_sent_desc', 'Администратор обработает её в ближайшее время')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={resetForm} className="border-[#292a32] text-slate-300 hover:bg-[#292a32] gap-1">
            <Plus className="w-4 h-4" /> {t('dealer.auto_import_another', 'Ещё одно')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label className="text-slate-400 mb-1 block">{t('dealer.auto_import_url_label', 'Ссылка на объявление')}</Label>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <Input value={importSiteUrl} onChange={e => setImportSiteUrl(e.target.value)} placeholder="https://example.com/listing/123" className="bg-[#101014] border-[#292a32] text-white" />
            </div>
            {importError && <p className="text-red-400 text-xs mt-1">{importError}</p>}
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#101014] rounded-xl border border-[#292a32]">
            <Checkbox id="import-consent-tab" checked={importConsent} onCheckedChange={setImportConsent} className="mt-0.5" />
            <label htmlFor="import-consent-tab" className="text-sm text-slate-400 leading-relaxed cursor-pointer">{t('dealer.auto_import_consent', 'Я подтверждаю право публикации')}</label>
          </div>
          <Button onClick={handleSubmit} disabled={!importSiteUrl || !importConsent || importSubmitting} className="gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 w-full sm:w-auto">
            {importSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
            {importSubmitting ? t('dealer.auto_import_loading', 'Импорт...') : t('dealer.auto_import_submit', 'Импортировать')}
          </Button>
        </div>
      )}
    </div>
  );
}