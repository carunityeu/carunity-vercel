// Fuel icons of the listing tiles for electric cars (bolt) and hybrids (plug).
// Drawn as SVG in currentColor, so the color comes from a class (text-electric by default).
import React from 'react';
import { cn } from '@/lib/utils';

/** Rounded lightning bolt. */
export function BoltIcon({ className }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className={cn('text-electric', className)}>
      <path d="M305 62 118 244l106 8-17 198 187-182-106-8z" fill="currentColor" stroke="currentColor" strokeWidth="40" strokeLinejoin="round" />
    </svg>
  );
}

/** Plug with two prongs and a cord, tilted 45°. */
export function PlugIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('text-electric', className)}>
      <g transform="rotate(45 12 12)" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2.6V8M14.5 2.6V8M12 17.5v4" strokeWidth="2.2" fill="none" />
        <path d="M6.2 8.6h11.6v3.6a5.8 5.8 0 0 1-11.6 0z" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
