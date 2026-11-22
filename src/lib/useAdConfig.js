import { useQuery } from '@tanstack/react-query';
import { useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

// Изображения для конкретного языка: локализованный вариант, если есть; иначе fallback на images
export function getImagesForLang(config, lang) {
  if (!config) return [];
  const loc = (config.localizations || []).find(l => l.lang === lang && l.images?.length > 0);
  if (loc) return loc.images;
  return config.images || [];
}

// Общая ссылка для конкретного языка: локализованная, если есть; иначе fallback на link_url
export function getLinkUrlForLang(config, lang) {
  if (!config) return '';
  const loc = (config.localizations || []).find(l => l.lang === lang);
  if (loc && loc.link_url) return loc.link_url;
  return config.link_url || '';
}

// Fetch all ad configurations from the database
export function useAdConfigurations() {
  return useQuery({
    queryKey: ['adConfigurations'],
    queryFn: () => base44.entities.AdConfiguration.list(),
    staleTime: 30000,
  });
}

// Pick a random ad image for a given slot — stable per page load, language-aware
// Uses a ref to store the random index so it doesn't change on refetch
export function useAdImage(slotId) {
  const { data: configs } = useAdConfigurations();
  const { i18n: i18nInstance } = useTranslation();
  const { user } = useAuth();
  const randomIndexRef = useRef(null);

  return useMemo(() => {
    if (!configs) return null;
    const config = configs.find(c => c.slot === slotId && c.enabled);
    if (!config) return null;

    // Prefer the language set in the user's account settings; fall back to UI language for guests
    const lang = (user?.preferred_language || i18nInstance.language || 'ru').slice(0, 2);
    const images = getImagesForLang(config, lang);
    if (!images.length) return null;

    // Initialize random index once per page load
    if (randomIndexRef.current === null) {
      randomIndexRef.current = Math.floor(Math.random() * images.length);
    }
    // Clamp index in case images array changed
    const idx = randomIndexRef.current % images.length;
    const img = images[idx];
    return {
      image: img.url,
      link: img.link || getLinkUrlForLang(config, lang) || '#',
      alt: img.alt || 'Advertisement',
    };
  }, [configs, slotId, i18nInstance.language, user?.preferred_language]);
}

// Simple pick for non-hook contexts (admin preview etc.)
export function pickRandomAdImage(configs, slotId, lang) {
  if (!configs) return null;
  const config = configs.find(c => c.slot === slotId && c.enabled);
  if (!config) return null;
  const resolvedLang = lang || (typeof window !== 'undefined' ? localStorage.getItem('i18nextLng')?.slice(0, 2) : null) || 'ru';
  const images = getImagesForLang(config, resolvedLang);
  if (!images.length) return null;
  const randomIndex = Math.floor(Math.random() * images.length);
  const img = images[randomIndex];
  return {
    image: img.url,
    link: img.link || getLinkUrlForLang(config, resolvedLang) || '#',
    alt: img.alt || 'Advertisement',
  };
}

// Check if a slot has a configured ad (any language)
export function hasAdConfig(configs, slotId) {
  if (!configs) return false;
  const config = configs.find(c => c.slot === slotId && c.enabled);
  if (!config) return false;
  return (config.images?.length > 0) || (config.localizations || []).some(l => l.images?.length > 0);
}