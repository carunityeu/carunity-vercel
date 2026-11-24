import React, { useState } from 'react';
import { Car } from 'lucide-react';
import PromoPhotoFrame from '@/components/cars/PromoPhotoFrame';
import TileActions from '@/components/cars/TileActions';

// Photo area of a listing tile: hover gallery, compare/favorite actions and,
// for promoted listings, the TOP PICK / BOOST badge in the photo's cut-out corner.
export default function TileImageArea({ car, promotion = null, className = 'mb-2', radiusClass }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const images = car.images?.length > 0 ? car.images : null;
  const total = images ? images.length : 0;

  const handleMouseMove = (e) => {
    if (!images || total <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const section = Math.floor(((e.clientX - rect.left) / rect.width) * total);
    setImgIndex(Math.min(section, total - 1));
  };

  return (
    <PromoPhotoFrame
      promotion={promotion}
      exclusive={!!car.exclusive_listing}
      className={className}
      radiusClass={radiusClass}
      style={{ aspectRatio: '4/3' }}>
      <div
        className="absolute inset-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setImgIndex(0); }}
        onMouseMove={handleMouseMove}>
        {images ? (
          <img src={images[imgIndex]} alt={car.title} className="w-full h-full object-cover transition-none" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-raised">
            <Car className="w-10 h-10 text-ink-3" />
          </div>
        )}

        {/* Dot indicators — only on hover, only if multiple images */}
        {hovered && total > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 px-2">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-150 ${i === imgIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}
              />
            ))}
          </div>
        )}
      </div>

      <TileActions car={car} />
    </PromoPhotoFrame>
  );
}