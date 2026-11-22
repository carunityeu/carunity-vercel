import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { getUserPreferredLanguage, getNotificationText } from '../../shared/notificationTranslations.ts';

// Scheduled function: runs daily to check for expiring/expired promotions
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Cache user languages to avoid repeated lookups
  const langCache: Record<string, string> = {};

  const now = new Date();
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);

  const allCars = await base44.asServiceRole.entities.Car.filter({ is_premium: true, status: 'active' });

  for (const car of allCars) {
    if (!car.promotion_until) continue;

    const promoEnd = new Date(car.promotion_until);

    // Promotion ended
    if (promoEnd < now) {
      // Check if we already sent this notification recently
      const existing = await base44.asServiceRole.entities.Notification.filter({
        user_email: car.created_by,
        type: 'promotion_ended',
        car_id: car.id
      });

      const recentlyNotified = existing.some(n => {
        const d = new Date(n.created_date);
        return (now - d) < 24 * 60 * 60 * 1000;
      });

      if (!recentlyNotified) {
        if (!langCache[car.created_by]) {
          langCache[car.created_by] = await getUserPreferredLanguage(base44, car.created_by);
        }
        const lang = langCache[car.created_by] as any;
        const ctx = { carTitle: car.title };
        const { title, content } = getNotificationText('promotion_ended', lang, ctx);
        await base44.asServiceRole.entities.Notification.create({
          user_email: car.created_by,
          type: 'promotion_ended',
          title,
          content,
          data: ctx,
          car_id: car.id,
          car_title: car.title,
          link: `/Dashboard?tab=listings`,
          is_read: false
        });
      }
    }
    // Promotion ending in 3 days
    else if (promoEnd <= in3Days) {
      const existing = await base44.asServiceRole.entities.Notification.filter({
        user_email: car.created_by,
        type: 'promotion_ending',
        car_id: car.id
      });

      const recentlyNotified = existing.some(n => {
        const d = new Date(n.created_date);
        return (now - d) < 24 * 60 * 60 * 1000;
      });

      if (!recentlyNotified) {
        const daysLeft = Math.ceil((promoEnd - now) / (1000 * 60 * 60 * 24));
        if (!langCache[car.created_by]) {
          langCache[car.created_by] = await getUserPreferredLanguage(base44, car.created_by);
        }
        const lang = langCache[car.created_by] as any;
        const ctx = { carTitle: car.title, daysLeft };
        const { title, content } = getNotificationText('promotion_ending', lang, ctx);
        await base44.asServiceRole.entities.Notification.create({
          user_email: car.created_by,
          type: 'promotion_ending',
          title,
          content,
          data: ctx,
          car_id: car.id,
          car_title: car.title,
          link: `/Dashboard?tab=listings`,
          is_read: false
        });
      }
    }
  }

  return Response.json({ ok: true, processed: allCars.length });
});