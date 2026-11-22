import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Languages, Loader2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'et', label: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', label: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', label: 'Lietuvių', flag: '🇱🇹' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
];

const ALL_LANG_CODES = LANGUAGES.map(l => l.code);

export default function DescriptionTranslator({ description, onTranslationsDone }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState({}); // { en: '...', et: '...' }
  const [previewLang, setPreviewLang] = useState(null);

  const handleTranslate = async () => {
    if (!description?.trim()) {
      toast.error(t('descriptionTranslator.fillFirst', 'Сначала заполните описание'));
      return;
    }

    setIsTranslating(true);
    try {
      const langNames = LANGUAGES.map(l => l.label).join(', ');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Переведи следующее описание автомобиля на эти языки: ${langNames}.

Верни JSON объект где ключи — коды языков (${ALL_LANG_CODES.join(', ')}), значения — переводы.
Сохрани стиль и тон оригинала. Переводи профессионально.

Описание для перевода:
${description}`,
        response_json_schema: {
          type: 'object',
          properties: Object.fromEntries(ALL_LANG_CODES.map(c => [c, { type: 'string' }])),
        },
      });

      setTranslations(result);
      if (onTranslationsDone) onTranslationsDone(result);
      setPreviewLang('en');
      toast.success(t('descriptionTranslator.success', 'Переведено на все языки!'));
    } catch {
      toast.error(t('descriptionTranslator.error', 'Ошибка при переводе. Попробуйте ещё раз.'));
    }
    setIsTranslating(false);
  };

  const doneCount = Object.keys(translations).length;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Languages className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('descriptionTranslator.title', 'Авто-перевод описания')}
          </span>
          {doneCount > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
              {doneCount} / {ALL_LANG_CODES.length} ✓
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('descriptionTranslator.hint', 'AI переведёт описание сразу на все языки. Покупатели увидят описание на своём языке.')}
          </p>

          {/* Language status grid (display only) */}
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map(lang => {
              const isDone = !!translations[lang.code];
              return (
                <div
                  key={lang.code}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
                    isDone
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <span>{lang.flag}</span>
                  <span className="flex-1">{lang.label}</span>
                  {isDone && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Translate button */}
          <Button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating || !description?.trim()}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isTranslating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t('descriptionTranslator.translating', 'Переводю...')}</>
            ) : (
              <><Languages className="w-4 h-4" /> {t('descriptionTranslator.translateAll', 'Перевести на все языки')}</>
            )}
          </Button>

          {/* Preview translations */}
          {doneCount > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {t('descriptionTranslator.preview', 'Предпросмотр перевода')}
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {ALL_LANG_CODES.filter(c => translations[c]).map(code => {
                  const lang = LANGUAGES.find(l => l.code === code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setPreviewLang(previewLang === code ? null : code)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                        previewLang === code
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      )}
                    >
                      {lang?.flag} {lang?.label}
                    </button>
                  );
                })}
              </div>
              {previewLang && translations[previewLang] && (
                <Textarea
                  readOnly
                  value={translations[previewLang]}
                  rows={4}
                  className="resize-none text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}