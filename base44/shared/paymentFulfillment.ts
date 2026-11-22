// Applies a paid Stripe checkout to the app's records.
// Called only from the signature-verified webhook — never from the browser.

function addDays(base, days) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

async function promoteListing(db, item, purchase, now) {
  const car = await db.entities.Car.get(item.listingId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
  if (!car) return null;
  const baseDate = car.promotion_until && new Date(car.promotion_until) > now ? new Date(car.promotion_until) : now;
  const expiresAt = addDays(baseDate, item.days);
  await db.entities.ListingPromotion.create({
    listing_id: item.listingId,
    listing_type: item.listingType || 'car',
    listing_title: item.listingTitle || car.title || '',
    seller_email: purchase.buyerEmail || car.seller_id || '',
    dealer_id: purchase.dealerId || car.dealer_id || null,
    promotion_type: item.kind === 'top_spot' ? 'top_spot' : 'boost',
    days: item.days,
    price: item.amount / 100,
    purchased_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: 'active',
  });
  await db.entities.Car.update(item.listingId, {
    is_premium: true,
    promotion_until: expiresAt.toISOString(),
  });
  return expiresAt;
}

async function activateListing(db, item, purchase, now) {
  const car = await db.entities.Car.get(item.listingId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
  if (!car) return;
  const expiresAt = addDays(now, item.days || 30);
  await db.entities.Car.update(item.listingId, { status: 'active' });
  await db.entities.ListingRenewal.create({
    car_id: item.listingId,
    seller_email: purchase.buyerEmail || car.seller_id || '',
    renewed_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    bonus_days: 0,
  });
}

async function orderMeta(db, item, purchase, now) {
  const price = item.amount / 100;
  const adEnd = addDays(now, item.adDays || 7);
  const platformUntil = await promoteListing(db, {
    ...item,
    kind: item.platformType === 'top_spot' ? 'top_spot' : 'boost',
    days: item.platformDays || 7,
  }, purchase, now);
  await db.entities.MetaAdsOrder.create({
    package_id: item.id,
    package_name: item.name,
    price,
    meta_budget: item.metaBudget || 0,
    carunity_margin: Math.round((price - (item.metaBudget || 0)) * 100) / 100,
    listing_id: item.listingId,
    listing_type: item.listingType || 'car',
    listing_title: item.listingTitle || '',
    seller_email: purchase.buyerEmail || '',
    dealer_id: purchase.dealerId || null,
    platform_promotion_type: item.platformType || 'boost',
    platform_promotion_days: item.platformDays || 7,
    platform_promotion_until: platformUntil ? platformUntil.toISOString() : null,
    meta_status: 'pending',
    status: 'paid',
    ad_duration_days: item.adDays || 7,
    ad_start_date: now.toISOString(),
    ad_end_date: adEnd.toISOString(),
  });
}

async function applyPlan(db, purchase, now) {
  if (!purchase.plan?.dealerId) return;
  const until = addDays(now, purchase.plan.days || 30);
  await db.entities.Dealer.update(purchase.plan.dealerId, {
    subscription_type: purchase.plan.id,
    subscription_until: until.toISOString().slice(0, 10),
  });
}

// purchase: { sessionId, buyerEmail, dealerId, items: [...], plan: {id, days, dealerId} | null }
export async function grantPurchase(base44, purchase) {
  const db = base44.asServiceRole;
  const now = new Date();

  const page = await db.entities.PaymentPurchase.filter({ session_id: purchase.sessionId }, { limit: 1 });
  const already = page?.items?.[0] || null;
  if (already) return already;

  for (const item of purchase.items || []) {
    if (item.kind === 'listing') await activateListing(db, item, purchase, now);
    else if (item.kind === 'meta') await orderMeta(db, item, purchase, now);
    else await promoteListing(db, item, purchase, now);
  }

  if (purchase.plan) await applyPlan(db, purchase, now);

  const records = purchase.items?.length
    ? purchase.items.map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount / 100,
      listing_id: item.listingId || '',
    }))
    : [{
      id: purchase.plan?.id || 'plan',
      name: purchase.plan?.name || 'Dealer plan',
      amount: (purchase.plan?.amount || 0) / 100,
      listing_id: '',
    }];

  return await db.entities.PaymentPurchase.create({
    session_id: purchase.sessionId,
    buyer_email: purchase.buyerEmail || '',
    amount: Math.round(records.reduce((sum, record) => sum + record.amount, 0) * 100) / 100,
    currency: 'eur',
    kind: purchase.plan ? 'plan' : purchase.items?.some((item) => item.kind === 'listing') ? 'listing' : 'promotion',
    items: records,
    reference_id: purchase.plan?.dealerId || purchase.items?.[0]?.listingId || '',
    status: 'paid',
  });
}