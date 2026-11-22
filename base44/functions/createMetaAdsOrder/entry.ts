import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { getUserPreferredLanguage } from '../../shared/notificationTranslations.ts';
import { getEmailStrings, getEmailSubject } from '../../shared/emailTranslations.ts';

const PACKAGES = {
  meta_boost: { name: 'Meta Boost', price: 49.99, metaBudget: 45, boostDays: 7, boostPrice: 9.99, topSpotDays: 0, topSpotPrice: 0, carunityMargin: 4.99, adDurationDays: 7, platformPromotionType: 'boost', platformPromotionDays: 7 },
  meta_premium: { name: 'Meta Premium', price: 89.99, metaBudget: 80, boostDays: 7, boostPrice: 9.99, topSpotDays: 0, topSpotPrice: 0, carunityMargin: 9.99, adDurationDays: 7, platformPromotionType: 'boost', platformPromotionDays: 7 },
  meta_top: { name: 'Meta TOP', price: 139.99, metaBudget: 130, boostDays: 0, boostPrice: 0, topSpotDays: 7, topSpotPrice: 59.99, carunityMargin: 9.99, adDurationDays: 7, platformPromotionType: 'top_spot', platformPromotionDays: 7 },
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Paid Meta packages are granted by the Stripe webhook only; this manual path is admin-only.
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { packageId, listingId, listingType, listingTitle, sellerEmail, dealerId } = body;

    if (!packageId || !listingId || !listingType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pkg = PACKAGES[packageId];
    if (!pkg) return Response.json({ error: 'Invalid package' }, { status: 400 });

    // 1. Activate platform promotion (boost or top_spot) on the listing
    const now = new Date();
    let platformPromotionUntil = null;

    // Get current car to check existing promotion
    let existingCar = null;
    try {
      existingCar = await base44.asServiceRole.entities.Car.get(listingId);
    } catch (e) {
      // listing might not be a Car entity, try other types
    }

    if (existingCar) {
      const baseDate = (existingCar.promotion_until && new Date(existingCar.promotion_until) > now)
        ? new Date(existingCar.promotion_until)
        : now;
      const expiresAt = new Date(baseDate);
      expiresAt.setDate(expiresAt.getDate() + pkg.platformPromotionDays);
      platformPromotionUntil = expiresAt.toISOString();

      // Create platform promotion record
      await base44.asServiceRole.entities.ListingPromotion.create({
        listing_id: listingId,
        listing_type: listingType,
        listing_title: listingTitle || '',
        seller_email: sellerEmail || '',
        dealer_id: dealerId || null,
        promotion_type: pkg.platformPromotionType,
        days: pkg.platformPromotionDays,
        price: pkg.platformPromotionType === 'boost' ? pkg.boostPrice : pkg.topSpotPrice,
        purchased_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'active',
      });

      // Apply promotion to the listing
      await base44.asServiceRole.entities.Car.update(listingId, {
        is_premium: true,
        promotion_until: expiresAt.toISOString(),
      });
    }

    // 2. Calculate ad schedule
    const adStartDate = now.toISOString();
    const adEndDate = new Date(now);
    adEndDate.setDate(adEndDate.getDate() + pkg.adDurationDays);

    // 3. Create Meta Ads order record (for manual fulfillment by CarUnity team)
    const order = await base44.asServiceRole.entities.MetaAdsOrder.create({
      package_id: packageId,
      package_name: pkg.name,
      price: pkg.price,
      meta_budget: pkg.metaBudget,
      carunity_margin: pkg.carunityMargin,
      listing_id: listingId,
      listing_type: listingType,
      listing_title: listingTitle || '',
      seller_email: sellerEmail || '',
      dealer_id: dealerId || null,
      platform_promotion_type: pkg.platformPromotionType,
      platform_promotion_days: pkg.platformPromotionDays,
      platform_promotion_until: platformPromotionUntil,
      meta_status: 'pending',
      status: 'paid',
      ad_duration_days: pkg.adDurationDays,
      ad_start_date: adStartDate,
      ad_end_date: adEndDate.toISOString(),
    });

    // 4. Send notification to the seller (in their preferred language)
    try {
      if (sellerEmail) {
        const lang = await getUserPreferredLanguage(base44, sellerEmail);
        const s = getEmailStrings('meta_ads_order', lang);
        const ctx = { packageName: pkg.name, price: pkg.price, metaBudget: pkg.metaBudget, promoType: pkg.platformPromotionType, promoDays: pkg.platformPromotionDays };
        const subject = getEmailSubject('meta_ads_order', lang, ctx);
        const body = `${s.greeting}\n\n${s.line1(ctx)}\n\n${s.includedTitle}\n${s.metaBudget(ctx)}\n${s.platformPromo(ctx)}\n\n${s.line2}\n\n${s.signature}`;
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: sellerEmail,
          subject,
          body,
        });
      }
    } catch (e) {
      console.error('Email send error:', e.message);
    }

    return Response.json({
      order_id: order.id,
      platform_promotion_until: platformPromotionUntil,
      package_name: pkg.name,
      price: pkg.price,
      meta_budget: pkg.metaBudget,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}