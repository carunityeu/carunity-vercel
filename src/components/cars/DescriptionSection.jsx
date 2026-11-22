import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CollapsibleCard from '@/components/car-details/CollapsibleCard';

const COLLAPSE_THRESHOLD = 300;

function DescriptionBody({ text }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [isLong, setIsLong] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    setIsLong(ref.current.scrollHeight > 160 || (text?.length || 0) > COLLAPSE_THRESHOLD);
  }, [text]);

  return (
    <>
      <div
        ref={ref}
        className={`whitespace-pre-wrap text-sm leading-relaxed text-slate-300 ${!expanded && isLong ? 'relative max-h-[160px] overflow-hidden' : ''}`}>
        {!expanded && isLong && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent" />
        )}
        {text}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? t('car.show_less', t('service.collapse', 'Свернуть')) : t('car.show_more', t('dealer.read_more', 'Читать дальше'))}
        </button>
      )}
    </>
  );
}

export default function DescriptionSection({ text }) {
  const { t } = useTranslation();
  if (!text) return null;
  return (
    <CollapsibleCard title={t('car.description')}>
      <DescriptionBody text={text} />
    </CollapsibleCard>
  );
}