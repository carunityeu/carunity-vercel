import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Download, Instagram, Loader2 } from 'lucide-react';
import StoryCard from './StoryCard';
import {
  STORY_HEIGHT,
  STORY_LOGO_URL,
  STORY_WIDTH,
  buildStoryFile,
  buildStoryFilename,
  copyText,
  downloadBlob,
  loadStoryIcons,
  renderStoryBlob,
  shareStoryFile,
  supportsFileShare,
  toDataUrl,
  toStoryPhotoDataUrl,
  waitForPaint,
} from '@/lib/storyImage';
import { buildStoryPills, formatStoryPrice } from '@/lib/storySpecs';

const PRIMARY_BTN =
  'inline-flex w-full sm:flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-900 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
const SECONDARY_BTN =
  'inline-flex w-full sm:flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60';

export default function StoryShareTab({ car, shareUrl }) {
  const { t, i18n } = useTranslation();
  const exportRef = useRef(null);
  const blobRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [assets, setAssets] = useState({ photo: null, logo: null, icons: {} });
  const [ready, setReady] = useState(false);
  const [building, setBuilding] = useState(false);
  const [busy, setBusy] = useState(null);
  const [done, setDone] = useState(null);
  const [failed, setFailed] = useState(null);
  const [canShare] = useState(() => supportsFileShare());

  const pills = useMemo(() => buildStoryPills(car, t, i18n.language), [car, t, i18n.language]);
  const priceLabel = formatStoryPrice(car?.price, i18n.language);
  const copyValue = shareUrl || (car?.short_id ? `https://carunity.eu/cardetails/${car.short_id}` : '');
  const cardProps = useMemo(() => ({
    car, pills, priceLabel,
    photoSrc: assets.photo, logoSrc: assets.logo, icons: assets.icons,
  }), [car, pills, priceLabel, assets]);

  const carId = car?.id;

  useEffect(() => {
    let alive = true;
    setReady(false);
    setImageUrl(null);
    blobRef.current = null;
    Promise.all([toStoryPhotoDataUrl(car?.images?.[0]), toDataUrl(STORY_LOGO_URL), loadStoryIcons()])
      .then(([photo, logo, icons]) => {
        if (alive) setAssets({ photo, logo, icons });
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [carId, car?.images?.[0]]);

  const buildImage = useCallback(async () => {
    if (blobRef.current) return blobRef.current;
    await waitForPaint();
    const blob = await renderStoryBlob(exportRef.current);
    blobRef.current = blob;
    return blob;
  }, []);

  // The preview displays the actual exported PNG, so spacing and type cannot drift.
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    let url;
    blobRef.current = null;
    setImageUrl(null);
    setBuilding(true);
    setDone(null);
    setFailed(null);
    const prepare = async () => {
      await waitForPaint();
      const blob = await renderStoryBlob(exportRef.current);
      if (!alive) return;
      blobRef.current = blob;
      url = URL.createObjectURL(blob);
      setImageUrl(url);
    };
    prepare()
      .catch(() => { if (alive) setFailed('render'); })
      .finally(() => { if (alive) setBuilding(false); });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [ready, cardProps]);

  const sendToApps = async (blob) => {
    try {
      const handedOver = await shareStoryFile(buildStoryFile(blob, car));
      if (handedOver) {
        setDone('share');
      } else {
        downloadBlob(blob, buildStoryFilename(car));
        setDone('download');
      }
    } catch (err) {
      console.error('[StoryShare] share sheet refused', err);
      setFailed('share');
    }
  };

  const handleShare = async () => {
    if (busy || building) return;
    setFailed(null);
    setDone(null);
    if (copyValue) copyText(copyValue);
    // Image already rendered: hands it over straight from the tap.
    if (blobRef.current) return sendToApps(blobRef.current);
    setBusy('share');
    try {
      await sendToApps(await buildImage());
    } catch (err) {
      console.error('[StoryShare] build failed', err);
      setFailed('render');
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async () => {
    if (busy || building) return;
    setFailed(null);
    setDone(null);
    setBusy('download');
    try {
      const blob = await buildImage();
      downloadBlob(blob, buildStoryFilename(car));
      if (copyValue) copyText(copyValue);
      setDone('download');
    } catch (err) {
      console.error('[StoryShare] download failed', err);
      setFailed('render');
    } finally {
      setBusy(null);
    }
  };

  const preparing = building || busy === 'share';

  return (
    <div className="space-y-4 border-t border-slate-700/50 pt-5">
      <p className="text-center text-xs text-slate-400 sm:text-sm">{t('story.subtitle')}</p>

      <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-2xl border border-border bg-background">
        {imageUrl ? <img data-story-preview src={imageUrl} alt={t('story.subtitle')} className="block h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" aria-label={t('story.preparing')} /></div>}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {canShare && (
          <button
            onClick={handleShare}
            disabled={!imageUrl || preparing || !!busy}
            className={PRIMARY_BTN}
          >
            {preparing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Instagram className="w-4 h-4" />
            )}
            {preparing ? t('story.preparing') : t('story.send')}
          </button>
        )}
        <button
          onClick={handleDownload}
          disabled={!imageUrl || preparing || !!busy}
          className={canShare ? SECONDARY_BTN : PRIMARY_BTN}
        >
          {busy === 'download' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {busy === 'download' ? t('story.preparing') : t('story.download')}
        </button>
      </div>

      {!ready && (
        <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {t('story.loading_assets')}
        </p>
      )}

      {failed && (
        <p
          className={`flex items-start gap-2 text-xs ${
            failed === 'share' ? 'text-amber-400' : 'text-red-400'
          }`}
        >
          <AlertCircle className="mt-px h-4 w-4 shrink-0" />
          {failed === 'share' ? t('story.error_share') : t('story.error')}
        </p>
      )}

      {done && (
        <div className="space-y-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="text-xs font-medium text-emerald-300">
            {done === 'share' ? t('story.after_share') : t('story.after_download')}
          </p>
          <p className="text-[11px] leading-snug text-emerald-400/80">{t('story.link_sticker')}</p>
        </div>
      )}

      <p className="text-xs leading-snug text-slate-500">
        {canShare ? t('story.hint_mobile') : t('story.hint_desktop')}
      </p>

      {createPortal(
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: -STORY_WIDTH * 2,
            width: STORY_WIDTH,
            height: STORY_HEIGHT,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div ref={exportRef}>
            <StoryCard {...cardProps} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}