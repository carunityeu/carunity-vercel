import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InfoHint from './InfoHint';

export default function InfoBanner({ titleKey, descKey, storageKey }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(() => {
    if (!storageKey) return true;
    try { return localStorage.getItem(storageKey) !== '1'; } catch { return true; }
  });

  if (!show) {
    return (
      <div className="flex justify-end">
        <InfoHint titleKey={titleKey} descKey={descKey} side="bottom" align="end" />
      </div>
    );
  }

  const dismiss = () => {
    setShow(false);
    if (storageKey) { try { localStorage.setItem(storageKey, '1'); } catch {} }
  };

  return (
    <div className="flex items-start gap-3 bg-[#1b1b22] border border-[#292a32] rounded-2xl p-3 sm:p-4">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
        <Info className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{t(titleKey)}</p>
        <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{t(descKey)}</p>
      </div>
      <button
        onClick={dismiss}
        className="text-slate-500 hover:text-slate-300 flex-shrink-0 mt-0.5"
        aria-label={t('dealer.info_close')}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}