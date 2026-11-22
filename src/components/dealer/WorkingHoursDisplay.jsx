import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DAY_KEYS = ['day_mon', 'day_tue', 'day_wed', 'day_thu', 'day_fri', 'day_sat', 'day_sun'];
const jsDayToIdx = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };

// Map old object-format keys (Mon, Tue, etc.) to array indices
const OLD_DAY_KEYS = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

// Handle old object format: {"Mon":"08:00-19:00","Sun":"Закрыто"}
function parseOldObjectFormat(obj) {
  const result = [];
  for (let i = 0; i < 7; i++) {
    const key = Object.keys(OLD_DAY_KEYS).find(k => OLD_DAY_KEYS[k] === i);
    const val = obj[key];
    if (!val || val === 'Закрыто' || val === 'Closed' || val === 'closed') {
      result.push({ open: '09:00', close: '18:00', closed: true });
    } else if (val.includes('-')) {
      const [open, close] = val.split('-');
      result.push({ open: open.trim(), close: close.trim(), closed: false });
    } else {
      result.push({ open: '09:00', close: '18:00', closed: true });
    }
  }
  return result;
}

export default function WorkingHoursDisplay({ value }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (!value) return null;

  let hours;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length === 7) {
      // Normalize: strip old 'day' field, keep open/close/closed
      hours = parsed.map(h => ({ open: h.open || '09:00', close: h.close || '18:00', closed: !!h.closed }));
    } else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      // Old object format: {"Mon":"08:00-19:00","Sun":"Закрыто"}
      hours = parseOldObjectFormat(parsed);
    }
  } catch {}

  // If we couldn't parse, don't show raw JSON code
  if (!hours) {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      return null; // Don't show raw JSON code
    }
    if (trimmed) {
      return <span className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">{value}</span>;
    }
    return null;
  }

  const todayIdx = jsDayToIdx[new Date().getDay()];
  const todayEntry = hours[todayIdx];
  const isOpenNow = todayEntry && !todayEntry.closed;

  return (
    <div className="w-full">
      {/* Today summary — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOpenNow ? 'bg-emerald-500' : 'bg-red-400'}`} />
          <span className={`text-sm font-semibold ${isOpenNow ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {isOpenNow ? t('dealer.hours_open') : t('dealer.hours_closed')}
          </span>
          {isOpenNow && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t('dealer.working_hours_until')} {todayEntry.close}
            </span>
          )}
        </div>
        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Full schedule */}
      {expanded && (
        <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
          {hours.map((h, i) => {
            const isToday = i === todayIdx;
            return (
              <div
                key={i}
                className={`flex justify-between items-center px-3 py-2 text-sm border-b last:border-b-0 border-slate-100 dark:border-slate-700
                  ${isToday ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-white dark:bg-slate-900'}`}
              >
                <span className={`font-medium w-28 flex-shrink-0 ${isToday ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {t(`dealer.${DAY_KEYS[i]}`)}
                  {isToday && <span className="ml-1 text-xs text-emerald-500">({t('dealer.working_hours_today')})</span>}
                </span>
                {h.closed ? (
                  <span className="text-slate-400">{t('dealer.hours_closed')}</span>
                ) : (
                  <span className={isToday ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}>
                    {h.open} – {h.close}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}