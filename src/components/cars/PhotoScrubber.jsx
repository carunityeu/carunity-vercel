import React, { useEffect, useRef, useState } from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MAX_TILE_PHOTOS = 5;
const SWIPE_PX = 30;

/** Up to five usable photo URLs of a listing (empty and non-http entries dropped). */
export const tilePhotos = (car) =>
  (Array.isArray(car?.images) ? car.images : [])
    .filter((src) => typeof src === 'string' && /^https?:\/\//.test(src.trim()))
    .slice(0, MAX_TILE_PHOTOS);

/**
 * Quick photo browsing on a listing tile.
 * Mouse: the photo is split into equal zones, moving across it shows the matching photo.
 * Touch: swipe left/right. All photos (max 5) are stacked and preloaded on first contact,
 * so switching is instant; segment bars show the position. Starts from the first photo
 * again when the pointer leaves or the listing changes.
 */
export default function PhotoScrubber({ car, alt, className, children }) {
  const photos = tilePhotos(car);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);   // pointer over the photo / touched
  const [warm, setWarm] = useState(false);       // other photos may load now
  const [loaded, setLoaded] = useState({});      // photo index -> finished loading
  const lastShown = useRef(0);
  const touch = useRef(null);
  const swiped = useRef(false);

  useEffect(() => { setIndex(0); setWarm(false); setLoaded({}); lastShown.current = 0; }, [car?.id]);

  // Never flash an empty frame: until the wanted photo has loaded, keep the last loaded one on screen
  if (loaded[index] || index === 0) lastShown.current = index;
  const shown = lastShown.current;

  const many = photos.length > 1;
  const zoneAt = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width - 1);
    return Math.floor((x / rect.width) * photos.length);
  };

  const handlers = many ? {
    onPointerEnter: (e) => { if (e.pointerType === 'mouse') { setWarm(true); setActive(true); } },
    onPointerMove: (e) => { if (e.pointerType === 'mouse') { const z = zoneAt(e); if (z !== index) setIndex(z); } },
    onPointerLeave: (e) => { if (e.pointerType === 'mouse') { setActive(false); setIndex(0); } },
    onTouchStart: (e) => { setWarm(true); setActive(true); swiped.current = false; touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; },
    onTouchEnd: (e) => {
      const start = touch.current;
      touch.current = null;
      if (!start) return;
      const dx = e.changedTouches[0].clientX - start.x;
      const dy = e.changedTouches[0].clientY - start.y;
      if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return; // a tap or a page scroll
      swiped.current = true;
      setIndex((i) => Math.min(Math.max(i + (dx < 0 ? 1 : -1), 0), photos.length - 1));
    },
    // A swipe must not open the listing
    onClickCapture: (e) => { if (swiped.current) { e.preventDefault(); e.stopPropagation(); swiped.current = false; } },
  } : {};

  return (
    <div className={cn('relative overflow-hidden bg-raised', className)} {...handlers}>
      {photos.length ? photos.map((src, i) => (
        // Only the first photo loads up front; the rest load once the tile is touched or hovered
        (i === 0 || warm) && (
          <img
            key={src + i}
            src={src}
            alt={i === 0 ? alt : ''}
            loading={i === 0 ? 'lazy' : 'eager'}
            decoding="async"
            draggable={false}
            onLoad={() => setLoaded((l) => (l[i] ? l : { ...l, [i]: true }))}
            className={cn('absolute inset-0 h-full w-full select-none object-cover', i === shown ? 'opacity-100' : 'opacity-0')} />
        )
      )) : (
        <div className="absolute inset-0 flex items-center justify-center"><Car className="h-8 w-8 text-ink-3" /></div>
      )}

      {/* Position bars: on hover with a mouse, always on touch screens */}
      {many && (
        <div className={cn('pointer-events-none absolute inset-x-3 bottom-2.5 flex gap-1',
          !active && '[@media(hover:hover)]:hidden')}>
          {photos.map((_, i) => (
            <span key={i} className={cn('h-[3px] flex-1 rounded-full', i === index ? 'bg-white' : 'bg-white/40')} />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
