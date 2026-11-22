import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus, Edit, Trash2, Upload, X, Loader2, Tag, Image, AlignLeft, MoveUp, MoveDown, RefreshCw, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

function BlockEditor({ blocks, onChange }) {
  const [uploadingIdx, setUploadingIdx] = useState(null);

  const updateBlock = (idx, patch) => {
    const next = blocks.map((b, i) => i === idx ? { ...b, ...patch } : b);
    onChange(next);
  };

  const addTextBlock = (afterIdx) => {
    const next = [...blocks];
    next.splice(afterIdx + 1, 0, { type: 'text', value: '' });
    onChange(next);
  };

  const addImageBlock = (afterIdx) => {
    const next = [...blocks];
    next.splice(afterIdx + 1, 0, { type: 'image', url: '', caption: '' });
    onChange(next);
  };

  const removeBlock = (idx) => onChange(blocks.filter((_, i) => i !== idx));

  const moveBlock = (idx, dir) => {
    const next = [...blocks];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const uploadImage = async (idx, file) => {
    setUploadingIdx(idx);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateBlock(idx, { url: file_url });
    setUploadingIdx(null);
  };

  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => (
        <div key={idx} className="group relative border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
          <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 z-10 bg-white dark:bg-slate-800 rounded-lg shadow p-1">
            <button onClick={() => moveBlock(idx, -1)} className="p-1 text-slate-400 hover:text-slate-700"><MoveUp className="w-3.5 h-3.5" /></button>
            <button onClick={() => moveBlock(idx, 1)} className="p-1 text-slate-400 hover:text-slate-700"><MoveDown className="w-3.5 h-3.5" /></button>
            <button onClick={() => removeBlock(idx)} className="p-1 text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
          </div>

          {block.type === 'text' ? (
            <textarea
              value={block.value}
              onChange={e => updateBlock(idx, { value: e.target.value })}
              placeholder="Введите текст..."
              rows={4}
              className="w-full p-4 bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 resize-y text-sm leading-relaxed focus:outline-none rounded-xl"
            />
          ) : (
            <div className="p-4">
              {block.url ? (
                <div>
                  <img src={block.url} alt="" className="w-full max-h-64 object-cover rounded-lg mb-2" />
                  <input
                    value={block.caption || ''}
                    onChange={e => updateBlock(idx, { caption: e.target.value })}
                    placeholder="Подпись к фото (необязательно)"
                    className="w-full text-xs text-slate-500 bg-transparent border-b border-slate-200 pb-1 focus:outline-none"
                  />
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                  {uploadingIdx === idx ? (
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  ) : (
                    <>
                      <Image className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-400">Нажмите для загрузки фото</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadImage(idx, e.target.files[0])} />
                </label>
              )}
            </div>
          )}

          <div className="hidden group-hover:flex items-center gap-2 px-4 pb-2">
            <span className="text-xs text-slate-400">Добавить после:</span>
            <button onClick={() => addTextBlock(idx)} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded px-2 py-0.5">
              <AlignLeft className="w-3 h-3" /> Текст
            </button>
            <button onClick={() => addImageBlock(idx)} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded px-2 py-0.5">
              <Image className="w-3 h-3" /> Фото
            </button>
          </div>
        </div>
      ))}

      {blocks.length === 0 && (
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([{ type: 'text', value: '' }])} className="gap-1">
            <AlignLeft className="w-4 h-4" /> Добавить текст
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([{ type: 'image', url: '', caption: '' }])} className="gap-1">
            <Image className="w-4 h-4" /> Добавить фото
          </Button>
        </div>
      )}
    </div>
  );
}

const emptyForm = () => ({
  title: '',
  subtitle: '',
  cover_image: '',
  published_at: '',
  is_published: true,
  car_tags: [],
  blocks: [{ type: 'text', value: '' }]
});

export default function ArticleManagement({ user }) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const queryClient = useQueryClient();

  const handleParseNews = async () => {
    setParsing(true);
    setParseResult(null);
    toast.info('Парсинг запущен, это займёт ~1 минуту...');

    // Fire-and-forget: don't await the full response to avoid 504
    base44.functions.invoke('parseAutoNews', {}).then((res) => {
      setParseResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success(`Готово: добавлено ${res.data?.results?.length || 0} новых статей`);
      setParsing(false);
    }).catch(() => {
      // 504 means the function is still running in background — refresh after delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
        queryClient.invalidateQueries({ queryKey: ['articles'] });
        toast.success('Парсинг завершён, список обновлён');
        setParsing(false);
      }, 5000);
    });
  };

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['adminArticles'],
    queryFn: () => base44.entities.Article.list('-created_date', 100)
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, content: JSON.stringify(data.blocks) };
      delete payload.blocks;
      if (editingArticle) return base44.entities.Article.update(editingArticle.id, payload);
      return base44.entities.Article.create({ ...payload, author_email: user.email, author_name: user.full_name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setShowEditor(false);
      setEditingArticle(null);
      setForm(emptyForm());
      toast.success(editingArticle ? 'Статья обновлена' : 'Статья опубликована');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Article.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Удалено');
    }
  });

  const openEdit = (article) => {
    let blocks = [{ type: 'text', value: '' }];
    try { blocks = JSON.parse(article.content); } catch { blocks = [{ type: 'text', value: article.content || '' }]; }
    setEditingArticle(article);
    setForm({
      title: article.title,
      subtitle: article.subtitle || '',
      cover_image: article.cover_image || '',
      published_at: article.published_at || '',
      is_published: article.is_published,
      car_tags: article.car_tags || [],
      blocks
    });
    setShowEditor(true);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, cover_image: file_url }));
    setUploading(false);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.car_tags.includes(t)) setForm(f => ({ ...f, car_tags: [...f.car_tags, t] }));
    setTagInput('');
  };

  const removeTag = (tag) => setForm(f => ({ ...f, car_tags: f.car_tags.filter(t => t !== tag) }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">Статьи и новости ({articles.length})</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
            onClick={handleParseNews}
            disabled={parsing}
          >
            {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {parsing ? 'Парсинг...' : 'Спарсить новости'}
          </Button>
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 gap-2" onClick={() => { setForm(emptyForm()); setEditingArticle(null); setShowEditor(true); }}>
            <Plus className="w-4 h-4" /> Написать
          </Button>
        </div>
      </div>
      {parseResult && (
        <div className="mx-4 mt-3 mb-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-sm">
          <div className="flex items-center gap-2 font-medium text-blue-800 dark:text-blue-300 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            {parseResult.message}
          </div>
          <div className="flex flex-wrap gap-2">
            {parseResult.sources?.map((s, i) => (
              <span key={i} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                {s.source}: {s.processed ?? (s.status === 'fetch_failed' ? '❌ ошибка' : '0')} шт.
              </span>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
      ) : articles.length === 0 ? (
        <div className="p-12 text-center text-slate-400">Статей пока нет</div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {articles.map(article => (
            <div key={article.id} className="p-4 flex gap-4 items-center">
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                {article.cover_image ? (
                  <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{article.title}</p>
                  <Badge className={article.is_published ? 'bg-emerald-100 text-emerald-700 text-xs' : 'bg-slate-100 text-slate-600 text-xs'}>
                    {article.is_published ? 'Опубликована' : 'Черновик'}
                  </Badge>
                </div>
                {article.published_at && (
                  <p className="text-xs text-slate-400">
                    {format(new Date(article.published_at), 'H:mm · d MMM yyyy', { locale: ru })}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => openEdit(article)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить статью?</AlertDialogTitle>
                      <AlertDialogDescription>Действие нельзя отменить.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(article.id)} className="bg-red-600 hover:bg-red-700">Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Редактировать статью' : 'Новая статья'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <Label>Заголовок *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Заголовок статьи" />
            </div>
            <div>
              <Label>Подзаголовок</Label>
              <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Краткое описание" />
            </div>
            <div>
              <Label>Обложка (главное фото)</Label>
              {form.cover_image && <img src={form.cover_image} className="w-full h-40 object-cover rounded-xl mb-2" alt="" />}
              <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-emerald-500 transition-colors">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-slate-400" />}
                <span className="text-sm text-slate-500">{form.cover_image ? 'Заменить фото' : 'Загрузить обложку'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            </div>
            <div>
              <Label>Дата и время публикации</Label>
              <Input
                type="datetime-local"
                value={form.published_at}
                onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))}
              />
            </div>

            <div>
              <Label className="mb-3 block">Содержание статьи</Label>
              <p className="text-xs text-slate-400 mb-3">Наведите на блок, чтобы добавить текст или фото после него, переместить или удалить.</p>
              <BlockEditor blocks={form.blocks} onChange={blocks => setForm(f => ({ ...f, blocks }))} />
              {form.blocks.length > 0 && (
                <div className="flex gap-2 mt-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setForm(f => ({ ...f, blocks: [...f.blocks, { type: 'text', value: '' }] }))} className="gap-1">
                    <AlignLeft className="w-4 h-4" /> + Текст
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setForm(f => ({ ...f, blocks: [...f.blocks, { type: 'image', url: '', caption: '' }] }))} className="gap-1">
                    <Image className="w-4 h-4" /> + Фото
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <Label className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                Теги авто (для показа объявлений под статьёй)
              </Label>
              <div className="flex gap-2 mb-2">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Например: BMW 5 Series" />
                <Button type="button" variant="outline" onClick={addTag}>+</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.car_tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag} <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_published} onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))} />
              <Label>Опубликовать</Label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowEditor(false)}>Отмена</Button>
              <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.title} className="bg-emerald-500 hover:bg-emerald-600">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}