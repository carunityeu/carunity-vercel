import React from 'react';

// PNG icons are white-on-black. We use CSS mask with luminance mode:
// white (high luminance) becomes the visible icon, black (low luminance) becomes transparent.
// backgroundColor: currentColor inherits the text color (white on the emerald nav bar).

function PngMaskIcon({ url, className }) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'currentColor',
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        maskMode: 'luminance',
        WebkitMaskMode: 'luminance',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

export function SparkIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2 7l7 2l-7 2l-2 7l-2-7l-7-2l7-2l2-7z" />
    </svg>
  );
}

export function CarIcon({ className }) {
  return <PngMaskIcon url="https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/a38c14073_icons8-sedan-96.png" className={className} />;
}

export function SuvIcon({ className }) {
  return <PngMaskIcon url="https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/e93cf159c_icons8-suv-96.png" className={className} />;
}

export function MotorcycleIcon({ className }) {
  return <PngMaskIcon url="https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/4c1b7d3d8_icons8-motorcycle-96.png" className={className} />;
}

export function TractorIcon({ className }) {
  return <PngMaskIcon url="https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/228d93111_icons8-tractor-96.png" className={className} />;
}

export function DamagedIcon({ className }) {
  return <PngMaskIcon url="https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/de365420b_icons8-car-crash-96.png" className={className} />;
}