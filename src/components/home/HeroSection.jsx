import React, { useEffect, useRef, useState } from 'react';
import { useAdImage } from '@/lib/useAdConfig';

const DEFAULT_HERO_IMAGE = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/c35f368f7_2026-05-24144213.jpg';

// Test creative (HTML5 banner 1614×480 from Google Ads). Shown only in test mode:
// open the site with ?hero_test=1 (remembered for the tab; ?hero_test=0 turns it off).
const TEST_CREATIVE = { src: 'https://s0.2mdn.net/dfp/274837/109987117/1795179510640/index.html', width: 1614, height: 480 };
function useHeroTest() {
  const [on] = useState(() => {
    try {
      const flag = new URLSearchParams(window.location.search).get('hero_test');
      if (flag === '1') sessionStorage.setItem('hero_test', '1');
      if (flag === '0') sessionStorage.removeItem('hero_test');
      return sessionStorage.getItem('hero_test') === '1';
    } catch { return false; }
  });
  return on;
}

/**
 * An HTML5 creative has a fixed size, so it is scaled to cover the hero like a photo with
 * object-cover (centred; the edges are cropped on narrow screens). Clicks are off in test mode.
 */
function CreativeFrame({ creative }) {
  const box = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const fit = () => setScale(Math.max(el.clientWidth / creative.width, el.clientHeight / creative.height));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [creative]);
  return (
    <div ref={box} className="relative h-full w-full overflow-hidden">
      <iframe
        title="Hero banner (test)"
        src={creative.src}
        width={creative.width}
        height={creative.height}
        loading="eager"
        sandbox="allow-scripts allow-same-origin"
        className="pointer-events-none absolute left-1/2 top-1/2 border-0"
        style={{ width: creative.width, height: creative.height, transform: `translate(-50%, -50%) scale(${scale})` }} />
    </div>
  );
}

// Edge-to-edge banner on top of the home page: the booked "hero-main" ad (random image per page
// load) or the default road photo. Fixed heights instead of a ratio, so wide monitors do not push
// the page down: phone 2:1, tablet 280px, desktop 460px. From lg the search panel covers the
// bottom ~96px, so advertisers keep logos and text in the centre (see docs/DESIGN_CODE.md).
export default function HeroSection() {
  const ad = useAdImage('hero-main');
  const testMode = useHeroTest();
  const link = ad?.link && ad.link !== '#' ? ad.link : null;
  const image = (
    <img
      src={ad?.image || DEFAULT_HERO_IMAGE}
      alt={ad?.alt || 'CarUnity'}
      className="h-full w-full object-cover object-center" />
  );

  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden bg-page sm:aspect-auto sm:h-[280px] lg:h-[460px]">
      {testMode ? <CreativeFrame creative={TEST_CREATIVE} />
        : link
          ? <a href={link} target={link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block h-full">{image}</a>
          : image}
    </div>
  );
}
