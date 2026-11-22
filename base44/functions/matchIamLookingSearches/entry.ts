import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { getUserPreferredLanguage, getNotificationText } from '../../shared/notificationTranslations.ts';

// Triggered by workflow when a Car becomes active
// Finds SavedSearch records where is_i_am_looking === true, matches the car, creates notifications
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const car_id = body.car_id;

    const langCache: Record<string, string> = {};

    if (!car_id) {
      return Response.json({ ok: true, message: 'No car_id provided' });
    }

    // Fetch the car
    let car;
    try {
      car = await base44.asServiceRole.entities.Car.get(car_id);
    } catch {
      return Response.json({ ok: true, message: 'Car not found' });
    }

    if (!car || car.status !== 'active') {
      return Response.json({ ok: true, message: 'Car not active' });
    }

    // Find all "I'm looking for" searches
    const searches = await base44.asServiceRole.entities.SavedSearch.filter({ is_i_am_looking: true });
    if (!searches || searches.length === 0) {
      return Response.json({ ok: true, message: 'No active I-am-looking searches' });
    }

    let matchCount = 0;
    const carTitle = car.title || `${car.brand || ''} ${car.model || ''} ${car.year || ''}`.trim();

    for (const search of searches) {
      const filters = search.filters || {};
      if (!matchesFilters(car, filters)) continue;

      // Deduplication: skip if notification already exists for this car + user
      const existing = await base44.asServiceRole.entities.Notification.filter(
        { type: 'saved_search_match', car_id: car_id, user_email: search.user_email },
        '-created_date', 1
      );
      if (existing && existing.length > 0) continue;

      const searchName = search.name || '';
      if (!langCache[search.user_email]) {
        langCache[search.user_email] = await getUserPreferredLanguage(base44, search.user_email);
      }
      const lang = langCache[search.user_email] as any;
      const ctx = { carTitle, price: car.price, searchName, isIamLooking: true };
      const { title, content } = getNotificationText('saved_search_match_iolooking', lang, ctx);
      await base44.asServiceRole.entities.Notification.create({
        user_email: search.user_email,
        type: 'saved_search_match',
        title,
        content,
        data: ctx,
        car_id: car_id,
        car_title: carTitle,
        link: `/CarDetails?id=${car_id}`,
        is_read: false
      });
      matchCount++;
    }

    return Response.json({ ok: true, matches: matchCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function matchesFilters(car, filters) {
  const brandFilter = filters.brand || filters.brands;
  if (brandFilter && brandFilter !== 'any' && car.brand !== brandFilter) return false;
  if (filters.model && car.model) {
    const carModel = String(car.model).toLowerCase();
    const filterModel = String(filters.model).toLowerCase();
    if (!carModel.includes(filterModel) && !filterModel.includes(carModel)) return false;
  }
  if (filters.priceFrom && car.price < Number(filters.priceFrom)) return false;
  if (filters.priceTo && car.price > Number(filters.priceTo)) return false;
  if (filters.yearFrom && car.year < Number(filters.yearFrom)) return false;
  if (filters.yearTo && car.year > Number(filters.yearTo)) return false;
  if (filters.fuelType && filters.fuelType !== 'any' && car.fuel_type !== filters.fuelType) return false;
  if (filters.transmission && filters.transmission !== 'any' && car.transmission !== filters.transmission) return false;
  if (filters.bodyType && car.body_type !== filters.bodyType) return false;
  if (filters.bodyTypes && filters.bodyTypes.length > 0 && !filters.bodyTypes.includes(car.body_type)) return false;
  if (filters.mileageTo && car.mileage > Number(filters.mileageTo)) return false;
  if (filters.country && car.country !== filters.country) return false;
  return true;
}