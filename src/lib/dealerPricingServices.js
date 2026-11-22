/**
 * Список всех платных услуг платформы для ценовой политики дилеров.
 * Каждая услуга имеет id, название (RU) и базовую цену в EUR.
 * Используется в админ-панели для установки индивидуальных скидок дилерам.
 */

export const DEALER_PAID_SERVICES = [
  { id: 'place_30', name: 'Публикация объявления (30 дней)', basePrice: 3.99 },
  { id: 'topspot_7', name: 'ТОП Spot (7 дней)', basePrice: 79 },
  { id: 'boost_1', name: 'Boost (1 день)', basePrice: 1.99 },
  { id: 'boost_3', name: 'Boost (3 дня)', basePrice: 4.99 },
  { id: 'boost_7', name: 'Boost (7 дней)', basePrice: 9.99 },
  { id: 'boost_14', name: 'Boost (14 дней)', basePrice: 17.99 },
  { id: 'boost_30', name: 'Boost (30 дней)', basePrice: 29.99 },
  { id: 'meta_boost', name: 'Meta Boost', basePrice: 49 },
  { id: 'meta_boost_plus', name: 'Meta Boost+', basePrice: 89 },
  { id: 'meta_premium', name: 'Meta Premium', basePrice: 149 },
  { id: 'meta_top', name: 'Meta TOP', basePrice: 199 },
  { id: 'plan_starter', name: 'Подписка Starter', basePrice: 59 },
  { id: 'plan_pro', name: 'Подписка Pro', basePrice: 119 },
  { id: 'plan_premium', name: 'Подписка Premium', basePrice: 149 },
];

/**
 * Получить кастомную цену для услуги дилера.
 * Возвращает custom_price если есть, иначе базовую цену со скидкой,
 * иначе просто базовую цену.
 */
export function getDealerServicePrice(dealer, serviceId) {
  if (!dealer?.custom_pricing) return null;
  const entry = dealer.custom_pricing.find(p => p.service_id === serviceId);
  if (!entry) return null;
  const service = DEALER_PAID_SERVICES.find(s => s.id === serviceId);
  if (!service) return null;
  if (entry.custom_price != null && entry.custom_price > 0) return entry.custom_price;
  if (entry.discount_percent > 0) return Math.round(service.basePrice * (1 - entry.discount_percent / 100) * 100) / 100;
  return service.basePrice;
}