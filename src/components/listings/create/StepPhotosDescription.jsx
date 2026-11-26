import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Loader2, ImageIcon, Sparkles, Languages } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ImageCropModal from '@/components/listings/ImageCropModal';
import { listingDescriptionPrompt } from '@/lib/listingDescriptionPrompt';

const LANGS = ['ru', 'en', 'et', 'lv', 'lt'];

export default function StepPhotosDescription({ form, updateForm, setDescTranslations, t }) {
  const [cropQueue, setCropQueue] = useState([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    setCropQueue(prev => [...prev, ...files.map(f => ({ src: URL.createObjectURL(f) }))]);
  };

  const handleCropDone = async (blob) => {
    setCropQueue(prev => prev.slice(1));
    setUploadingCount(c => c + 1);
    const result = await base44.integrations.Core.UploadPublicFile({ file: new File([blob], 'photo.jpg', { type: 'image/jpeg' }) });
    if (result?.file_url) updateForm('images', [...form.images, result.file_url]);
    setUploadingCount(c => c - 1);
  };

  const generateDesc = async () => {
    setIsGenerating(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: listingDescriptionPrompt(form, form.powerUnit === 'kw' ? 'kW' : 'hp'),
      });
      updateForm('description', typeof res === 'string' ? res : res?.description || res);
      toast.success(t('listing.desc_generated'));
    } catch { toast.error(t('listing.desc_error')); }
    setIsGenerating(false);
  };

  const translateDesc = async () => {
    setIsTranslating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate this car listing description into these languages: ${LANGS.join(', ')}. Return a JSON object with language codes as keys. Keep the original tone.\n\n${form.description}`,
        response_json_schema: { type: 'object', properties: Object.fromEntries(LANGS.map(c => [c, { type: 'string' }])) },
      });
      setDescTranslations(result);
      toast.success(t('descriptionTranslator.success', 'Переведено на все языки!'));
    } catch { toast.error(t('descriptionTranslator.error', 'Ошибка при переводе. Попробуйте ещё раз.')); }
    setIsTranslating(false);
  };

  const photoCount = form.images.length;
  const hasPhotos = photoCount > 0;

  return (
    <div className="lc-photos">
      {/* Photos section */}
      <div className="lc-photo-section">
        <div className="lc-photo-head">
          <h4>{t('listing.cr_photos')}</h4>
          <span className="lc-photo-counter">{photoCount}/20</span>
        </div>

        <div className="lc-photo-grid">
          {form.images.map((img, idx) => (
            <div key={idx} className="lc-photo-tile lc-photo-filled">
              <img src={img} alt="" />
              {idx === 0 && <span className="lc-photo-cover">{t('listing.cr_cover_photo')}</span>}
              <button type="button" onClick={() => updateForm('images', form.images.filter((_, i) => i !== idx))} className="lc-photo-remove">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {form.images.length < 20 && (
            <label className={`lc-photo-tile lc-upload ${uploadingCount > 0 ? 'is-uploading' : ''}`}>
              {uploadingCount > 0 ? (
                <div className="lc-upload-inner">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{uploadingCount}</span>
                </div>
              ) : (
                <div className="lc-upload-inner">
                  <Plus className="w-7 h-7" />
                  <span>{t('listing.cr_add_photo')}</span>
                </div>
              )}
              <input aria-label={t('listing.add_up_to_20_photos')} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
            </label>
          )}
        </div>
        <p className="lc-photo-hint">{hasPhotos ? t('listing.cr_photo_hint') : t('listing.add_up_to_20_photos')}</p>
      </div>

      {cropQueue.length > 0 && <ImageCropModal imageSrc={cropQueue[0].src} onDone={handleCropDone} onCancel={() => setCropQueue(prev => prev.slice(1))} />}

      {/* Description section */}
      <div className="lc-desc-section">
        <div className="lc-description-head">
          <label htmlFor="listing-description">{t('listing.cr_description')}</label>
          <div className="lc-description-tools">
            <button type="button" className="lc-description-action" disabled={!form.description?.trim() || isTranslating} onClick={translateDesc}>
              {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}{t('listing.auto_translate')}
            </button>
            <button type="button" className="lc-description-action" disabled={!form.brand || !form.model || !form.year || isGenerating} onClick={generateDesc}>
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}{t('listing.generate')}
            </button>
          </div>
        </div>
        <Textarea id="listing-description" value={form.description} onChange={e => updateForm('description', e.target.value)} rows={5} placeholder={t('listing.cr_desc_placeholder')} className="lc-description focus-visible:ring-0 focus-visible:ring-offset-0" />
        <p className="lc-desc-hint">{t('listing.cr_desc_hint')}</p>
      </div>
    </div>
  );
}