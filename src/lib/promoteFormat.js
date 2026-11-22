const LOCALES = { ru: 'ru-RU', en: 'en-GB', et: 'et-EE', lv: 'lv-LV', lt: 'lt-LT' };

export function formatPromoteDate(dateStr, i18n) {
  const locale = LOCALES[i18n?.language?.slice(0, 2)] || 'ru-RU';
  return new Date(dateStr).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function daysWord(days, t) {
  return t('promote.days_word', 'дней');
}