import premiumCarsData from '@/data/premiumCars.json';

// Weak automotive terms that alone don't indicate a specific premium trim
const WEAK_TERMS = new Set([
  'quattro', 'tfsi', 'tdi', 'sport', 'luxury', 'premium', 'classic', 'edition',
  'auto', 'manual', 'dct', 'stronic', 'tiptronic', 'fsi', 'mpi', 'cdi',
  'bluemotion', 'efficientdynamics', 'xdrive', 'sdrive', 'hybrid', 'electric',
  'diesel', 'petrol', 'gasoline', 'turbo', 'supercharged', 'cabriolet', 'cabrio',
  'convertible', 'coupe', 'sedan', 'wagon', 'avant', 'touring', 'hatchback',
  'suv', 'roadster', 'spyder', 'spider', 'volante', 'targa', 'lhd', 'rwd',
  'fwd', 'awd', '4wd', '4x4', '2wd', 'bi-turbo', 'biturbo', 'twin-turbo',
  'twinturbo', 'v6', 'v8', 'v10', 'v12', 'i4', 'i6', 'i8', 'w12', 'w16',
  'boxer', 'flat', 'inline', 'rotary', 'package', 'line', 'series', 'class',
  'grade', 'level', 'trim', 'spec', 's-line', 'nogaro', 'limited', 'launch',
  'anniversary', 'special', 'exclusive', 'style', 'design', 'look', 'aero',
  'comfort', 'convenience', 'technology', 'tech', 'panorama', 'leather',
  'alcantara', 'nappa', 'carbon', 'fiber', 'alloy', 'wheel', 'wheels',
  'led', 'matrix', 'laser', 'xenon', 'halogen'
]);

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a car matches any entry in the premium car database.
 * Matching is based on brand, model, and specific trim/engine details.
 *
 * @param {Object} car - Car object with brand, model, trim_level, year, engine_volume, engine_power, etc.
 * @returns {boolean} - true if the car is a premium model
 */
export function checkIfPremiumCar(car) {
  if (!car.brand || !car.model) return false;

  const carBrand = car.brand.toLowerCase().trim();
  const carModel = car.model.toLowerCase().trim();
  const carTrim = (car.trim_level || '').toLowerCase().trim();
  const carTitle = (car.title || '').toLowerCase().trim();
  const carEngineCode = (car.engine_code || '').toLowerCase().trim();
  const carYear = car.year;
  const carEngineVolume = car.engine_volume;
  const carEnginePower = car.engine_power;

  // Find the brand in the premium database
  const brandData = premiumCarsData.brands.find(
    b => b.brand.toLowerCase().trim() === carBrand
  );
  if (!brandData) return false;

  // Combine all text fields for keyword matching
  const allText = [carTrim, carTitle, carEngineCode].filter(Boolean).join(' ');
  const allWords = allText.split(/[\s,;.\-_/]+/).filter(Boolean);

  // Check each entry under this brand
  for (const entry of brandData.entries) {
    // Normalize: replace hyphens with spaces for model matching
    const entryLower = entry.toLowerCase().replace(/-/g, ' ');
    const normalizedModel = carModel.replace(/-/g, ' ');

    // 1. Model match - find model as substring NOT followed by alphanumeric
    // This handles concatenated words like "SaloonM5" (M5 at end of word)
    let modelFound = false;
    let searchPos = 0;
    while (true) {
      const idx = entryLower.indexOf(normalizedModel, searchPos);
      if (idx === -1) break;
      const afterIdx = idx + normalizedModel.length;
      const afterChar = afterIdx < entryLower.length ? entryLower[afterIdx] : '';
      // Model must NOT be followed by a letter or digit (prevents "M5" matching "M550i")
      if (!afterChar || !/[a-z0-9]/.test(afterChar)) {
        modelFound = true;
        break;
      }
      searchPos = idx + 1;
    }
    if (!modelFound) continue;

    // 2. Year match — premium DB was compiled ~2018, so only enforce the LOWER bound
    //    (model introduction year). Newer cars of the same trim line still qualify.
    const yearRangeMatch = entry.match(/\((\d{4})\s*[–—-]\s*(\d{4})\)/);
    const singleYearMatch = entry.match(/\((\d{4})\)/);
    if (yearRangeMatch) {
      const start = parseInt(yearRangeMatch[1]);
      if (carYear && carYear < start) continue;
    } else if (singleYearMatch && !yearRangeMatch) {
      const yr = parseInt(singleYearMatch[1]);
      if (carYear && carYear < yr) continue;
    }

    // 3. Score-based detail matching
    let score = 0;

    // 3a. Individual word matching (length >= 3)
    if (allText) {
      const words = allText.split(/[\s,;.\-_/]+/).filter(w => w.length >= 3);
      for (const word of words) {
        if (entryLower.includes(word)) {
          score += WEAK_TERMS.has(word) ? 1 : 3;
        }
      }

      // 3b. Multi-word phrase matching (2-3 word phrases)
      for (let len = 2; len <= 3; len++) {
        for (let i = 0; i <= allWords.length - len; i++) {
          const phrase = allWords.slice(i, i + len).join(' ');
          if (phrase.length >= 5 && entryLower.includes(phrase)) {
            if (!WEAK_TERMS.has(phrase)) score += 3;
          }
        }
      }
    }

    // 3c. Engine volume match
    if (carEngineVolume) {
      const allNumbers = entry.match(/\d+\.\d+/g);
      if (allNumbers) {
        for (const num of allNumbers) {
          const vol = parseFloat(num);
          if (vol >= 0.5 && vol <= 10.0 && Math.abs(vol - carEngineVolume) < 0.15) {
            score += 3;
            break;
          }
        }
      }
    }

    // 3d. Engine power match
    if (carEnginePower) {
      const powerMatches = [...entry.matchAll(/(\d+)\s*(?:hp|bhp|ps|kw)/gi)];
      for (const match of powerMatches) {
        const power = parseInt(match[1]);
        if (Math.abs(power - carEnginePower) < 15) {
          score += 3;
          break;
        }
      }
    }

    // If score meets threshold, it's a premium car
    if (score >= 3) return true;
  }

  return false;
}