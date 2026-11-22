import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    await base44.auth.me().catch(e => e.status === 401 ? null : Promise.reject(e));
    const input = await req.json().catch(() => ({}));
    const { searchTerms = [], countryValues = [], cityValues = [], verifiedOnly = false, sortBy = 'cars', page = 1, language = 'en' } = input;
    const validTerms = (values, limit) => Array.isArray(values) && values.length <= limit && values.every(v => typeof v === 'string' && v.length > 0 && v.length <= 120);
    if (!validTerms(searchTerms, 1000) || !validTerms(countryValues, 20) || !validTerms(cityValues, 20) || typeof verifiedOnly !== 'boolean' || !['cars', 'rating', 'name', 'newest'].includes(sortBy) || !Number.isSafeInteger(page) || page < 1 || !['ru', 'en', 'et', 'lv', 'lt'].includes(language)) return Response.json({ error: 'Invalid directory filters' }, { status: 400 });
    const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = (values, exact = false) => ({ $regex: `${exact ? '^' : ''}(?:${values.map(escape).join('|')})${exact ? '$' : ''}`, $options: 'i' });
    const query = {};
    if (searchTerms.length) query.$or = ['name', 'city', 'country'].map(field => ({ [field]: regex(searchTerms) }));
    if (countryValues.length) query.country = regex(countryValues, true);
    if (cityValues.length) query.city = regex(cityValues, true);
    if (verifiedOnly) query.is_verified = true;
    const [total, allTotal, cityPage] = await Promise.all([
      base44.entities.Dealer.count(query),
      base44.entities.Dealer.count({}),
      base44.entities.Dealer.list({ distinct: 'city' })
    ]);
    const pageSize = 12;
    const currentPage = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
    const end = currentPage * pageSize;
    const compare = (a, b) => {
      let order = 0;
      if (sortBy === 'cars') order = b.car_count - a.car_count;
      if (sortBy === 'rating') order = (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') order = (a.name || '').localeCompare(b.name || '', language, { sensitivity: 'base' });
      return order || (b.created_date || '').localeCompare(a.created_date || '') || a.id.localeCompare(b.id);
    };
    let candidates = [];
    let cursor;
    do {
      const batch = await base44.entities.Dealer.filter(query, { sort: '-created_date', limit: 200, ...(cursor ? { cursor } : {}) });
      if (!batch.items.length) break;
      const counts = await base44.entities.Car.aggregate({ query: { status: 'active', seller_type: 'dealer', dealer_id: { $in: batch.items.map(d => d.id) } }, groupBy: 'dealer_id', limit: 200 });
      const countMap = Object.fromEntries(counts.rows.map(row => [row.dealer_id, row.count]));
      const items = batch.items.map(d => ({
        id: d.id, name: d.name, city: d.city, country: d.country, logo: d.logo, cover_image: d.cover_image,
        cover_image_position: d.cover_image_position, is_verified: d.is_verified, rating: d.rating,
        reviews_count: d.reviews_count, brands: d.brands, created_date: d.created_date,
        description: d.description, description_ru: d.description_ru, description_en: d.description_en,
        description_et: d.description_et, description_lv: d.description_lv, description_lt: d.description_lt,
        car_count: countMap[d.id] || 0
      }));
      candidates = [...candidates, ...items].sort(compare).slice(0, end);
      cursor = batch.has_more ? batch.next_cursor : undefined;
    } while (cursor);
    return Response.json({ items: candidates.slice((currentPage - 1) * pageSize, end), total, allTotal, cities: cityPage.items.filter(Boolean), page: currentPage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}