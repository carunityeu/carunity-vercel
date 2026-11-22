import React from 'react';
import { Car as CarIcon } from 'lucide-react';
import StoryLogo from '@/components/cars/StoryLogo';
import StoryPill from '@/components/cars/StoryPill';
import { STORY_PHOTO_HEIGHT, STORY_PHOTO_WIDTH } from '@/lib/storyImage';

export default function StoryCard({ car, pills = [], priceLabel, photoSrc, logoSrc, icons = {} }) {
  const title = [car?.brand, car?.model].filter(Boolean).join(' ') || car?.title || '';
  const rows = [['date', 'mileage'], ['fuel', 'power', 'drive'], ['energy', 'transmission', 'country']]
    .map(keys => keys.map(key => pills.find(pill => pill.key === key)).filter(Boolean)).filter(row => row.length);
  const rowFont = row => Math.max(32, Math.min(50, Math.floor((STORY_PHOTO_WIDTH - row.length * 138 - (row.length - 1) * 20) / (row.reduce((sum, pill) => sum + pill.label.length, 0) * 0.55))));
  return (
    <div data-story-artwork style={{ position: 'relative', width: 1080, height: 1920, background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', padding: '290px 60px 0', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 160, left: 0, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <StoryLogo src={logoSrc} height={70} />
      </div>
      <div style={{ width: STORY_PHOTO_WIDTH, height: STORY_PHOTO_HEIGHT, borderRadius: 52, background: 'hsl(var(--muted))', overflow: 'hidden' }}>
        {photoSrc ? <img src={photoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--muted-foreground))' }}><CarIcon size={104} strokeWidth={1.5} /></div>}
      </div>
      <div style={{ margin: '36px 20px 0' }}>
        <h1 data-story-text style={{ margin: 0, fontSize: title.length > 42 ? 54 : title.length > 30 ? 62 : 70, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', overflowWrap: 'anywhere' }}>{title}</h1>
        <p data-story-text style={{ margin: '16px 0 0', minHeight: 47, color: 'hsl(var(--muted-foreground))', fontSize: 36, lineHeight: 1.3, fontWeight: 500 }}>{car?.trim_level || '\u00a0'}</p>
        {priceLabel && <p data-story-text style={{ margin: '20px 0 0', fontSize: 92, lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 700 }}>{priceLabel}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 32 }}>
        {rows.map((row, index) => <div key={index} style={{ display: 'flex', gap: 20, minWidth: 0 }}>
          {row.map(pill => <StoryPill key={pill.key} iconSrc={icons[pill.icon]} label={pill.label} fontSize={rowFont(row)} />)}
        </div>)}
      </div>
      <p data-story-text style={{ position: 'absolute', bottom: 92, left: 60, right: 60, margin: 0, textAlign: 'center', fontSize: 40, lineHeight: 1.2, fontWeight: 600 }}>www.carunity.eu</p>
    </div>
  );
}