import React from 'react';
import { ArrowRight } from 'lucide-react';

const ILLUSTRATIONS = [
  'https://base44.app/api/apps/6973f00466c3a37f3d8e7e53/files/mp/public/6973f00466c3a37f3d8e7e53/e2adfe174_applyfirst.png',
  'https://base44.app/api/apps/6973f00466c3a37f3d8e7e53/files/mp/public/6973f00466c3a37f3d8e7e53/6677deaf0_yourdealership.png',
];

export default function DealerRegistrationIntro({ t, onStart }) {
  return <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
    {['intro', 'reviewIntro'].map((key, index) => <section key={key} className={`flex flex-col items-center gap-6 py-5 sm:gap-10 sm:py-8 ${index ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
      <div className="min-w-0 flex-1 md:p-5">
        {index === 0 ? <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl">{t('title')}</h1> : <h2 className="mb-4 text-2xl font-bold leading-tight sm:text-3xl">{t('reviewTitle')}</h2>}
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{t(key)}</p>
      </div>
      <div className="w-full min-w-0 flex-1 overflow-hidden rounded-2xl bg-[#1a1c1e] md:max-w-[46%]">
        <img
          src={ILLUSTRATIONS[index]}
          alt={index === 0 ? t('title') : t('reviewTitle')}
          className={`${index === 0 ? 'aspect-square' : 'aspect-[16/10]'} w-full object-contain`}
          loading="lazy"
        />
      </div>
    </section>)}

    <div className="flex justify-center pt-4"><button type="button" onClick={onStart} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground sm:w-auto">{t('start')}<ArrowRight className="h-4 w-4" /></button></div>
  </div>;
}