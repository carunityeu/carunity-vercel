import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function DealerApplicationsPanel({ onOpen, onApprove, busy }) {
  const {t:translate} = useTranslation();
  const t=key=>translate('dealerApply.'+key);
  const query=useInfiniteQuery({queryKey:['dealerApplicationPages'], initialPageParam:null, queryFn:({pageParam})=>entities.DealerApplication.filter({}, {sort:'-created_date',limit:50,...(pageParam ? {cursor:pageParam} : {})}),getNextPageParam:page=>page.has_more ? page.next_cursor : undefined});
  const applications=query.data?.pages.flatMap(page=>page.items) || [];
  return <section className="overflow-hidden rounded-2xl border border-border bg-card">
    <h2 className="border-b border-border p-4 text-lg font-semibold">{t('applications')}</h2>
    {query.isPending ? <div role="status" className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : query.isError ? <div role="alert" className="p-5"><p>{t('failed')}</p><Button variant="outline" onClick={()=>query.refetch()} className="mt-3">{t('retry')}</Button></div> : applications.length === 0 ? <p className="p-10 text-center text-muted-foreground">{t('empty')}</p> : <div className="divide-y divide-border">{applications.map(app=><article key={app.id} className="flex min-w-0 flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center">
      <div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><h3 className="break-words font-semibold">{app.dealer_name}</h3><span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">{t('status_'+app.status)}</span></div><p className="break-words text-sm text-muted-foreground">{app.applicant_name} · {app.applicant_email}</p><p className="mt-1 text-xs text-muted-foreground">{app.city}{app.country && `, ${({ 'Латвия':t('Latvia'), 'Литва':t('Lithuania'), 'Эстония':t('Estonia') })[app.country] || app.country}`}</p></div>
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={!!busy} onClick={()=>onOpen(app)}>{t('details')}</Button>{app.status==='pending' && <><Button size="sm" disabled={!!busy} onClick={()=>onApprove(app)}>{busy===app.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('approve')}</Button><Button size="sm" variant="outline" disabled={!!busy} onClick={()=>onOpen(app)}>{t('reject')}</Button></>}</div>
    </article>)}</div>}
    {query.hasNextPage && <div className="border-t border-border p-4 text-center"><Button variant="outline" onClick={()=>query.fetchNextPage()} disabled={query.isFetchingNextPage}>{t('more')}</Button></div>}
  </section>;
}