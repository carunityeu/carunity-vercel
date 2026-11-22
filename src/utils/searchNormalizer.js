/**
 * Search term normalization utility.
 * Maps common search terms from Russian, Estonian, Latvian, Lithuanian
 * to their English field values used in the database.
 * This enables searching in any language across all car fields.
 */

// Common terms → English field values
const TERM_MAP = {
  // Fuel types
  'дизель': 'diesel', 'дизельный': 'diesel', 'дизельном': 'diesel', 'дизеля': 'diesel',
  'бензин': 'petrol', 'бензиновый': 'petrol', 'бензиновом': 'petrol', 'бензина': 'petrol',
  'электро': 'electric', 'электрокар': 'electric', 'электромобиль': 'electric', 'электрический': 'electric', 'электрика': 'electric',
  'гибрид': 'hybrid', 'гибридный': 'hybrid', 'гибридная': 'hybrid',
  'газ': 'gas', 'газовый': 'gas',
  'diisel': 'diesel', 'diiseliga': 'diesel', 'bensiin': 'petrol', 'bensiiniga': 'petrol',
  'elektri': 'electric', 'elektriauto': 'electric', 'hübriid': 'hybrid', 'hübriidiga': 'hybrid',
  'dīzelis': 'diesel', 'benzīns': 'petrol', 'elektriskais': 'electric', 'hibrīds': 'hybrid',
  'dyzelis': 'diesel', 'benzinas': 'petrol', 'elektrinis': 'electric', 'hibridas': 'hybrid',

  // Transmission
  'автомат': 'automatic', 'автоматическая': 'automatic', 'автомате': 'automatic', 'акпп': 'automatic', 'авто': 'automatic',
  'механика': 'manual', 'механическая': 'manual', 'механике': 'manual', 'мкпп': 'manual', 'мех': 'manual',
  'automaat': 'automatic', 'automaatkast': 'automatic', 'käsikäigukast': 'manual', 'käsikast': 'manual', 'käsi': 'manual',
  'automāts': 'automatic', 'automātiskā': 'automatic', 'mehāniskā': 'manual',
  'automatinė': 'automatic', 'mechaninė': 'manual',

  // Body types
  'внедорожник': 'suv', 'внедорожники': 'suv', 'джип': 'suv',
  'кроссовер': 'crossover', 'кроссоверы': 'crossover',
  'седан': 'sedan', 'седаны': 'sedan',
  'хэтчбек': 'hatchback', 'хэтч': 'hatchback', 'хэтчбеки': 'hatchback',
  'универсал': 'wagon', 'универсалы': 'wagon',
  'купе': 'coupe',
  'кабриолет': 'convertible', 'кабрио': 'convertible',
  'минивэн': 'minivan', 'минивен': 'minivan', 'минивэны': 'minivan',
  'пикап': 'pickup',
  'maastur': 'suv', 'maasturid': 'suv', 'luukpära': 'hatchback', 'sedanid': 'sedan',
  'universaal': 'wagon', 'kupee': 'coupe', 'kabriolett': 'convertible', 'mahtuniversaal': 'minivan', 'kaubik': 'minivan',
  'visurgājējs': 'suv', 'pikaps': 'pickup',
  'universalas': 'wagon', 'visureigis': 'suv',
  'sportcar': 'coupe', 'спорткар': 'coupe', 'спортивный': 'coupe', 'спортивная': 'coupe',

  // Drive types
  'полный': 'awd', 'полным': 'awd', '4x4': 'awd', 'awd': 'awd', '4wd': 'awd',
  'задний': 'rwd', 'задним': 'rwd', 'rwd': 'rwd',
  'передний': 'fwd', 'передним': 'fwd', 'fwd': 'fwd',
  'esivedu': 'fwd', 'tagasivedu': 'rwd', 'nelivedu': 'awd',
  'priekšpiedziņa': 'fwd', 'aizmugurējā': 'rwd', 'visu': 'awd',
  'priekinė': 'fwd', 'galinė': 'rwd', 'keturių': 'awd',

  // Condition
  'новый': 'new', 'новая': 'new', 'новые': 'new', 'новое': 'new',
  'б/у': 'used', 'бу': 'used', 'подержанный': 'used', 'подержанная': 'used', 'бывший': 'used',
  'uus': 'new', 'kasutatud': 'used', 'uued': 'new',
  'jauns': 'new', 'lietots': 'used',
  'naujas': 'new', 'naudotas': 'used',

  // Seller type
  'дилер': 'dealer', 'дилерский': 'dealer', 'дилеры': 'dealer', 'салон': 'dealer',
  'частник': 'private', 'частный': 'private',
  'jaamaja': 'dealer', 'edasmaija': 'dealer', 'eraisik': 'private',
  'tirgotājs': 'dealer', 'privātists': 'private',
  'platintojas': 'dealer', 'privatus': 'private',

  // Colors
  'красный': 'red', 'красная': 'red', 'красное': 'red',
  'синий': 'blue', 'синяя': 'blue', 'синее': 'blue',
  'зеленый': 'green', 'зеленая': 'green', 'зеленое': 'green',
  'черный': 'black', 'черная': 'black', 'черное': 'black',
  'белый': 'white', 'белая': 'white', 'белое': 'white',
  'серый': 'gray', 'серая': 'gray', 'серое': 'gray', 'grey': 'gray',
  'серебристый': 'silver', 'серебристая': 'silver',
  'золотой': 'gold', 'золотая': 'gold',
  'коричневый': 'brown', 'коричневая': 'brown',
  'желтый': 'yellow', 'желтая': 'yellow',
  'оранжевый': 'orange', 'оранжевая': 'orange',
  'фиолетовый': 'purple', 'фиолетовая': 'purple',
  'punane': 'red', 'sinine': 'blue', 'roheline': 'green', 'must': 'black', 'valge': 'white', 'hall': 'gray', 'hõbedane': 'silver', 'kuldne': 'gold', 'pruun': 'brown', 'kollane': 'yellow',
  'sarkans': 'red', 'zils': 'blue', 'zaļš': 'green', 'melns': 'black', 'balts': 'white', 'pelēks': 'gray',
  'raudona': 'red', 'mėlyna': 'blue', 'žalia': 'green', 'juoda': 'black', 'balta': 'white', 'pilka': 'gray',
};

// Stop words (prepositions, conjunctions, articles) to exclude from search
const STOP_WORDS = new Set([
  // Russian
  'до', 'от', 'и', 'в', 'на', 'с', 'за', 'для', 'по', 'не', 'а', 'но', 'или', 'что', 'это', 'как', 'так', 'же', 'бы', 'ли', 'лишь', 'только', 'без', 'про', 'при', 'об', 'о', 'к', 'у', 'из', 'до', 'после', 'перед',
  // English
  'to', 'from', 'and', 'in', 'on', 'at', 'for', 'of', 'with', 'by', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'or', 'not', 'no', 'any', 'all',
  // Estonian
  'kuni', 'ja', 'või', 'kuid', 'aga', 'sest', 'et', 'kui', 'mis', 'see', 'on', 'ei', 'ka', 'nii', 'omas', 'ning', 'kas', 'keda', 'mida', 'millest', 'mille', 'millal',
  // Latvian
  'līdz', 'un', 'vai', 'bet', 'jo', 'ka', 'ja', 'kas', 'tas', 'ir', 'nav', 'ar', 'no', 'uz', 'par', 'priekš', 'pēc', 'aiz', 'bez',
  // Lithuanian
  'iki', 'ir', 'ar', 'bet', 'nes', 'kad', 'jei', 'kas', 'tai', 'yra', 'nėra', 'su', 'iš', 'į', 'ant', 'už', 'po', 'prieš', 'be',
]);

// Cyrillic → Latin, so a brand or model typed in Russian ("БМВ", "х5")
// also matches the Latin spelling stored in the database.
const CYRILLIC_MAP = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'x', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
};

export function cyrillicToLatin(word) {
  if (!word) return '';
  return word.split('').map((ch) => CYRILLIC_MAP[ch] ?? ch).join('');
}

/**
 * Normalize a search query: replace non-English terms with their English equivalents
 * and remove stop words (prepositions, conjunctions).
 * @param {string} query - The search query
 * @returns {string[]} Array of normalized, meaningful words
 */
export function normalizeSearchQuery(query) {
  if (!query) return [];
  return query
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(w => w.length > 0)
    .map(word => TERM_MAP[word] || word)
    .filter(word => !STOP_WORDS.has(word) && word.length > 0);
}

// Reverse map: English field value → all translations (for haystack building)
// This allows searching in any language and matching English field values
const FIELD_TRANSLATIONS = {
  // Fuel types
  'diesel': ['diesel', 'дизель', 'дизельный', 'дизеля', 'diisel', 'diiseliga', 'dīzelis', 'dyzelis'],
  'petrol': ['petrol', 'бензин', 'бензиновый', 'бензина', 'bensiin', 'bensiiniga', 'benzīns', 'benzinas'],
  'electric': ['electric', 'электро', 'электрический', 'электрокар', 'электромобиль', 'elektri', 'elektriauto', 'elektriskais', 'elektrinis'],
  'hybrid': ['hybrid', 'гибрид', 'гибридный', 'hübriid', 'hübriidiga', 'hibrīds', 'hibridas'],
  'plugin_hybrid': ['plugin_hybrid', 'подключаемый гибрид', 'plug-in hybrid'],
  'gas': ['gas', 'газ', 'газовый', 'gaas', 'gāze', 'dujos'],
  // Transmission
  'automatic': ['automatic', 'автомат', 'автоматическая', 'автомате', 'акпп', 'automaat', 'automaatkast', 'automaadiga', 'automāts', 'automātiskā', 'automatinė'],
  'manual': ['manual', 'механика', 'механическая', 'механике', 'мкпп', 'käsikäigukast', 'käsikast', 'käsi', 'mehāniskā', 'mechaninė'],
  // Body types
  'suv': ['suv', 'внедорожник', 'внедорожники', 'джип', 'maastur', 'maasturid', 'visurgājējs', 'visureigis'],
  'crossover': ['crossover', 'кроссовер', 'кроссоверы', 'maastur'],
  'sedan': ['sedan', 'седан', 'седаны', 'sedanid'],
  'hatchback': ['hatchback', 'хэтчбек', 'хэтч', 'luukpära'],
  'wagon': ['wagon', 'универсал', 'универсалы', 'universaal', 'universalas'],
  'coupe': ['coupe', 'купе', 'kupee', 'sportcar', 'спорткар', 'спортивный'],
  'convertible': ['convertible', 'кабриолет', 'кабрио', 'kabriolett'],
  'minivan': ['minivan', 'минивэн', 'минивен', 'минивэны', 'mahtuniversaal', 'kaubik', 'mahtuniversaal'],
  'pickup': ['pickup', 'пикап', 'пикапы', 'pikaps'],
  // Drive types
  'awd': ['awd', '4x4', '4wd', 'полный', 'полным', 'nelivedu', 'visu riteņu', 'keturių', 'visu'],
  'rwd': ['rwd', 'задний', 'задним', 'tagasivedu', 'aizmugurējā', 'galinė'],
  'fwd': ['fwd', 'передний', 'передним', 'esivedu', 'priekšpiedziņa', 'priekinė'],
  // Condition
  'new': ['new', 'новый', 'новая', 'новые', 'новое', 'uus', 'uued', 'jauns', 'naujas'],
  'used': ['used', 'б/у', 'бу', 'подержанный', 'подержанная', 'бывший', 'kasutatud', 'lietots', 'naudotas'],
  'accident_free': ['accident_free', 'без ДТП', 'безаварийный'],
  // Seller type
  'dealer': ['dealer', 'дилер', 'дилерский', 'дилеры', 'салон', 'jaamaja', 'edasmaija', 'tirgotājs', 'platintojas'],
  'private': ['private', 'частник', 'частный', 'eraisik', 'privātists', 'privatus'],
  // Colors
  'red': ['red', 'красный', 'красная', 'красное', 'punane', 'sarkans', 'raudona'],
  'blue': ['blue', 'синий', 'синяя', 'синее', 'sinine', 'zils', 'mėlyna'],
  'green': ['green', 'зеленый', 'зеленая', 'зеленое', 'roheline', 'zaļš', 'žalia'],
  'black': ['black', 'черный', 'черная', 'черное', 'must', 'melns', 'juoda'],
  'white': ['white', 'белый', 'белая', 'белое', 'valge', 'balts', 'balta'],
  'gray': ['gray', 'grey', 'серый', 'серая', 'серое', 'hall', 'pelēks', 'pilka'],
  'silver': ['silver', 'серебристый', 'серебристая', 'hõbedane'],
  'gold': ['gold', 'золотой', 'золотая', 'kuldne'],
  'brown': ['brown', 'коричневый', 'коричневая', 'pruun'],
  'yellow': ['yellow', 'желтый', 'желтая', 'kollane'],
  'orange': ['orange', 'оранжевый', 'оранжевая'],
  'purple': ['purple', 'фиолетовый', 'фиолетовая'],
};

/**
 * Build a comprehensive haystack from a car object for text search.
 * Includes all text fields, descriptions in all languages, and field values
 * WITH their translations so any-language search terms can match English field values.
 * @param {object} car - The car object
 * @returns {string} Lowercased haystack string
 */
export function buildSearchHaystack(car) {
  const fields = [
    car.brand, car.model, car.title,
    car.description, car.description_en, car.description_ru, car.description_et,
    car.description_lv, car.description_lt, car.description_de, car.description_fi, car.description_pl,
    car.color, car.color_interior, car.location, car.country,
    car.fuel_type, car.transmission, car.transmission_type, car.body_type, car.drive_type,
    car.condition, car.vin, car.license_plate, car.engine_code, car.trim_level,
    car.emission_class, car.engine_layout, car.fuel_system, car.turbo_type,
    car.car_class, car.front_suspension, car.rear_suspension, car.front_brakes, car.rear_brakes,
    car.seller_type,
  ];
  if (car.features?.length) fields.push(car.features.join(' '));

  // Add translations for structured field values (so any-language search matches)
  const translatableFields = [
    car.fuel_type, car.transmission, car.body_type, car.drive_type,
    car.condition, car.seller_type, car.color, car.color_interior,
  ];
  for (const val of translatableFields) {
    if (val && FIELD_TRANSLATIONS[val?.toLowerCase()]) {
      fields.push(...FIELD_TRANSLATIONS[val.toLowerCase()]);
    }
  }

  return fields.filter(Boolean).join(' ').toLowerCase();
}