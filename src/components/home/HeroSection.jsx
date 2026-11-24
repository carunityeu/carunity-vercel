import React from 'react';
import { useAdImage } from '@/lib/useAdConfig';

const DEFAULT_HERO_IMAGE = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/c35f368f7_2026-05-24144213.jpg';

// Edge-to-edge banner on top of the home page: the booked "hero-main" ad (random image per page
// load) or the default road photo. Fixed heights instead of a ratio, so wide monitors do not push
// the page down: phone 2:1, tablet 280px, desktop 460px. From lg the search panel covers the
// bottom ~96px, so advertisers keep logos and text in the centre (see docs/DESIGN_CODE.md).
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
    <div className="relative aspect-[2/1] w-full overflow-hidden bg-page sm:aspect-auto sm:h-[280px] lg:h-[460px]">
      {link
        ? <a href={link} target={link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block h-full">{image}</a>
        : image}
    </div>
  );
}
