import { useEffect, useRef, useState } from 'react';

export default function useListingDraft({ user, dealerId, values, restore, published, t }) {
  const key = user ? `listing_draft:${user.id}:${dealerId || 'private'}` : null;
  const [loadedKey, setLoadedKey] = useState(null);
  const [error, setError] = useState('');
  const restoreRef = useRef(restore);
  restoreRef.current = restore;
  useEffect(() => {
    if (!key) return;
    try {
      const stored = localStorage.getItem(key);
      if (stored) restoreRef.current(JSON.parse(stored));
      setLoadedKey(key);
    } catch {
      setError(t('listing.wizard_storage_error'));
      setLoadedKey(key);
    }
  }, [key]);
  const save = () => {
    if (!key || loadedKey !== key || published) return false;
    try {
      localStorage.setItem(key, JSON.stringify(values));
      setError('');
      return true;
    } catch {
      setError(t('listing.wizard_storage_error'));
      return false;
    }
  };
  useEffect(() => {
    if (published && key) localStorage.removeItem(key);
    else if (key && loadedKey === key) save();
  }, [key, loadedKey, values, published]);
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const persist = () => saveRef.current();
    const onVisibility = () => { if (document.visibilityState === 'hidden') persist(); };
    window.addEventListener('pagehide', persist);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      persist();
      window.removeEventListener('pagehide', persist);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  return { ready: !!key && loadedKey === key, save, error };
}