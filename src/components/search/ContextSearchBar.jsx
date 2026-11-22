import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
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
      const isAuth = await base44.auth.isAuthenticated();

      if (isAuth) {
        const user = await base44.auth.me();
        const savedSearches = await base44.entities.SavedSearch.filter({ user_email: user.email }, '-created_date', 3);
        for (const ss of savedSearches) {
          if (ss.name) suggestions.push(ss.name);
          if (ss.filters?.brand && ss.filters.brand !== 'any') brands[ss.filters.brand] = (brands[ss.filters.brand] || 0) + 2;
        }
      }

      if (recentIds.length > 0) {
        const recentCars = await base44.entities.Car.filter({ status: 'active' }, '-created_date', 20)
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
        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200",
        focused
          ? "border-emerald-500 bg-white dark:bg-slate-800 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20"
          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
      )}>
        <Search className={cn("w-4 h-4 flex-shrink-0 transition-colors", focused ? "text-emerald-500" : "text-slate-400")} />
        <div className="flex items-center flex-1 min-w-0 gap-1">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap flex-shrink-0">{t('search.find_btn')}</span>
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
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none min-w-0"
            />
            {!query && !focused && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
                <div className="overflow-hidden w-full" style={{ height: CAROUSEL_LINE }}>
                  <div
                    className={reducedMotion ? '' : 'transition-transform duration-500 ease-out'}
                    style={{ transform: `translateY(-${carouselIndex * CAROUSEL_LINE}px)` }}
                  >
                    {SEARCH_EXAMPLES.map((ex) => (
                      <div key={ex} className="whitespace-nowrap truncate text-sm text-slate-400 dark:text-slate-500" style={{ height: CAROUSEL_LINE, lineHeight: `${CAROUSEL_LINE}px` }}>
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
          <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin flex-shrink-0" />}
        {!loading && (
          <button
            onClick={() => handleSearch()}
            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            {t('search.find_btn')}
          </button>
        )}
      </div>

      {focused && !query && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <p className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">{t('search.try')}</p>
          {smartSuggestions.map((s) => (
            <button
              key={s}
              onMouseDown={() => {
                setQuery(s);
                handleSearch(s);
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}