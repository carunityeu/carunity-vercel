import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auth } from '@/api/auth';
import { entities } from '@/api/entities';
import requireAccount from '@/components/auth/requireAccount';

export default function useSearchSaveToggle(signature) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState({});
  const [pending, setPending] = useState(false);
  const locked = useRef(false);
  const toggle = async (data) => {
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    try {
      if (!await requireAccount()) return;
      const id = saved[signature];
      if (id) {
        await entities.SavedSearch.delete(id);
        setSaved(previous => { const next = { ...previous }; delete next[signature]; return next; });
        toast.success(t('searchRef.searchRemoved'));
      } else {
        const user = await auth.me();
        const record = await entities.SavedSearch.create({ ...data, user_email: user.email });
        setSaved(previous => ({ ...previous, [signature]: record.id }));
        toast.success(t('catalog.search_saved'));
      }
      queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
    } catch {
      toast.error(t('searchRef.saveFailed'));
    } finally {
      locked.current = false;
      setPending(false);
    }
  };
  return { searchSaved: !!saved[signature], pending, toggle };
}