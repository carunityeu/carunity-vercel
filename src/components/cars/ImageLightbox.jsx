import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MAX_SCALE = 5;
const clamp = (s) => Math.min(MAX_SCALE, Math.max(1, s));
const ROUND_BTN = 'flex items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25';

// Full-screen viewer: wheel / buttons / double-click / pinch zoom, drag to pan, swipe to switch photos
export default function ImageLightbox({ images, initialIndex, onClose }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(initialIndex || 0);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map());
  const gesture = useRef({});

  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const zoomTo = useCallback((s) => {
    const ns = clamp(s);
    setScale(ns);
    if (ns === 1) setPos({ x: 0, y: 0 });
  }, []);

  useEffect(() => { setScale(1); setPos({ x: 0, y: 0 }); }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === '+' || e.key === '=') setScale((s) => clamp(s + 0.5));
      if (e.key === '-') zoomTo(scale - 0.5);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, next, prev, zoomTo, scale]);

  const dist = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      gesture.current = { pinchDist: dist(), pinchScale: scale };
    } else {
      gesture.current = { startX: e.clientX, startY: e.clientY, px: pos.x, py: pos.y, moved: false };
      setDragging(true);
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 2 && g.pinchDist) {
      zoomTo(g.pinchScale * (dist() / g.pinchDist));
    } else if (scale > 1 && g.startX !== undefined) {
      setPos({ x: g.px + e.clientX - g.startX, y: g.py + e.clientY - g.startY });
    }
  };

  const onPointerUp = (e) => {
    const g = gesture.current;
    const wasSingle = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) setDragging(false);
    if (wasSingle && scale === 1 && g.startX !== undefined && images.length > 1) {
      const dx = e.clientX - g.startX;
      if (Math.abs(dx) > 60 && Math.abs(e.clientY - g.startY) < 80) { dx < 0 ? next() : prev(); }
    }
    if (pointers.current.size < 2) g.pinchDist = null;
  };

  if (!images || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 select-none"
      style={{ touchAction: 'none' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onWheel={(e) => zoomTo(scale * (1 - e.deltaY * 0.002))}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}>
      <div className="absolute right-3 top-3 z-10 flex gap-2 sm:right-4 sm:top-4" onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" aria-label={t('carPage.zoom_out')} onClick={() => zoomTo(scale - 0.5)} className={`${ROUND_BTN} h-10 w-10`}><ZoomOut className="h-5 w-5" /></button>
        <button type="button" aria-label={t('carPage.zoom_in')} onClick={() => zoomTo(scale + 0.5)} className={`${ROUND_BTN} h-10 w-10`}><ZoomIn className="h-5 w-5" /></button>
        <button type="button" aria-label={t('carPage.close')} onClick={onClose} className={`${ROUND_BTN} h-10 w-10`}><X className="h-5 w-5" /></button>
      </div>

      {images.length > 1 && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white sm:left-4 sm:top-4">
          {index + 1} / {images.length}
        </div>
      )}

      {images.length > 1 && (
        <div onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={prev} className={`${ROUND_BTN} absolute left-2 top-1/2 z-10 h-11 w-11 -translate-y-1/2 md:left-6 md:h-12 md:w-12`}><ChevronLeft className="h-6 w-6" /></button>
          <button type="button" onClick={next} className={`${ROUND_BTN} absolute right-2 top-1/2 z-10 h-11 w-11 -translate-y-1/2 md:right-6 md:h-12 md:w-12`}><ChevronRight className="h-6 w-6" /></button>
        </div>
      )}

      <img
        src={images[index]}
        alt=""
        draggable={false}
        onDoubleClick={() => zoomTo(scale > 1 ? 1 : 2.5)}
        className="max-h-[80vh] max-w-[95vw] rounded-lg object-contain"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          transition: dragging ? 'none' : 'transform 0.15s ease-out',
          cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in'
        }}
      />

      {images.length > 1 && (
        <div
          className="scrollbar-hide absolute bottom-3 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto sm:bottom-4"
          onPointerDown={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-12 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all md:h-14 md:w-20 ${i === index ? 'border-emerald-500' : 'border-transparent opacity-50 hover:opacity-80'}`}>
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}