import { translateCity, translateCountry } from '@/utils/locationUtils';

const LOCALES = { ru: 'ru-RU', en: 'en-GB', et: 'et-EE', lv: 'lv-LV', lt: 'lt-LT' };

export function localeFor(language) {
  return LOCALES[String(language || '').slice(0, 2)] || 'ru-RU';
}

function capitalize(value) {
  if (!value) return '';
  const text = String(value).replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatNumber(value, language) {
  try {
    return new Intl.NumberFormat(localeFor(language)).formatToParts(value).map(part => part.type === 'group' ? ' ' : part.value).join('');
  } catch {
    return String(value);
  }
}

export function formatStoryPrice(price, language) {
  if (numberValue(price) === null) return '';
  try {
    const amount = new Intl.NumberFormat(localeFor(language), { maximumFractionDigits: 0 }).formatToParts(price).map(part => part.type === 'group' ? ' ' : part.value).join('');
    return `${amount} €`;
  } catch {
    return `${price} €`;
  }
}

function numberValue(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

/**
 * Spec tiles shown on the story artwork.
 * `icon` is a key into STORY_ICON_URLS — the same icon files the app itself uses.
 */
export function buildStoryPills(car, t, language) {
  if (!car) return [];
  const pills = [];
  const pick = (key, fallback) => t(key, { defaultValue: fallback });
  const mileage = numberValue(car.mileage);
  const power = numberValue(car.engine_power);
  const consumption = numberValue(car.energy_consumption);
  if (car.year) pills.push({
    key: 'date', icon: 'date',
    label: car.month_of_manufacture ? `${String(car.month_of_manufacture).padStart(2, '0')}/${car.year}` : String(car.year),
  });
  if (mileage !== null) pills.push({ key: 'mileage', icon: 'mileage', label: `${formatNumber(mileage, language)} ${t('story.unit.km')}` });
  if (car.fuel_type) pills.push({
    key: 'fuel', icon: car.fuel_type === 'electric' ? 'electric' : 'fuel',
    label: pick(`story.fuel.${car.fuel_type}`, capitalize(car.fuel_type)),
  });
  if (power > 0) pills.push({ key: 'power', icon: 'power', label: `${Math.round(power * 0.7355)} ${t('story.unit.kw')}` });
  if (car.drive_type) pills.push({ key: 'drive', icon: 'drive', label: String(car.drive_type).toUpperCase() });
  if (car.fuel_type === 'electric' && consumption > 0) {
    pills.push({ key: 'energy', icon: 'hybrid', label: `${formatNumber(consumption, language)} ${t('car.kwh_100km')}` });
  } else if (car.transmission) {
    pills.push({ key: 'transmission', icon: 'transmission', label: pick(`story.transmission.${car.transmission}`, capitalize(car.transmission)) });
  }
  const country = translateCountry(t, String(car.country || '').trim());
  const city = translateCity(t, String(car.location || '').trim());
  const location = [city, country].filter(Boolean).join(', ');
  if (location) pills.push({ key: 'country', icon: 'location', label: location });
  return pills;
}

/** Short, human-readable address printed at the bottom of the card. */
export function buildStoryLink(car) {
  if (car?.short_id) return `carunity.eu/cardetails/${car.short_id}`;
  return 'carunity.eu';
}