import React from 'react';
import { Check } from 'lucide-react';

export default function ListingColorSwatch({ color, label, active, onClick }) {
  return <button type="button" className="lc-swatch-button" aria-pressed={active} onClick={onClick}>
    <span className="lc-swatch" style={{ background: color }}>{active && <Check />}</span>
    <span>{label}</span>
  </button>;
}