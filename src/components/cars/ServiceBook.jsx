import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Wrench,
  Plus,
  Image,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Pencil,
  Trash2,
  Languages,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru, enUS, et, lv, lt } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const dateFnsLocales = { ru, en: enUS, et, lv, lt };

const emptyForm = {
  date: '',
  type: 'maintenance',
  mileage: '',
  description: '',
  workshop_name: '',
  cost: '',
  photos: [],
};

export default function ServiceBook({ carId, isOwner }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const dateLocale = dateFnsLocales[i18n.language?.split('-')[0]] || ru;
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isUploading, setIsUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { photos: string[], index: number }
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const typeConfig = {
    maintenance: { label: t('service.type_maintenance', 'Техобслуживание'), color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    repair: { label: t('service.type_repair', 'Ремонт'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    parts: { label: t('service.type_parts', 'Замена запчастей'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    inspection: { label: t('service.type_inspection', 'Техосмотр'), color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    other: { label: t('service.type_other', 'Другое'), color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
  };

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['serviceRecords', carId],
    queryFn: () => base44.entities.ServiceRecord.filter({ car_id: carId }, '-date', 50),
    enabled: !!carId,
  });

  const addRecord = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ServiceRecord.create({ ...data, car_id: carId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRecords', carId] });
      toast.success(t('service.record_added', 'Запись добавлена в сервисную книжку'));
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (err) => {
      toast.error(err?.message || t('service.error', 'Ошибка при сохранении записи'));
    },
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.ServiceRecord.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRecords', carId] });
      toast.success(t('service.record_updated', 'Запись обновлена'));
      setOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: (err) => {
      toast.error(err?.message || t('service.error', 'Ошибка при сохранении записи'));
    },
  });

  // Auto-translate description to all 5 languages
  const translateDescription = async (text) => {
    if (!text?.trim()) return {};
    try {
      const LANG_CODES = ['en', 'ru', 'et', 'lv', 'lt'];
      const langNames = ['English', 'Русский', 'Eesti', 'Latviešu', 'Lietuvių'];
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Переведи следующее описание сервисных работ на эти языки: ${langNames.join(', ')}.

Верни JSON объект где ключи — коды языков (${LANG_CODES.join(', ')}), значения — переводы.
Сохрани технический стиль и точность. Переводи профессионально.

Описание для перевода:
${text}`,
        response_json_schema: {
          type: 'object',
          properties: Object.fromEntries(LANG_CODES.map(c => [c, { type: 'string' }])),
        },
      });
      return {
        description_en: result.en || '',
        description_ru: result.ru || '',
        description_et: result.et || '',
        description_lv: result.lv || '',
        description_lt: result.lt || '',
      };
    } catch {
      return {};
    }
  };

  // Get description in current UI language
  const getLocalizedDescription = (rec) => {
    if (!rec.description) return '';
    const lang = i18n.language?.slice(0, 2);
    const langField = `description_${lang}`;
    return rec[langField] || rec.description;
  };

  const deleteRecord = useMutation({
    mutationFn: async (id) => {
      await base44.entities.ServiceRecord.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceRecords', carId] });
      toast.success(t('service.record_deleted', 'Запись удалена'));
      setDeleteId(null);
    },
    onError: (err) => {
      toast.error(err?.message || t('service.error', 'Ошибка при удалении записи'));
    },
  });

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setIsUploading(true);
    const urls = [];
    for (const file of files) {
      const res = await base44.integrations.Core.UploadFile({ file });
      if (res.file_url) urls.push(res.file_url);
    }
    setForm(prev => ({ ...prev, photos: [...prev.photos, ...urls] }));
    setIsUploading(false);
  };

  const [isTranslating, setIsTranslating] = useState(false);

  const handleSubmit = async () => {
    if (!form.date || !form.type) {
      toast.error(t('service.fill_required', 'Заполните дату и тип работ'));
      return;
    }
    const payload = {
      ...form,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      cost: form.cost ? parseFloat(form.cost) : null,
    };

    // Auto-translate description if it changed and is non-empty
    const descChanged = editingId ? form.description !== (records.find(r => r.id === editingId)?.description || '') : !!form.description?.trim();
    if (descChanged && form.description?.trim()) {
      setIsTranslating(true);
      const translations = await translateDescription(form.description);
      Object.assign(payload, translations);
      setIsTranslating(false);
    }

    if (editingId) {
      updateRecord.mutate({ id: editingId, data: payload });
    } else {
      addRecord.mutate(payload);
    }
  };

  const openEditDialog = (rec) => {
    setEditingId(rec.id);
    setForm({
      date: rec.date || '',
      type: rec.type || 'maintenance',
      mileage: rec.mileage != null ? String(rec.mileage) : '',
      description: rec.description || '',
      workshop_name: rec.workshop_name || '',
      cost: rec.cost != null ? String(rec.cost) : '',
      photos: rec.photos || [],
    });
    setOpen(true);
  };

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const visible = showAll ? records : records.slice(0, 3);

  if (isLoading) return null;
  if (!isOwner && records.length === 0) return null;

  const recordsCount = records.length;
  const recordsLabel = recordsCount === 1
    ? t('service.record_one', 'запись')
    : recordsCount < 5
      ? t('service.record_few', 'записи')
      : t('service.record_many', 'записей');

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold leading-tight text-white md:text-xl">
            {t('service.title', 'Сервисная книжка')}
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">{recordsCount} {recordsLabel}</p>
        </div>
        {isOwner && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm(emptyForm); } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={openAddDialog}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('service.add_record', 'Добавить запись')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">
                  {editingId ? t('service.edit_record', 'Редактировать запись') : t('service.new_record', 'Новая запись обслуживания')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                      {t('service.field_date', 'Дата')} *
                    </label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                      {t('service.field_type', 'Тип работ')} *
                    </label>
                    <select
                      value={form.type}
                      onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                      className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white"
                    >
                      {Object.entries(typeConfig).map(([val, cfg]) => (
                        <option key={val} value={val}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                      {t('service.field_mileage', 'Пробег (км)')}
                    </label>
                    <Input
                      type="number"
                      placeholder="150 000"
                      value={form.mileage}
                      onChange={e => setForm(p => ({ ...p, mileage: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                      {t('service.field_cost', 'Стоимость (€)')}
                    </label>
                    <Input
                      type="number"
                      placeholder="250"
                      value={form.cost}
                      onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                    {t('service.field_workshop', 'СТО / Мастерская')}
                  </label>
                  <Input
                    placeholder={t('service.workshop_placeholder', 'Название сервиса')}
                    value={form.workshop_name}
                    onChange={e => setForm(p => ({ ...p, workshop_name: e.target.value }))}
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                    {t('service.field_description', 'Описание работ')}
                  </label>
                  <Textarea
                    placeholder={t('service.description_placeholder', 'Замена масла и фильтров...')}
                    rows={3}
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-emerald-500" />
                    {t('service.auto_translate_hint', 'При сохранении описание автоматически переводится на все 5 языков')}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                    {t('service.field_photos', 'Фото документов / чеков')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {form.photos.map((url, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setForm(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                      {isUploading ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin" /> : <Image className="w-5 h-5 text-slate-400" />}
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={addRecord.isPending || updateRecord.isPending || isTranslating}
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {(addRecord.isPending || updateRecord.isPending || isTranslating)
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : editingId ? t('service.save_changes', 'Сохранить изменения') : t('service.save_record', 'Сохранить запись')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Records list */}
      {records.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          <Wrench className="mx-auto mb-2 h-10 w-10 opacity-30" />
          <p className="text-sm">{t('service.no_records', 'Записей пока нет')}</p>
          {isOwner && <p className="text-xs mt-1">{t('service.add_first', 'Добавьте первую запись об обслуживании')}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((rec) => {
            const cfg = typeConfig[rec.type] || typeConfig.other;
            const numberFmt = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 });
            const pills = [
              cfg.label,
              format(new Date(rec.date), 'd MMMM yyyy', { locale: dateLocale }),
              rec.mileage ? `${numberFmt.format(rec.mileage)} ${t('car.km', 'км')}` : null,
              rec.cost ? `${numberFmt.format(rec.cost)} €` : null,
              rec.workshop_name || null,
            ].filter(Boolean);
            return (
              <div key={rec.id} className="flex items-start gap-3 rounded-xl bg-slate-800/60 p-4 md:gap-4">
                <div className="min-w-0 flex-1">
                  {rec.description && (
                    <p className="text-base font-semibold leading-snug text-white">{getLocalizedDescription(rec)}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {pills.map((label, i) => (
                      <span key={i} className="inline-flex items-center rounded-full bg-slate-950 px-3 py-1 text-xs text-slate-100 md:text-sm">
                        {label}
                      </span>
                    ))}

                    {isOwner && (
                      <span className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => openEditDialog(rec)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-emerald-900/20 hover:text-emerald-400"
                          title={t('service.edit', 'Редактировать')}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(rec.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-900/20 hover:text-red-500"
                          title={t('service.delete', 'Удалить')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {rec.photos?.length > 0 && (
                  <button
                    onClick={() => setLightbox({ photos: rec.photos, index: 0 })}
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-700 transition-opacity hover:opacity-90 md:h-24 md:w-24"
                  >
                    <img src={rec.photos[0]} alt="" className="h-full w-full object-cover" />
                    {rec.photos.length > 1 && (
                      <span className="absolute bottom-1 right-1 rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        +{rec.photos.length - 1}
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}

          {records.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex w-full items-center justify-center gap-1.5 py-2 text-sm text-slate-400 transition-colors hover:text-white"
            >
              {showAll
                ? <><ChevronUp className="w-4 h-4" /> {t('service.collapse', 'Свернуть')}</>
                : <><ChevronDown className="w-4 h-4" /> {t('service.show_all', 'Показать все')} {records.length} {recordsLabel}</>
              }
            </button>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox.photos[lightbox.index]} alt="" className="max-h-full max-w-full rounded-xl shadow-2xl" />

          {lightbox.photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((prev) => ({ ...prev, index: (prev.index - 1 + prev.photos.length) % prev.photos.length })); }}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label={t('carPage.prev_photo', 'Предыдущее фото')}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox((prev) => ({ ...prev, index: (prev.index + 1) % prev.photos.length })); }}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label={t('carPage.next_photo', 'Следующее фото')}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <button onClick={() => setLightbox(null)} className="absolute right-3 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t('service.delete_confirm_title', 'Удалить запись?')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              {t('service.delete_confirm_desc', 'Это действие нельзя отменить. Запись будет удалена навсегда.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              {t('service.cancel', 'Отмена')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteId) deleteRecord.mutate(deleteId); }}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
              disabled={deleteRecord.isPending}
            >
              {deleteRecord.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('service.delete', 'Удалить')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}