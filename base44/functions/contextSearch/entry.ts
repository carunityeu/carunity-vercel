import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Значения фильтров, которые модель иногда добавляет «по смыслу».
// Оставляем только те, что действительно упомянуты в запросе.
const SYNONYMS: Record<string, Record<string, string[]>> = {
  fuelType: {
    petrol: ['petrol', 'gasoline', 'бензин', 'бензинов', 'bensiin', 'benzīn', 'benzinas'],
    diesel: ['diesel', 'дизел', 'diisel', 'dīzel', 'dyzel'],
    electric: ['electric', 'электро', 'elektri', 'elektris', 'elektr'],
    hybrid: ['hybrid', 'гибрид', 'hübriid', 'hibrīd', 'hibrid'],
    plugin_hybrid: ['plug', 'подключаем'],
    gas: ['gas', 'газ', 'gaas', 'gāze', 'dujos'],
  },
  transmission: {
    automatic: ['autom', 'автомат', 'акпп', 'automaat', 'automāt', 'automat'],
    manual: ['manual', 'механ', 'мкпп', 'käsi', 'mehān', 'mechan'],
  },
  bodyType: {
    sedan: ['sedan', 'седан', 'sedaan'],
    hatchback: ['hatch', 'хэтч', 'luuk'],
    suv: ['suv', 'внедорож', 'джип', 'maastur', 'visurgāj', 'visureig'],
    crossover: ['crossover', 'кроссовер'],
    wagon: ['wagon', 'универсал', 'universaa'],
    coupe: ['coupe', 'купе', 'kupee'],
    convertible: ['convert', 'кабрио', 'kabriolet'],
    minivan: ['minivan', 'минивэн', 'минивен', 'mahtuniversaal', 'kaubik'],
    pickup: ['pickup', 'пикап', 'pikap'],
  },
  driveType: {
    awd: ['awd', '4x4', '4wd', 'полн', 'nelivedu', 'visu riteņu', 'keturi'],
    rwd: ['rwd', 'задн', 'tagasivedu', 'aizmugur', 'galin'],
    fwd: ['fwd', 'передн', 'esivedu', 'priekšpiedziņ', 'priekin'],
  },
  condition: {
    new: ['new', 'нов', 'uus', 'jaun', 'nauj'],
    used: ['used', 'б/у', 'бу', 'подерж', 'kasutatud', 'lietot', 'naudot'],
  },
  color: {
    white: ['white', 'бел', 'valge', 'balt'],
    black: ['black', 'чёрн', 'черн', 'must', 'meln', 'juod'],
    gray: ['gray', 'grey', 'сер', 'hall', 'pelēk', 'pilk'],
    silver: ['silver', 'серебр', 'hõbed'],
    blue: ['blue', 'син', 'sinine', 'zil', 'mėlyn'],
    red: ['red', 'красн', 'punane', 'sarkan', 'raudon'],
    green: ['green', 'зелён', 'зелен', 'rohel', 'zaļ', 'žali'],
    brown: ['brown', 'коричн', 'pruun'],
    beige: ['beige', 'беж', 'beež'],
    gold: ['gold', 'золот', 'kuldne'],
    yellow: ['yellow', 'жёлт', 'желт', 'kollane', 'dzelten', 'gelton'],
    orange: ['orange', 'оранж', 'oranž'],
    purple: ['purple', 'фиолет', 'lilla', 'violets'],
  },
  country: {
    estonia: ['estonia', 'эстон', 'eesti', 'igaunij', 'estij'],
    latvia: ['latvia', 'латв', 'läti', 'latvij', 'latvijoje'],
    lithuania: ['lithuania', 'литв', 'leedu', 'lietuv', 'lietuvoje'],
  },
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { query } = await req.json();

  if (!query || query.trim().length < 1) {
    return Response.json({ filters: {}, redirect_url: '/Catalog' });
  }

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a car search assistant for an auto marketplace operating in Estonia, Latvia, Lithuania (Baltic region).
The user typed a search query in ANY language (Russian, English, Estonian, Latvian, Lithuanian, or mixed).
Extract search parameters from it.

User query: "${query}"

Available filter fields and their EXACT values:
- brand: car brand name in English, capitalized exactly (e.g. "BMW", "Toyota", "Mercedes-Benz", "Audi", "Volkswagen", "Ford", "Honda", "Kia", "Hyundai", "Skoda", "Volvo", "Mazda", "Nissan", "Renault", "Peugeot", "Opel", "Seat", "Subaru", "Mitsubishi", "Lexus", "Porsche", "Land Rover", "Jeep", "Chevrolet", "Dodge", "Jaguar", "Tesla", "Toyota")
- model: car model name in English (e.g. "X5", "Camry", "A4", "Golf")
- fuelType: MUST be exactly one of: petrol, diesel, electric, hybrid, plugin_hybrid, gas
- transmission: MUST be exactly one of: manual, automatic
- bodyType: MUST be exactly one of: sedan, hatchback, suv, crossover, wagon, coupe, convertible, minivan, pickup
- driveType: MUST be exactly one of: fwd, rwd, awd
- condition: MUST be exactly one of: new, used (leave empty if not specified)
- color: MUST be exactly one of: white, black, grey, silver, blue, red, green, brown, beige, yellow, orange, other
- powerFrom: minimum engine power in HP (horsepower, number only, e.g. 150)
- powerTo: maximum engine power in HP (number only, e.g. 250)
- priceFrom: minimum price in EUR (number only)
- priceTo: maximum price in EUR (number only)
- yearFrom: minimum manufacture year (number only, e.g. 2018)
- yearTo: maximum manufacture year (number only)
- country: MUST be exactly one of: Estonia, Latvia, Lithuania

Multi-language translation guide:

RUSSIAN:
- "автомат" / "автоматическая" / "АКПП" → transmission: "automatic"
- "механика" / "механическая" / "МКПП" → transmission: "manual"
- "бензин" / "бензиновый" → fuelType: "petrol"
- "дизель" / "дизельный" → fuelType: "diesel"
- "электро" / "электрокар" / "электромобиль" / "электрический" → fuelType: "electric"
- "гибрид" / "гибридный" → fuelType: "hybrid"
- "внедорожник" → bodyType: "suv"; "кроссовер" → "crossover"; "седан" → "sedan"
- "хэтчбек" → "hatchback"; "универсал" → "wagon"; "купе" → "coupe"
- "кабриолет" / "кабрио" → "convertible"; "минивэн" / "минивен" → "minivan"; "пикап" → "pickup"
- "полный привод" / "4x4" → driveType: "awd"; "задний" → "rwd"; "передний" → "fwd"
- "новый" / "новые" → condition: "new"; "б/у" / "подержанный" → condition: "used"
- Brands: "Ауди"→Audi, "БМВ"→BMW, "Мерседес"/"Мерс"→Mercedes-Benz, "Тойота"→Toyota, "Фольксваген"/"ВАГ"→Volkswagen, "Хонда"→Honda, "Форд"→Ford, "Киа"→Kia, "Хендай"→Hyundai, "Шкода"→Skoda, "Вольво"→Volvo, "Мазда"→Mazda, "Ниссан"→Nissan, "Рено"→Renault, "Пежо"→Peugeot, "Опель"→Opel, "Сеат"→Seat, "Субару"→Subaru, "Митсубиси"→Mitsubishi, "Лексус"→Lexus, "Порше"→Porsche, "Ягуар"→Jaguar
- "до X" / "до X евро" → priceTo: X; "от X" / "от X евро" → priceFrom: X; "бюджетный"/"недорогой"→priceTo:7000; "премиум"/"люкс"→priceFrom:30000
- "красный"→color:red, "синий"→color:blue, "зеленый"→color:green, "черный"→color:black, "белый"→color:white, "серый"→color:gray, "серебристый"→color:silver
- Power: "лошадиные силы"/"л.с."→powerFrom/powerTo in HP; "мощный"→powerFrom:200; "100 л.с."→powerFrom:100; "до 200 сил"→powerTo:200
- Country: "Эстония"/"в Эстонии"→country:Estonia, "Латвия"/"в Латвии"→country:Latvia, "Литва"/"в Литве"→country:Lithuania

ESTONIAN:
- "automaat" / "automaatkast" → transmission: "automatic"; "käsikäigukast" / "käsi" → "manual"
- "bensiin" / "bensiiniga" → fuelType: "petrol"; "diisel" / "diiseliga" → "diesel"; "elektri" / "elektriauto" → "electric"; "hübriid" → "hybrid"
- "maastur" → bodyType: "suv"; "luukpära" → "hatchback"; "universaal" → "wagon"; "kupee" → "coupe"; "kabriolett" → "convertible"; "mahtuniversaal" / "kaubik" → "minivan"
- "esivedu" → driveType: "fwd"; "tagasivedu" → "rwd"; "nelivedu" → "awd"
- "uus" → condition: "new"; "kasutatud" → "used"
- Colors: "punane"→red, "sinine"→blue, "roheline"→green, "must"→black, "valge"→white, "hall"→gray, "hõbedane"→silver
- Power: "hobujõud"/"hj"→powerFrom/powerTo; "tugev mootor"→powerFrom:200
- Country: "Eestis"/"Eesti"→country:Estonia, "Lätis"/"Läti"→country:Latvia, "Leedus"/"Leedu"→country:Lithuania
- Brands: "Audi"→Audi, "BMW"→BMW, "Mercedes"→Mercedes-Benz, "Toyota"→Toyota, "Volkswagen"→Volkswagen, "Honda"→Honda, "Ford"→Ford, "Kia"→Kia, "Hyundai"→Hyundai, "Skoda"→Skoda, "Volvo"→Volvo, "Mazda"→Mazda, "Nissan"→Nissan, "Renault"→Renault, "Peugeot"→Peugeot, "Opel"→Opel

LATVIAN:
- "automāts" / "automātiskā" → transmission: "automatic"; "mehāniskā" → "manual"
- "benzīns" → fuelType: "petrol"; "dīzelis" → "diesel"; "elektriskais" → "electric"; "hibrīds" → "hybrid"
- "visurgājējs" → bodyType: "suv"; "pikaps" → "pickup"
- "priekšpiedziņa" → "fwd"; "aizmugurējā" → "rwd"; "visu riteņu" → "awd"
- "jauns" → "new"; "lietots" → "used"
- Colors: "sarkans"→red, "zils"→blue, "zaļš"→green, "melns"→black, "balts"→white, "pelēks"→gray
- Power: "zirgspēki"/"zs"→powerFrom/powerTo; "jaudīgs"→powerFrom:200
- Country: "Igaunijā"/"Igaunija"→country:Estonia, "Latvijā"/"Latvija"→country:Latvia, "Lietuvā"/"Lietuva"→country:Lithuania

LITHUANIAN:
- "automatinė" → transmission: "automatic"; "mechaninė" → "manual"
- "benzinas" → fuelType: "petrol"; "dyzelis" → "diesel"; "elektrinis" → "electric"; "hibridas" → "hybrid"
- "visureigis" → bodyType: "suv"; "universalas" → "wagon"
- "priekinė" → "fwd"; "galinė" → "rwd"; "keturių" → "awd"
- "naujas" → "new"; "naudotas" → "used"
- Colors: "raudona"→red, "mėlyna"→blue, "žalia"→green, "juoda"→black, "balta"→white, "pilka"→gray
- Power: "arklio galios"/"AG"→powerFrom/powerTo; "galingas"→powerFrom:200
- Country: "Estijoje"/"Estija"→country:Estonia, "Latvijoje"/"Latvija"→country:Latvia, "Lietuvoje"/"Lietuva"→country:Lithuania

English:
- "automatic"/"auto" → transmission: "automatic"; "manual"→"manual"
- "petrol"/"gasoline" → fuelType: "petrol"; "diesel"→"diesel"; "electric"/"ev"→"electric"; "hybrid"→"hybrid"
- "suv"→suv; "sedan"→sedan; "hatchback"→hatchback; "wagon"→wagon; "coupe"→coupe; "convertible"→convertible; "minivan"→minivan; "pickup"→pickup; "crossover"→crossover
- "awd"/"4x4"/"4wd"→awd; "rwd"→rwd; "fwd"→fwd
- "new"→new; "used"→used
- Colors: "red"→red, "blue"→blue, "black"→black, "white"→white, "green"→green
- Power: "hp"/"horsepower"→powerFrom/powerTo; "200 hp"→powerFrom:200
- Country: "Estonia"/"in Estonia"→country:Estonia, "Latvia"→country:Latvia, "Lithuania"→country:Lithuania

Examples:
- "Audi" → { brand: "Audi" }
- "BMW X5" → { brand: "BMW", model: "X5" }
- "diisel automaadiga" → { fuelType: "diesel", transmission: "automatic" }
- "BMW X5 diisel automaat" → { brand: "BMW", model: "X5", fuelType: "diesel", transmission: "automatic" }
- "elektriauto kuni 25000" → { fuelType: "electric", priceTo: 25000 }
- "punane maastur" → { bodyType: "suv", color: "red" }
- "mercedes automaenne" → { brand: "Mercedes-Benz", transmission: "automatic" }
- "punane BMW Eestis 150 hj" → { brand: "BMW", color: "red", country: "Estonia", powerFrom: 150 }
- "raudona Audi 200 AG" → { brand: "Audi", color: "red", powerTo: 200 }
- "черный седан в Латвии 250 л.с." → { bodyType: "sedan", color: "black", country: "Latvia", powerFrom: 250 }

IMPORTANT: Only include fields you are confident about. Do NOT include priceFrom/priceTo/yearFrom/yearTo/powerFrom/powerTo if not explicitly mentioned (do not set them to 0). Return ONLY a valid JSON object with non-empty values.`,
    response_json_schema: {
      type: "object",
      properties: {
        brand: { type: "string" },
        model: { type: "string" },
        bodyType: { type: "string" },
        fuelType: { type: "string" },
        transmission: { type: "string" },
        driveType: { type: "string" },
        condition: { type: "string" },
        color: { type: "string" },
        powerFrom: { type: "number" },
        powerTo: { type: "number" },
        priceFrom: { type: "number" },
        priceTo: { type: "number" },
        yearFrom: { type: "number" },
        yearTo: { type: "number" },
        country: { type: "string" }
      }
    }
  });

  // Build redirect URL with query params — skip 0/empty values
  const params = new URLSearchParams();
  const extracted = result && typeof result === 'object' ? result : {};
  // Отбрасываем значения, которых в запросе не было
  const qLow = query.toLowerCase();
  const mentioned = (field: string, value: unknown) => {
    const key = String(value).toLowerCase();
    const words = SYNONYMS[field]?.[key];
    if (!words) return true;
    return words.some((word) => qLow.includes(word));
  };
  const hasDigit = /\d/.test(query);
  const numericFields = ['powerFrom', 'powerTo', 'priceFrom', 'priceTo', 'yearFrom', 'yearTo'];
  const parsed = Object.entries(extracted).filter(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 0) return false;
    if (numericFields.includes(key) && !hasDigit) return false;
    if (SYNONYMS[key]) return mentioned(key, value);
    return true;
  });
  for (const [key, value] of parsed) params.set(key, String(value));
  // Keep the raw text only when nothing structured was extracted: the original
  // words in another language (e.g. "БМВ") would filter the correct results out.
  if (parsed.length === 0) params.set('q', query.trim());

  const redirect_url = `/Catalog?${params.toString()}`;

  return Response.json({ filters: result, redirect_url });
});