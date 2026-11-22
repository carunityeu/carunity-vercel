const OLD_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// Dealer working hours (JSON string, new array format or old {Mon:"08:00-19:00"} object) → 7 day entries
export function parseHours(value) {
  if (!value) return null;
  try {
    const p = JSON.parse(value);
    if (Array.isArray(p) && p.length === 7) {
      return p.map((h) => ({ open: h.open || '09:00', close: h.close || '18:00', closed: !!h.closed }));
    }
    if (p && typeof p === 'object' && !Array.isArray(p)) {
      return OLD_KEYS.map((k) => {
        const v = p[k];
        if (!v || !v.includes('-') || /закрыт|closed/i.test(v)) return { open: '09:00', close: '18:00', closed: true };
        const [open, close] = v.split('-');
        return { open: open.trim(), close: close.trim(), closed: false };
      });
    }
  } catch { /* not JSON */ }
  return null;
}

// Merge consecutive days with identical hours: Mon-Fri 08:00-18:00, Sat 10:00-18:00 ...
export function groupHours(hours) {
  const groups = [];
  hours.forEach((h, i) => {
    const key = h.closed ? 'closed' : `${h.open}-${h.close}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.to = i;
    else groups.push({ key, from: i, to: i, closed: h.closed, open: h.open, close: h.close });
  });
  return groups;
}