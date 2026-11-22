// Languages a dealer can assign to an employee. Ordered by relevance for the Baltic market first.
export const EMPLOYEE_LANGUAGES = [
  'et', 'lv', 'lt', 'ru', 'en',
  'fi', 'sv', 'no', 'da',
  'de', 'pl', 'uk',
  'fr', 'es', 'it',
];

// One employee can speak up to this many languages (shown as flags on the listing page).
export const MAX_EMPLOYEE_LANGUAGES = 4;

export const EMPLOYEE_LANGUAGE_LABELS = {
  et: 'Eesti',
  lv: 'Latviešu',
  lt: 'Lietuvių',
  ru: 'Русский',
  en: 'English',
  fi: 'Suomi',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
  de: 'Deutsch',
  pl: 'Polski',
  uk: 'Українська',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
};

const FLAG_COUNTRY = {
  et: 'ee',
  lv: 'lv',
  lt: 'lt',
  ru: 'ru',
  en: 'gb',
  fi: 'fi',
  sv: 'se',
  no: 'no',
  da: 'dk',
  de: 'de',
  pl: 'pl',
  uk: 'ua',
  fr: 'fr',
  es: 'es',
  it: 'it',
};

export const employeeFlagUrl = (code, width = 40) =>
  FLAG_COUNTRY[code] ? `https://flagcdn.com/w${width}/${FLAG_COUNTRY[code]}.png` : null;