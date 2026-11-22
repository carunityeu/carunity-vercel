import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { filters = {} } = await req.json();
    if (!filters || typeof filters !== 'object' || Array.isArray(filters)) return Response.json({ error: 'Invalid filters' }, { status: 400 });
    const query = { status: 'active' };
    for (const key of ['brand', 'model', 'body_type', 'fuel_type', 'transmission', 'drive_type', 'country', 'location', 'condition']) {
      const value = filters[key];
      if (value === undefined || value === null || value === '') continue;
      if (typeof value !== 'string' || value.length > 80) return Response.json({ error: 'Invalid text filter' }, { status: 400 });
      query[key] = { $regex: '^' + value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', $options: 'i' };
    }
    const ranges = { price_min: ['price', '$gte'], price_max: ['price', '$lte'], year_min: ['year', '$gte'], year_max: ['year', '$lte'], mileage_max: ['mileage', '$lte'], power_min: ['engine_power', '$gte'], power_max: ['engine_power', '$lte'], seats_min: ['seats', '$gte'] };
    for (const [key, [field, op]] of Object.entries(ranges)) {
      if (filters[key] === undefined || filters[key] === null) continue;
      if (typeof filters[key] !== 'number' || !Number.isFinite(filters[key]) || filters[key] < 0) return Response.json({ error: 'Invalid numeric filter' }, { status: 400 });
      query[field] = { ...query[field], [op]: filters[key] };
    }
    if (filters.exclude_ids !== undefined) {
      if (!Array.isArray(filters.exclude_ids) || filters.exclude_ids.length > 100 || filters.exclude_ids.some(id => typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(id))) return Response.json({ error: 'Invalid excluded IDs' }, { status: 400 });
      if (filters.exclude_ids.length) query.id = { $nin: filters.exclude_ids };
    }
    const sorts = { price_asc: 'price', price_desc: '-price', newest: '-created_date', year_desc: '-year', mileage_asc: 'mileage' };
    const fields = ['title', 'brand', 'model', 'year', 'price', 'mileage', 'fuel_type', 'transmission', 'body_type', 'drive_type', 'engine_power', 'engine_volume', 'seats', 'country', 'location', 'condition', 'features'];
    const [page, total] = await Promise.all([
      base44.entities.Car.filter(query, { sort: sorts[filters.sort] || '-created_date', limit: 3, fields }),
      base44.entities.Car.count(query)
    ]);
    return Response.json({ cars: page.items.map(car => ({ ...car, url: `/CarDetails?id=${car.id}` })), total, has_more: page.has_more, applied_filters: filters });
  } catch (error) {
    console.error('Caro catalog search failed', error.message);
    return Response.json({ error: 'Catalog search failed' }, { status: error.status === 401 ? 401 : 500 });
  }
}