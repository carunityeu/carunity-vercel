import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { Loader2, Settings2, Plus, Globe, X } from 'lucide-react';
import { toast } from 'sonner';
import { AD_SLOTS } from '@/lib/adSlots';
import AdLanguageImages from './AdLanguageImages';

const MAX_IMAGES = 5;
const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'et', label: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', label: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', label: 'Lietuvių', flag: '🇱🇹' },
];

// images / link of one variant: null lang = default (fallback) variant
const imagesOf = (config, lang) => {
  if (lang === null || lang === undefined) return config?.images || [];
  return (config?.localizations || []).find(l => l.lang === lang)?.images || [];
};

const linkOf = (config, lang) => {
  if (lang === null || lang === undefined) return config?.link_url || '';
  return (config?.localizations || []).find(l => l.lang === lang)?.link_url || '';
};

const withImages = (config, lang, images) => {
  if (lang === null || lang === undefined) return { ...(config || {}), images };
  const locs = [...(config?.localizations || [])];
  const idx = locs.findIndex(l => l.lang === lang);
  if (idx >= 0) locs[idx] = { ...locs[idx], images };
  else locs.push({ lang, images, link_url: '' });
  return { ...(config || {}), localizations: locs };
};

const withLink = (config, lang, linkUrl) => {
  if (lang === null || lang === undefined) return { ...(config || {}), link_url: linkUrl };
  const locs = [...(config?.localizations || [])];
  const idx = locs.findIndex(l => l.lang === lang);
  if (idx >= 0) locs[idx] = { ...locs[idx], link_url: linkUrl };
  else locs.push({ lang, images: [], link_url: linkUrl });
  return { ...(config || {}), localizations: locs };
};

export default function AdminAds() {
  const queryClient = useQueryClient();
  const [uploadingKey, setUploadingKey] = useState(null);
  const [activeLangBySlot, setActiveLangBySlot] = useState({});
  const [langMenuOpen, setLangMenuOpen] = useState(null);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['adConfigurations'],
    queryFn: () => base44.entities.AdConfiguration.list(),
  });

  // Read-modify-write against fresh server data so a save never drops images added a moment ago
  const saveMutation = useMutation({
    mutationFn: async ({ slotId, title, build }) => {
      const list = await base44.entities.AdConfiguration.filter({ slot: slotId });
      const existing = list[0] || null;
      const next = build(existing);
      if (existing) return base44.entities.AdConfiguration.update(existing.id, next);
      return base44.entities.AdConfiguration.create({ slot: slotId, title, ...next });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adConfigurations'] });
      toast.success('Реклама сохранена');
    },
    onError: () => toast.error('Ошибка при сохранении'),
  });

  const save = (slotId, title, build) => saveMutation.mutateAsync({ slotId, title, build });

  const handleUpload = async (slotId, title, lang, file) => {
    setUploadingKey(`${slotId}|${lang ?? 'default'}`);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      await save(slotId, title, (config) => {
        const next = [...imagesOf(config, lang), { url: file_url, link: '', alt: title }].slice(0, MAX_IMAGES);
        return withImages(config, lang, next);
      });
    } catch (e) {
      toast.error('Ошибка загрузки');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleRemoveImage = (slotId, title, lang, index) => save(slotId, title, (config) =>
    withImages(config, lang, imagesOf(config, lang).filter((_, i) => i !== index))
  );

  const handleImageLink = (slotId, title, lang, index, link) => save(slotId, title, (config) =>
    withImages(config, lang, imagesOf(config, lang).map((img, i) => (i === index ? { ...img, link } : img)))
  );

  const handleLinkUrl = (slotId, title, lang, linkUrl) => save(slotId, title, (config) =>
    withLink(config, lang, linkUrl)
  );

  const handleToggle = (slotId, title, enabled) => save(slotId, title, (config) =>
    ({ ...(config || {}), enabled })
  );

  const handleAddLang = async (slotId, title, lang) => {
    setLangMenuOpen(null);
    await save(slotId, title, (config) => {
      const locs = [...(config?.localizations || [])];
      if (!locs.find(l => l.lang === lang)) locs.push({ lang, images: [], link_url: '' });
      return { ...(config || {}), localizations: locs };
    });
    setActiveLangBySlot(s => ({ ...s, [slotId]: lang }));
  };

  const handleRemoveLang = async (slotId, title, lang) => {
    await save(slotId, title, (config) => ({
      ...(config || {}),
      localizations: (config?.localizations || []).filter(l => l.lang !== lang),
    }));
    setActiveLangBySlot(s => ({ ...s, [slotId]: null }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-2">
        <div className="flex items-start gap-3">
          <Settings2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-medium text-sm">Управление рекламными баннерами</h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Вкладка «По умолчанию» — fallback для языков без локализации. Добавьте варианты для нужных языков — показывается вариант, соответствующий языку интерфейса пользователя. До {MAX_IMAGES} изображений на вариант, ротация при перезагрузке.
            </p>
          </div>
        </div>
      </div>

      {AD_SLOTS.map((slotDef) => {
        const config = configs.find(c => c.slot === slotDef.slot);
        const isHero = slotDef.format === 'hero';
        const activeLang = activeLangBySlot[slotDef.slot] ?? null;
        const images = imagesOf(config, activeLang);
        const linkUrl = linkOf(config, activeLang);
        const locs = config?.localizations || [];
        const availableLangs = LANGUAGES.filter(l => !locs.find(lo => lo.lang === l.code));
        const maxImages = Math.max(1, slotDef.maxImages || MAX_IMAGES);

        return (
          <div key={slotDef.slot} className="bg-[#1b1b22] border border-[#292a32] rounded-2xl">
            {/* Header */}
            <div className="p-4 border-b border-[#292a32] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium text-sm truncate">{slotDef.title}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 uppercase">
                    {slotDef.format}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5 truncate">{slotDef.description}</p>
                {slotDef.placement && (
                  <p className="text-emerald-500/80 text-[11px] mt-0.5 truncate">Показ: {slotDef.placement}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-500 hidden sm:block">
                  {images.length}/{maxImages}
                </span>
                <Switch
                  checked={config?.enabled !== false}
                  onCheckedChange={(v) => handleToggle(slotDef.slot, slotDef.title, v)}
                />
              </div>
            </div>

            {/* Language tabs — scrollable row + dropdown button kept outside overflow */}
            <div className="flex items-center gap-1.5 px-3 sm:px-4 pt-3 pb-2 border-b border-[#292a32]">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
                <button
                  onClick={() => setActiveLangBySlot(s => ({ ...s, [slotDef.slot]: null }))}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                    activeLang === null
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  По умолчанию
                </button>
                {locs.map((loc) => {
                  const langDef = LANGUAGES.find(l => l.code === loc.lang);
                  return (
                    <div key={loc.lang} className="flex items-center">
                      <button
                        onClick={() => setActiveLangBySlot(s => ({ ...s, [slotDef.slot]: loc.lang }))}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                          activeLang === loc.lang
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        <span>{langDef?.flag}</span>
                        {langDef?.label || loc.lang}
                      </button>
                      <button
                        onClick={() => handleRemoveLang(slotDef.slot, slotDef.title, loc.lang)}
                        className="ml-0.5 w-5 h-5 rounded-full hover:bg-red-500/20 flex items-center justify-center text-slate-500 hover:text-red-400"
                        title="Удалить локализацию"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {availableLangs.length > 0 && (
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setLangMenuOpen(langMenuOpen === slotDef.slot ? null : slotDef.slot)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap text-slate-400 hover:text-emerald-400 border border-dashed border-[#292a32] hover:border-emerald-500/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Язык
                  </button>
                  {langMenuOpen === slotDef.slot && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(null)} />
                      <div className="absolute right-0 top-full mt-1 z-50 bg-[#101014] border border-[#292a32] rounded-lg shadow-2xl py-1 min-w-[150px]">
                        {availableLangs.map(l => (
                          <button
                            key={l.code}
                            onClick={() => handleAddLang(slotDef.slot, slotDef.title, l.code)}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300 text-left"
                          >
                            <span>{l.flag}</span>
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Images for active variant */}
            <AdLanguageImages
              images={images}
              linkUrl={linkUrl}
              isHero={isHero}
              maxImages={maxImages}
              uploading={uploadingKey === `${slotDef.slot}|${activeLang ?? 'default'}`}
              onUploadFile={(file) => handleUpload(slotDef.slot, slotDef.title, activeLang, file)}
              onRemoveImage={(index) => handleRemoveImage(slotDef.slot, slotDef.title, activeLang, index)}
              onImageLink={(index, link) => handleImageLink(slotDef.slot, slotDef.title, activeLang, index, link)}
              onLinkUrl={(value) => handleLinkUrl(slotDef.slot, slotDef.title, activeLang, value)}
              emptyText={activeLang === null ? 'Нет изображений — используется стандартная реклама' : 'Нет изображений для этого языка — будет показан вариант по умолчанию'}
            />
          </div>
        );
      })}
    </div>
  );
}