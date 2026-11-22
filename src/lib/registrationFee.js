// Ориентировочный регистрационный сбор в Эстонии (M1, с 01.01.2025).
// Формула: базовая часть + часть по CO₂ + часть по полной массе,
// части по CO₂ и массе умножаются на коэффициент возраста (после 5 лет).

const BASE_FEE = 150;

// Коэффициент возраста: 0–4 года = 1, далее по таблице, с 20 лет части обнуляются
const AGE_FACTORS = {
  5: 0.92,
  6: 0.84,
  7: 0.75,
  8: 0.67,
  9: 0.59,
  10: 0.51,
  11: 0.43,
  12: 0.35,
  13: 0.26,
  14: 0.18,
  15: 0.1,
};

const ageFactor = (years) => {
  if (years <= 4) return 1;
  if (years >= 20) return 0;
  return AGE_FACTORS[years] ?? 0;
};

// Прогрессивная шкала CO₂ (WLTP), эталонное значение не выше 350 г/км
const co2Part = (co2) => {
  const c = Math.min(Math.max(Number(co2) || 0, 0), 350);
  let part = 0;
  if (c > 117) part += (Math.min(c, 150) - 117) * 3;
  if (c > 150) part += (Math.min(c, 200) - 150) * 3.5;
  if (c > 200) part += (c - 200) * 4;
  return part;
};

const massPart = (fullMass, threshold, max) => {
  if (!fullMass || fullMass <= threshold) return 0;
  return Math.min((fullMass - threshold) * 0.4, max);
};

/**
 * Возвращает оценку регистрационного сбора в евро или null, если данных недостаточно.
 */
export function estimateRegistrationFee(car) {
  if (!car) return null;

  const fuel = car.fuel_type;
  const isElectric = fuel === 'electric';
  const isPlugin = fuel === 'plugin_hybrid';

  if (!isElectric && !isPlugin && (car.co2_emissions == null || car.co2_emissions === '')) {
    return null;
  }

  const threshold = isElectric ? 2400 : isPlugin ? 2200 : 2000;
  const massMax = isElectric ? 440 : 400;

  const variable = (isElectric || isPlugin ? 0 : co2Part(car.co2_emissions)) +
    massPart(car.weight_max_kg, threshold, massMax);

  const age = car.year ? Math.max(new Date().getFullYear() - Number(car.year), 0) : 0;
  const fee = variable * ageFactor(age) + BASE_FEE;

  return Math.round(fee);
}

export const REG_FEE_LABELS = {
  ru: {
    label: 'Регистрационный сбор',
    short: 'Рег. сбор',
    hint: 'Ориентировочная оценка по CO₂, массе и возрасту автомобиля (регистрация в Эстонии)',
  },
  en: {
    label: 'Registration fee',
    short: 'Reg. fee',
    hint: 'Estimate based on CO₂, weight and vehicle age (registration in Estonia)',
  },
  et: {
    label: 'Registreerimistasu',
    short: 'Reg. tasu',
    hint: 'Hinnanguline arvestus CO₂, massi ja vanuse järgi (registreerimine Eestis)',
  },
  lv: {
    label: 'Reģistrācijas maksa',
    short: 'Reģ. maksa',
    hint: 'Aptuveni aprēķināts pēc CO₂, masas un vecuma (reģistrācija Igaunijā)',
  },
  lt: {
    label: 'Registracijos mokestis',
    short: 'Reg. mokestis',
    hint: 'Apytikslis skaičiavimas pagal CO₂, masę ir amžių (registracija Estijoje)',
  },
};

export const getRegFeeLabels = (language) =>
  REG_FEE_LABELS[(language || 'ru').slice(0, 2)] || REG_FEE_LABELS.ru;