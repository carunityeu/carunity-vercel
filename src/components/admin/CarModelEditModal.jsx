import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_FORM = {
  title: '', brand: '', model: '', years: '', cover_image: '',
  gallery_images: [], short_description: '', description: '',
  user_rating: '', rating_votes: 0,
  pros: [], cons: [], body_types: [],
  is_published: false
};

export default function CarModelEditModal({ model, open, onOpenChange, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [newBodyType, setNewBodyType] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (model) {
      setForm({
        ...EMPTY_FORM,
        ...model,
        user_rating: model.user_rating ?? '',
        pros: model.pros || [],
        cons: model.cons || [],
        body_types: model.body_types || [],
        gallery_images: model.gallery_images || [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [model, open]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (model?.id) {
        return entities.CarModelInfo.update(model.id, data);
      } else {
        return entities.CarModelInfo.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCarModels']);
      queryClient.invalidateQueries(['publishedCarModels']);
      toast.success(model?.id ? 'Обзор обновлён' : 'Обзор создан');
      onSaved?.();
      onOpenChange(false);
    }
  });

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, cover_image: file_url }));
    } catch {
      toast.error('Ошибка загрузки изображения');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title || !form.brand || !form.model) {
      toast.error('Заполните название, марку и модель');
      return;
    }
    const data = {
      ...form,
      user_rating: form.user_rating !== '' ? parseFloat(form.user_rating) : null,
      rating_votes: form.rating_votes || 0
    };
    mutation.mutate(data);
  };

  const addItem = (field, value, setter) => {
    if (!value.trim()) return;
    setForm(f => ({ ...f, [field]: [...(f[field] || []), value.trim()] }));
    setter('');
  };

  const removeItem = (field, idx) => {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{model?.id ? 'Редактировать обзор' : 'Новый обзор модели'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Марка *</Label>
              <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="BMW" />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Модель *</Label>
              <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="X5" />
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Заголовок *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="BMW X5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Годы выпуска</Label>
              <Input value={form.years} onChange={e => setForm(f => ({ ...f, years: e.target.value }))} placeholder="2006–2013" />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Оценка (1–10)</Label>
              <Input type="number" min="1" max="10" step="0.1" value={form.user_rating} onChange={e => setForm(f => ({ ...f, user_rating: e.target.value }))} placeholder="8.5" />
            </div>
          </div>

          {/* Cover image */}
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Главное изображение</Label>
            <div className="flex gap-2">
              <Input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="https://..." className="flex-1" />
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                <Button type="button" variant="outline" size="sm" disabled={uploadingCover} asChild>
                  <span>{uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}</span>
                </Button>
              </label>
            </div>
            {form.cover_image && (
              <img src={form.cover_image} alt="" className="mt-2 h-32 w-full object-cover rounded-lg" />
            )}
          </div>

          {/* Short description */}
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Краткое описание (для карточки)</Label>
            <Textarea value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} rows={2} placeholder="Короткое описание для превью..." />
          </div>

          {/* Full description */}
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Полное описание / история</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={6} placeholder="Подробная информация о модели..." />
          </div>

          {/* Body types */}
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Типы кузова</Label>
            <div className="flex gap-2 mb-2">
              <Input value={newBodyType} onChange={e => setNewBodyType(e.target.value)} placeholder="Седан" onKeyDown={e => e.key === 'Enter' && addItem('body_types', newBodyType, setNewBodyType)} />
              <Button type="button" variant="outline" size="sm" onClick={() => addItem('body_types', newBodyType, setNewBodyType)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.body_types.map((bt, i) => (
                <span key={i} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-sm">
                  {bt}
                  <button onClick={() => removeItem('body_types', i)}><X className="w-3 h-3 text-slate-400 hover:text-red-500" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Pros */}
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Достоинства</Label>
            <div className="flex gap-2 mb-2">
              <Input value={newPro} onChange={e => setNewPro(e.target.value)} placeholder="Добавить достоинство" onKeyDown={e => e.key === 'Enter' && addItem('pros', newPro, setNewPro)} />
              <Button type="button" variant="outline" size="sm" onClick={() => addItem('pros', newPro, setNewPro)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <ul className="space-y-1">
              {form.pros.map((p, i) => (
                <li key={i} className="flex items-center justify-between text-sm bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
                  <span className="text-slate-700 dark:text-slate-300">✓ {p}</span>
                  <button onClick={() => removeItem('pros', i)}><X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" /></button>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Недостатки</Label>
            <div className="flex gap-2 mb-2">
              <Input value={newCon} onChange={e => setNewCon(e.target.value)} placeholder="Добавить недостаток" onKeyDown={e => e.key === 'Enter' && addItem('cons', newCon, setNewCon)} />
              <Button type="button" variant="outline" size="sm" onClick={() => addItem('cons', newCon, setNewCon)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <ul className="space-y-1">
              {form.cons.map((c, i) => (
                <li key={i} className="flex items-center justify-between text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                  <span className="text-slate-700 dark:text-slate-300">✗ {c}</span>
                  <button onClick={() => removeItem('cons', i)}><X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" /></button>
                </li>
              ))}
            </ul>
          </div>

          {/* Gallery */}
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Галерея (URL)</Label>
            <div className="flex gap-2 mb-2">
              <Input value={newGalleryUrl} onChange={e => setNewGalleryUrl(e.target.value)} placeholder="https://..." onKeyDown={e => e.key === 'Enter' && addItem('gallery_images', newGalleryUrl, setNewGalleryUrl)} />
              <Button type="button" variant="outline" size="sm" onClick={() => addItem('gallery_images', newGalleryUrl, setNewGalleryUrl)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.gallery_images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="h-16 w-24 object-cover rounded-lg" />
                  <button onClick={() => removeItem('gallery_images', i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center gap-3 py-2">
            <Switch checked={form.is_published} onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))} />
            <Label>Опубликовано</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Отмена</Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (model?.id ? 'Сохранить' : 'Создать')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}