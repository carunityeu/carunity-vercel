import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// --- HTML helpers ---

function cleanHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractJsonLd(html) {
  const results = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      results.push(parsed);
    } catch (e) {}
  }
  return results;
}

function extractJsonLdImages(jsonLdData) {
  const images = [];
  const collect = (item) => {
    if (!item || typeof item !== 'object') return;
    if (item.image) {
      if (Array.isArray(item.image)) {
        item.image.forEach(u => { if (typeof u === 'string' || (u && u.url)) images.push(typeof u === 'string' ? u : u.url); });
      } else if (typeof item.image === 'string') {
        images.push(item.image);
      } else if (item.image && item.image.url) {
        images.push(item.image.url);
      }
    }
    if (item["@graph"] && Array.isArray(item["@graph"])) item["@graph"].forEach(collect);
    if (Array.isArray(item)) item.forEach(collect);
  };
  jsonLdData.forEach(collect);
  return images;
}

function extractMeta(html) {
  const meta = {};
  const get = (attr, val) => {
    const re = new RegExp(`<meta[^>]*${attr}=["']${val}["'][^>]*content=["']([^"']+)["']`, 'i');
    const m = html.match(re);
    return m ? m[1] : null;
  };
  meta.ogImage = get('property', 'og:image') || get('name', 'og:image');
  meta.ogTitle = get('property', 'og:title') || get('name', 'og:title');
  meta.ogDescription = get('property', 'og:description') || get('name', 'og:description');
  meta.title = get('name', 'title');
  meta.description = get('name', 'description');
  return meta;
}

function extractImageCandidates(html, baseUrl, jsonLdImages = []) {
  const candidates = [];
  const seen = new Set();

  const excludePatterns = [
    'sprite', 'icon', 'logo', 'favicon', 'avatar', 'banner', 'ad-', 'ads/', 'adv_',
    'facebook', 'twitter', 'instagram', 'telegram', 'whatsapp', 'youtube', 'tiktok',
    'vk.com', 'placeholder', 'blank.gif', 'pixel', 'tracking', '1x1', 'no-image',
    'default-image', 'loader', 'spinner', 'arrow', 'button', 'star', 'checkmark',
    'payment', 'visa', 'mastercard', 'paypal', 'ssl', 'secure', 'certificate',
    'captcha', 'gravatar', 'emoji', 'social', 'share', 'like', 'comment'
  ];

  const addCandidate = (rawSrc, boost = 0) => {
    if (!rawSrc || rawSrc.length < 10) return;
    if (rawSrc.startsWith('data:')) return;
    try {
      const fullUrl = new URL(rawSrc, baseUrl).href;
      const lower = fullUrl.toLowerCase();
      if (excludePatterns.some(p => lower.includes(p))) return;
      if (!lower.match(/\.(jpg|jpeg|png|webp|avif|gif)/) &&
          !lower.includes('image') && !lower.includes('photo') && !lower.includes('upload') &&
          !lower.includes('cdn') && !lower.includes('media')) return;

      const norm = lower.split('?')[0].split('#')[0];
      if (seen.has(norm)) return;
      seen.add(norm);

      let score = boost;
      if (lower.includes('original') || lower.includes('full') || lower.includes('large') || lower.includes('big') || lower.includes('max')) score += 3;
      if (lower.includes('photo') || lower.includes('gallery') || lower.includes('slide') || lower.includes('carousel') || lower.includes('main')) score += 2;
      if (lower.includes('upload') || lower.includes('cdn') || lower.includes('media') || lower.includes('image')) score += 1;
      if (lower.includes('thumb') || lower.includes('small') || lower.includes('tiny') || lower.includes('mini') || lower.includes('preview')) score -= 2;
      const dimMatch = lower.match(/\/(\d{2,3})x(\d{2,3})\//);
      if (dimMatch && parseInt(dimMatch[1]) < 200 && parseInt(dimMatch[2]) < 200) score -= 3;
      const wMatch = lower.match(/[?&]w=(\d+)/);
      const hMatch = lower.match(/[?&]h=(\d+)/);
      if (wMatch && parseInt(wMatch[1]) < 200) score -= 2;
      if (hMatch && parseInt(hMatch[1]) < 200) score -= 2;

      candidates.push({ url: fullUrl, score });
    } catch (e) {}
  };

  // JSON-LD images get highest priority
  jsonLdImages.forEach(u => addCandidate(u, 10));

  // img tags: src, data-src, data-lazy, data-original, data-zoom, etc.
  const imgRegex = /<img[^>]*>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const tag = imgMatch[0];
    const attrs = ['src', 'data-src', 'data-lazy', 'data-lazy-src', 'data-original',
                   'data-zoom-image', 'data-large', 'data-full', 'data-high', 'data-big',
                   'data-src-original', 'data-real-src'];
    for (const attr of attrs) {
      const re = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'i');
      const m = tag.match(re);
      if (m) addCandidate(m[1]);
    }
    const srcsetMatch = tag.match(/srcset\s*=\s*["']([^"']+)["']/i);
    if (srcsetMatch) {
      const parts = srcsetMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => {
        const u = p.split(/\s+/)[0];
        if (u) addCandidate(u);
      });
    }
  }

  // source/picture tags
  const sourceRegex = /<source[^>]*>/gi;
  let sourceMatch;
  while ((sourceMatch = sourceRegex.exec(html)) !== null) {
    const tag = sourceMatch[0];
    const srcsetMatch = tag.match(/srcset\s*=\s*["']([^"']+)["']/i);
    if (srcsetMatch) {
      const parts = srcsetMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => {
        const u = p.split(/\s+/)[0];
        if (u) addCandidate(u);
      });
    }
  }

  // background images in inline styles
  const bgRegex = /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi;
  let bgMatch;
  while ((bgMatch = bgRegex.exec(html)) !== null) {
    addCandidate(bgMatch[1]);
  }

  // a[href] pointing to image files (some galleries use links)
  const aImgRegex = /<a[^>]*href=["']([^"']+\.(?:jpg|jpeg|png|webp|avif)[^"']*)["']/gi;
  let aMatch;
  while ((aMatch = aImgRegex.exec(html)) !== null) {
    addCandidate(aMatch[1], 1);
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.map(c => c.url);
}

function upgradeThumbnailUrl(url) {
  return url
    .replace(/\.th\d?\.(jpg|jpeg|png|webp|avif)/i, '.$1')
    .replace(/\.thumb\.(jpg|jpeg|png|webp|avif)/i, '.$1')
    .replace(/_thumb(?=\.|$)/i, '')
    .replace(/_small(?=\.|$)/i, '_large')
    .replace(/_mini(?=\.|$)/i, '')
    .replace(/\/thumbnail\//i, '/original/')
    .replace(/\/thumb\//i, '/full/')
    .replace(/\/small\//i, '/large/')
    .replace(/([?&])w=\d+&?/i, '$1')
    .replace(/([?&])h=\d+&?/i, '$1')
    .replace(/[?&]$/, '')
    .replace(/\?$/, '');
}

function cleanNullStrings(obj) {
  const cleaned = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === 'null' || val === 'None' || val === 'N/A' || val === 'n/a' || val === 'unknown' || val === 'Unknown' || val === 'неизвестно' || val === 'none' || val === 'None.') {
      cleaned[key] = null;
    } else if (Array.isArray(val)) {
      cleaned[key] = val.filter(v => v !== null && v !== 'null' && v !== '' && v !== 'unknown' && v !== 'none');
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// --- Predefined keys (must match FeaturesEditor.jsx / CarForm.jsx) ---

const FEATURE_KEYS = [
  // interior
  'leather_interior','velour_interior','alcantara','heated_seats','ventilated_seats','massage_seats',
  'heated_steering','electric_seats','memory_seats','sport_seats','sunroof','panoramic_roof','glass_roof',
  'climate_control','dual_zone_climate','triple_zone_climate','ac','rear_heated_seats','third_row','wood_trim',
  // multimedia
  'navigation','carplay','bluetooth','usb','aux','wireless_charging','wifi','audio_system','bose','harman_kardon',
  'bang_olufsen','digital_dash','hud','rear_monitor','dvd_tv',
  // safety
  'abs','esp','airbags','lane_assist','auto_emergency_braking','blind_spot','adaptive_cruise','side_airbags',
  'front_airbags','knee_airbags','pedestrian_warning','fatigue_sensor','lane_departure','night_vision',
  'sign_recognition','parking_assist','auto_parking',
  // exterior
  'alloy_wheels','winter_tires','summer_tires','second_tires','front_parktronic','rear_parktronic','rear_camera',
  'camera_360','electric_trunk','tow_bar','roof_rails','side_steps','spoiler','xenon','led','matrix_lights',
  'adaptive_light','headlight_washers','tinting','chrome','heated_mirrors','folding_mirrors',
  // suspension
  'air_suspension','adaptive_suspension','sport_suspension','lowered_suspension','diff_lock','electronic_diff',
  'drive_modes','regenerative_braking',
  // other
  'cruise_control','electric_windows','electric_mirrors','keyless','remote_start','alarm','immobilizer',
  'spare_wheel','space_saver','tow_hook','engine_guard','floor_mats','trunk_mats','window_deflectors',
  // extras
  'camera_360','auto_start_stop','auto_dimming_mirror','climate_auto','climate_2zone','climate_3zone',
  'climate_4zone','auto_tailgate','auto_high_beams','led_headlights','android_auto','rain_sensor','light_sensor',
  'fog_lights','xenon_lights','heated_windshield','winter_package','smoker_package','parking_sensors',
  'ambient_lighting','premium_sound','privacy_glass','tinted_windows','keyless_entry','power_mirror','heated_wheel',
];

const COLOR_KEYS = ['white','black','grey','silver','blue','red','green','brown','beige','yellow','orange','other'];

const INTERIOR_MATERIALS = ['alcantara','leather','partial_leather','fabric','velour','other'];

const INTERIOR_COLORS = ['black','gray','brown','beige','red','blue','green','yellow','orange','white'];

// Mapping from common free-text terms (EN/RU) to predefined feature keys
const FEATURE_ALIASES = {
  // interior
  'leather': 'leather_interior', 'кожа': 'leather_interior', 'кожаный салон': 'leather_interior', 'leather seats': 'leather_interior',
  'velour': 'velour_interior', 'велюр': 'velour_interior', 'velour interior': 'velour_interior',
  'alcantara': 'alcantara', 'алькантара': 'alcantara',
  'heated seats': 'heated_seats', 'подогрев сидений': 'heated_seats', 'подогрев сиденья': 'heated_seats',
  'ventilated seats': 'ventilated_seats', 'вентиляция сидений': 'ventilated_seats',
  'massage seats': 'massage_seats', 'массаж сидений': 'massage_seats', 'массаж': 'massage_seats',
  'heated steering': 'heated_steering', 'heated steering wheel': 'heated_steering', 'подогрев руля': 'heated_steering', 'подогрев рулевого колеса': 'heated_steering',
  'heated wheel': 'heated_steering',
  'electric seats': 'electric_seats', 'электропривод сидений': 'electric_seats', 'электросиденья': 'electric_seats',
  'memory seats': 'memory_seats', 'память сидений': 'memory_seats',
  'sport seats': 'sport_seats', 'спортивные сиденья': 'sport_seats',
  'sunroof': 'sunroof', 'люк': 'sunroof', 'солнечная крыша': 'sunroof',
  'panoramic roof': 'panoramic_roof', 'панорамная крыша': 'panoramic_roof', 'панорама': 'panoramic_roof',
  'glass roof': 'glass_roof', 'стеклянная крыша': 'glass_roof',
  'climate control': 'climate_control', 'климат контроль': 'climate_control', 'климат-контроль': 'climate_control',
  'dual zone climate': 'dual_zone_climate', 'двухзонный климат': 'dual_zone_climate', '2-zone climate': 'dual_zone_climate',
  'triple zone climate': 'triple_zone_climate', 'трёхзонный климат': 'triple_zone_climate', '3-zone climate': 'triple_zone_climate',
  'ac': 'ac', 'кондиционер': 'ac', 'air conditioning': 'ac',
  'rear heated seats': 'rear_heated_seats', 'подогрев задних сидений': 'rear_heated_seats',
  'third row': 'third_row', 'третий ряд': 'third_row', '7 мест': 'third_row', '7 seater': 'third_row',
  'wood trim': 'wood_trim', 'деревянная отделка': 'wood_trim', 'wood': 'wood_trim',
  // multimedia
  'navigation': 'navigation', 'навигация': 'navigation', 'gps': 'navigation',
  'carplay': 'carplay', 'apple carplay': 'carplay',
  'bluetooth': 'bluetooth',
  'usb': 'usb',
  'aux': 'aux',
  'wireless charging': 'wireless_charging', 'беспроводная зарядка': 'wireless_charging',
  'wifi': 'wifi', 'wi-fi': 'wifi',
  'audio system': 'audio_system', 'аудиосистема': 'audio_system',
  'bose': 'bose', 'bose sound': 'bose',
  'harman kardon': 'harman_kardon', 'harman/kardon': 'harman_kardon',
  'bang olufsen': 'bang_olufsen', 'bang&olufsen': 'bang_olufsen', 'bang & olufsen': 'bang_olufsen', 'b&o': 'bang_olufsen',
  'digital dash': 'digital_dash', 'цифровая панель': 'digital_dash', 'digital dashboard': 'digital_dash',
  'hud': 'hud', 'head-up display': 'hud', 'проекционный дисплей': 'hud',
  'rear monitor': 'rear_monitor', 'монитор задних сидений': 'rear_monitor',
  'dvd': 'dvd_tv', 'tv': 'dvd_tv', 'dvd/tv': 'dvd_tv',
  // safety
  'abs': 'abs',
  'esp': 'esp', 'esc': 'esp',
  'airbags': 'airbags', 'подушки': 'airbags', 'подушки безопасности': 'airbags',
  'lane assist': 'lane_assist', 'ассистент полосы': 'lane_assist',
  'auto emergency braking': 'auto_emergency_braking', 'аварийное торможение': 'auto_emergency_braking', 'aeb': 'auto_emergency_braking',
  'blind spot': 'blind_spot', 'мониторинг слепых зон': 'blind_spot', 'слепые зоны': 'blind_spot',
  'adaptive cruise': 'adaptive_cruise', 'адаптивный круиз': 'adaptive_cruise', 'adaptive cruise control': 'adaptive_cruise', 'acc': 'adaptive_cruise',
  'side airbags': 'side_airbags', 'боковые подушки': 'side_airbags',
  'front airbags': 'front_airbags', 'фронтальные подушки': 'front_airbags',
  'knee airbags': 'knee_airbags',
  'pedestrian warning': 'pedestrian_warning', 'защита пешеходов': 'pedestrian_warning',
  'fatigue sensor': 'fatigue_sensor', 'контроль усталости': 'fatigue_sensor',
  'lane departure': 'lane_departure', 'контроль полосы': 'lane_departure', 'ldw': 'lane_departure',
  'night vision': 'night_vision', 'ночное видение': 'night_vision',
  'sign recognition': 'sign_recognition', 'распознавание знаков': 'sign_recognition', 'распознавание дорожных знаков': 'sign_recognition',
  'parking assist': 'parking_assist', 'ассистент парковки': 'parking_assist',
  'auto parking': 'auto_parking', 'автопарковка': 'auto_parking', 'автоматическая парковка': 'auto_parking',
  // exterior
  'alloy wheels': 'alloy_wheels', 'литые диски': 'alloy_wheels', 'легкосплавные диски': 'alloy_wheels',
  'winter tires': 'winter_tires', 'зимние шины': 'winter_tires', 'зимняя резина': 'winter_tires',
  'summer tires': 'summer_tires', 'летние шины': 'summer_tires', 'летняя резина': 'summer_tires',
  'second tires': 'second_tires', 'второй комплект шин': 'second_tires',
  'front parktronic': 'front_parktronic', 'передний парктроник': 'front_parktronic',
  'rear parktronic': 'rear_parktronic', 'задний парктроник': 'rear_parktronic', 'парктроник': 'rear_parktronic',
  'rear camera': 'rear_camera', 'камера заднего вида': 'rear_camera', 'задняя камера': 'rear_camera',
  '360 camera': 'camera_360', 'camera 360': 'camera_360', 'камера 360': 'camera_360', '360 обзор': 'camera_360',
  'electric trunk': 'electric_trunk', 'электропривод багажника': 'electric_trunk', 'electric tailgate': 'auto_tailgate', 'автобагажник': 'auto_tailgate',
  'tow bar': 'tow_bar', 'фаркоп': 'tow_bar', 'tow hook': 'tow_hook',
  'roof rails': 'roof_rails', 'рейлинги': 'roof_rails',
  'side steps': 'side_steps', 'боковые подножки': 'side_steps',
  'spoiler': 'spoiler', 'спойлер': 'spoiler',
  'xenon': 'xenon', 'ксенон': 'xenon', 'xenon lights': 'xenon_lights',
  'led': 'led', 'led headlights': 'led_headlights', 'led фары': 'led_headlights',
  'matrix lights': 'matrix_lights', 'matrix led': 'matrix_lights', 'матричные фары': 'matrix_lights', 'matrix led headlights': 'matrix_lights',
  'adaptive light': 'adaptive_light', 'адаптивный свет': 'adaptive_light',
  'headlight washers': 'headlight_washers', 'омыватель фар': 'headlight_washers',
  'tinting': 'tinting', 'тонировка': 'tinting', 'tinted windows': 'tinted_windows', 'тонированные стёкла': 'tinted_windows',
  'chrome': 'chrome', 'хром': 'chrome',
  'heated mirrors': 'heated_mirrors', 'подогрев зеркал': 'heated_mirrors',
  'folding mirrors': 'folding_mirrors', 'электрозеркала': 'folding_mirrors', 'electric mirrors': 'electric_mirrors',
  // suspension
  'air suspension': 'air_suspension', 'пневмоподвеска': 'air_suspension',
  'adaptive suspension': 'adaptive_suspension', 'адаптивная подвеска': 'adaptive_suspension',
  'sport suspension': 'sport_suspension', 'спортивная подвеска': 'sport_suspension',
  'lowered suspension': 'lowered_suspension', 'заниженная подвеска': 'lowered_suspension',
  'diff lock': 'diff_lock', 'блокировка дифференциала': 'diff_lock',
  'electronic diff': 'electronic_diff', 'электронный дифференциал': 'electronic_diff',
  'drive modes': 'drive_modes', 'режимы вождения': 'drive_modes',
  'regenerative braking': 'regenerative_braking', 'рекуперация': 'regenerative_braking',
  // other
  'cruise control': 'cruise_control', 'круиз контроль': 'cruise_control', 'круиз-контроль': 'cruise_control',
  'electric windows': 'electric_windows', 'электростёкла': 'electric_windows',
  'keyless': 'keyless', 'keyless entry': 'keyless_entry', 'keyless go': 'keyless', 'бесключевой доступ': 'keyless_entry',
  'remote start': 'remote_start', 'удалённый запуск': 'remote_start',
  'alarm': 'alarm', 'сигнализация': 'alarm',
  'immobilizer': 'immobilizer', 'иммобилайзер': 'immobilizer',
  'spare wheel': 'spare_wheel', 'запаска': 'spare_wheel', 'запасное колесо': 'spare_wheel',
  'space saver': 'space_saver', 'докатка': 'space_saver',
  'floor mats': 'floor_mats', 'коврики': 'floor_mats',
  'trunk mats': 'trunk_mats', 'коврик в багажник': 'trunk_mats',
  'window deflectors': 'window_deflectors', 'ветровики': 'window_deflectors',
  // extras
  'auto start stop': 'auto_start_stop', 'start-stop': 'auto_start_stop', 'старт-стоп': 'auto_start_stop',
  'auto dimming mirror': 'auto_dimming_mirror', 'автозатемнение зеркала': 'auto_dimming_mirror',
  'climate auto': 'climate_auto',
  'ambient lighting': 'ambient_lighting', 'контурная подсветка': 'ambient_lighting',
  'premium sound': 'premium_sound', 'премиум звук': 'premium_sound',
  'privacy glass': 'privacy_glass', 'тонировка сзади': 'privacy_glass',
  'fog lights': 'fog_lights', 'противотуманки': 'fog_lights', 'птф': 'fog_lights',
  'rain sensor': 'rain_sensor', 'датчик дождя': 'rain_sensor',
  'light sensor': 'light_sensor', 'датчик света': 'light_sensor',
  'heated windshield': 'heated_windshield', 'подогрев лобового': 'heated_windshield',
  'winter package': 'winter_package', 'зимний пакет': 'winter_package',
  'parking sensors': 'parking_sensors', 'датчики парковки': 'parking_sensors',
  'android auto': 'android_auto',
};

const COLOR_ALIASES = {
  'white': 'white', 'белый': 'white', 'белая': 'white', 'white color': 'white',
  'black': 'black', 'чёрный': 'black', 'черный': 'black', 'чёрная': 'black', 'черная': 'black',
  'grey': 'grey', 'gray': 'grey', 'серый': 'grey', 'серая': 'grey', 'серебристый': 'silver',
  'silver': 'silver', 'серебро': 'silver',
  'blue': 'blue', 'синий': 'blue', 'синяя': 'blue', 'голубой': 'blue', 'голубая': 'blue',
  'red': 'red', 'красный': 'red', 'красная': 'red',
  'green': 'green', 'зелёный': 'green', 'зеленый': 'green', 'зелёная': 'green',
  'brown': 'brown', 'коричневый': 'brown', 'коричневая': 'brown',
  'beige': 'beige', 'бежевый': 'beige', 'бежевая': 'beige',
  'yellow': 'yellow', 'жёлтый': 'yellow', 'желтый': 'yellow',
  'orange': 'orange', 'оранжевый': 'orange',
};

const INTERIOR_MATERIAL_ALIASES = {
  'leather': 'leather', 'кожа': 'leather', 'кожаный': 'leather',
  'partial leather': 'partial_leather', 'комбинированный': 'partial_leather', 'комби': 'partial_leather', 'кожа/ткань': 'partial_leather',
  'alcantara': 'alcantara', 'алькантара': 'alcantara',
  'fabric': 'fabric', 'ткань': 'fabric', 'тканевый': 'fabric',
  'velour': 'velour', 'велюр': 'velour', 'велюровый': 'velour',
};

function normalizeFeatures(rawFeatures) {
  if (!Array.isArray(rawFeatures)) return [];
  const result = new Set();
  // Patterns to reject (not real features)
  const rejectPatterns = /^\d+(\.\d+)?\s*(tdi|kw|hp|л\.с\.|л\.с|km|kmh|cc|cm3|л|л\.|v\d|at|mt|amt|dsg|cvt|робот|автомат|механика|ручная|передний|задний|полный|привод|fwd|rwd|awd|petrol|diesel|electric|hybrid|gas|бензин|дизель|электро|гибрид|газ)/i;
  const rejectWords = /^(automāts|automat|автомат|механика|ручная|мкпп|акпп|вариатор|робот|dsg|cvt|tiptronic|multitronic|s\W?tronic|quattro|4motion|xdrive|4matic|4wd|2wd|передний|задний|полный| fwd|rwd|awd|4x4|4x2)$/i;

  for (const raw of rawFeatures) {
    if (!raw || typeof raw !== 'string') continue;
    const lower = raw.toLowerCase().trim();
    if (lower.length < 2) continue;
    // Reject engine specs, power figures, transmission types
    if (rejectPatterns.test(lower) || rejectWords.test(lower)) continue;
    if (/^\d+(\.\d+)?$/.test(lower)) continue; // pure numbers
    if (/^\d+(\.\d+)?\s*(kw|hp|л\.с\.?|ps|cv)/i.test(lower)) continue; // power
    if (/^\d+(\.\d+)?\s*(tdi|tfsi|mpi|cdi|crdi|d|gdi)/i.test(lower)) continue; // engine codes
    if (/(dzinējs|engine|двигатель|мотор|мотора)/i.test(lower) && lower.length < 40) continue; // engine descriptions

    // Direct key match
    if (FEATURE_KEYS.includes(lower)) { result.add(lower); continue; }
    // Alias match
    if (FEATURE_ALIASES[lower]) { result.add(FEATURE_ALIASES[lower]); continue; }
    // Partial match: check if any alias is substring of the feature text
    let matched = false;
    for (const [alias, key] of Object.entries(FEATURE_ALIASES)) {
      if (lower.includes(alias)) { result.add(key); matched = true; break; }
    }
    // Also check direct key as substring
    if (!matched) {
      for (const key of FEATURE_KEYS) {
        if (lower.includes(key)) { result.add(key); matched = true; break; }
      }
    }
    // If no match, keep as custom (only if meaningful and not a package/trim name)
    if (!matched && lower.length > 2 && !lower.includes('пакет') && !lower.includes('package') && !lower.includes('line') && !lower.includes('trim') && !lower.includes('edition')) {
      result.add(raw.trim());
    }
  }
  return Array.from(result);
}

function normalizeColor(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const lower = raw.toLowerCase().trim();
  if (COLOR_KEYS.includes(lower)) return lower;
  if (COLOR_ALIASES[lower]) return COLOR_ALIASES[lower];
  for (const [alias, key] of Object.entries(COLOR_ALIASES)) {
    if (lower.includes(alias)) return key;
  }
  return 'other';
}

function normalizeInteriorMaterial(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const lower = raw.toLowerCase().trim();
  if (INTERIOR_MATERIALS.includes(lower)) return lower;
  if (INTERIOR_MATERIAL_ALIASES[lower]) return INTERIOR_MATERIAL_ALIASES[lower];
  for (const [alias, key] of Object.entries(INTERIOR_MATERIAL_ALIASES)) {
    if (lower.includes(alias)) return key;
  }
  return 'other';
}

function normalizeInteriorColor(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const lower = raw.toLowerCase().trim();
  if (INTERIOR_COLORS.includes(lower)) return lower;
  for (const color of INTERIOR_COLORS) {
    if (lower.includes(color)) return color;
  }
  return null;
}

function detectCountryFromUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.endsWith('.ee')) return 'Estonia';
    if (hostname.endsWith('.lv')) return 'Latvia';
    if (hostname.endsWith('.lt')) return 'Lithuania';
    if (hostname.endsWith('.ru')) return 'Russia';
    if (hostname.endsWith('.fi')) return 'Finland';
    if (hostname.endsWith('.pl')) return 'Poland';
    if (hostname.endsWith('.de')) return 'Germany';
  } catch (e) {}
  return null;
}

// --- Main handler ---

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { url, dealerId, sellerEmail } = body;

    if (!url || !dealerId) {
      return Response.json({ error: 'Missing url or dealerId' }, { status: 400 });
    }

    // 1. Fetch HTML
    let html;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en,ru,et,lv,lt;q=0.9'
        },
        signal: AbortSignal.timeout(20000)
      });
      if (!response.ok) {
        return Response.json({ error: `Не удалось загрузить страницу (HTTP ${response.status})` }, { status: 502 });
      }
      html = await response.text();
    } catch (fetchError) {
      return Response.json({ error: `Не удалось получить доступ к ссылке: ${fetchError.message || 'timeout'}` }, { status: 502 });
    }

    // 2. Extract structured data sources (before cleaning)
    const jsonLd = extractJsonLd(html);
    const jsonLdImages = extractJsonLdImages(jsonLd);
    const meta = extractMeta(html);
    const detectedCountry = detectCountryFromUrl(url);

    // 3. Extract image candidates
    const imageCandidates = extractImageCandidates(html, url, jsonLdImages);

    // 4. Clean HTML for LLM
    const cleanedHtml = cleanHtml(html);
    const truncatedHtml = cleanedHtml.substring(0, 100000);

    // Build extra context for LLM
    let extraContext = '';
    if (detectedCountry) extraContext += `\nСтрана (по домену): ${detectedCountry}.`;
    if (meta.ogTitle) extraContext += `\nЗаголовок OG: ${meta.ogTitle}`;
    if (meta.ogDescription) extraContext += `\nОписание OG: ${meta.ogDescription}`;
    if (jsonLd.length > 0) {
      const jsonLdStr = JSON.stringify(jsonLd).substring(0, 8000);
      extraContext += `\nJSON-LD структурированные данные:\n${jsonLdStr}`;
    }

    // 5. Extract structured data with expanded schema
    const extracted = await base44.integrations.Core.InvokeLLM({
      prompt: `Ты — профессиональный парсер автомобильных объявлений. Извлеки ВСЮ доступную информацию о автомобиле из HTML-страницы. Будь максимально точным и полным. Если поле нельзя найти — верни null.

Для features: перечисли ВСЕ опции и особенности автомобиля как есть из объявления (на языке объявления) — кожаный салон, навигация, подогрев сидений, парктроник, камера заднего вида, LED-фары, круиз-контроль, пневмоподвеска, панорамная крыша, Bang&Olufsen, Matrix LED, и т.д. Они будут автоматически смаплены к предопределённым ключам.

Для color: верни один из: ${COLOR_KEYS.join(', ')} (например "чёрный" → black, "серебристый" → silver, "белый" → white).
Для interior_material: верни один из: ${INTERIOR_MATERIALS.join(', ')} (например "кожа" → leather, "ткань" → fabric).
Для color_interior: верни один из: ${INTERIOR_COLORS.join(', ')} или null.

Для description возьми полный текст описания из объявления.${extraContext}

HTML:
${truncatedHtml}`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Полный заголовок объявления" },
          brand: { type: "string", description: "Марка автомобиля" },
          model: { type: "string", description: "Модель" },
          year: { type: "number", description: "Год выпуска" },
          month_of_manufacture: { type: "number", description: "Месяц выпуска (1-12), если указан" },
          price: { type: "number", description: "Цена в EUR" },
          mileage: { type: "number", description: "Пробег в км" },
          fuel_type: { type: "string", enum: ["petrol", "diesel", "electric", "hybrid", "plugin_hybrid", "gas"] },
          transmission: { type: "string", enum: ["manual", "automatic"] },
          transmission_type: { type: "string", description: "Тип трансмиссии (AT, DSG, CVT, Tiptronic, робот и т.д.)" },
          body_type: { type: "string", enum: ["sedan", "hatchback", "suv", "crossover", "wagon", "coupe", "convertible", "minivan", "pickup"] },
          trim_level: { type: "string", description: "Комплектация / trim (например: Comfort, Highline, R-Line, Sport, Business)" },
          color: { type: "string", description: `Цвет кузова — только один из: ${COLOR_KEYS.join(', ')}` },
          color_interior: { type: "string", description: `Цвет салона — один из: ${INTERIOR_COLORS.join(', ')}` },
          interior_material: { type: "string", description: `Материал салона — один из: ${INTERIOR_MATERIALS.join(', ')}` },
          metallic: { type: "boolean", description: "Металлик / перламутр (ЛКП)" },
          engine_volume: { type: "number", description: "Объём двигателя в литрах" },
          engine_volume_cc: { type: "number", description: "Объём двигателя в куб.см" },
          engine_power: { type: "number", description: "Мощность в л.с." },
          engine_code: { type: "string", description: "Код двигателя" },
          engine_layout: { type: "string", description: "Расположение двигателя (продольное, поперечное)" },
          turbo_type: { type: "string", description: "Тип наддува (турбо, компрессор, twin-turbo, без наддува)" },
          drive_type: { type: "string", enum: ["fwd", "rwd", "awd"] },
          vin: { type: "string", description: "VIN-номер" },
          license_plate: { type: "string", description: "Государственный номер" },
          doors: { type: "number", description: "Количество дверей" },
          seats: { type: "number", description: "Количество мест" },
          owners_count: { type: "number", description: "Количество владельцев" },
          emission_class: { type: "string", description: "Экологический класс (Euro 5, Euro 6, Euro 6d)" },
          technical_inspection_until: { type: "string", description: "Техосмотр до (дата YYYY-MM-DD если есть)" },
          condition: { type: "string", description: "Состояние (новый, б/у, отличное, хорошее, удовлетворительное)" },
          features: { type: "array", items: { type: "string" }, description: "Все опции и особенности автомобиля как есть из объявления" },
          service_book: { type: "boolean", description: "Сервисная книжка есть" },
          warranty: { type: "boolean", description: "На гарантии" },
          non_smoker: { type: "boolean", description: "Некурящий владелец" },
          vat_deductible: { type: "boolean", description: "С вычетом НДС" },
          co2_emissions: { type: "number", description: "Выбросы CO2 (г/км)" },
          fuel_consumption_combined: { type: "number", description: "Расход топл. комбинированный (л/100км)" },
          acceleration_0_100: { type: "number", description: "Разгон 0-100 км/ч (сек)" },
          description: { type: "string", description: "Полный текст описания из объявления" },
          location: { type: "string", description: "Город или регион продажи" },
          country: { type: "string", description: "Страна (Estonia, Latvia, Lithuania, Russia, Finland, Poland, Germany)" }
        }
      }
    });

    // 6. Filter images using vision LLM
    let selectedImages = imageCandidates.slice(0, 20);
    if (imageCandidates.length > 0) {
      try {
        const topCandidates = imageCandidates.slice(0, 12);
        const imageFilter = await base44.integrations.Core.InvokeLLM({
          prompt: `Тебе показаны изображения со страницы автомобильного объявления. Выбери ТОЛЬКО фотографии самого рекламируемого автомобиля (экстерьер, интерьер, салон, приборная панель, детали, колёса, двигатель, багажник). Исключи ВСЁ остальное: логотипы, баннеры, иконки, аватарки продавца, рекламу, миниатюры других объявлений (похожие авто в блоке "рекомендуем"), элементы интерфейса, плейсхолдеры, картинки-заглушки, карты, графики. Верни индексы (0-based) подходящих фото в порядке от лучшего к худшему.`,
          file_urls: topCandidates,
          response_json_schema: {
            type: "object",
            properties: {
              valid_indices: { type: "array", items: { type: "number" }, description: "Индексы подходящих фото автомобиля (0-based)" }
            }
          }
        });
        if (imageFilter.valid_indices && Array.isArray(imageFilter.valid_indices) && imageFilter.valid_indices.length > 0) {
          const filtered = imageFilter.valid_indices
            .map(i => topCandidates[i])
            .filter(Boolean);
          if (filtered.length > 0) selectedImages = filtered.slice(0, 20);
        }
      } catch (imgError) {
        console.log('Image filter error:', imgError.message);
      }
    }

    // 7. Build car data — normalize all enum/feature fields to predefined keys
    const clean = cleanNullStrings(extracted);
    const title = clean.title || `${clean.brand || ''} ${clean.model || ''} ${clean.year || ''}`.trim();
    const upgradedImages = selectedImages.map(upgradeThumbnailUrl);
    const carData = {
      title: title || 'Импортированное объявление',
      brand: clean.brand || '',
      model: clean.model || '',
      year: clean.year || new Date().getFullYear(),
      month_of_manufacture: clean.month_of_manufacture || null,
      price: clean.price || 0,
      mileage: clean.mileage || 0,
      fuel_type: clean.fuel_type || 'petrol',
      transmission: clean.transmission || 'manual',
      transmission_type: clean.transmission_type || null,
      body_type: clean.body_type || 'sedan',
      trim_level: clean.trim_level || null,
      color: normalizeColor(clean.color),
      color_interior: normalizeInteriorColor(clean.color_interior),
      interior_material: normalizeInteriorMaterial(clean.interior_material),
      metallic: clean.metallic || false,
      engine_volume: clean.engine_volume || null,
      engine_volume_cc: clean.engine_volume_cc || null,
      engine_power: clean.engine_power || null,
      engine_code: clean.engine_code || null,
      engine_layout: clean.engine_layout || null,
      turbo_type: clean.turbo_type || null,
      drive_type: clean.drive_type || null,
      vin: clean.vin || null,
      license_plate: clean.license_plate || null,
      doors: clean.doors || null,
      seats: clean.seats || null,
      owners_count: clean.owners_count || null,
      emission_class: clean.emission_class || null,
      technical_inspection_until: clean.technical_inspection_until || null,
      condition: clean.condition || null,
      features: normalizeFeatures(clean.features),
      service_book: clean.service_book || false,
      warranty: clean.warranty || false,
      non_smoker: clean.non_smoker || false,
      vat_deductible: clean.vat_deductible || false,
      co2_emissions: clean.co2_emissions || null,
      fuel_consumption_combined: clean.fuel_consumption_combined || null,
      acceleration_0_100: clean.acceleration_0_100 || null,
      description: clean.description || '',
      location: clean.location || '',
      country: clean.country || detectedCountry || '',
      images: upgradedImages,
      seller_type: 'dealer',
      seller_id: sellerEmail || user.email,
      dealer_id: dealerId,
      status: 'pending'
    };

    // 8. Create Car record
    const car = await base44.entities.Car.create(carData);

    return Response.json({ success: true, car });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}