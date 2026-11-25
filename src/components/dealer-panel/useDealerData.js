// Everything the dealer panel shows, loaded once and shared by the sections.
// Only measured data: no estimated or multiplied numbers (e.g. no "impressions" derived from views).
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { getPlan } from '@/lib/dealerPlans';

const DAY = 24 * 60 * 60 * 1000;
const asList = (r) => (Array.isArray(r) ? r : r?.items || []);

/** Count of rows created in the last 7 days and in the 7 days before. */
export function weekly(rows, field = 'created_date') {
  const now = Date.now();
  let thisWeek = 0;
  let lastWeek = 0;
  for (const r of rows) {
    const t = Date.parse(r[field]);
    if (Number.isNaN(t)) continue;
    if (now - t <= 7 * DAY) thisWeek++;
    else if (now - t <= 14 * DAY) lastWeek++;
  }
  return { thisWeek, lastWeek, delta: thisWeek - lastWeek };
}

export const daysOnSale = (car) => Math.max(0, Math.floor((Date.now() - Date.parse(car.created_date)) / DAY));

export default function useDealerData(dealer, user) {
  const plan = getPlan(dealer?.subscription_type);
  const ownerEmail = (user?.email || '').toLowerCase();

  const carsQuery = useQuery({
    queryKey: ['dealerOwnCars', dealer?.id],
    queryFn: () => entities.Car.filter({ dealer_id: dealer.id }, '-created_date', 500),
    enabled: !!dealer?.id,
  });
  const cars = carsQuery.data || [];
  const carIds = cars.map((c) => c.id);
  const idsKey = carIds.join(',');

  // Conversations where the salon owner is the receiver (the database only returns your own)
  const { data: messages = [] } = useQuery({
    queryKey: ['dealerMessages', ownerEmail],
    queryFn: async () => asList(await entities.Message.filter({ receiver_email: ownerEmail }, '-created_date', 500)),
    enabled: !!ownerEmail,
  });
  const { data: offers = [] } = useQuery({
    queryKey: ['dealerOffers', idsKey],
    queryFn: async () => asList(await entities.PriceOffer.filter({ car_id: { $in: carIds } }, '-created_date', 500)),
    enabled: carIds.length > 0,
  });
  const { data: favorites = [] } = useQuery({
    queryKey: ['dealerCarFavorites', idsKey],
    queryFn: async () => asList(await entities.Favorite.filter({ car_id: { $in: carIds } }, '-created_date', 1000)),
    enabled: carIds.length > 0,
  });
  const { data: leads = [] } = useQuery({
    queryKey: ['dealerLeadsLite', dealer?.id],
    queryFn: async () => asList(await entities.DealerLead.filter({ dealer_id: dealer.id }, '-created_date', 500)),
    enabled: !!dealer?.id && plan.hasLeads,
  });

  const perCar = useMemo(() => {
    const map = Object.fromEntries(carIds.map((id) => [id, { messages: 0, offers: 0, favorites: 0 }]));
    for (const m of messages) if (map[m.car_id]) map[m.car_id].messages++;
    for (const o of offers) if (map[o.car_id]) map[o.car_id].offers++;
    for (const f of favorites) if (map[f.car_id]) map[f.car_id].favorites++;
    return map;
  }, [idsKey, messages, offers, favorites]);

  // One conversation = one chat, not every message in it
  const chats = useMemo(() => {
    const byChat = new Map();
    for (const m of messages) if (!byChat.has(m.chat_id)) byChat.set(m.chat_id, m);
    return [...byChat.values()];
  }, [messages]);

  return {
    plan,
    cars,
    loadingCars: carsQuery.isLoading,
    refetchCars: carsQuery.refetch,
    messages,
    chats,
    unread: messages.filter((m) => !m.is_read).length,
    offers,
    favorites,
    leads,
    perCar,
  };
}
