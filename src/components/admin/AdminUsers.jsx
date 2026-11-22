import React, { useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Building2, Eye, Search, TrendingDown, TrendingUp, UserRound, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ListPagination from '@/components/ui/ListPagination';
import AdminUserRow from './AdminUserRow';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;
const TABS = [
  { id: 'all', label: 'Все' },
  { id: 'private', label: 'Частники' },
  { id: 'dealer', label: 'Дилеры' },
];
const kindOf = (entry) => (entry.type === 'private' && entry.isAdmin ? 'admin' : entry.type);

export default function AdminUsers({ users = [], cars = [], dealers = [], views = [], messages = [] }) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const dealerEmails = useMemo(
    () => new Set(dealers.map((d) => d.owner_email).filter(Boolean)),
    [dealers]
  );

  const withType = useMemo(() => users.map((u) => ({
    user: u,
    isAdmin: u.role === 'admin',
    type: u.user_type === 'dealer' || dealerEmails.has(u.email) ? 'dealer' : 'private',
  })), [users, dealerEmails]);

  const counters = useMemo(() => {
    const cutoff = subDays(new Date(), 30);
    const viewers = new Set();
    const viewers30 = new Set();
    views.forEach((v) => {
      if (!v.user_email) return;
      viewers.add(v.user_email);
      if (v.viewed_at || v.created_date) {
        if (new Date(v.viewed_at || v.created_date) >= cutoff) viewers30.add(v.user_email);
      }
    });

    const privateCount = withType.filter((u) => kindOf(u) === 'private').length;
    const dealerCount = withType.filter((u) => u.type === 'dealer').length;
    const new30 = users.filter((u) => u.created_date && new Date(u.created_date) >= cutoff).length;
    const monthKey = format(new Date(), 'yyyy-MM');
    const prevKey = format(subDays(new Date(), new Date().getDate()), 'yyyy-MM');
    const thisMonth = users.filter((u) => u.created_date?.slice(0, 7) === monthKey).length;
    const prevMonth = users.filter((u) => u.created_date?.slice(0, 7) === prevKey).length;

    return {
      privateCount,
      dealerCount,
      new30,
      thisMonth,
      prevMonth,
      visitors: viewers.size,
      visitors30: viewers30.size,
      privatePct: users.length ? Math.round((privateCount / users.length) * 100) : 0,
    };
  }, [users, views, withType]);

  const byEmail = useMemo(() => {
    const listings = {};
    const activity = {};
    const touch = (email, date) => {
      if (!email || !date) return;
      if (!activity[email] || new Date(date) > new Date(activity[email])) activity[email] = date;
    };
    cars.forEach((c) => {
      if (c.created_by) listings[c.created_by] = (listings[c.created_by] || 0) + 1;
    });
    views.forEach((v) => touch(v.user_email, v.viewed_at || v.created_date));
    messages.forEach((m) => touch(m.sender_email, m.created_date));
    return { listings, activity };
  }, [cars, views, messages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return withType
      .filter((u) => (tab === 'all' ? true : kindOf(u) === tab))
      .filter((u) => {
        if (!q) return true;
        const hay = [u.user.full_name, u.user.email, u.user.phone, u.user.city, u.user.country]
          .filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => new Date(b.user.created_date || 0) - new Date(a.user.created_date || 0));
  }, [withType, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const kpis = [
    { label: 'Всего пользователей', value: users.length, sub: `+${counters.new30} за 30 дней`, icon: Users },
    { label: 'Частники', value: counters.privateCount, sub: `${counters.privatePct}% от всех`, icon: UserRound },
    { label: 'Дилеры', value: counters.dealerCount, sub: `${dealers.length} карточек в базе`, icon: Building2 },
    { label: 'Посетители', value: counters.visitors30, sub: `всего ${counters.visitors} за всё время`, icon: Eye },
  ];

  const delta = counters.thisMonth - counters.prevMonth;
  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-[#292a32] bg-[#1b1b22] p-3 sm:p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#292a32]">
              <kpi.icon className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold leading-none text-white sm:text-2xl">{kpi.value}</div>
            <div className="mt-1 text-xs text-slate-400">{kpi.label}</div>
            <div className="text-[11px] text-slate-600">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#292a32] bg-[#1b1b22] p-4 text-xs">
        <span className="text-slate-400">Регистрации в этом месяце:</span>
        <span className="font-bold text-white">{counters.thisMonth}</span>
        <span className="text-slate-600">в прошлом: {counters.prevMonth}</span>
        {DeltaIcon && (
          <span className={cn('flex items-center gap-1 font-semibold', delta > 0 ? 'text-emerald-400' : 'text-red-400')}>
            <DeltaIcon className="h-3.5 w-3.5" />
            {delta > 0 ? '+' : ''}{delta}
          </span>
        )}
        <span className="ml-auto text-[11px] text-slate-600">
          Посетители считаются по уникальным просмотрам объявлений
        </span>
      </div>

      <div className="rounded-2xl border border-[#292a32] bg-[#1b1b22]">
        <div className="flex flex-col gap-3 border-b border-[#292a32] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((item) => {
              const count = item.id === 'all' ? withType.length : withType.filter((u) => kindOf(u) === item.id).length;
              return (
                <button
                  key={item.id}
                  onClick={() => { setTab(item.id); setPage(1); }}
                  className={cn(
                    'min-h-9 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium transition-colors',
                    tab === item.id ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                  )}
                >
                  {item.label} <span className="text-slate-600">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Имя, email, телефон, город..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="border-[#292a32] bg-[#101014] pl-9 text-white placeholder:text-slate-600"
            />
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {users.length === 0 ? 'Пользователей пока нет' : 'Ничего не найдено'}
          </div>
        ) : (
          <div className="divide-y divide-[#292a32]">
            {paged.map(({ user, type, isAdmin }) => (
              <AdminUserRow
                key={user.id}
                user={user}
                type={type}
                isAdmin={isAdmin}
                listingsCount={byEmail.listings[user.email] || 0}
                lastActivity={byEmail.activity[user.email]}
              />
            ))}
          </div>
        )}

        <div className="border-t border-[#292a32] p-4">
          <ListPagination className="mt-0" page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}