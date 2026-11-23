import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { ArrowRight } from 'lucide-react';

export default function LuxurySection() {
  const { t } = useTranslation();

  const { data: brands = [] } = useQuery({
    queryKey: ['luxuryBrandsPublished'],
    queryFn: () => entities.LuxuryBrand.filter({ is_published: true }, 'sort_order', 20),
    staleTime: 10 * 60 * 1000,
  });

  if (brands.length === 0) return null;

  return (
    <section className="py-12 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
              <span className="text-xl">✦</span>
              {t('luxury.title')}
            </h2>
            <p className="text-slate-400 mt-1 text-sm">{t('luxury.subtitle')}</p>
          </div>
          <Link
            to="/LuxuryCatalog"
            className="hidden sm:flex items-center gap-2 border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            {t('luxury.all_cars', 'Все люкс машины')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Brand cards row */}
        <div className="relative" ref={(el) => {
          if (!el) return;
          const scroll = el.querySelector('.luxury-scroll');
          const leftFade = el.querySelector('.fade-left');
          const rightFade = el.querySelector('.fade-right');
          const update = () => {
            if (!scroll) return;
            const atStart = scroll.scrollLeft <= 8;
            const atEnd = scroll.scrollLeft >= scroll.scrollWidth - scroll.clientWidth - 8;
            if (leftFade) leftFade.style.opacity = atStart ? '0' : '1';
            if (rightFade) rightFade.style.opacity = atEnd ? '0' : '1';
          };
          setTimeout(update, 50);
          scroll?.addEventListener('scroll', update);
        }}>
          {/* Left fade */}
          <div className="fade-left absolute left-0 top-0 bottom-2 w-16 z-10 pointer-events-none bg-gradient-to-r from-slate-950/80 to-transparent transition-opacity duration-200" style={{opacity: 0}} />
          {/* Right fade */}
          <div className="fade-right absolute right-0 top-0 bottom-2 w-16 z-10 pointer-events-none bg-gradient-to-l from-slate-950/80 to-transparent transition-opacity duration-200" />
        <div className="luxury-scroll flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/LuxuryCatalog?brand=${encodeURIComponent(brand.name)}`}
              className="flex-shrink-0 group"
              style={{ width: '200px' }}
            >
              <div
                className="relative rounded-2xl overflow-hidden bg-slate-800 flex flex-col"
                style={{ height: '190px' }}
              >
                {/* Logo + name area */}
                <div className="flex flex-col items-center pt-4 pb-1 px-4 z-10">
                  {brand.logo ? (
                    <div className="overflow-hidden mb-1.5 flex items-center justify-center" style={{ width: `${brand.logo_width || 48}px`, height: '48px' }}>
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-full h-full"
                        style={{ objectFit: brand.logo_fit === 'cover' ? 'cover' : 'contain', filter: 'brightness(0) invert(1)' }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg mb-1.5">
                      {brand.name[0]}
                    </div>
                  )}
                  {brand.show_name !== false && (
                    <span className="text-white font-semibold text-sm text-center leading-tight">{brand.name}</span>
                  )}
                  {brand.show_name !== false && brand.subtitle && (
                    <span className="text-slate-400 text-xs mt-0.5 text-center">{brand.subtitle}</span>
                  )}
                </div>

                {/* Car image at bottom */}
                <div className="flex-1 flex items-end justify-center overflow-hidden px-2">
                  {brand.image ? (
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-full object-contain transition-transform duration-300"
                      style={{ maxHeight: '110px', marginBottom: '-4px' }}
                    />
                  ) : (
                    <div className="w-full h-16 flex items-center justify-center text-slate-400 text-xs">
                      —
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-emerald-500 transition-colors duration-200 pointer-events-none" />
              </div>
            </Link>
          ))}
        </div>
        </div>

        {/* Mobile link */}
        <div className="mt-5 flex sm:hidden justify-center">
          <Link
            to="/LuxuryCatalog"
            className="flex items-center gap-2 text-sm text-emerald-400 font-medium"
          >
            {t('luxury.all_cars', 'Все люкс машины')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}