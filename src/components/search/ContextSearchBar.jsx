import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { auth } from '@/api/auth';
import { entities } from '@/api/entities';
import requireAccount from '@/components/auth/requireAccount';
import { Search, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const getDefaultSuggestions = (t) => [
  t('search.suggestion_1', 'BMW X5 дизель'),
  t('search.suggestion_2', 'Красный внедорожник'),
  t('search.suggestion_3', 'Электрокар до 25000€'),
  t('search.suggestion_4', 'Семейный минивэн'),
  t('search.suggestion_5', 'Автомат до 10000€'),
];

const CAROUSEL_LINE = 20; // px — matches text-sm line-height

export default function ContextSearchBar({ className }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState(() => getDefaultSuggestions(t));
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const SEARCH_EXAMPLES = [
    t('search.example_1', 'BMW 3 Series'),
    t('search.example_2', 'Volkswagen Golf'),
    t('search.example_3', 'Mercedes-Benz C-Class'),
    t('search.example_4', 'Audi A6'),
    t('search.example_5', 'Tesla Model 3'),
    t('search.example_6', 'Porsche 911'),
    t('search.example_7', 'Toyota RAV4'),
    t('search.example_8', 'Volvo XC60'),
    t('search.example_9', 'BMW Automatic'),
    t('search.example_10', 'Red Porsche'),
    t('search.example_11', 'Diesel Skoda'),
    t('search.example_12', 'Wagon Toyota'),
    t('search.example_13', 'Electric Audi'),
    t('search.example_14', 'Convertible Mercedes'),
    t('search.example_15', 'Skoda Octavia'),
    t('search.example_16', 'Ford Focus'),
    t('search.example_17', 'Nissan Qashqai'),
    t('search.example_18', 'Kia Sportage'),
  ];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion || query || focused) return;
    const id = setInterval(() => setCarouselIndex((i) => (i + 1) % SEARCH_EXAMPLES.length), 2500);
    return () => clearInterval(id);
  }, [reducedMotion, query, focused]);

  const loadSmartSuggestions = async () => {
    if (suggestionsLoaded) return;
    setSuggestionsLoaded(true);
    try {
      const suggestions = [];
      const brands = {};
      const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]').slice(0, 5);
      const isAuth = await auth.isAuthenticated();

      if (isAuth) {
        const user = await auth.me();
        const savedSearches = await entities.SavedSearch.filter({ user_email: user.email }, '-created_date', 3);
        for (const ss of savedSearches) {
          if (ss.name) suggestions.push(ss.name);
          if (ss.filters?.brand && ss.filters.brand !== 'any') brands[ss.filters.brand] = (brands[ss.filters.brand] || 0) + 2;
        }
      }

      if (recentIds.length > 0) {
        const recentCars = await entities.Car.filter({ status: 'active' }, '-created_date', 20)
          .then(cars => cars.filter(c => recentIds.includes(c.id)));
        for (const car of recentCars) {
          if (car.brand) brands[car.brand] = (brands[car.brand] || 0) + 1;
        }
      }

      const topBrand = Object.entries(brands).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topBrand) suggestions.push(`${topBrand} ${t('search.all_models', 'все модели')}`);

      const finalSuggestions = [...new Set([...suggestions, ...getDefaultSuggestions(t)])].slice(0, 5);
      setSmartSuggestions(finalSuggestions);
    } catch {}
  };

  const handleSearch = async (searchQuery) => {
    const q = (searchQuery ?? query).trim();
    if (!q) {
      navigate('/Catalog');
      return;
    }

    if (!await requireAccount()) return;
    setLoading(true);
    try {
      const response = await base44.functions.invoke('contextSearch', { query: q });
      const { redirect_url } = response.data;
      navigate(redirect_url);
    } catch (e) {
      navigate(`/Catalog?q=${encodeURIComponent(q)}`);
    } finally {
      setLoading(false);
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "flex h-10 items-center gap-2 pl-3 pr-1 rounded-xl border bg-raised transition-colors",
        focused ? "border-brand ring-2 ring-brand/20" : "border-transparent hover:border-line"
      )}>
        <Search className={cn("w-4 h-4 flex-shrink-0 transition-colors", focused ? "text-brand-text" : "text-ink-3")} />
        <div className="flex items-center flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { setFocused(true); loadSmartSuggestions(); }}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={handleKeyDown}
              aria-label={t('search.find_btn')}
              className="w-full bg-transparent text-sm text-ink outline-none min-w-0"
            />
            {!query && !focused && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
                <div className="overflow-hidden w-full" style={{ height: CAROUSEL_LINE }}>
                  <div
                    className={reducedMotion ? '' : 'transition-transform duration-500 ease-out'}
                    style={{ transform: `translateY(-${carouselIndex * CAROUSEL_LINE}px)` }}
                  >
                    {SEARCH_EXAMPLES.map((ex) => (
                      <div key={ex} className="whitespace-nowrap truncate text-sm text-ink-3" style={{ height: CAROUSEL_LINE, lineHeight: `${CAROUSEL_LINE}px` }}>
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {query && !loading && (
          <button type="button" aria-label="Clear" onClick={() => setQuery('')} className="text-ink-3 hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && <Loader2 className="mr-2 w-4 h-4 text-brand-text animate-spin flex-shrink-0" />}
        {!loading && (
          <button
            type="button"
            onClick={() => handleSearch()}
            className="h-8 flex-shrink-0 rounded-lg bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            {t('search.find_btn')}
          </button>
        )}
      </div>

      {focused && !query && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-line rounded-xl shadow-xl z-50 overflow-hidden">
          <p className="px-3 py-2 text-xs text-ink-3 uppercase tracking-wide font-medium">{t('search.try')}</p>
          {smartSuggestions.map((s) => (
            <button
              key={s}
              onMouseDown={() => {
                setQuery(s);
                handleSearch(s);
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-ink-2 hover:bg-raised flex items-center gap-2 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-ink-3" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}