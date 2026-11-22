export const BOOST_OPTIONS = [
  { days: 1, price: 1.99 }, { days: 3, price: 4.99 }, { days: 7, price: 9.99 },
  { days: 14, price: 17.99 }, { days: 30, price: 29.99 },
];

export const TOP_SPOT = { days: 7, price: 59.99 };

export function isPromotionActive(car) {
  if (!car) return false;
  return car.is_premium && car.promotion_until && new Date(car.promotion_until) > new Date();
}

export const EMPTY_SELECTION = { boostOpt: null, topSpot: false, metaPkg: null };

export function roundPrice(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function formatPrice(value) {
  const rounded = roundPrice(value);
  return `${rounded.toFixed(2).replace(/\.00$/, '')}€`;
}

export function selectionTotal(selection) {
  if (!selection) return 0;
  return roundPrice(
    (selection.boostOpt?.price || 0) + (selection.topSpot ? TOP_SPOT.price : 0) + (selection.metaPkg?.price || 0)
  );
}

export function hasSelection(selection) {
  if (!selection) return false;
  return Boolean(selection.boostOpt || selection.topSpot || selection.metaPkg);
}