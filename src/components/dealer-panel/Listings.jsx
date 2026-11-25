import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Car, Clock, ExternalLink, Eye, Heart, MessageSquare, Pencil, Plus, Rocket, Search, Sparkles, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { formatNumber, formatPrice } from '@/utils/format';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { isPromotionActive } from '@/lib/promoteOptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ListPagination from '@/components/ui/ListPagination';
import { fieldClass } from '@/components/ds';
import { Card, Segmented, StatusBadge, EmptyState } from './ui';
import { daysOnSale } from './useDealerData';

const STATUSES = ['active', 'pending', 'rejected', 'sold'];
const PAGE = 10;
const SORTS = {
  new: (a, b) => Date.parse(b.created_date) - Date.parse(a.created_date),
  views: (a, b) => (b.views_count || 0) - (a.views_count || 0),
  price: (a, b) => (b.price || 0) - (a.price || 0),
  age: (a, b) => Date.parse(a.created_date) - Date.parse(b.created_date),
};

function Metric({ icon: Icon, value, title }) {
  return <span className="flex items-center gap-1" title={title}><Icon className="h-3.5 w-3.5" />{value}</span>;
}

function Row({ car, stats, employees, onAssign, onPromote, onDelete }) {
  const { t } = useTranslation();
  const photo = car.images?.find((s) => typeof s === 'string' && s.startsWith('http'));
  const promoted = isPromotionActive(car);
  const team = [...new Set((employees || []).map((e) => (e.name || e.email || '').trim()).filter(Boolean))];
  const iconBtn = 'flex h-9 w-9 items-center justify-center rounded-lg bg-raised text-ink-2';

  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <Link to={getCarDetailsPath(car)} className="h-[72px] w-28 flex-shrink-0 overflow-hidden rounded-xl bg-raised">
        {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Car className="h-5 w-5 text-ink-3" /></div>}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-ink">{car.brand} {car.model} <span className="font-normal text-ink-3">{car.year}</span></p>
          <StatusBadge status={car.status} label={t('car.status_' + car.status, car.status)} />
          {promoted && <span className="inline-flex h-6 items-center gap-1 rounded-md bg-brand/15 px-2 text-xs font-semibold text-brand-text"><Sparkles className="h-3 w-3" />{t('dp.promoted', 'Продвигается')}</span>}
        </div>
        <p className="mt-0.5 text-base font-bold text-ink">{formatPrice(car.price)}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
          <Metric icon={Eye} value={formatNumber(car.views_count || 0)} title={t('dp.views', 'Просмотры')} />
          <Metric icon={MessageSquare} value={stats.messages || 0} title={t('dp.chats', 'Обращения')} />
          <Metric icon={Tag} value={stats.offers || 0} title={t('dp.offers', 'Предложения цены')} />
          <Metric icon={Heart} value={stats.favorites || 0} title={t('dp.favorites', 'В избранном')} />
          <Metric icon={Clock} value={t('dp.days_short', '{{n}} дн.', { n: daysOnSale(car) })} title={t('dp.days_on_sale', 'Дней в продаже')} />
        </div>
      </div>

      <select aria-label={t('dealerEmployees.assign_title')} value={car.assigned_employee || ''} onChange={(e) => onAssign(car, e.target.value)}
        className="hidden h-9 w-40 rounded-lg border-0 bg-raised px-2 text-sm text-ink-2 lg:block">
        <option value="">{t('dp.no_manager', 'Без менеджера')}</option>
        {car.assigned_employee && !team.includes(car.assigned_employee) && <option value={car.assigned_employee}>{car.assigned_employee}</option>}
        {team.map((name) => <option key={name} value={name}>{name}</option>)}
      </select>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        {car.status === 'active' && !promoted && (
          <Button size="sm" variant="secondary" className="h-9 gap-1.5 text-brand-text" onClick={() => onPromote(car)}><Rocket />{t('promote.button', 'Продвинуть')}</Button>
        )}
        <Link to={createPageUrl('EditListing') + `?id=${car.id}`} className={iconBtn} title={t('dp.edit', 'Редактировать')} aria-label={t('dp.edit', 'Редактировать')}><Pencil className="h-4 w-4" /></Link>
        <Link to={getCarDetailsPath(car)} className={iconBtn} title={t('dp.open', 'Открыть объявление')} aria-label={t('dp.open', 'Открыть объявление')}><ExternalLink className="h-4 w-4" /></Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button" className={`${iconBtn} text-red-300`} title={t('dp.delete', 'Удалить')} aria-label={t('dp.delete', 'Удалить')}><Trash2 className="h-4 w-4" /></button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-line bg-surface">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-ink">{t('dealer.delete_confirm_title')}</AlertDialogTitle>
              <AlertDialogDescription className="text-ink-2">{car.brand} {car.model} {car.year} · {formatPrice(car.price)}. {t('dealer.delete_confirm_desc')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('dashboard.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(car)} className="bg-red-600 text-white hover:bg-red-700">{t('dealer.delete_btn')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}

export default function Listings({ dealer, data, initialStatus, onPromote }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { cars, perCar, loadingCars } = data;
  const [status, setStatus] = useState(STATUSES.includes(initialStatus) ? initialStatus : 'active');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('new');
  const [page, setPage] = useState(1);

  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, cars.filter((c) => c.status === s).length])), [cars]);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cars
      .filter((c) => c.status === status)
      .filter((c) => !q || `${c.brand} ${c.model} ${c.year} ${c.trim_level || ''} ${c.vin || ''}`.toLowerCase().includes(q))
      .sort(SORTS[sort]);
  }, [cars, status, query, sort]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const shown = list.slice((page - 1) * PAGE, page * PAGE);

  const remove = useMutation({
    mutationFn: (car) => entities.Car.delete(car.id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['dealerOwnCars'] }); toast.success(t('dealer.listing_deleted')); },
    onError: (e) => toast.error(e.message),
  });
  const assign = async (car, name) => {
    try {
      await entities.Car.update(car.id, { assigned_employee: name });
      queryClient.invalidateQueries({ queryKey: ['dealerOwnCars'] });
      toast.success(t('dealerEmployees.assign_saved'));
    } catch (e) { toast.error(e.message); }
  };
  const statusLabel = { active: t('dp.st_active', 'Активные'), pending: t('dp.st_pending', 'На модерации'), rejected: t('dp.st_rejected', 'Отклонённые'), sold: t('dp.st_sold', 'Проданные') };

  if (!loadingCars && cars.length === 0) {
    return (
      <Card>
        <EmptyState icon={Car} title={t('dealer.no_cars_title')} text={t('dealer.no_cars_desc')}
          action={<Button asChild><Link to={createPageUrl('CreateListing') + `?dealer_id=${dealer.id}`}><Plus />{t('dealer.add_car', 'Добавить авто')}</Link></Button>} />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={status} onChange={(v) => { setStatus(v); setPage(1); }}
          items={STATUSES.map((s) => ({ value: s, label: statusLabel[s], count: counts[s] }))} />
        <div className="relative ml-auto w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder={t('dp.search_listings', 'Марка, модель, VIN')} className={`${fieldClass} pl-9`} />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={t('dp.sort', 'Сортировка')} className="h-10 rounded-xl border-0 bg-raised px-3 text-sm text-ink">
          <option value="new">{t('dp.sort_new', 'Сначала новые')}</option>
          <option value="age">{t('dp.sort_age', 'Дольше всех в продаже')}</option>
          <option value="views">{t('dp.sort_views', 'По просмотрам')}</option>
          <option value="price">{t('dp.sort_price', 'По цене')}</option>
        </select>
      </div>

      <Card bodyClassName="p-0">
        {shown.length ? (
          <ul className="divide-y divide-line">
            {shown.map((car) => <Row key={car.id} car={car} stats={perCar[car.id] || {}} employees={dealer.employees} onAssign={assign} onPromote={onPromote} onDelete={(c) => remove.mutate(c)} />)}
          </ul>
        ) : (
          <EmptyState icon={Search} title={query ? t('dp.nothing_found', 'Ничего не найдено') : t('dp.empty_status', 'Здесь пока пусто')} />
        )}
      </Card>
      {pages > 1 && <ListPagination className="mt-0" page={page} totalPages={pages} onPageChange={setPage} />}
    </div>
  );
}
