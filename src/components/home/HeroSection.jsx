import React from 'react';
import { useAdImage } from '@/lib/useAdConfig';

const DEFAULT_HERO_IMAGE = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/c35f368f7_2026-05-24144213.jpg';

// Full-width 10:3 banner on top of the home page. It shows the booked "hero-main" ad
// (random image per page load) or the default road photo when no ad is booked.
export default function HeroSection() {
  const ad = useAdImage('hero-main');
  const link = ad?.link && ad.link !== '#' ? ad.link : null;
  const image = (
    <img
      src={ad?.image || DEFAULT_HERO_IMAGE}
      alt={ad?.alt || 'CarUnity'}
      className="h-full w-full object-cover object-center" />
  );

  return (
    <div className="relative aspect-[10/3] w-full overflow-hidden bg-page">
      {link
        ? <a href={link} target={link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block h-full">{image}</a>
        : image}
    </div>
  );
}
