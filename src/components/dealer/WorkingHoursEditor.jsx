import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const DAY_KEYS = ['day_mon', 'day_tue', 'day_wed', 'day_thu', 'day_fri', 'day_sat', 'day_sun'];
const OLD_DAY_KEYS = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

const defaultHours = DAY_KEYS.map((_, i) => ({
  open: '09:00',
  close: '18:00',
  closed: i >= 5,
}));

function parseValue(value) {
  if (!value) return defaultHours;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length === 7) {
      return parsed.map(h => ({ open: h.open || '09:00', close: h.close || '18:00', closed: !!h.closed }));
    }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const result = [];
      for (let i = 0; i < 7; i++) {
        const key = Object.keys(OLD_DAY_KEYS).find(k => OLD_DAY_KEYS[k] === i);
        const val = parsed[key];
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
  } catch {}
  return defaultHours;
}

import '@/components/dealer/workingHoursEditor.css';

export default function WorkingHoursEditor({ value, onChange }) {
  const { t } = useTranslation();
  const [hours, setHours] = useState(() => parseValue(value));

  const update = (index, field, val) => {
    const next = hours.map((h, i) => i === index ? { ...h, [field]: val } : h);
    setHours(next);
    onChange(JSON.stringify(next));
  };

  return (
    <div className="dealer-hours">
      {hours.map((h, i) => (
        <div key={i} className="day">
          <span className="name">{t(`dealer.${DAY_KEYS[i]}_short`)}</span>
          {!h.closed ? (
            <div className="times">
              <input type="time" aria-label={`${t(`dealer.${DAY_KEYS[i]}_short`)} ${t('dealer.hours_open')}`} value={h.open} onChange={e => update(i, 'open', e.target.value)} />
              <span className="dash">–</span>
              <input type="time" aria-label={`${t(`dealer.${DAY_KEYS[i]}_short`)} ${t('dealer.hours_closed')}`} value={h.close} onChange={e => update(i, 'close', e.target.value)} />
            </div>
          ) : <span className="closed">{t('dealer.hours_closed')}</span>}
          <label className="state">
            <input type="checkbox" checked={!h.closed} onChange={e => update(i, 'closed', !e.target.checked)} />
            <span>{t('dealer.hours_open')}</span>
          </label>
        </div>
      ))}
    </div>
  );
}