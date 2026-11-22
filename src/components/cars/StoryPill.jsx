import React from 'react';

export default function StoryPill({ iconSrc, label, fontSize = 50 }) {
  if (!label) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, background: 'hsl(var(--input))', borderRadius: 26, padding: '24px 36px', boxSizing: 'border-box', height: 124, minWidth: 0, maxWidth: '100%', flexShrink: 1 }}>
      {iconSrc && <img src={iconSrc} alt="" style={{ width: 44, height: 44, objectFit: 'contain', display: 'block', flexShrink: 0 }} />}
      <span data-story-text style={{ color: 'hsl(var(--foreground))', fontSize, fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.01em', minWidth: 0, overflowWrap: 'anywhere' }}>{label}</span>
    </div>
  );
}