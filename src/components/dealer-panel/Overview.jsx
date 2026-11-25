import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Camera, Car, ChevronRight, Clock, Crown, Eye, Heart, MessageSquare, Tag, Target, XCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { formatNumber, formatPrice } from '@/utils/format';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { Card, Stat, StatusBadge, EmptyState, Bar } from './ui';
import { weekly } from './useDealerData';

const thumb = (car) => car.images?.find((s) => typeof s === 'string' && s.startsWith('http'));

function Thumb({ car, className = 'h-11 w-16' }) {
  const src = thumb(car);
  return (
    <div className={`flex-shrink-0 overflow-hidden rounded-lg bg-raised ${className}`}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Car className="h-4 w-4 text-ink-3" /></div>}
    </div>
  );
}

/** Things that need the dealer now, most urgent first. Each opens the place where it is fixed. */
function todo({ t, cars, leads, dealer, go }) {
  const items = [];
  const rejected = cars.filter((c) => c.status === 'rejected');
  const pending = cars.filter((c) => c.status === 'pending');
  const fewPhotos = cars.filter((c) => c.status === 'active' && (c.images?.length || 0) < 4);
  const newLeads = leads.filter((l) => (l.status || 'new') === 'new');
  const daysLeft = dealer?.subscription_until ? Math.ceil((Date.parse(dealer.subscription_until) - Date.now()) / 86400000) : null;

  if (rejected.length) items.push({ tone: 'danger', icon: XCircle, text: t('dp.todo_rejected', 'Отклонено модерацией: {{n}}. Исправьте и отправьте снова.', { n: rejected.length }), onClick: () => go('cars', 'rejected') });
  if (newLeads.length) items.push({ tone: 'brand', icon: Target, text: t('dp.todo_leads', 'Новые лиды: {{n}}. Свяжитесь, пока интерес горячий.', { n: newLeads.length }), onClick: () => go('leads') });
  if (daysLeft !== null && daysLeft <= 14) items.push({ tone: daysLeft < 0 ? 'danger' : 'warn', icon: Crown, text: daysLeft < 0 ? t('dp.todo_plan_over', 'Тариф закончился. Объявления скоро снимут с публикации.') : t('dp.todo_plan_soon', 'Тариф заканчивается через {{n}} дн.', { n: daysLeft }), to: createPageUrl('DealerPricing') });
  if (pending.length) items.push({ tone: 'warn', icon: Clock, text: t('dp.todo_pending', 'На модерации: {{n}}. Обычно проверка занимает до суток.', { n: pending.length }), onClick: () => go('cars', 'pending') });
  if (fewPhotos.length) items.push({ tone: 'info', icon: Camera, text: t('dp.todo_photos', 'Мало фото (меньше 4): {{n}}. Добавьте салон, двигатель, багажник и детали.', { n: fewPhotos.length }), onClick: () => go('cars', 'active') });
  return items;
}

const TONE = {
  danger: 'text-red-300', warn: 'text-amber-300', brand: 'text-brand-text', info: 'text-ink-2',
};

export default function Overview({ dealer, data, go }) {
  const { t, i18n } = useTranslation();
  const { cars, chats, offers, favorites, leads, perCar, plan } = data;
  const active = cars.filter((c) => c.status === 'active');
  const views = active.reduce((s, c) => s + (c.views_count || 0), 0);
  const w = { chats: weekly(chats), offers: weekly(offers), favorites: weekly(favorites), leads: weekly(leads) };
  const tasks = todo({ t, cars, leads, dealer, go });
  const interest = (c) => (perCar[c.id]?.messages || 0) * 5 + (perCar[c.id]?.offers || 0) * 5 + (perCar[c.id]?.favorites || 0) * 2 + (c.views_count || 0) / 20;
  const top = [...active].sort((a, b) => interest(b) - interest(a)).slice(0, 5);
  const recent = cars.slice(0, 5);
  const byBody = active.reduce((m, c) => { const k = c.body_type || 'other'; m[k] = (m[k] || 0) + 1; return m; }, {});
  const bodies = Object.entries(byBody).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const weekLabel = t('dp.vs_prev_week', 'за 7 дней, к прошлой неделе');

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={Car} label={t('dp.active_listings', 'Активные объявления')} value={active.length}
          deltaLabel={t('dp.of_total', 'из {{n}} всего', { n: cars.length })} onClick={() => go('cars', 'active')} />
        <Stat icon={Eye} label={t('dp.views', 'Просмотры')} value={formatNumber(views)} deltaLabel={t('dp.views_total', 'всего по активным объявлениям')} />
        <Stat icon={MessageSquare} label={t('dp.chats', 'Обращения')} value={w.chats.thisWeek} delta={w.chats.delta} deltaLabel={weekLabel} />
        {plan.hasLeads
          ? <Stat icon={Target} label={t('dp.leads', 'Лиды')} value={w.leads.thisWeek} delta={w.leads.delta} deltaLabel={weekLabel} onClick={() => go('leads')} />
          : <Stat icon={Heart} label={t('dp.favorites', 'В избранном')} value={w.favorites.thisWeek} delta={w.favorites.delta} deltaLabel={weekLabel} />}
      </div>

      <Card title={t('dp.todo_title', 'Что сделать сейчас')} bodyClassName="p-2 pt-1">
        {tasks.length ? (
          <ul className="divide-y divide-line">
            {tasks.map((it, i) => {
              const inner = (
                <>
                  <it.icon className={`h-4 w-4 flex-shrink-0 ${TONE[it.tone]}`} />
                  <span className="flex-1 text-sm text-ink">{it.text}</span>
                  <ChevronRight className="h-4 w-4 text-ink-3" />
                </>
              );
              const cls = 'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left';
              return <li key={i}>{it.to ? <Link to={it.to} className={cls}>{inner}</Link> : <button type="button" onClick={it.onClick} className={cls}>{inner}</button>}</li>;
            })}
          </ul>
        ) : <p className="px-3 py-3 text-sm text-ink-3">{t('dp.todo_none', 'Всё в порядке: срочных дел нет.')}</p>}
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card title={t('dp.recent', 'Последние объявления')}
          action={<button type="button" onClick={() => go('cars')} className="text-sm font-medium text-brand-text">{t('dp.all', 'Все')}</button>}
          bodyClassName="p-2 pt-1">
          {recent.length ? (
            <ul className="divide-y divide-line">
              {recent.map((car) => (
                <li key={car.id}>
                  <Link to={getCarDetailsPath(car)} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <Thumb car={car} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{car.brand} {car.model} <span className="font-normal text-ink-3">{car.year}</span></p>
                      <p className="text-sm text-ink-2">{formatPrice(car.price)}</p>
                    </div>
                    <StatusBadge status={car.status} label={t('car.status_' + car.status, car.status)} />
                    <span className="hidden w-20 items-center justify-end gap-1 text-sm text-ink-3 sm:flex"><Eye className="h-3.5 w-3.5" />{formatNumber(car.views_count || 0)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={Car} title={t('dp.no_cars', 'Объявлений пока нет')} />}
        </Card>

        <Card title={t('dp.top_interest', 'Больше всего интереса')} hint={t('dp.top_interest_hint', 'Обращения, предложения, избранное и просмотры')} bodyClassName="p-2 pt-1">
          {top.length ? (
            <ol className="space-y-0.5">
              {top.map((car, i) => {
                const pc = perCar[car.id] || {};
                return (
                  <li key={car.id}>
                    <Link to={getCarDetailsPath(car)} className="flex items-center gap-3 rounded-xl px-3 py-2">
                      <span className="w-4 text-sm font-semibold text-ink-3">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">{car.brand} {car.model}</span>
                      <span className="flex items-center gap-2.5 text-xs text-ink-3">
                        <span className="flex items-center gap-1" title={t('dp.chats', 'Обращения')}><MessageSquare className="h-3.5 w-3.5" />{pc.messages || 0}</span>
                        <span className="flex items-center gap-1" title={t('dp.offers', 'Предложения цены')}><Tag className="h-3.5 w-3.5" />{pc.offers || 0}</span>
                        <span className="flex items-center gap-1" title={t('dp.favorites', 'В избранном')}><Heart className="h-3.5 w-3.5" />{pc.favorites || 0}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : <p className="px-3 py-3 text-sm text-ink-3">{t('dp.no_active', 'Нет активных объявлений')}</p>}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title={t('dp.stock_by_body', 'Склад по типу кузова')}>
          {bodies.length ? (
            <div className="space-y-3">
              {bodies.map(([body, n]) => (
                <div key={body}>
                  <div className="mb-1.5 flex justify-between text-sm"><span className="text-ink">{t('body_types.' + body, body)}</span><span className="text-ink-3">{n}</span></div>
                  <Bar value={n} max={active.length} />
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-ink-3">{t('dp.no_active', 'Нет активных объявлений')}</p>}
        </Card>

        <Card title={t('dp.plan', 'Тариф')}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold capitalize text-ink">{dealer.subscription_type || 'starter'}</p>
              {dealer.subscription_until
                ? <p className="text-sm text-ink-3">{t('dp.plan_until', 'действует до {{date}}', { date: new Date(dealer.subscription_until).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }) })}</p>
                : <p className="text-sm text-ink-3">{t('dp.plan_no_date', 'без даты окончания')}</p>}
              <p className="mt-1 text-sm text-ink-3">{plan.maxListings === Infinity
                ? t('dp.plan_unlimited', 'Объявлений без ограничений')
                : t('dp.plan_slots', 'Объявлений: {{used}} из {{max}}', { used: active.length, max: plan.maxListings })}</p>
            </div>
            <Link to={createPageUrl('DealerPricing')} className="flex h-10 flex-shrink-0 items-center gap-1.5 rounded-xl bg-raised px-4 text-sm font-semibold text-ink">
              {t('dp.plan_manage', 'Тарифы')}<ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {!dealer.is_verified && (
            <p className="mt-4 flex items-center gap-2 text-sm text-amber-300"><AlertTriangle className="h-4 w-4" />{t('dp.not_verified', 'Салон ещё не подтверждён: значок проверки не показывается покупателям.')}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
