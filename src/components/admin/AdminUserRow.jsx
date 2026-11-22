import React from 'react';
import { Car, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const TYPE_META = {
  admin: { label: 'Админ', className: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  dealer: { label: 'Дилер', className: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  private: { label: 'Частник', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
};

const initials = (user) => {
  const source = user?.full_name || user?.email || '';
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

export default function AdminUserRow({ user, type, isAdmin, listingsCount = 0, lastActivity }) {
  const meta = TYPE_META[type] || TYPE_META.private;

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#292a32] bg-[#292a32]">
          {user.avatar
            ? <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            : <span className="text-xs font-bold text-slate-300">{initials(user) || 'U'}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-medium text-white">{user.full_name || user.email}</p>
            <span className={cn('rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase', meta.className)}>
              {meta.label}
            </span>
            {isAdmin && (
              <span className="rounded border border-purple-500/30 bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-purple-300">
                Админ
              </span>
            )}
          </div>
          <p className="truncate text-xs text-slate-400">{user.email}</p>
          <p className="mt-0.5 truncate text-[11px] text-slate-600">
            {[user.phone, user.city, user.country].filter(Boolean).join(' · ') || 'Профиль не заполнен'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:w-auto sm:flex-shrink-0 sm:gap-5">
        <div className="sm:text-right">
          <p className="text-[10px] uppercase tracking-wide text-slate-600">Регистрация</p>
          <p className="text-xs text-slate-300">
            {user.created_date ? format(new Date(user.created_date), 'dd.MM.yyyy', { locale: ru }) : '—'}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-[10px] uppercase tracking-wide text-slate-600">Объявления</p>
          <p className="flex items-center gap-1 text-xs text-slate-300 sm:justify-end">
            <Car className="h-3 w-3 text-slate-500" />{listingsCount}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-[10px] uppercase tracking-wide text-slate-600">Активность</p>
          <p className="flex items-center gap-1 text-xs text-slate-300 sm:justify-end">
            <Clock className="h-3 w-3 text-slate-500" />
            {lastActivity
              ? formatDistanceToNow(new Date(lastActivity), { locale: ru, addSuffix: true })
              : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}