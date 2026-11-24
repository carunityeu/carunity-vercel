import React from 'react';

const TAG_PATH =
  'M58 0 H352 C373 0 390 17 390 38 V82 C390 103 373 120 352 120 H58 C44 120 35 112 25 102 L12 89 C-4 73 -4 47 12 31 L25 18 C35 8 44 0 58 0 Z';

// Бирка скидки: синяя только у электромобилей, у остальных — стандартная зелёная
export default function DiscountTag({ label, electric = false, story = false }) {
  return (
    <span className={story ? 'relative inline-flex items-center h-[60px] pl-10 pr-6 flex-shrink-0' : 'relative inline-flex items-center h-[18px] sm:h-5 pl-[13px] pr-2.5 flex-shrink-0'}>
      <svg
        viewBox="0 0 390 120"
        preserveAspectRatio="none"
        className={`absolute inset-0 w-full h-full ${electric ? 'text-[#465A90]' : 'text-emerald-500'}`}
        aria-hidden="true"
      >
        <path d={TAG_PATH} fill="currentColor" />
      </svg>
      <span className={story ? 'absolute left-[9%] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-card' : 'absolute left-[9%] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white dark:bg-slate-900'} />
      <span data-story-text={story ? '' : undefined} className={story ? 'relative text-[30px] font-bold leading-none text-white whitespace-nowrap' : 'relative text-[11px] sm:text-[11px] font-bold leading-none text-white whitespace-nowrap'}>
        {label}
      </span>
    </span>
  );
}