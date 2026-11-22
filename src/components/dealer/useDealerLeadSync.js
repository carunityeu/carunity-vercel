import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const SCORE_WEIGHTS = { view: 1, favorite: 5, offer: 8 };
const MIN_RAW_SCORE = 8; // один оффер, избранное с просмотрами или несколько просмотров
const MAX_CREATED = 20;

const maskEmail = (email) => {
  if (!email) return '***';
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}***@${domain}`;
};

// Собирает активность покупателей по авто дилера и создаёт недостающие лиды,
// чтобы раздел AI Leads показывал реальных заинтересованных покупателей.
// Запускается один раз на набор салонов, чтобы не дублировать записи.
export default function useDealerLeadSync({ salonIds, cars, dealerEmail, leads, ready, onSynced }) {
  const leadsRef = useRef(leads);
  const onSyncedRef = useRef(onSynced);
  leadsRef.current = leads;
  onSyncedRef.current = onSynced;

  const salonKey = salonIds.join(',');
  const syncedKey = useRef(null);

  useEffect(() => {
    if (!ready || !salonKey || !dealerEmail || (cars || []).length === 0) return;
    if (syncedKey.current === salonKey) return;
    syncedKey.current = salonKey;

    let cancelled = false;

    const sync = async () => {
      const carIds = cars.map(car => car.id);
      const query = { car_id: { $in: carIds } };
      const [viewsRes, favoritesRes, offersRes] = await Promise.all([
        base44.entities.ViewHistory.filter(query, { sort: '-viewed_at', limit: 500 }),
        base44.entities.Favorite.filter(query, { limit: 300 }),
        base44.entities.PriceOffer.filter(query, { limit: 200 }),
      ]);
      if (cancelled) return;

      const scores = new Map();
      const add = (email, carId, action) => {
        if (!email || !carId || email === dealerEmail) return;
        const key = `${email}|${carId}`;
        if (!scores.has(key)) scores.set(key, { email, carId, raw: 0, views: 0, actions: [] });
        const entry = scores.get(key);
        entry.raw += SCORE_WEIGHTS[action];
        if (action === 'view') entry.views += 1;
        if (!entry.actions.includes(action)) entry.actions.push(action);
      };

      viewsRes.items.forEach(v => add(v.user_email, v.car_id, 'view'));
      favoritesRes.items.forEach(f => add(f.user_email, f.car_id, 'favorite'));
      offersRes.items.filter(o => o.buyer_email).forEach(o => add(o.buyer_email, o.car_id, 'offer'));

      const known = new Set(
        leadsRef.current.map(lead => `${lead.buyer_profile?.raw_email || lead.user_email}|${lead.car_id}`)
      );

      const carMap = {};
      cars.forEach(car => { carMap[car.id] = car; });

      const toCreate = [...scores.entries()]
        .filter(([key, entry]) => entry.raw >= MIN_RAW_SCORE && !known.has(key) && carMap[entry.carId])
        .sort((a, b) => b[1].raw - a[1].raw)
        .slice(0, MAX_CREATED);

      if (toCreate.length === 0) return;

      const records = toCreate.map(([, entry]) => {
        const car = carMap[entry.carId];
        return {
          dealer_id: salonIds[0],
          car_id: car.id,
          car_title: `${car.brand || ''} ${car.model || ''} ${car.year || ''}`.trim(),
          car_brand: car.brand,
          car_model: car.model,
          car_price: car.price,
          car_image: car.images?.[0],
          user_email: maskEmail(entry.email),
          intent_score: Math.min(100, Math.round(entry.raw * 3.5)),
          buyer_profile: { actions: entry.actions, views_count: entry.views, raw_email: entry.email },
          status: 'new',
        };
      });

      await base44.entities.DealerLead.bulkCreate(records);
      if (!cancelled) onSyncedRef.current?.();
    };

    sync();
    return () => { cancelled = true; };
  }, [ready, salonKey, cars, dealerEmail, salonIds]);
}