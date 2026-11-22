import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { PROMOTION_THRESHOLDS } from '../../shared/promotionThresholds.ts';
import { getUserPreferredLanguage, getNotificationText } from '../../shared/notificationTranslations.ts';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();

    const periodStart = new Date(now.getTime() - (PROMOTION_THRESHOLDS.analysisPeriodDays + PROMOTION_THRESHOLDS.comparisonPeriodDays) * MS_PER_DAY);
    const recentStart = new Date(now.getTime() - PROMOTION_THRESHOLDS.analysisPeriodDays * MS_PER_DAY);

    // 1. Get all active dealer cars
    const dealerCars = await base44.asServiceRole.entities.Car.filter(
      { status: 'active', seller_type: 'dealer' },
      '-created_date', 500
    );
    const carsWithDealer = dealerCars.filter(c => c.dealer_id);
    if (carsWithDealer.length === 0) {
      return Response.json({ ok: true, processed: 0, notificationsCreated: 0 });
    }

    // 2. Get dealers → map dealer_id to owner_email
    const dealers = await base44.asServiceRole.entities.Dealer.filter({}, '-created_date', 500);
    const dealerEmailMap = {};
    for (const d of dealers) {
      dealerEmailMap[d.id] = d.owner_email;
    }

    // 3. Get ViewHistory (recent records sorted by viewed_at desc)
    const carIdSet = new Set(carsWithDealer.map(c => c.id));
    const viewHistory = await base44.asServiceRole.entities.ViewHistory.filter(
      {}, '-viewed_at', 10000
    );

    // 4. Group views by car_id and period
    const viewsByCar = {};
    for (const car of carsWithDealer) {
      viewsByCar[car.id] = { recent: 0, previous: 0 };
    }
    for (const v of viewHistory) {
      if (!v.car_id || !carIdSet.has(v.car_id)) continue;
      const viewedAt = new Date(v.viewed_at || v.created_date);
      if (viewedAt < periodStart) continue;
      if (viewedAt >= recentStart) {
        viewsByCar[v.car_id].recent++;
      } else {
        viewsByCar[v.car_id].previous++;
      }
    }

    // 5. Get existing view_decline notifications (to check cooldown)
    const allViewDeclineNotifs = await base44.asServiceRole.entities.Notification.filter(
      { type: 'view_decline' }, '-created_date', 500
    );
    const notifiedCarIds = new Set();
    for (const n of allViewDeclineNotifs) {
      if (!n.car_id) continue;
      const d = new Date(n.created_date);
      if ((now - d) < PROMOTION_THRESHOLDS.notificationCooldownHours * 60 * 60 * 1000) {
        notifiedCarIds.add(n.car_id);
      }
    }

    // 6. Check each car for decline and create notifications
    let notificationsCreated = 0;
    const langCache: Record<string, string> = {};
    for (const car of carsWithDealer) {
      const views = viewsByCar[car.id];

      if (views.previous < PROMOTION_THRESHOLDS.minViewsThreshold) continue;

      // Skip if car currently has active promotion
      if (car.is_premium && car.promotion_until && new Date(car.promotion_until) > now) continue;

      const declinePercent = Math.round(((views.previous - views.recent) / views.previous) * 100);
      if (declinePercent < PROMOTION_THRESHOLDS.minDeclinePercent) continue;

      // Skip if already notified recently (cooldown)
      if (notifiedCarIds.has(car.id)) continue;

      const dealerEmail = dealerEmailMap[car.dealer_id];
      if (!dealerEmail) continue;

      const carTitle = `${car.brand} ${car.model} ${car.year || ''}`.trim();
      if (!langCache[dealerEmail]) {
        langCache[dealerEmail] = await getUserPreferredLanguage(base44, dealerEmail);
      }
      const lang = langCache[dealerEmail] as any;
      const ctx = { carTitle, declinePercent };
      const { title, content } = getNotificationText('view_decline', lang, ctx);
      await base44.asServiceRole.entities.Notification.create({
        user_email: dealerEmail,
        type: 'view_decline',
        title,
        content,
        data: ctx,
        car_id: car.id,
        car_title: carTitle,
        link: '/DealerDashboard',
        is_read: false,
      });
      notificationsCreated++;
    }

    return Response.json({
      ok: true,
      processed: carsWithDealer.length,
      notificationsCreated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}