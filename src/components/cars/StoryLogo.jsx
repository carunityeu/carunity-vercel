import React from 'react';

/**
 * CarUnity mark for the story card.
 * Uses the brand logo once it is available as a data URL,
 * otherwise falls back to a wordmark so the export never breaks.
 */
export default function StoryLogo({ src, height = 96 }) {
  if (src) {
    return (
      <img
        src={src}
        alt="CarUnity"
        crossOrigin="anonymous"
        style={{ height, width: 'auto', display: 'block' }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        fontSize: height * 0.82,
        lineHeight: 1,
        fontWeight: 800,
        letterSpacing: '-0.03em',
      }}
    >
      <span style={{ color: '#ffffff' }}>C</span>
      <span style={{ color: '#10b981' }}>U</span>
    </div>
  );
}