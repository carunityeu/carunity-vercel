import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { getUserPreferredLanguage, getNotificationText } from '../../shared/notificationTranslations.ts';

// Scheduled: runs daily to find new cars matching saved searches
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const savedSearches = await base44.asServiceRole.entities.SavedSearch.filter({ notify_new: true });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Cache user languages to avoid repeated lookups
  const langCache: Record<string, string> = {};

  for (const search of savedSearches) {
    const filters = search.filters || {};
    let query = { status: 'active' };

    if (filters.brand && filters.brand !== 'any') query.brand = filters.brand;
    if (filters.fuelType && filters.fuelType !== 'any') query.fuel_type = filters.fuelType;
    if (filters.transmission && filters.transmission !== 'any') query.transmission = filters.transmission;

    const newCars = await base44.asServiceRole.entities.Car.filter(query, '-created_date', 20);

    const matchingNew = newCars.filter(car => {
      const createdAt = new Date(car.created_date);
      if (createdAt < yesterday) return false;
      if (filters.priceFrom && car.price < parseInt(filters.priceFrom)) return false;
      if (filters.priceTo && car.price > parseInt(filters.priceTo)) return false;
      if (filters.yearFrom && car.year < parseInt(filters.yearFrom)) return false;
      if (filters.yearTo && car.year > parseInt(filters.yearTo)) return false;
      if (filters.bodyTypes?.length > 0 && !filters.bodyTypes.includes(car.body_type)) return false;
      return true;
    });

    if (matchingNew.length > 0) {
      const searchName = search.name || '';
      if (!langCache[search.user_email]) {
        langCache[search.user_email] = await getUserPreferredLanguage(base44, search.user_email);
      }
      const lang = langCache[search.user_email] as any;
      const ctx = { count: matchingNew.length, searchName };
      const { title, content } = getNotificationText('saved_search_match', lang, ctx);
      await base44.asServiceRole.entities.Notification.create({
        user_email: search.user_email,
        type: 'saved_search_match',
        title,
        content,
        data: ctx,
        link: `/Catalog?${new URLSearchParams(filters).toString()}`,
        is_read: false
      });
    }
  }

  return Response.json({ ok: true });
});