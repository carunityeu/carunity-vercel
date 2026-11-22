// Color keys used across exterior and interior color selects
const COLOR_KEYS = [
  'white', 'black', 'grey', 'gray', 'silver', 'blue', 'red', 'green',
  'brown', 'beige', 'yellow', 'orange', 'other',
];

const SUPPORTED_LOCALES = ['en', 'ru', 'et', 'lv', 'lt'];

/**
 * Translates a stored color value to the current UI language.
 * Handles both new data (stored as keys like 'white') and legacy data
 * (stored as a translated label in whatever language the seller used).
 *
 * @param {string|null|undefined} rawColor - the raw color value from the entity
 * @param {object} i18n - the i18n instance from useTranslation()
 * @returns {string|null} - the translated color label, or null if empty
 */
export function translateColor(rawColor, i18n) {
  if (!rawColor) return null;

  // New data: stored as a known key → translate directly
  if (COLOR_KEYS.includes(rawColor)) {
    return i18n.t('colors.' + rawColor);
  }

  // Legacy data: stored as a translated label — reverse-map to a key
  for (const locale of SUPPORTED_LOCALES) {
    const localeT = i18n.getFixedT(locale);
    for (const key of COLOR_KEYS) {
      if (localeT('colors.' + key) === rawColor) {
        return i18n.t('colors.' + key);
      }
    }
  }

  // Unknown value — return as-is
  return rawColor;
}