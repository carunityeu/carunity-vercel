import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, ImagePlus, Languages, Loader2, Save, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { translateCountry, translateCity, CITIES_BY_COUNTRY } from '@/utils/locationUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fieldClass, NativeSelect } from '@/components/ds';
import SocialLinksEditor, { SOCIAL_PLATFORMS } from '@/components/dealer/SocialLinksEditor';
import WorkingHoursEditor from '@/components/dealer/WorkingHoursEditor';
import DealerTeamAssignments from '@/components/dealer/DealerTeamAssignments';
import { Card, Field } from './ui';

const LANGS = ['en', 'ru', 'et', 'lv', 'lt'];
const TEXT_FIELDS = ['name', 'phone', 'email', 'website', 'city', 'country', 'address', 'working_hours', 'description', 'logo', 'cover_image', 'cover_image_position'];
const FIELDS = [...TEXT_FIELDS, ...SOCIAL_PLATFORMS.map((p) => p.key)];
const pick = (d) => Object.fromEntries(FIELDS.map((k) => [k, d?.[k] ?? '']));

// Canonical country key for a stored value in any language ("Эстония" -> "Estonia")
const countryKey = (t, value) => Object.keys(CITIES_BY_COUNTRY).find((k) => k.toLowerCase() === String(value).toLowerCase() || translateCountry(t, k).toLowerCase() === String(value).toLowerCase()) || value;

async function translateDescription(text) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Translate this car dealership description into English, Russian, Estonian, Latvian and Lithuanian. Keep the tone. Return JSON with keys ${LANGS.join(', ')}.\n\n${text}`,
    response_json_schema: { type: 'object', properties: Object.fromEntries(LANGS.map((c) => [c, { type: 'string' }])) },
  });
  if (!LANGS.every((c) => typeof result?.[c] === 'string' && result[c].trim())) throw new Error('incomplete translation');
  return Object.fromEntries(LANGS.map((c) => [`description_${c}`, result[c]]));
}

function ImageField({ label, value, onChange, preview }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch {
      toast.error(t('dp.upload_unavailable', 'Загрузка файлов временно недоступна. Вставьте ссылку на изображение.'));
    } finally { setBusy(false); }
  };
  return (
    <Field label={label}>
      <div className="flex items-start gap-3">
        {preview}
        <div className="min-w-0 flex-1 space-y-2">
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" className={fieldClass} />
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-raised px-3 text-sm font-medium text-ink-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {t('dp.upload_file', 'Загрузить файл')}
            <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={busy} />
          </label>
        </div>
      </div>
    </Field>
  );
}

export default function SalonSettings({ dealer, cars, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => pick(dealer));
  const [saving, setSaving] = useState(false);
  const [rev, setRev] = useState(0); // remounts editors that keep their own state (working hours) on reset
  useEffect(() => setForm(pick(dealer)), [dealer]);

  const original = useMemo(() => pick(dealer), [dealer]);
  const dirty = FIELDS.some((k) => String(form[k] ?? '') !== String(original[k] ?? ''));
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));
  const country = countryKey(t, form.country);
  const cities = CITIES_BY_COUNTRY[country] || [];
  const [posX, posY] = String(form.cover_image_position || '50% 50%').split(' ').map((v) => parseInt(v, 10) || 50);

  const save = async () => {
    setSaving(true);
    const patch = Object.fromEntries(FIELDS.filter((k) => String(form[k] ?? '') !== String(original[k] ?? '')).map((k) => [k, form[k] === '' ? null : form[k]]));
    let translationFailed = false;
    if ('description' in patch) {
      if (patch.description?.trim()) {
        try { Object.assign(patch, await translateDescription(patch.description)); }
        catch {
          // Without a translation the other languages would keep the OLD text: clear them so the
          // page falls back to the new description in its original language.
          translationFailed = true;
          for (const c of LANGS) patch[`description_${c}`] = null;
        }
      } else for (const c of LANGS) patch[`description_${c}`] = null;
    }
    try {
      await entities.Dealer.update(dealer.id, patch);
      onSaved({ ...dealer, ...patch });
      if (translationFailed) toast.warning(t('dp.saved_no_translation', 'Сохранено. Перевод описания сейчас недоступен: на других языках покажется исходный текст.'));
      else toast.success(t('dealer.profile_saved', 'Сохранено'));
    } catch (e) {
      toast.error(t('dp.save_failed', 'Не удалось сохранить: {{msg}}', { msg: e.message }));
    } finally { setSaving(false); }
  };

  const saveTeam = async (employees) => {
    try {
      await entities.Dealer.update(dealer.id, { employees });
      onSaved({ ...dealer, employees });
      toast.success(t('dealerEmployees.saved'));
    } catch (e) { toast.error(t('dp.save_failed', 'Не удалось сохранить: {{msg}}', { msg: e.message })); }
  };

  return (
    <div className="space-y-5 pb-24">
      <div className="flex justify-end">
        <Link to={createPageUrl('DealerProfile') + `?id=${dealer.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-raised px-3 text-sm font-medium text-ink-2">
          <ExternalLink className="h-4 w-4" />{t('dp.open_salon_page', 'Страница салона')}
        </Link>
      </div>

      <Card title={t('dp.salon_main', 'Основное')} hint={t('dp.salon_main_hint', 'Так салон видят покупатели в каталоге и на его странице')}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('dealer.field_name', 'Название')}><Input value={form.name} onChange={set('name')} className={fieldClass} /></Field>
          <Field label={t('dealer.field_website', 'Сайт')}><Input value={form.website} onChange={set('website')} placeholder="https://" className={fieldClass} /></Field>
          <Field label={t('dashboard.field_phone', 'Телефон')}><Input value={form.phone} onChange={set('phone')} inputMode="tel" className={fieldClass} /></Field>
          <Field label={t('dp.contact_email', 'Email для покупателей')} hint={t('dp.contact_email_hint', 'Показывается на странице салона. Вход в панель — по вашему аккаунту.')}>
            <Input value={form.email} onChange={set('email')} type="email" className={fieldClass} />
          </Field>
          <Field label={t('dashboard.field_country', 'Страна')}>
            <NativeSelect value={country || ''} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value, city: '' }))}>
              <option value="">—</option>
              {!CITIES_BY_COUNTRY[country] && country && <option value={country}>{country}</option>}
              {Object.keys(CITIES_BY_COUNTRY).map((c) => <option key={c} value={c}>{translateCountry(t, c)}</option>)}
            </NativeSelect>
          </Field>
          <Field label={t('dashboard.field_city', 'Город')}>
            <Input value={form.city} onChange={set('city')} list="salon-cities" className={fieldClass} />
            <datalist id="salon-cities">{cities.map((c) => <option key={c} value={c}>{translateCity(t, c)}</option>)}</datalist>
          </Field>
          <Field label={t('dealer.field_address', 'Адрес')} className="md:col-span-2"><Input value={form.address} onChange={set('address')} className={fieldClass} /></Field>
        </div>
      </Card>

      <Card title={t('dealer.working_hours', 'Часы работы')}>
        <WorkingHoursEditor key={rev} value={form.working_hours || ''} onChange={set('working_hours')} />
      </Card>

      <Card title={t('dealer.field_description', 'Описание')} hint={t('dp.description_hint', 'Пишите на любом языке: при сохранении описание переводится на все 5 языков сайта.')}>
        <Textarea value={form.description} onChange={set('description')} rows={6} className="rounded-xl border-transparent bg-raised text-sm text-ink" />
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-3"><Languages className="h-3.5 w-3.5" />{t('dp.languages', 'English · Русский · Eesti · Latviešu · Lietuvių')}</p>
      </Card>

      <Card title={t('dealer.social_links', 'Социальные сети')} hint={t('dp.socials_hint', 'Ссылки показываются иконками на странице салона')}>
        <SocialLinksEditor form={form} onChange={(key, val) => setForm((f) => ({ ...f, [key]: val }))} />
      </Card>

      <Card title={t('dp.branding', 'Оформление')}>
        <div className="space-y-5">
          <ImageField label={t('dealer.logo', 'Логотип')} value={form.logo} onChange={set('logo')}
            preview={<div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-raised">{form.logo && <img src={form.logo} alt="" className="h-full w-full object-cover" />}</div>} />
          <ImageField label={t('dealer.cover_banner', 'Обложка')} value={form.cover_image} onChange={set('cover_image')} preview={null} />
          {form.cover_image && (
            <div className="space-y-3">
              <div className="h-40 overflow-hidden rounded-xl bg-raised">
                <img src={form.cover_image} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${posX}% ${posY}%` }} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[['x', posX, t('dealer.horizontal', 'По горизонтали')], ['y', posY, t('dealer.vertical', 'По вертикали')]].map(([axis, v, label]) => (
                  <label key={axis} className="flex items-center gap-3 text-sm text-ink-2">
                    <span className="w-28">{label}</span>
                    <input type="range" min={0} max={100} value={v} className="flex-1 accent-brand"
                      onChange={(e) => setForm((f) => ({ ...f, cover_image_position: axis === 'x' ? `${e.target.value}% ${posY}%` : `${posX}% ${e.target.value}%` }))} />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <DealerTeamAssignments employees={Array.isArray(dealer.employees) ? dealer.employees : []} cars={cars} companyEmail={dealer.email} onSave={saveTeam} />
      </Card>

      {/* One save for the whole form, shown only when something changed */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-6 py-3">
            <span className="mr-auto text-sm text-ink-2">{t('dp.unsaved', 'Есть несохранённые изменения')}</span>
            <Button variant="ghost" onClick={() => { setForm(original); setRev((r) => r + 1); }} disabled={saving}><Undo2 />{t('dp.discard', 'Отменить')}</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Save />}{t('dp.save_changes', 'Сохранить изменения')}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
