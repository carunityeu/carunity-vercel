import React, { useState } from 'react';
import PhotoDump from '@/components/car-details/PhotoDump';
import ImageLightbox from '@/components/cars/ImageLightbox';

// Photo list → tap a photo → full-screen zoomable viewer; closing the viewer returns to the list
export default function PhotoViewer({ images, title, onClose }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <>
      <PhotoDump images={images} title={title} onClose={onClose} onSelect={setOpenIndex} paused={openIndex !== null} />
      {openIndex !== null && (
        <ImageLightbox images={images} initialIndex={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
}