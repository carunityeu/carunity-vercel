// Unified price formatter for the whole app.
// Output: "35 000 €" (space thousand separator, € symbol after the amount).
export function formatPrice(price) {
  if (price == null || price === '' || isNaN(Number(price))) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(price));
}