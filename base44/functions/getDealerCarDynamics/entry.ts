import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { PROMOTION_THRESHOLDS } from '../../shared/promotionThresholds.ts';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { dealerId } = body;
    if (!dealerId) return Response.json({ error: 'dealerId required' }, { status: 400 });

    // Get dealer's active cars
    const cars = await base44.asServiceRole.entities.Car.filter(
      { dealer_id: dealerId, status: 'active' },
      '-created_date', 200
    );

    if (cars.length === 0) {
      return Response.json({ dynamics: {} });
    }

    const carIdSet = new Set(cars.map(c => c.id));
    const now = new Date();
    const periodStart = new Date(now.getTime() - (PROMOTION_THRESHOLDS.analysisPeriodDays + PROMOTION_THRESHOLDS.comparisonPeriodDays) * MS_PER_DAY);
    const recentStart = new Date(now.getTime() - PROMOTION_THRESHOLDS.analysisPeriodDays * MS_PER_DAY);

    // Get ViewHistory (recent records)
    const viewHistory = await base44.asServiceRole.entities.ViewHistory.filter(
      {}, '-viewed_at', 10000
    );

    // Build dynamics per car
    const dynamics = {};
    for (const car of cars) {
      dynamics[car.id] = { recent_views: 0, prev_views: 0, decline_percent: 0 };
    }

    for (const v of viewHistory) {
      if (!v.car_id || !carIdSet.has(v.car_id)) continue;
      const viewedAt = new Date(v.viewed_at || v.created_date);
      if (viewedAt < periodStart) continue;
      if (viewedAt >= recentStart) {
        dynamics[v.car_id].recent_views++;
      } else {
        dynamics[v.car_id].prev_views++;
      }
    }

    // Calculate decline percent
    for (const carId of Object.keys(dynamics)) {
      const d = dynamics[carId];
      if (d.prev_views > 0) {
        d.decline_percent = Math.round(((d.prev_views - d.recent_views) / d.prev_views) * 100);
      }
    }

    return Response.json({ dynamics });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}