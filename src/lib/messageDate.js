// Entity timestamps without an explicit offset are UTC, not browser-local time.
export default function messageDate(value) {
  if (typeof value !== 'string') return new Date(value);
  const date = value.trim();
  const hasTime = /[T ]\d{2}:\d{2}/.test(date);
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(date);
  const normalized = date.replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1');
  return new Date(hasTime && !hasOffset ? `${normalized}Z` : normalized);
}