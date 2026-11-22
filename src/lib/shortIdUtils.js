import { base44 } from '@/api/base44Client';

/**
 * Ensures a car has a short_id (9-digit number).
 * Generates one if missing, checks for collisions.
 * Returns the short_id or null if generation failed.
 */
export async function ensureShortId(car) {
  if (!car || car.short_id) return car?.short_id || null;

  for (let i = 0; i < 5; i++) {
    const candidate = Math.floor(Math.random() * 900000000) + 100000000; // 100000000–999999999
    try {
      const existing = await base44.entities.Car.filter({ short_id: candidate });
      if (!existing || existing.length === 0) {
        await base44.entities.Car.update(car.id, { short_id: candidate });
        return candidate;
      }
    } catch {
      // If filter fails (e.g. field not yet populated), try to set the short_id directly
      try {
        await base44.entities.Car.update(car.id, { short_id: candidate });
        return candidate;
      } catch {
        continue;
      }
    }
  }
  return null;
}

/**
 * Builds the share URL for a car listing.
 * Returns the clean URL: carunity.eu/cardetails/123456789
 */
export function getShareUrl(shortId) {
  if (!shortId) return null;
  // Use the shareListing backend function so link previews (OG tags)
  // include the car's main image. The function redirects to the listing page.
  return `${window.location.origin}/functions/shareListing?sid=${shortId}`;
}

/**
 * Returns the clean router path for a car listing.
 * Uses /cardetails/:shortId if short_id is available, otherwise falls back to old format.
 */
export function getCarDetailsPath(car) {
  if (!car) return '#';
  if (car.short_id) return `/cardetails/${car.short_id}`;
  return `/CarDetails?id=${car.id}`;
}