import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* -------- shared mini browser frame -------- */
function BrowserFrame({ children }) {
  return (
    <div className="w-[260px] sm:w-[300px] rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex flex-col shadow-inner flex-shrink-0">
      <div className="h-4 bg-slate-800 flex items-center gap-1 px-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
        <span className="w-1.5 h-1.5 rounded-full bg-green-400/70" />
        <span className="ml-1.5 flex-1 h-1.5 rounded-full bg-slate-700" />
      </div>
      <div className="h-4 bg-slate-800/80 flex items-center px-1.5 gap-1">
        <span className="w-5 h-1.5 rounded bg-emerald-500" />
        <span className="w-6 h-1 rounded-full bg-slate-600" />
        <span className="w-6 h-1 rounded-full bg-slate-600" />
        <span className="w-6 h-1 rounded-full bg-slate-600" />
      </div>
      {children}
    </div>
  );
}

function AdTag({ label }) {
  return <span className="absolute left-1.5 top-0.5 text-[6px] text-white/55 tracking-wide">{label}</span>;
}

/* A. Banner between sections */
function BetweenSectionsScene() {
  return (
    <BrowserFrame>
      <div className="flex-1 px-1.5 py-1.5 space-y-1.5">
        <div className="h-1.5 w-16 rounded-full bg-slate-600" />
        <div className="grid grid-cols-3 gap-1">
          <div className="h-7 rounded bg-slate-700/60" />
          <div className="h-7 rounded bg-slate-700/60" />
          <div className="h-7 rounded bg-slate-700/60" />
        </div>
        {/* highlighted ad banner between sections */}
        <div className="h-8 rounded bg-gradient-to-r from-emerald-600 to-emerald-500 flex items-center justify-center relative ring-1 ring-emerald-400/50">
          <AdTag label="AD" />
          <span className="text-[7px] font-bold text-white tracking-wider">In-Feed Banner · 970×250</span>
        </div>
        <div className="h-1.5 w-16 rounded-full bg-slate-600" />
        <div className="grid grid-cols-3 gap-1">
          <div className="h-7 rounded bg-slate-700/60" />
          <div className="h-7 rounded bg-slate-700/60" />
          <div className="h-7 rounded bg-slate-700/60" />
        </div>
      </div>
    </BrowserFrame>
  );
}

/* B. After Listing Ad — последний слайд галереи объявления */
function AfterListingScene() {
  return (
    <BrowserFrame>
      <div className="flex-1 px-1.5 py-1.5 space-y-1.5">
        {/* listing title */}
        <div className="h-1.5 w-20 rounded-full bg-slate-500" />
        <div className="h-1 w-14 rounded-full bg-slate-600" />
        {/* gallery viewport — ad slide active, fills the same container as a photo */}
        <div className="relative h-20 rounded bg-gradient-to-br from-emerald-600 to-emerald-500 overflow-hidden ring-1 ring-emerald-400/50">
          <AdTag label="AD" />
          <span className="absolute bottom-1 left-1 text-[6px] font-bold text-white tracking-wider">Listing Spotlight</span>
          {/* left arrow: came from last photo */}
          <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-black/50 flex items-center justify-center">
            <span className="text-[7px] text-white leading-none">‹</span>
          </div>
          {/* slide counter */}
          <div className="absolute bottom-1 right-1 text-[6px] text-white/80 bg-black/40 px-1 rounded">6 / 6 · AD</div>
        </div>
        {/* thumbnail strip: photos + AD thumb as the last slide */}
        <div className="flex gap-0.5">
          <div className="w-4 h-3 rounded-sm bg-slate-700/70" />
          <div className="w-4 h-3 rounded-sm bg-slate-700/70" />
          <div className="w-4 h-3 rounded-sm bg-slate-700/70" />
          <div className="w-4 h-3 rounded-sm bg-slate-700/70" />
          <div className="w-4 h-3 rounded-sm bg-slate-700/70" />
          {/* AD thumbnail — highlighted, last */}
          <div className="w-4 h-3 rounded-sm bg-emerald-600 ring-1 ring-emerald-400 flex items-center justify-center">
            <span className="text-[6px] text-white font-bold">AD</span>
          </div>
        </div>
        {/* transition hint: last photo → ad slide */}
        <div className="flex items-center gap-1 text-[6px] text-slate-400">
          <span>5</span>
          <span>→</span>
          <span className="text-emerald-400 font-semibold">Listing Spotlight</span>
        </div>
      </div>
    </BrowserFrame>
  );
}

/* C. Homepage Hero */
function HomepageHeroScene() {
  return (
    <BrowserFrame>
      {/* full-screen hero as ad */}
      <div className="relative h-[76px] flex items-center px-2.5 overflow-hidden" style={{ background: 'linear-gradient(120deg,#065f46,#101014)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/40 to-transparent" />
        <AdTag label="AD · 1920×600" />
        <div className="relative z-10">
          <div className="h-2.5 w-24 rounded bg-white/90" />
          <div className="mt-1 h-1.5 w-16 rounded bg-white/60" />
          <div className="mt-1.5 inline-block h-3 w-12 rounded bg-emerald-400" />
        </div>
      </div>
      <div className="flex-1 px-1.5 py-1.5 space-y-1.5">
        <div className="grid grid-cols-3 gap-1">
          <div className="h-7 rounded bg-slate-700/60" />
          <div className="h-7 rounded bg-slate-700/60" />
          <div className="h-7 rounded bg-slate-700/60" />
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="h-7 rounded bg-slate-700/60" />
          <div className="h-7 rounded bg-slate-700/60" />
          <div className="h-7 rounded bg-slate-700/60" />
        </div>
      </div>
    </BrowserFrame>
  );
}

const SCENES = {
  between: { Scene: BetweenSectionsScene, captionKey: 'advertising.preview_between_caption', size: '970 × 250 px' },
  afterlisting: { Scene: AfterListingScene, captionKey: 'advertising.preview_afterlisting_caption', size: '1600 × 1000 px' },
  hero: { Scene: HomepageHeroScene, captionKey: 'advertising.preview_hero_caption', size: '1920 × 600 px' },
};

export default function AdFormatPreviewBadge({ type }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ side: 'right', v: 'below', mobile: false });
  const containerRef = useRef(null);
  const btnRef = useRef(null);
  const config = SCENES[type] || SCENES.between;
  const Scene = config.Scene;

  const computePos = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 640;
    const POPW = 340;
    const POPH = 400;
    if (isMobile) {
      setPos({ side: 'right', v: 'below', mobile: true });
      return;
    }
    const spaceRight = vw - r.right;
    const spaceLeft = r.left;
    const ratio = spaceRight / (spaceRight + spaceLeft);
    let side;
    if (ratio > 0.42 && ratio < 0.58) side = 'center';
    else if (spaceRight >= spaceLeft) side = 'right';
    else side = 'left';
    // ensure chosen side has room
    if (side === 'right' && spaceRight < POPW + 20) side = spaceLeft > POPW + 20 ? 'left' : 'center';
    if (side === 'left' && spaceLeft < POPW + 20) side = spaceRight > POPW + 20 ? 'right' : 'center';
    if (side === 'center' && (spaceRight < POPW / 2 + 20 || spaceLeft < POPW / 2 + 20)) {
      side = spaceRight >= spaceLeft ? 'right' : 'left';
    }
    const spaceBelow = vh - r.bottom;
    const v = spaceBelow > POPH + 24 ? 'below' : 'above';
    setPos({ side, v, mobile: false });
  };

  const openPopover = () => { computePos(); setOpen(true); };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    const rhandler = () => computePos();
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    window.addEventListener('resize', rhandler);
    window.addEventListener('scroll', rhandler, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
      window.removeEventListener('resize', rhandler);
      window.removeEventListener('scroll', rhandler, true);
    };
  }, [open]);

  // positioning classes
  let posClass, arrowHClass, origin;
  if (pos.mobile) {
    posClass = 'top-full mt-2 left-0';
    arrowHClass = 'left-2';
    origin = 'origin-top-left';
  } else if (pos.side === 'center') {
    posClass = pos.v === 'below' ? 'top-full mt-2 left-1/2 -translate-x-1/2' : 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    arrowHClass = 'left-1/2 -translate-x-1/2';
    origin = pos.v === 'below' ? 'origin-top' : 'origin-bottom';
  } else if (pos.side === 'right') {
    posClass = pos.v === 'below' ? 'top-full mt-2 left-full ml-2' : 'bottom-full mb-2 left-full ml-2';
    arrowHClass = 'left-2';
    origin = pos.v === 'below' ? 'origin-top-left' : 'origin-bottom-left';
  } else {
    posClass = pos.v === 'below' ? 'top-full mt-2 right-full mr-2' : 'bottom-full mb-2 right-full mr-2';
    arrowHClass = 'right-2';
    origin = pos.v === 'below' ? 'origin-top-right' : 'origin-bottom-right';
  }

  const arrowVert = pos.v === 'above' ? '-bottom-1.5 border-r border-b' : '-top-1.5 border-l border-t';
  const animClass = open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none';

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={openPopover}
        onMouseLeave={() => setOpen(false)}
        onClick={() => { if (open) setOpen(false); else openPopover(); }}
        aria-label="Preview"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 dark:hover:text-emerald-400 dark:hover:border-emerald-400 transition-colors align-middle"
      >
        <Info className="w-3 h-3" />
      </button>

      <div
        onMouseEnter={openPopover}
        onMouseLeave={() => setOpen(false)}
        className={`absolute z-50 transition-all duration-200 ${origin} ${posClass} ${animClass}`}
      >
        {/* arrow */}
        <div className={`absolute w-3 h-3 rotate-45 bg-slate-800 border-slate-700 ${arrowVert} ${arrowHClass}`} />
        <div className="relative rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-3 w-fit max-w-[calc(100vw-1.5rem)]">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 sm:hidden"
          >
            <X className="w-3 h-3" />
          </button>
          <Scene />
          <div className="mt-2 w-[260px] sm:w-[300px]">
            <p className="text-xs font-medium text-slate-300 text-center">{t(config.captionKey)}</p>
            <p className="mt-1 text-[11px] text-slate-500 text-center">
              <span className="text-slate-400">{t('advertising.size_label')}:</span>{' '}{config.size}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}