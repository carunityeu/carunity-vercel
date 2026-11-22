import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const DAY = 24 * 60 * 60 * 1000;
const RENEWAL_DAYS = 30;
const BONUS_DAYS = 3;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { carId } = await req.json().catch(() => ({}));
    if (!carId) return Response.json({ error: 'carId is required' }, { status: 400 });

    const car = await base44.asServiceRole.entities.Car.get(carId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!car) return Response.json({ error: 'Not found' }, { status: 404 });

    let ownsCar = car.seller_id === user.email || car.created_by_id === user.id || car.created_by === user.email;
    if (!ownsCar && car.dealer_id) {
      const dealers = await base44.asServiceRole.entities.Dealer.filter({ id: car.dealer_id });
      ownsCar = dealers[0]?.owner_email === user.email;
    }
    if (!ownsCar && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + RENEWAL_DAYS * DAY);
    const bonusUntil = new Date(now.getTime() + BONUS_DAYS * DAY);
    const currentPromo = car.promotion_until ? new Date(car.promotion_until) : null;
    const promotionUntil = currentPromo && currentPromo > bonusUntil ? currentPromo : bonusUntil;

    await base44.asServiceRole.entities.ListingRenewal.create({
      car_id: car.id,
      seller_email: car.seller_id || user.email,
      renewed_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      bonus_until: bonusUntil.toISOString(),
      bonus_days: BONUS_DAYS,
    });

    await base44.asServiceRole.entities.Car.update(car.id, {
      status: 'active',
      is_premium: true,
      promotion_until: promotionUntil.toISOString(),
    });

    return Response.json({
      success: true,
      expires_at: expiresAt.toISOString(),
      bonus_until: bonusUntil.toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}