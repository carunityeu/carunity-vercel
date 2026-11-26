// Single source of truth for every price the app can charge.
// Buyers pick an id; amounts, currency and durations always come from here.

export const CURRENCY = 'eur';

export const CATALOG = {
  listing_30: { name: 'CarUnity listing (30 days)', amount: 499, kind: 'listing', days: 30 },
  listing_90: { name: 'CarUnity listing (90 days)', amount: 999, kind: 'listing', days: 90 },
  boost_1: { name: 'Boost (1 day)', amount: 199, kind: 'boost', days: 1 },
  boost_3: { name: 'Boost (3 days)', amount: 499, kind: 'boost', days: 3 },
  boost_7: { name: 'Boost (7 days)', amount: 999, kind: 'boost', days: 7 },
  boost_14: { name: 'Boost (14 days)', amount: 1799, kind: 'boost', days: 14 },
  boost_30: { name: 'Boost (30 days)', amount: 2999, kind: 'boost', days: 30 },
  top_spot_7: { name: 'TOP Spot (7 days)', amount: 5999, kind: 'top_spot', days: 7 },
  meta_boost: { name: 'Meta Boost', amount: 4999, kind: 'meta', adDays: 7, metaBudget: 45, platformType: 'boost', platformDays: 7 },
  meta_premium: { name: 'Meta Premium', amount: 8999, kind: 'meta', adDays: 7, metaBudget: 80, platformType: 'boost', platformDays: 7 },
  meta_top: { name: 'Meta TOP', amount: 13999, kind: 'meta', adDays: 7, metaBudget: 130, platformType: 'top_spot', platformDays: 7 },
};

export const DEALER_PLANS = {
  starter: {
    name: 'Dealer STARTER',
    monthly: 5900,
    yearly: 59000,
  },
  pro: {
    name: 'Dealer PRO',
    monthly: 11900,
    yearly: 119000,
  },
  premium: {
    name: 'Dealer PREMIUM',
    monthly: 14900,
    yearly: 149000,
  },
};

export const PLAN_DAYS = { monthly: 30, yearly: 365 };

// Turns client-selected ids into fully server-resolved line items.
export function resolveItems(rawItems) {
  if (!Array.isArray(rawItems)) return { error: 'items_required' };
  if (!rawItems.length) return { error: 'items_required' };
  if (rawItems.length > 10) return { error: 'too_many_items' };

  const items = [];
  for (const raw of rawItems) {
    const entry = CATALOG[raw?.id];
    if (!entry) return { error: 'unknown_item' };
    if (!raw?.listingId) return { error: 'listing_required' };
    items.push({
      id: raw.id,
      name: entry.name,
      amount: entry.amount,
      kind: entry.kind,
      days: entry.days || entry.platformDays || entry.adDays,
      adDays: entry.adDays || null,
      metaBudget: entry.metaBudget || null,
      platformType: entry.platformType || null,
      platformDays: entry.platformDays || null,
      listingId: raw?.listingId || null,
      listingType: raw?.listingType || 'car',
      listingTitle: raw?.listingTitle || '',
    });
  }
  return { items };
}