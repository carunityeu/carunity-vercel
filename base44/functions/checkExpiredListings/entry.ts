import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { getUserPreferredLanguage, getNotificationText } from '../../shared/notificationTranslations.ts';
import { getEmailStrings, getEmailSubject } from '../../shared/emailTranslations.ts';

const DAY = 24 * 60 * 60 * 1000;
const LISTING_DAYS = 30;
const APP_URL = 'https://carunity.eu';
const DASHBOARD_URL = `${APP_URL}/Dashboard?tab=listings`;

const roundPrice = (value) => Math.round(value / 100) * 100;
const formatPrice = (value) => value.toLocaleString('en-US').replace(/,/g, ' ');

async function getSimilarPriceRange(base44, car) {
  const { items } = await base44.asServiceRole.entities.Car.filter(
    { brand: car.brand, status: 'active' },
    { sort: '-created_date', limit: 60 }
  );
  const prices = (items || [])
    .filter(other => other.id !== car.id && other.price > 0 && (
      other.model === car.model ||
      (other.body_type && other.body_type === car.body_type && Math.abs((other.year || 0) - (car.year || 0)) <= 2)
    ))
    .map(other => other.price)
    .sort((a, b) => a - b);
  if (prices.length < 2) return null;
  const low = prices[0];
  const high = prices[prices.length - 1];
  if (high - low < 100) return null;
  return `${formatPrice(roundPrice(low))}–${formatPrice(roundPrice(high))} €`;
}

// Scheduled function: reminders for listings whose 30-day period has ended
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();
    const langCache = {};

    const { items: activeCars } = await base44.asServiceRole.entities.Car.filter({ status: 'active' }, { limit: 500 });
    const { items: renewals } = await base44.asServiceRole.entities.ListingRenewal.filter({}, { sort: '-created_date', limit: 500 });

    const renewedUntil = (renewals || []).reduce((map, renewal) => {
      const current = map[renewal.car_id];
      if (!current || new Date(renewal.expires_at) > new Date(current)) map[renewal.car_id] = renewal.expires_at;
      return map;
    }, {});

    const expiredCars = (activeCars || []).filter(car => {
      if (car.seller_type !== 'private' || !car.seller_id) return false;
      const expiresAt = renewedUntil[car.id]
        ? new Date(renewedUntil[car.id]).getTime()
        : new Date(car.created_date).getTime() + LISTING_DAYS * DAY;
      return expiresAt <= now;
    });

    // Reminder 3 days before the private listing ends: «Машина продана?»
    const expiringCars = (activeCars || []).filter(car => {
      if (car.seller_type !== 'private' || !car.seller_id) return false;
      const expiresAt = renewedUntil[car.id]
        ? new Date(renewedUntil[car.id]).getTime()
        : new Date(car.created_date).getTime() + LISTING_DAYS * DAY;
      return expiresAt > now && expiresAt - now <= 3 * DAY;
    });

    let reminders = 0;

    for (const car of expiringCars) {
      const answered = await base44.asServiceRole.entities.SaleFeedback.filter({ listing_id: car.id }, { limit: 1 });
      if (answered.length > 0) continue;

      const existingNotifs = await base44.asServiceRole.entities.Notification.filter({
        user_email: car.seller_id,
        car_id: car.id,
        type: 'listing_expiring'
      });
      if (existingNotifs.some(n => (now - new Date(n.created_date).getTime()) < 3 * DAY)) continue;

      const expiresAt = renewedUntil[car.id]
        ? new Date(renewedUntil[car.id]).getTime()
        : new Date(car.created_date).getTime() + LISTING_DAYS * DAY;
      const daysLeft = Math.max(1, Math.ceil((expiresAt - now) / DAY));
      const carTitle = `${car.brand} ${car.model} ${car.year}`;

      if (!langCache[car.seller_id]) {
        langCache[car.seller_id] = await getUserPreferredLanguage(base44, car.seller_id);
      }
      const lang = langCache[car.seller_id];
      const { title, content } = getNotificationText('listing_expiring', lang, { carTitle, daysLeft, views: car.views_count || 0 });

      await base44.asServiceRole.entities.Notification.create({
        user_email: car.seller_id,
        type: 'listing_expiring',
        title,
        content,
        data: { carTitle, daysLeft, views: car.views_count || 0 },
        car_id: car.id,
        car_title: carTitle,
        link: '/Dashboard?tab=listings'
      });

      reminders += 1;
    }

    let notified = 0;

    for (const car of expiredCars) {
      const existingNotifs = await base44.asServiceRole.entities.Notification.filter({
        user_email: car.seller_id,
        car_id: car.id,
        type: 'promotion_ended'
      });
      const recentNotif = existingNotifs.find(n => (now - new Date(n.created_date).getTime()) < 7 * DAY);
      if (recentNotif) continue;

      const [favorites, messages, priceRange] = await Promise.all([
        base44.asServiceRole.entities.Favorite.count({ car_id: car.id }),
        base44.asServiceRole.entities.Message.count({ car_id: car.id }),
        getSimilarPriceRange(base44, car).catch(() => null),
      ]);

      const carTitle = `${car.brand} ${car.model} ${car.year}`;
      if (!langCache[car.seller_id]) {
        langCache[car.seller_id] = await getUserPreferredLanguage(base44, car.seller_id);
      }
      const lang = langCache[car.seller_id];
      const s = getEmailStrings('listing_expired', lang);
      const ctx = {
        carTitle,
        views: car.views_count || 0,
        favorites,
        messages,
        priceRange,
      };

      await base44.asServiceRole.entities.Notification.create({
        user_email: car.seller_id,
        type: 'promotion_ended',
        title: s.notifTitle,
        content: s.notifContent(ctx),
        car_id: car.id,
        car_title: carTitle,
        link: '/Dashboard?tab=listings'
      });

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: car.seller_id,
        subject: getEmailSubject('listing_expired', lang, ctx),
        body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1e293b;">${s.heading}</h2>
  <p style="color:#64748b;">${s.body1(ctx)}</p>
  <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:20px 0;">
    <p style="margin:0 0 6px;font-size:13px;color:#64748b;">${s.statsTitle}</p>
    <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${s.statsLine(ctx)}</p>
    ${priceRange ? `<p style="margin:12px 0 0;font-size:14px;color:#334155;">${s.priceHint(ctx)}</p>
    <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">${s.priceAdvice}</p>` : ''}
  </div>
  <p style="color:#0f172a;font-weight:600;">${s.bonus}</p>
  <p style="color:#1e293b;font-weight:600;margin-top:20px;">${s.question}</p>
  <p style="color:#64748b;">${s.soldHint}</p>
  <a href="${DASHBOARD_URL}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#10b981;color:white;text-decoration:none;border-radius:8px;font-weight:600;">${s.ctaRenew}</a>
  <p style="color:#94a3b8;font-size:12px;margin-top:24px;">${s.footer}</p>
</div>`
      });

      notified += 1;
    }

    return Response.json({ processed: expiredCars.length, notified, reminders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}