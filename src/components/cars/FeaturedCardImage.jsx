import React, { useState, useRef, useEffect } from 'react';
import { Car } from 'lucide-react';

/**
 * Featured card image with hover-driven gallery.
 * Splits the image width into N zones (max 3); moving the cursor
 * horizontally switches the displayed photo with a smooth crossfade.
 * No zoom, no arrows, no click required.
 */
export default function FeaturedCardImage({ car }) {
  const images = (car.images?.filter(Boolean) || []).slice(0, 3);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef(null);

  // Preload all images so switching is instant
  useEffect(() => {
    images.forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [car.id]);

  const handleMouseMove = (e) => {
    if (images.length <= 1) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width;
    const zone = Math.min(Math.floor(relX * images.length), images.length - 1);
    if (zone !== currentIdx) setCurrentIdx(zone);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setCurrentIdx(0);
  };

  if (!images.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Car className="w-10 h-10 text-slate-400" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}>
      {images.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={car.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: idx === currentIdx ? 1 : 0,
            transition: 'none',
          }}
        />
      ))}
      {/* Very subtle dot hint — only when hovering and more than 1 image */}
      {images.length > 1 && hovered && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
          {images.map((_, idx) => (
            <span
              key={idx}
              className="w-1.5 h-1.5 rounded-full transition-opacity duration-200"
              style={{
                backgroundColor: '#fff',
                opacity: idx === currentIdx ? 0.9 : 0.35,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}