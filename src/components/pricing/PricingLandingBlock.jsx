import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PricingLandingBlock({
  image, imageAlt, title, description, buttonText, buttonTo, reverse,
}) {
  return (
    <div className="overflow-hidden">
      <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-white mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
            {description}
          </p>
          <Link
            to={buttonTo}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 text-sm sm:text-base transition-colors"
          >
            {buttonText}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex-1 min-h-[240px] sm:min-h-[300px] md:min-h-[380px] flex items-center justify-center bg-slate-950 p-4 sm:p-8">
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            className="max-w-full max-h-[280px] md:max-h-[340px] object-contain"
          />
        </div>
      </div>
    </div>
  );
}