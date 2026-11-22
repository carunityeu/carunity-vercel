import React from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// Presentational image manager for one ad variant (default or a specific language)
export default function AdLanguageImages({
  images,
  linkUrl,
  isHero,
  maxImages,
  uploading,
  onUploadFile,
  onRemoveImage,
  onImageLink,
  onLinkUrl,
  emptyText = 'Нет изображений',
}) {
  return (
    <div className="p-4">
      {images.length === 0 ? (
        <p className="text-slate-500 text-xs text-center py-4">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative group bg-[#101014] border border-[#292a32] rounded-lg overflow-hidden">
              <div className={cn("relative bg-[#292a32]", isHero ? "aspect-[16/10]" : "aspect-[4/3]")}>
                <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Input
                    placeholder="Ссылка..."
                    defaultValue={img.link || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (img.link || '')) {
                        onImageLink(i, e.target.value);
                      }
                    }}
                    className="h-7 text-[10px] bg-[#101014] border-[#292a32] text-white"
                  />
                </div>
              </div>
              <button
                onClick={() => onRemoveImage(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
              {img.link && (
                <a href={img.link} target="_blank" rel="noopener noreferrer"
                  className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 text-white/70" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {images.length < maxImages && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files[0]) onUploadFile(e.target.files[0]);
                e.target.value = '';
              }}
            />
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#292a32] text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 text-xs transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Добавить изображение
            </div>
          </label>
        )}

        {images.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#292a32] bg-[#101014] flex-1 min-w-[200px]">
            <span className="text-xs text-slate-500 whitespace-nowrap">Общая ссылка:</span>
            <Input
              placeholder="https://..."
              defaultValue={linkUrl || ''}
              onBlur={(e) => {
                if (e.target.value !== (linkUrl || '')) {
                  onLinkUrl(e.target.value);
                }
              }}
              className="h-7 text-xs bg-transparent border-0 text-white px-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}