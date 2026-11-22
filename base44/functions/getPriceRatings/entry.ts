import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const norm = (v) => String(v ?? '').trim().toLowerCase();

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// Peer price re-priced to the target's attributes:
// newer year, lower mileage, more power and more equipment => price adjusted upward.
function adjustedPrice(peer, target) {
  let factor = 1;
  const peerYear = num(peer.year);
  const targetYear = num(target.year);
  if (peerYear !== null && targetYear !== null) factor *= Math.pow(1.06, clamp(targetYear - peerYear, -8, 8));

  const peerMileage = num(peer.mileage);
  const targetMileage = num(target.mileage);
  if (peerMileage !== null && targetMileage !== null) factor *= Math.pow(1.02, clamp((peerMileage - targetMileage) / 10000, -12, 12));

  const peerPower = num(peer.engine_power);
  const targetPower = num(target.engine_power);
  if (peerPower !== null && targetPower !== null) factor *= Math.pow(1.01, clamp((targetPower - peerPower) / 10, -12, 12));

  factor *= Math.pow(1.005, clamp((num(target.features_count) ?? 0) - (num(peer.features_count) ?? 0), -40, 40));

  return num(peer.price) * factor;
}

// A wider (same-segment, other brands) comparison is only indicative,
// so it never claims the extreme ends of the scale.
const SCORE_RANGE = { model: [1, 5], brand: [1, 5], segment: [2, 4] };

function scoreFor(ratio) {
  if (ratio <= 0.85) return 5;
  if (ratio <= 0.94) return 4;
  if (ratio <= 1.06) return 3;
  if (ratio <= 1.15) return 2;
  return 1;
}

// Comparison pool, strictest first:
// same model -> same body type of the brand -> same body type across brands (same segment).
function pickPeers(target, pool) {
  const brand = norm(target.brand);
  const model = norm(target.model);
  const body = norm(target.body_type);
  const year = num(target.year);
  const power = num(target.engine_power);

  const withinYears = (list, span) =>
    list.filter((p) => year === null || num(p.year) === null || Math.abs(num(p.year) - year) <= span);
  const similarPower = (list) =>
    list.filter((p) => power === null || num(p.engine_power) === null || Math.abs(num(p.engine_power) - power) / power <= 0.3);

  const carClass = norm(target.car_class);
  const sameClass = (list) => (carClass ? list.filter((p) => !norm(p.car_class) || norm(p.car_class) === carClass) : list);

  const sameBrand = pool.filter((p) => norm(p.brand) === brand);
  const sameModel = model ? sameBrand.filter((p) => norm(p.model) === model) : [];
  const brandBody = body ? sameBrand.filter((p) => norm(p.body_type) === body) : [];
  const segment = body ? pool.filter((p) => norm(p.body_type) === body) : [];

  const tiers = [
    { list: withinYears(sameModel, 3), min: 2, scope: 'model' },
    { list: sameModel, min: 2, scope: 'model' },
    { list: withinYears(brandBody, 3), min: 2, scope: 'brand' },
    { list: sameClass(similarPower(withinYears(segment, 2))), min: 4, scope: 'segment' },
    { list: sameClass(withinYears(segment, 3)), min: 4, scope: 'segment' }
  ];

  for (const tier of tiers) {
    if (tier.list.length >= tier.min) return { peers: tier.list, scope: tier.scope };
  }
  return { peers: [], scope: null };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const cars = Array.isArray(body?.cars) ? body.cars.slice(0, 60) : [];
    if (cars.length === 0) return Response.json({ ratings: {} });

    const found = await base44.entities.Car.filter({ status: 'active' }, { limit: 500, sort: '-created_date' });
    const pool = (Array.isArray(found) ? found : (found?.items || [])).filter(
      (p) => (num(p.price) ?? 0) > 0 && num(p.mileage) !== null
    );

    const ratings = {};
    for (const car of cars) {
      const price = num(car.price);
      if (!price || price <= 0) continue;

      const candidates = pool.filter((p) => p.id !== car.id);
      const { peers, scope } = pickPeers(car, candidates);
      if (peers.length < 2) continue;

      const adjusted = peers.map((p) => adjustedPrice(p, car)).filter((v) => v > 0);
      if (adjusted.length < 2) continue;

      // Scattered peer group => the comparison is unreliable, skip it.
      const spread = Math.max(...adjusted) / Math.min(...adjusted);
      if (spread > 2.5) continue;

      const fair = median(adjusted);
      if (!fair) continue;

      const ratio = price / fair;
      const bounds = SCORE_RANGE[scope] || [1, 5];
      ratings[car.id] = {
        score: clamp(scoreFor(ratio), bounds[0], bounds[1]),
        peers: adjusted.length,
        ratio: Math.round(ratio * 100) / 100,
        scope
      };
    }

    return Response.json({ ratings });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}