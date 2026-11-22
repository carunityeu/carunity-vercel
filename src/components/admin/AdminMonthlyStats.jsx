import React, { useMemo } from 'react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const monthKey = (date) => format(date, 'yyyy-MM');
const monthStats = (items, key) => items.filter((i) => i.created_date?.slice(0, 7) === key).length;

export default function AdminMonthlyStats({ users = [], cars = [], messages = [], dealers = [], leads = [] }) {
  const months = useMemo(() => {
    const now = new Date();
    const rows = [];
    for (let i = 5; i >= 0; i--) {
      const d = startOfMonth(subMonths(now, i));
      const key = monthKey(d);
      rows.push({
        key,
        label: format(d, 'LLL yyyy', { locale: ru }),
        users: monthStats(users, key),
        cars: monthStats(cars, key),
        messages: monthStats(messages, key),
        leads: monthStats(leads, key),
        dealers: monthStats(dealers, key),
      });
    }
    return rows.map((row, i) => ({ ...row, prevUsers: i > 0 ? rows[i - 1].users : null }));
  }, [users, cars, messages, dealers, leads]);

  const current = months[months.length - 1];
  const previous = months[months.length - 2];
  const delta = current.users - (previous?.users || 0);
  const DeltaIcon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;

  return (
    <div className="rounded-2xl border border-[#292a32] bg-[#1b1b22] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">Статистика по месяцам</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Регистрации:</span>
          <span className="font-bold text-white">{current.users}</span>
          <span className="text-slate-600">vs {previous?.users ?? 0} в прошлом</span>
          <span className={cn('flex items-center gap-0.5 font-semibold', delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-slate-500')}>
            <DeltaIcon className="h-3.5 w-3.5" />
            {delta > 0 ? '+' : ''}{delta}
          </span>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 sm:hidden">
        {[...months].reverse().map((m) => {
          const isCurrent = m.key === current.key;
          const d = m.prevUsers == null ? null : m.users - m.prevUsers;
          return (
            <div
              key={m.key}
              className={cn(
                'rounded-xl border p-3',
                isCurrent ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-[#292a32] bg-[#101014]'
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className={cn('text-xs font-semibold capitalize', isCurrent ? 'text-emerald-300' : 'text-slate-300')}>
                  {m.label}
                </span>
                {d != null && d !== 0 && (
                  <span className={cn('text-[11px] font-semibold', d > 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {d > 0 ? '+' : ''}{d} рег.
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[['Рег.', m.users], ['Объявл.', m.cars], ['Сообщ.', m.messages], ['Лиды', m.leads]].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-sm font-bold text-white">{value}</p>
                    <p className="text-[10px] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-2 font-medium">Месяц</th>
              <th className="pb-2 text-right font-medium">Регистрации</th>
              <th className="pb-2 text-right font-medium">Объявления</th>
              <th className="pb-2 text-right font-medium">Сообщения</th>
              <th className="pb-2 text-right font-medium">Лиды</th>
              <th className="pb-2 text-right font-medium">Δ к прошлому</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#292a32]">
            {[...months].reverse().map((m) => {
              const isCurrent = m.key === current.key;
              const d = m.prevUsers == null ? null : m.users - m.prevUsers;
              return (
                <tr key={m.key} className={isCurrent ? 'bg-emerald-500/5' : ''}>
                  <td className={cn('py-2.5 capitalize', isCurrent ? 'font-semibold text-emerald-300' : 'text-slate-300')}>
                    {m.label}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-white">{m.users}</td>
                  <td className="py-2.5 text-right text-slate-300">{m.cars}</td>
                  <td className="py-2.5 text-right text-slate-300">{m.messages}</td>
                  <td className="py-2.5 text-right text-slate-300">{m.leads}</td>
                  <td className="py-2.5 text-right">
                    {d == null ? (
                      <span className="text-slate-600">—</span>
                    ) : (
                      <span className={cn('font-semibold', d > 0 ? 'text-emerald-400' : d < 0 ? 'text-red-400' : 'text-slate-500')}>
                        {d > 0 ? '+' : ''}{d}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}