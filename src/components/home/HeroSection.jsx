import React from 'react';
import { useAdImage } from '@/lib/useAdConfig';

const DEFAULT_HERO_IMAGE = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/c35f368f7_2026-05-24144213.jpg';

export default function HeroSection() {
  // Pick a random ad image for the hero (changes per page reload)
  const heroAd = useAdImage('hero-main');

  // If ad config exists, use it; otherwise use default hero image
  const heroImage = heroAd?.image || DEFAULT_HERO_IMAGE;
  const heroLink = heroAd?.link && heroAd.link !== '#' ? heroAd.link : null;
  const isAd = !!heroAd;

  return (
    <section className="w-full">
      <div className="relative w-full overflow-hidden bg-[#0e1117]" style={{ aspectRatio: '10 / 3' }}>
        {/* Banner image */}
        {heroLink ? (
          <a
            href={heroLink}
            target={heroLink.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="absolute inset-0 block"
          >
            <img
              src={heroImage}
              alt={heroAd?.alt || 'CarUnity'}
              className="w-full h-full object-cover object-center"
            />
          </a>
        ) : (
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={heroImage}
              alt={heroAd?.alt || 'CarUnity'}
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}


      </div>
    </section>
  );
}