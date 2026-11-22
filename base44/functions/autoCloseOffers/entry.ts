import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';
import { getUserPreferredLanguage, getNotificationText } from '../../shared/notificationTranslations.ts';

// This function is triggered by a scheduled automation (every hour)
// It finds expired fast-sale offers and marks them as expired
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date().toISOString();

    // Find expired fast-sale offers that are still pending
    const expiredOffers = await base44.asServiceRole.entities.TradeInOffer.filter(
      { fast_sale: true, status: 'pending', expires_at: { $lt: now } },
      '-created_date', 100
    );

    if (!expiredOffers || expiredOffers.length === 0) {
      return Response.json({ ok: true, closed: 0 });
    }

    // Mark all as expired in one batch
    await base44.asServiceRole.entities.TradeInOffer.updateMany(
      { fast_sale: true, status: 'pending', expires_at: { $lt: now } },
      { $set: { status: 'expired' } }
    );

    // Notify sellers about expired offers
    const langCache: Record<string, string> = {};
    for (const offer of expiredOffers) {
      if (!langCache[offer.seller_email]) {
        langCache[offer.seller_email] = await getUserPreferredLanguage(base44, offer.seller_email);
      }
      const lang = langCache[offer.seller_email] as any;
      const ctx = { carTitle: offer.car_title, dealerName: offer.dealer_name, kind: 'offer_expired' };
      const { title, content } = getNotificationText('offer_expired', lang, ctx);
      await base44.asServiceRole.entities.Notification.create({
        user_email: offer.seller_email,
        type: 'offer_received',
        title,
        content,
        data: ctx,
        car_id: offer.car_id,
        car_title: offer.car_title,
        link: '/Dashboard?tab=get-offers',
        is_read: false
      });
    }

    return Response.json({ ok: true, closed: expiredOffers.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});