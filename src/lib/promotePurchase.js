import { startCheckout } from '@/lib/stripeCheckout';

const BOOST_ITEM_BY_DAYS = { 1: 'boost_1', 3: 'boost_3', 7: 'boost_7', 14: 'boost_14', 30: 'boost_30' };

// Turns the workspace selection into checkout items — prices live on the server.
export function buildPromotionItems(cars, selections, dealerId) {
  const items = [];
  for (const car of cars) {
    const selection = selections[car.id];
    if (!selection) continue;
    const base = {
      listingId: car.id,
      listingType: 'car',
      listingTitle: car.title || '',
      dealerId: dealerId || car.dealer_id || null,
    };
    if (selection.boostOpt) {
      const id = BOOST_ITEM_BY_DAYS[selection.boostOpt.days];
      if (id) items.push({ id, ...base });
    }
    if (selection.topSpot) items.push({ id: 'top_spot_7', ...base });
    if (selection.metaPkg) items.push({ id: selection.metaPkg.id, ...base });
  }
  return items;
}

// Sends the buyer to Stripe Checkout; the webhook activates what was paid for.
export async function purchasePromotion({ cars, selections, dealerId }) {
  const items = buildPromotionItems(cars, selections, dealerId);
  if (!items.length) return false;
  return startCheckout({ items });
}