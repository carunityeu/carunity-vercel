// Prompt for the "Generate description" button of the listing forms.
// Plain, factual wording: no superlatives, no sales pitch, nothing that was not given.
const LANG_NAMES = { ru: 'Russian', en: 'English', et: 'Estonian', lv: 'Latvian', lt: 'Lithuanian' };

export function listingDescriptionPrompt(form, powerUnit = 'hp') {
  const lang = LANG_NAMES[(localStorage.getItem('i18nextLng') || 'ru').slice(0, 2)] || 'Russian';
  const facts = [
    ['Car', [form.brand, form.model, form.trim_level, form.year].filter(Boolean).join(' ')],
    ['Mileage', form.mileage && `${form.mileage} km`],
    ['Fuel', form.fuel_type],
    ['Gearbox', form.transmission],
    ['Body', form.body_type],
    ['Engine', [form.engine_volume && `${form.engine_volume} L`, form.engine_power && `${form.engine_power} ${powerUnit}`].filter(Boolean).join(', ')],
    ['Drive', form.drive_type],
    ['Colour', form.color],
    ['Owners', form.owners_count],
    ['Equipment', Array.isArray(form.features) && form.features.length ? form.features.slice(0, 15).join(', ') : ''],
  ].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');

  return `Write a description for a used car listing on a classifieds site, in ${lang}.
Tone: plain and neutral, like a private seller writing it themselves. No superlatives, no marketing phrases ("dream car", "perfect", "unique opportunity"), no exclamation marks, no emojis.
Use only the facts below; do not invent condition, history or extras. 2 short paragraphs, 60–120 words in total: what the car is and its main specs, then the equipment if given, and one short line inviting buyers to get in touch or come for a viewing.
Return only the description text.

${facts}`;
}
