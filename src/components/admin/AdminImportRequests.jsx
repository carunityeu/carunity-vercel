import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CloudUpload, Loader2, CheckCircle2, XCircle, Link2, Trash2, ExternalLink, Car,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function AdminImportRequests() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Manual import form state
  const [manualUrl, setManualUrl] = useState('');
  const [manualDealerId, setManualDealerId] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState(null);

  // Request import state (from dealer requests)
  const [processingId, setProcessingId] = useState(null);

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['importRequests'],
    queryFn: () => entities.ImportRequest.list('-created_date', 100),
  });

  const { data: dealers = [], isLoading: loadingDealers } = useQuery({
    queryKey: ['adminDealers'],
    queryFn: () => entities.Dealer.list('-created_date', 200),
  });

  const deleteRequest = useMutation({
    mutationFn: (id) => entities.ImportRequest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['importRequests']);
      toast.success(t('admin.import_deleted', 'Заявка удалена'));
    },
  });

  const rejectRequest = useMutation({
    mutationFn: ({ id, notes }) => entities.ImportRequest.update(id, { status: 'rejected', admin_notes: notes || 'Отклонено администратором' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['importRequests']);
      toast.success(t('admin.import_rejected', 'Заявка отклонена'));
    },
  });

  const doImport = async (url, dealerId, dealerName, dealerEmail, requestId) => {
    try {
      const res = await base44.functions.invoke('importListingFromUrl', {
        url,
        dealerId,
        sellerEmail: dealerEmail,
      });
      const data = res?.data || res;
      if (data?.success && data?.car) {
        if (requestId) {
          await entities.ImportRequest.update(requestId, {
            status: 'imported',
            car_id: data.car.id,
            car_title: data.car.title,
          });
          queryClient.invalidateQueries(['importRequests']);
        }
        queryClient.invalidateQueries(['adminCars']);
        return data.car;
      } else {
        const errMsg = data?.error || t('admin.import_error', 'Ошибка импорта');
        if (requestId) {
          await entities.ImportRequest.update(requestId, {
            status: 'rejected',
            error_message: errMsg,
          });
          queryClient.invalidateQueries(['importRequests']);
        }
        throw new Error(errMsg);
      }
    } catch (e) {
      const errMsg = e?.response?.data?.error || e?.message || t('admin.import_error', 'Ошибка импорта');
      if (requestId) {
        try {
          await entities.ImportRequest.update(requestId, {
            status: 'rejected',
            error_message: errMsg,
          });
          queryClient.invalidateQueries(['importRequests']);
        } catch {}
      }
      throw new Error(errMsg);
    }
  };

  const handleManualImport = async () => {
    if (!manualUrl || !manualDealerId) return;
    setManualLoading(true);
    setManualResult(null);
    try {
      const dealer = dealers.find(d => d.id === manualDealerId);
      const car = await doImport(manualUrl, manualDealerId, dealer?.name, dealer?.owner_email, null);
      setManualResult({ success: true, car });
      setManualUrl('');
      toast.success(t('admin.import_success', 'Объявление импортировано!'));
    } catch (e) {
      setManualResult({ success: false, error: e.message });
      toast.error(e.message);
    }
    setManualLoading(false);
  };

  const handleProcessRequest = async (req) => {
    setProcessingId(req.id);
    try {
      const car = await doImport(req.url, req.dealer_id, req.dealer_name, req.dealer_email, req.id);
      toast.success(`${t('admin.import_success', 'Импортировано')}: ${car.title}`);
    } catch (e) {
      toast.error(e.message);
    }
    setProcessingId(null);
  };

  const handleRejectRequest = async (req) => {
    await rejectRequest.mutate({ id: req.id, notes: 'Отклонено' });
  };

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    imported: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };

  const statusLabels = {
    pending: t('admin.import_status_pending', 'Ожидает'),
    imported: t('admin.import_status_imported', 'Импортировано'),
    rejected: t('admin.import_status_rejected', 'Отклонено'),
  };

  return (
    <div className="space-y-6">
      {/* Manual import form */}
      <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <CloudUpload className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-white">{t('admin.import_manual_title', 'Импорт объявления по ссылке')}</h2>
            <p className="text-sm text-slate-500">{t('admin.import_manual_desc', 'Вставьте ссылку и выберите дилера — объявление создастся автоматически')}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-slate-400 text-sm mb-1 block">{t('admin.import_url_label', 'Ссылка на объявление')}</label>
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <Input
                value={manualUrl}
                onChange={e => setManualUrl(e.target.value)}
                placeholder="https://example.com/listing/123"
                className="bg-[#101014] border-[#292a32] text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-sm mb-1 block">{t('admin.import_dealer_label', 'Дилер')}</label>
            <Select value={manualDealerId} onValueChange={setManualDealerId}>
              <SelectTrigger className="bg-[#101014] border-[#292a32] text-white">
                <SelectValue placeholder={t('admin.import_dealer_placeholder', 'Выберите дилера')} />
              </SelectTrigger>
              <SelectContent className="bg-[#292a32] border-[#292a32] max-h-64">
                {dealers.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name} ({d.owner_email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleManualImport}
            disabled={!manualUrl || !manualDealerId || manualLoading}
            className="gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 w-full sm:w-auto"
          >
            {manualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
            {manualLoading ? t('admin.import_loading', 'Импорт...') : t('admin.import_submit', 'Импортировать')}
          </Button>

          {manualResult?.success && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-emerald-400 text-sm font-medium">{t('admin.import_success', 'Объявление импортировано!')}</p>
                <p className="text-white text-sm truncate">{manualResult.car.title} — {manualResult.car.price?.toLocaleString()} €</p>
              </div>
              <a href={`/#/cardetails/${manualResult.car.short_id || manualResult.car.id}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-emerald-500/40 text-emerald-400 gap-1">
                  <ExternalLink className="w-3.5 h-3.5" /> {t('admin.import_view', 'Открыть')}
                </Button>
              </a>
            </div>
          )}
          {manualResult && !manualResult.success && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{manualResult.error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Dealer requests list */}
      <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl">
        <div className="p-4 sm:p-5 border-b border-[#292a32]">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-emerald-400" />
            {t('admin.import_requests_title', 'Заявки на импорт от дилеров')}
          </h2>
        </div>
        {loadingRequests ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CloudUpload className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('admin.import_requests_empty', 'Заявок пока нет')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#292a32]">
            {requests.map(req => (
              <div key={req.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge className={statusColors[req.status]}>{statusLabels[req.status]}</Badge>
                    {req.dealer_name && <span className="text-sm font-medium text-white">{req.dealer_name}</span>}
                    {req.dealer_email && <span className="text-xs text-slate-500">· {req.dealer_email}</span>}
                  </div>
                  <a href={req.url} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 hover:underline truncate block max-w-full">
                    {req.url}
                  </a>
                  {req.car_title && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Car className="w-3 h-3" /> {req.car_title}
                    </p>
                  )}
                  {req.error_message && (
                    <p className="text-xs text-red-400 mt-1">{req.error_message}</p>
                  )}
                  <p className="text-xs text-slate-600 mt-1">{new Date(req.created_date).toLocaleString('ru-RU')}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {req.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleProcessRequest(req)}
                        disabled={processingId === req.id}
                        className="bg-emerald-500 hover:bg-emerald-600 gap-1"
                      >
                        {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                        <span className="hidden sm:inline">{t('admin.import_process', 'Парсить')}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(req)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {req.status === 'imported' && req.car_id && (
                    <a href={`/#/cardetails/${req.car_id}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="border-emerald-500/40 text-emerald-400 gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t('admin.import_view', 'Открыть')}</span>
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteRequest.mutate(req.id)}
                    className="border-[#292a32] text-slate-400 hover:bg-[#292a32]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}