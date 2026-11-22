import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  X,
  Link2,
  Check,
  Facebook,
  Mail,
  Instagram,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import StoryShareTab from './StoryShareTab';

export default function ShareModal({ open, onClose, car, shareUrl }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);

  useEffect(() => {
    if (open) setStoryOpen(false);
  }, [open]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return '';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const carTitle = car ? `${car.brand} ${car.model} ${car.year}` : '';
  const carPrice = car ? formatPrice(car.price) : '';
  const thumbnail = car?.images?.[0] || '';

  const shareText = shareUrl;

  const fetchImageBlob = useCallback(async (url) => {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) return null;
      return await res.blob();
    } catch {
      return null;
    }
  }, []);

  const handleCopy = useCallback(async () => {
    // Try to copy text + image together (rich paste into messengers)
    const imgBlob = thumbnail ? await fetchImageBlob(thumbnail) : null;
    if (imgBlob && window.ClipboardItem && navigator.clipboard?.write) {
      try {
        const imgType = imgBlob.type || 'image/png';
        const item = new ClipboardItem({
          'text/plain': new Blob([shareText], { type: 'text/plain' }),
          [imgType]: imgBlob,
        });
        await navigator.clipboard.write([item]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch {}
    }
    // Fallback: copy text only
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('share.copy_link'));
    }
  }, [shareUrl, shareText, thumbnail, fetchImageBlob, t]);

  const handleFacebook = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }, [shareUrl]);

  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent(
      carTitle ? `${carTitle} — CarUnity` : t('share.title')
    );
    const body = encodeURIComponent(shareUrl);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [carTitle, carPrice, shareUrl, t]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const sharingButtons = [
    {
      id: 'copy',
      icon: copied ? Check : Link2,
      label: copied ? t('share.copied') : t('share.copy_link'),
      onClick: handleCopy,
      active: copied,
    },
    {
      id: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      onClick: handleFacebook,
    },
    {
      id: 'email',
      icon: Mail,
      label: 'Email',
      onClick: handleEmail,
    },
    {
      id: 'story',
      icon: Instagram,
      label: t('story.tab'),
      onClick: () => setStoryOpen((value) => !value),
      active: storyOpen,
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-slate-900 dark:bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl mx-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start gap-3 p-5 sm:p-6 border-b border-slate-700/50 bg-slate-900">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <h2 className="text-base sm:text-lg font-semibold text-white leading-tight">
                  {t('share.title')}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {t('share.subtitle')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* Listing Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-700">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={carTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Share2 className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-[15px] font-semibold text-white truncate">
                    {carTitle}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">
                    {carPrice}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">carunity.eu</p>
                </div>
              </div>

              {/* Sharing Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {sharingButtons.map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={btn.id}
                      onClick={btn.onClick}
                      className={`group flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border transition-all ${
                        btn.active
                          ? 'bg-emerald-500/15 border-emerald-500/50'
                          : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors ${
                          btn.active
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-700/70 text-slate-300 group-hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-xs text-center leading-tight ${
                          btn.active ? 'text-emerald-400 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {btn.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {storyOpen && <StoryShareTab car={car} shareUrl={shareUrl} />}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}