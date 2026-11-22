import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';
import { getUserPreferredLanguage, getNotificationText } from '../../shared/notificationTranslations.ts';

// This function is triggered by entity automation when a Car is created/updated
// It finds dealers whose purchase criteria match the car and notifies them
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { event, data } = payload;

    if (!data) {
      return Response.json({ ok: true });
    }

    // Only process private seller cars
    if (data.seller_type !== 'private') {
      return Response.json({ ok: true });
    }

    // Only process active cars
    if (data.status !== 'active') {
      return Response.json({ ok: true });
    }

    // Check if notifications already sent for this car (deduplication)
    const existingNotifs = await base44.asServiceRole.entities.Notification.filter(
      { type: 'fast_sale_match', car_id: event?.entity_id || data.id },
      '-created_date', 1
    );
    if (existingNotifs && existingNotifs.length > 0) {
      return Response.json({ ok: true, matched: 0, reason: 'already_notified' });
    }

    // Get all enabled dealer purchase criteria
    const allCriteria = await base44.asServiceRole.entities.DealerPurchaseCriteria.filter(
      { enabled: true },
      '-created_date', 100
    );

    if (!allCriteria || allCriteria.length === 0) {
      return Response.json({ ok: true, matched: 0, reason: 'no_criteria' });
    }

    // Filter matching criteria
    const matchingDealers = [];
    for (const criteria of allCriteria) {
      // Check brand
      if (criteria.brands && criteria.brands.length > 0) {
        if (!criteria.brands.some(b => b.toLowerCase() === (data.brand || '').toLowerCase())) continue;
      }
      // Check body type
      if (criteria.body_types && criteria.body_types.length > 0) {
        if (!criteria.body_types.includes(data.body_type)) continue;
      }
      // Check fuel type
      if (criteria.fuel_types && criteria.fuel_types.length > 0) {
        if (!criteria.fuel_types.includes(data.fuel_type)) continue;
      }
      // Check price range
      if (criteria.price_min && (data.price || 0) < criteria.price_min) continue;
      if (criteria.price_max && (data.price || 0) > criteria.price_max) continue;
      // Check year range
      if (criteria.year_min && (data.year || 0) < criteria.year_min) continue;
      if (criteria.year_max && (data.year || 0) > criteria.year_max) continue;
      // Check mileage
      if (criteria.mileage_max && data.mileage && data.mileage > criteria.mileage_max) continue;
      // Check country
      if (criteria.countries && criteria.countries.length > 0) {
        if (!criteria.countries.includes(data.country)) continue;
      }

      matchingDealers.push(criteria);
    }

    // Limit to max 10 dealers to prevent spam
    const maxDealers = 10;
    const selectedDealers = matchingDealers.slice(0, maxDealers);

    // Create notifications for each matched dealer
    const carId = event?.entity_id || data.id;
    const carTitle = `${data.brand || ''} ${data.model || ''} ${data.year || ''}`.trim();
    const priceStr = data.price ? `${data.price} EUR` : '';

    // Cache user languages
    const langCache: Record<string, string> = {};

    for (const dealer of selectedDealers) {
      if (!langCache[dealer.dealer_email]) {
        langCache[dealer.dealer_email] = await getUserPreferredLanguage(base44, dealer.dealer_email);
      }
      const lang = langCache[dealer.dealer_email] as any;
      const ctx = { carTitle, price: priceStr };
      const { title, content } = getNotificationText('fast_sale_match', lang, ctx);
      await base44.asServiceRole.entities.Notification.create({
        user_email: dealer.dealer_email,
        type: 'fast_sale_match',
        title,
        content,
        data: ctx,
        car_id: carId,
        car_title: carTitle,
        link: `/CarDetails?id=${carId}`,
        is_read: false
      });
    }

    return Response.json({ ok: true, matched: selectedDealers.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});