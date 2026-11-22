import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { History, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS, et, lv, lt } from 'date-fns/locale';
import ListCarCard from '@/components/cars/ListCarCard';
import DashboardTabHeader from '@/components/dashboard/DashboardTabHeader';
import useViewHistory from '@/components/dashboard/useViewHistory';

const locales = { ru, en: enUS, et, lv, lt };
export default function ViewHistoryTab({ user }) {
  const { t, i18n } = useTranslation();
  const history = useViewHistory(user);
  const queryClient = useQueryClient();
  useEffect(() => base44.entities.Car.subscribe(event => {
    if (event.type === 'delete' || (event.type === 'update' && event.data?.status && event.data.status !== 'active')) {
      queryClient.invalidateQueries({ queryKey: ['viewHistory'] });
    }
  }), [queryClient]);
  const rows = (history.data?.rows || []).filter((item) => item.car);
  return <div className="space-y-4">
    <DashboardTabHeader icon={History} title={t('account.nav_history')} count={history.count} />
    {history.isLoading ? <Loader2 className="mx-auto my-12 h-7 w-7 animate-spin text-muted-foreground" /> : history.isError ?
      <Button variant="outline" onClick={() => history.refetch()}>{t('common.retry', 'Retry')}</Button> : rows.length === 0 ?
      <div className="rounded-2xl border bg-card p-8 text-center">
        <h3 className="font-semibold">{t('dashboard.history_empty')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('dashboard.history_empty_desc')}</p>
      </div> : <div className="flex flex-col gap-4">
        {rows.map(item => <div key={item.car_id} data-history-car={item.car_id}>
          {item.car ? <ListCarCard car={item.car} showLocation /> :
            <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">{t('dashboard.listing_deleted')}</div>}
          {item.max_viewed_at && <p className="mt-1.5 px-1 text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.max_viewed_at), { addSuffix: true, locale: locales[i18n.language?.slice(0, 2)] || enUS })}</p>}
        </div>)}
      </div>}
    {(history.page > 1 || history.data?.hasMore) && <div className="flex items-center justify-center gap-3">
      <Button variant="outline" disabled={history.page === 1 || history.isFetching} onClick={history.previous}>{t('catalog.prev')}</Button>
      <span className="text-sm text-muted-foreground">{history.page}</span>
      <Button variant="outline" disabled={!history.data?.hasMore || history.isFetching} onClick={history.next}>{t('catalog.next')}</Button>
    </div>}
  </div>;
}