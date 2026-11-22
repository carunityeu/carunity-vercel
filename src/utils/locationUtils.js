/**
 * Static location translations (countries & cities) — no i18next dependency.
 * Uses i18n.language to pick the right locale.
 *
 * City keys are the canonical English/international names (with diacritics).
 * Non-diacritic variants (e.g. "Parnu" for "Pärnu") are also included as keys
 * so that data stored without diacritics still translates correctly.
 *
 * Reverse lookup checks ALL language maps (not just ru) so that a city stored
 * in any locale form (e.g. Estonian "Tallinn", Russian "Таллин") is resolved
 * to the canonical key and then translated into the current language.
 */
import i18n from '@/lib/i18n';

// ─── Canonical city keys (English/international names) ──────────────────────
// Every city below must have an entry in EVERY language's `cities` map.
const CITY_KEYS = [
  // Estonia
  'Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Viljandi', 'Rakvere', 'Maardu',
  'Sillamäe', 'Haapsalu', 'Võru', 'Kohtla-Järve', 'Jõhvi', 'Kuressaare',
  'Paide', 'Keila', 'Põlva', 'Valga', 'Jõgeva', 'Rapla', 'Elva', 'Türi',
  'Narva-Jõesuu', 'Tapa', 'Paldiski', 'Kunda', 'Põltsamaa', 'Räpina',
  'Antsla', 'Kallaste', 'Mustvee', 'Võhma', 'Tõrva', 'Suure-Jaani',
  'Abja-Paluoja', 'Karksi-Nuia', 'Kilingi-Nõmme', 'Lihula', 'Mõisaküla',
  'Püssi', 'Kiviõli', 'Loksa', 'Tamsalu',
  // Latvia
  'Riga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala', 'Ventspils',
  'Rēzekne', 'Valmiera', 'Jēkabpils', 'Ogre', 'Tukums', 'Cēsis',
  'Salaspils', 'Kuldīga', 'Olaine', 'Dobele', 'Saldus', 'Kraslava',
  'Aizkraukle', 'Bauska', 'Gulbene', 'Limbaži', 'Līvāni', 'Ludza',
  'Madona', 'Preiļi', 'Rūjiena', 'Salacgrīva', 'Sigulda', 'Smiltene',
  'Saulkrasti', 'Viesīte', 'Balvi', 'Brocēni', 'Kandava', 'Pļaviņas',
  'Valdemārpils', 'Vangaži',
  // Lithuania
  'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus',
  'Marijampolė', 'Mažeikiai', 'Tauragė', 'Telšiai', 'Utena', 'Visaginas',
  'Plungė', 'Kretinga', 'Radviliškis', 'Druskininkai', 'Palanga',
  'Jonava', 'Kėdainiai', 'Šilutė', 'Gargždai', 'Kuršėnai',
  'Anykščiai', 'Birštonas', 'Biržai', 'Elektrėnai', 'Ignalina',
  'Jurbarkas', 'Kaišiadorys', 'Kalvarija', 'Kazlų Rūda', 'Kelmė',
  'Kybartai', 'Lentvaris', 'Naujoji Akmenė', 'Pagėgiai', 'Pakruojis',
  'Prienai', 'Raseiniai', 'Rietavas', 'Rokiškis', 'Skuodas', 'Šakiai',
  'Šilalė', 'Trakai', 'Ukmergė', 'Varėna', 'Vilkaviškis', 'Zarasai',
  // Common European (pass-through for most languages)
  'Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart',
  'Amsterdam', 'Rotterdam', 'Brussels', 'Antwerp', 'Paris', 'Lyon',
  'Marseille', 'Rome', 'Milan', 'Naples', 'Madrid', 'Barcelona',
  'Vienna', 'Prague', 'Warsaw', 'Krakow', 'Wrocław', 'Oslo', 'Bergen',
  'Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Linköping',
  'Copenhagen', 'Aarhus', 'London', 'Manchester', 'Birmingham',
  'Zurich', 'Geneva', 'Bern', 'Lisbon', 'Porto', 'Athens',
  'Thessaloniki', 'Dublin', 'Helsinki', 'Tampere', 'Turku', 'Oulu',
  'Espoo', 'Vantaa', 'Budapest', 'Bratislava', 'Ljubljana', 'Zagreb',
  'Belgrade', 'Bucharest', 'Sofia', 'Vilnius', 'Tallinn',
];

// Cities grouped by country — used by filter dropdowns.
// Keys must match the canonical English names in CITY_KEYS.
export const CITIES_BY_COUNTRY = {
  Estonia: [
    'Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Viljandi', 'Rakvere', 'Maardu',
    'Sillamäe', 'Haapsalu', 'Võru', 'Kohtla-Järve', 'Jõhvi', 'Kuressaare',
    'Paide', 'Keila', 'Põlva', 'Valga', 'Jõgeva', 'Rapla', 'Elva', 'Türi',
    'Narva-Jõesuu', 'Tapa', 'Paldiski', 'Kunda', 'Põltsamaa', 'Räpina',
    'Antsla', 'Kallaste', 'Mustvee', 'Võhma', 'Tõrva', 'Suure-Jaani',
    'Abja-Paluoja', 'Karksi-Nuia', 'Kilingi-Nõmme', 'Lihula', 'Mõisaküla',
    'Püssi', 'Kiviõli', 'Loksa', 'Tamsalu',
  ],
  Latvia: [
    'Riga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala', 'Ventspils',
    'Rēzekne', 'Valmiera', 'Jēkabpils', 'Ogre', 'Tukums', 'Cēsis',
    'Salaspils', 'Kuldīga', 'Olaine', 'Dobele', 'Saldus', 'Kraslava',
    'Aizkraukle', 'Bauska', 'Gulbene', 'Limbaži', 'Līvāni', 'Ludza',
    'Madona', 'Preiļi', 'Rūjiena', 'Salacgrīva', 'Sigulda', 'Smiltene',
    'Saulkrasti', 'Viesīte', 'Balvi', 'Brocēni', 'Kandava', 'Pļaviņas',
    'Valdemārpils', 'Vangaži',
  ],
  Lithuania: [
    'Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus',
    'Marijampolė', 'Mažeikiai', 'Tauragė', 'Telšiai', 'Utena', 'Visaginas',
    'Plungė', 'Kretinga', 'Radviliškis', 'Druskininkai', 'Palanga',
    'Jonava', 'Kėdainiai', 'Šilutė', 'Gargždai', 'Kuršėnai',
    'Anykščiai', 'Birštonas', 'Biržai', 'Elektrėnai', 'Ignalina',
    'Jurbarkas', 'Kaišiadorys', 'Kalvarija', 'Kazlų Rūda', 'Kelmė',
    'Kybartai', 'Lentvaris', 'Naujoji Akmenė', 'Pagėgiai', 'Pakruojis',
    'Prienai', 'Raseiniai', 'Rietavas', 'Rokiškis', 'Skuodas', 'Šakiai',
    'Šilalė', 'Trakai', 'Ukmergė', 'Varėna', 'Vilkaviškis', 'Zarasai',
  ],
};

// Non-diacritic aliases → canonical key.  These are checked as additional keys.
const CITY_ALIASES = {
  'Parnu': 'Pärnu', 'Liepaja': 'Liepāja', 'Jurmala': 'Jūrmala',
  'Rezekne': 'Rēzekne', 'Klaipeda': 'Klaipėda', 'Siauliai': 'Šiauliai',
  'Panevezys': 'Panevėžys', 'Marijampole': 'Marijampolė',
  'Mazeikiai': 'Mažeikiai', 'Taurage': 'Tauragė', 'Jekabpils': 'Jēkabpils',
  'Tallinnn': 'Tallinn', // common typo (double-н in Russian transliteration)
  'Таллинн': 'Tallinn',
  // Estonia — new
  'Poltsamaa': 'Põltsamaa', 'Rapina': 'Räpina', 'Vohma': 'Võhma',
  'Torva': 'Tõrva', 'Kilingi-Nomme': 'Kilingi-Nõmme', 'Moisakula': 'Mõisaküla',
  'Pussi': 'Püssi', 'Kivioli': 'Kiviõli',
  // Latvia — new
  'Limbazi': 'Limbaži', 'Livani': 'Līvāni', 'Rujiena': 'Rūjiena',
  'Salacgriva': 'Salacgrīva', 'Broceni': 'Brocēni', 'Plavinas': 'Pļaviņas',
  'Vangazi': 'Vangaži',
  // Lithuania — new
  'Anyksciai': 'Anykščiai', 'Birstonas': 'Birštonas', 'Elektenai': 'Elektrėnai',
  'Kaisiadorys': 'Kaišiadorys', 'Kelme': 'Kelmė', 'Silale': 'Šilalė',
  'Ukmerge': 'Ukmergė', 'Varena': 'Varėna', 'Vilkaviskis': 'Vilkaviškis',
  'Sakiai': 'Šakiai', 'Rokiskis': 'Rokiškis',
};

// ─── Per-language translations ─────────────────────────────────────────────
const TRANSLATIONS = {
  ru: {
    countries: {
      Estonia: 'Эстония', Latvia: 'Латвия', Lithuania: 'Литва',
      Germany: 'Германия', Finland: 'Финляндия', Sweden: 'Швеция',
      Poland: 'Польша', Russia: 'Россия', Belarus: 'Беларусь',
      Ukraine: 'Украина', Netherlands: 'Нидерланды', Belgium: 'Бельгия',
      France: 'Франция', Italy: 'Италия', Spain: 'Испания',
      Austria: 'Австрия', Switzerland: 'Швейцария', Denmark: 'Дания',
      Norway: 'Норвегия', 'Czech Republic': 'Чехия',
      'United Kingdom': 'Великобритания', UK: 'Великобритания',
      Portugal: 'Португалия', Greece: 'Греция', Ireland: 'Ирландия',
      Hungary: 'Венгрия', Slovakia: 'Словакия', Slovenia: 'Словения',
      Croatia: 'Хорватия', Serbia: 'Сербия', Romania: 'Румыния',
      Bulgaria: 'Болгария',
    },
    cities: {
      // Estonia
      Tallinn: 'Таллин', Tartu: 'Тарту', Narva: 'Нарва', Pärnu: 'Пярну',
      Viljandi: 'Вильянди', Rakvere: 'Раквере', Maardu: 'Маарду',
      Sillamäe: 'Силламяэ', Haapsalu: 'Хаапсалу', Võru: 'Выру',
      'Kohtla-Järve': 'Кохтла-Ярве', Jõhvi: 'Йыхви', Kuressaare: 'Курессааре',
      Paide: 'Пайде', Keila: 'Кейла', Põlva: 'Пылва', Valga: 'Валка',
      Jõgeva: 'Йыгева', Rapla: 'Рапла', Elva: 'Эльва', Türi: 'Тюри',
      'Narva-Jõesuu': 'Нарва-Йыэсуу', Tapa: 'Тапа', Paldiski: 'Палдиски',
      Kunda: 'Кунда', Põltsamaa: 'Пылтсамаа', Räpina: 'Ряпина',
      Antsla: 'Антсла', Kallaste: 'Калласте', Mustvee: 'Муствеэ',
      Võhma: 'Выхма', Tõrva: 'Тырва', 'Suure-Jaani': 'Сууре-Яани',
      'Abja-Paluoja': 'Абья-Палуоя', 'Karksi-Nuia': 'Каркси-Нуиа',
      'Kilingi-Nõmme': 'Килинги-Нымме', Lihula: 'Лихула',
      Mõisaküla: 'Мыйзакюла', Püssi: 'Пюсси', Kiviõli: 'Кивиыли',
      Loksa: 'Локса', Tamsalu: 'Тамсалу',
      // Latvia
      Riga: 'Рига', Daugavpils: 'Даугавпилс', Liepāja: 'Лиепая',
      Jelgava: 'Елгава', Jūrmala: 'Юрмала', Ventspils: 'Вентспилс',
      Rēzekne: 'Резекне', Valmiera: 'Валмиера', Jēkabpils: 'Екабпилс',
      Ogre: 'Огре', Tukums: 'Тукумс', Cēsis: 'Цесис',
      Salaspils: 'Саласпилс', Kuldīga: 'Кулдига', Olaine: 'Олайне',
      Dobele: 'Добеле', Saldus: 'Салдус', Kraslava: 'Краслава',
      Aizkraukle: 'Айзкраукле', Bauska: 'Бауска', Gulbene: 'Гулбене',
      Limbaži: 'Лимбажи', Līvāni: 'Ливаны', Ludza: 'Лудза',
      Madona: 'Мадона', Preiļi: 'Прейли', Rūjiena: 'Руиена',
      Salacgrīva: 'Салацгрива', Sigulda: 'Сигулда', Smiltene: 'Смилтене',
      Saulkrasti: 'Саулкрасты', Viesīte: 'Висите', Balvi: 'Балви',
      Brocēni: 'Броцены', Kandava: 'Кандава', Pļaviņas: 'Плявиняс',
      Valdemārpils: 'Вальдемарпилс', Vangaži: 'Вангажи',
      // Lithuania
      Vilnius: 'Вильнюс', Kaunas: 'Каунас', Klaipėda: 'Клайпеда',
      Šiauliai: 'Шяуляй', Panevėžys: 'Паневежис', Alytus: 'Алитус',
      Marijampolė: 'Мариямполе', Mažeikiai: 'Мажейкяй', Tauragė: 'Таураге',
      Telšiai: 'Тельшяй', Utena: 'Утена', Visaginas: 'Висагинас',
      Plungė: 'Плунге', Kretinga: 'Кретинга', Radviliškis: 'Радвилишкис',
      Druskininkai: 'Друскининкай', Palanga: 'Паланга', Jonava: 'Йонава',
      Kėdainiai: 'Кедайняй', Šilutė: 'Шилуте', Gargždai: 'Гаргждай',
      Kuršėnai: 'Куршенай', Anykščiai: 'Аникщяй', Birštonas: 'Бирштонас',
      Biržai: 'Биржай', Elektrėnai: 'Электренай', Ignalina: 'Игналина',
      Jurbarkas: 'Юрбаркас', Kaišiadorys: 'Кайшядорис', Kalvarija: 'Кальвария',
      'Kazlų Rūda': 'Казлу Руда', Kelmė: 'Кельме', Kybartai: 'Кибартай',
      Lentvaris: 'Лентварис', 'Naujoji Akmenė': 'Науйойи Акмене',
      Pagėgiai: 'Пагегяй', Pakruojis: 'Пакруойис', Prienai: 'Приенай',
      Raseiniai: 'Расейняй', Rietavas: 'Ретавас', Rokiškis: 'Рокишкис',
      Skuodas: 'Скуодас', Šakiai: 'Шакяй', Šilalė: 'Шилале',
      Trakai: 'Тракай', Ukmergė: 'Укмерге', Varėna: 'Варена',
      Vilkaviškis: 'Вилкавишкис', Zarasai: 'Зарасай',
      // European — Russian forms
      Berlin: 'Берлин', Munich: 'Мюнхен', Hamburg: 'Гамбург',
      Frankfurt: 'Франкфурт', Cologne: 'Кёльн', Stuttgart: 'Штутгарт',
      Amsterdam: 'Амстердам', Rotterdam: 'Роттердам', Brussels: 'Брюссель',
      Antwerp: 'Антверпен', Paris: 'Париж', Lyon: 'Лион',
      Marseille: 'Марсель', Rome: 'Рим', Milan: 'Милан', Naples: 'Неаполь',
      Madrid: 'Мадрид', Barcelona: 'Барселона', Vienna: 'Вена',
      Prague: 'Прага', Warsaw: 'Варшава', Krakow: 'Краков',
      Wrocław: 'Вроцлав', Oslo: 'Осло', Bergen: 'Берген',
      Stockholm: 'Стокгольм', Gothenburg: 'Гётеборг', Malmö: 'Мальмё',
      Uppsala: 'Уппсала', Linköping: 'Линчёпинг',
      Copenhagen: 'Копенгаген', Aarhus: 'Орхус', London: 'Лондон',
      Manchester: 'Манчестер', Birmingham: 'Бирмингем',
      Zurich: 'Цюрих', Geneva: 'Женева', Bern: 'Берн',
      Lisbon: 'Лиссабон', Porto: 'Порту', Athens: 'Афины',
      Thessaloniki: 'Салоники', Dublin: 'Дублин', Helsinki: 'Хельсинки',
      Tampere: 'Тампере', Turku: 'Турку', Oulu: 'Оулу', Espoo: 'Эспоо',
      Vantaa: 'Вантаа', Budapest: 'Будапешт',
      Bratislava: 'Братислава', Ljubljana: 'Любляна', Zagreb: 'Загреб',
      Belgrade: 'Белград', Bucharest: 'Бухарест', Sofia: 'София',
    },
  },
  en: {
    countries: {
      Estonia: 'Estonia', Latvia: 'Latvia', Lithuania: 'Lithuania',
      Germany: 'Germany', Finland: 'Finland', Sweden: 'Sweden',
      Poland: 'Poland', Russia: 'Russia', Belarus: 'Belarus',
      Ukraine: 'Ukraine', Netherlands: 'Netherlands', Belgium: 'Belgium',
      France: 'France', Italy: 'Italy', Spain: 'Spain',
      Austria: 'Austria', Switzerland: 'Switzerland', Denmark: 'Denmark',
      Norway: 'Norway', 'Czech Republic': 'Czech Republic',
      'United Kingdom': 'United Kingdom', UK: 'United Kingdom',
      Portugal: 'Portugal', Greece: 'Greece', Ireland: 'Ireland',
      Hungary: 'Hungary', Slovakia: 'Slovakia', Slovenia: 'Slovenia',
      Croatia: 'Croatia', Serbia: 'Serbia', Romania: 'Romania',
      Bulgaria: 'Bulgaria',
    },
    // English uses canonical keys directly — empty map, reverse lookup handles the rest
    cities: {},
  },
  et: {
    countries: {
      Estonia: 'Eesti', Latvia: 'Läti', Lithuania: 'Leedu',
      Germany: 'Saksamaa', Finland: 'Soome', Sweden: 'Rootsi',
      Poland: 'Poola', Russia: 'Venemaa', Belarus: 'Valgevene',
      Ukraine: 'Ukraina', Netherlands: 'Madalmaad', Belgium: 'Belgia',
      France: 'Prantsusmaa', Italy: 'Itaalia', Spain: 'Hispaania',
      Austria: 'Austria', Switzerland: 'Šveits', Denmark: 'Taani',
      Norway: 'Norra', 'Czech Republic': 'Tšehhi',
      'United Kingdom': 'Suurbritannia', UK: 'Suurbritannia',
      Portugal: 'Portugal', Greece: 'Kreeka', Ireland: 'Iirimaa',
      Hungary: 'Ungari', Slovakia: 'Slovakkia', Slovenia: 'Sloveenia',
      Croatia: 'Horvaatia', Serbia: 'Serbia', Romania: 'Rumeenia',
      Bulgaria: 'Bulgaaria',
    },
    cities: {
      // Estonia — native Estonian names
      Tallinn: 'Tallinn', Tartu: 'Tartu', Narva: 'Narva', Pärnu: 'Pärnu',
      Viljandi: 'Viljandi', Rakvere: 'Rakvere', Maardu: 'Maardu',
      Sillamäe: 'Sillamäe', Haapsalu: 'Haapsalu', Võru: 'Võru',
      'Kohtla-Järve': 'Kohtla-Järve', Jõhvi: 'Jõhvi', Kuressaare: 'Kuressaare',
      Paide: 'Paide', Keila: 'Keila', Põlva: 'Põlva', Valga: 'Valga',
      Jõgeva: 'Jõgeva', Rapla: 'Rapla', Elva: 'Elva', Türi: 'Türi',
      'Narva-Jõesuu': 'Narva-Jõesuu', Tapa: 'Tapa', Paldiski: 'Paldiski',
      Kunda: 'Kunda', Põltsamaa: 'Põltsamaa', Räpina: 'Räpina',
      Antsla: 'Antsla', Kallaste: 'Kallaste', Mustvee: 'Mustvee',
      Võhma: 'Võhma', Tõrva: 'Tõrva', 'Suure-Jaani': 'Suure-Jaani',
      'Abja-Paluoja': 'Abja-Paluoja', 'Karksi-Nuia': 'Karksi-Nuia',
      'Kilingi-Nõmme': 'Kilingi-Nõmme', Lihula: 'Lihula',
      Mõisaküla: 'Mõisaküla', Püssi: 'Püssi', Kiviõli: 'Kiviõli',
      Loksa: 'Loksa', Tamsalu: 'Tamsalu',
      // Latvia
      Riga: 'Riia', Daugavpils: 'Daugavpils', Liepāja: 'Liepāja',
      Jelgava: 'Jelgava', Jūrmala: 'Jūrmala', Ventspils: 'Ventspils',
      Rēzekne: 'Rēzekne', Valmiera: 'Valmiera', Jēkabpils: 'Jēkabpils',
      Ogre: 'Ogre', Tukums: 'Tukums', Cēsis: 'Cēsis',
      Salaspils: 'Salaspils', Kuldīga: 'Kuldīga', Olaine: 'Olaine',
      Dobele: 'Dobele', Saldus: 'Saldus', Kraslava: 'Kraslava',
      Aizkraukle: 'Aizkraukle', Bauska: 'Bauska', Gulbene: 'Gulbene',
      Limbaži: 'Limbaži', Līvāni: 'Līvāni', Ludza: 'Ludza',
      Madona: 'Madona', Preiļi: 'Preiļi', Rūjiena: 'Rūjiena',
      Salacgrīva: 'Salacgrīva', Sigulda: 'Sigulda', Smiltene: 'Smiltene',
      Saulkrasti: 'Saulkrasti', Viesīte: 'Viesīte', Balvi: 'Balvi',
      Brocēni: 'Brocēni', Kandava: 'Kandava', Pļaviņas: 'Pļaviņas',
      Valdemārpils: 'Valdemārpils', Vangaži: 'Vangaži',
      // Lithuania
      Vilnius: 'Vilnius', Kaunas: 'Kaunas', Klaipėda: 'Klaipėda',
      Šiauliai: 'Šiauliai', Panevėžys: 'Panevėžys', Alytus: 'Alytus',
      Marijampolė: 'Marijampolė', Mažeikiai: 'Mažeikiai', Tauragė: 'Tauragė',
      Telšiai: 'Telšiai', Utena: 'Utena', Visaginas: 'Visaginas',
      Plungė: 'Plungė', Kretinga: 'Kretinga', Radviliškis: 'Radviliškis',
      Druskininkai: 'Druskininkai', Palanga: 'Palanga', Jonava: 'Jonava',
      Kėdainiai: 'Kėdainiai', Šilutė: 'Šilutė', Gargždai: 'Gargždai',
      Kuršėnai: 'Kuršėnai', Anykščiai: 'Anykščiai', Birštonas: 'Birštonas',
      Biržai: 'Biržai', Elektrėnai: 'Elektrėnai', Ignalina: 'Ignalina',
      Jurbarkas: 'Jurbarkas', Kaišiadorys: 'Kaišiadorys', Kalvarija: 'Kalvarija',
      'Kazlų Rūda': 'Kazlų Rūda', Kelmė: 'Kelmė', Kybartai: 'Kybartai',
      Lentvaris: 'Lentvaris', 'Naujoji Akmenė': 'Naujoji Akmenė',
      Pagėgiai: 'Pagėgiai', Pakruojis: 'Pakruojis', Prienai: 'Prienai',
      Raseiniai: 'Raseiniai', Rietavas: 'Rietavas', Rokiškis: 'Rokiškis',
      Skuodas: 'Skuodas', Šakiai: 'Šakiai', Šilalė: 'Šilalė',
      Trakai: 'Trakai', Ukmergė: 'Ukmergė', Varėna: 'Varėna',
      Vilkaviškis: 'Vilkaviškis', Zarasai: 'Zarasai',
      // European — Estonian forms
      Berlin: 'Berliin', Munich: 'München', Hamburg: 'Hamburg',
      Frankfurt: 'Frankfurt', Cologne: 'Köln', Stuttgart: 'Stuttgart',
      Amsterdam: 'Amsterdam', Rotterdam: 'Rotterdam', Brussels: 'Brüssel',
      Antwerp: 'Antwerpen', Paris: 'Pariis', Lyon: 'Lyon',
      Marseille: 'Marseille', Rome: 'Rooma', Milan: 'Milano',
      Naples: 'Napoli', Madrid: 'Madrid', Barcelona: 'Barcelona',
      Vienna: 'Viin', Prague: 'Praha', Warsaw: 'Varssavi', Krakow: 'Krakow',
      Wrocław: 'Wrocław', Oslo: 'Oslo', Bergen: 'Bergen',
      Stockholm: 'Stockholm', Gothenburg: 'Göteborg', Malmö: 'Malmö',
      Uppsala: 'Uppsala', Linköping: 'Linköping',
      Copenhagen: 'Kopenhaagen', Aarhus: 'Aarhus', London: 'London',
      Manchester: 'Manchester', Birmingham: 'Birmingham',
      Zurich: 'Zürich', Geneva: 'Genf', Bern: 'Bern',
      Lisbon: 'Lissabon', Porto: 'Porto', Athens: 'Ateena',
      Thessaloniki: 'Thessaloníki', Dublin: 'Dublin', Helsinki: 'Helsingi',
      Tampere: 'Tampere', Turku: 'Turku', Oulu: 'Oulu', Espoo: 'Espoo',
      Vantaa: 'Vantaa', Budapest: 'Budapest',
      Bratislava: 'Bratislava', Ljubljana: 'Ljubljana', Zagreb: 'Zagreb',
      Belgrade: 'Belgrad', Bucharest: 'Bukarest', Sofia: 'Sofia',
    },
  },
  lv: {
    countries: {
      Estonia: 'Igaunija', Latvia: 'Latvija', Lithuania: 'Lietuva',
      Germany: 'Vācija', Finland: 'Somija', Sweden: 'Zviedrija',
      Poland: 'Polija', Russia: 'Krievija', Belarus: 'Baltkrievija',
      Ukraine: 'Ukraina', Netherlands: 'Nīderlande', Belgium: 'Beļģija',
      France: 'Francija', Italy: 'Itālija', Spain: 'Spānija',
      Austria: 'Austrija', Switzerland: 'Šveice', Denmark: 'Dānija',
      Norway: 'Norvēģija', 'Czech Republic': 'Čehija',
      'United Kingdom': 'Lielbritānija', UK: 'Lielbritānija',
      Portugal: 'Portugāle', Greece: 'Grieķija', Ireland: 'Īrija',
      Hungary: 'Ungārija', Slovakia: 'Slovākija', Slovenia: 'Slovēnija',
      Croatia: 'Horvātija', Serbia: 'Serbija', Romania: 'Rumānija',
      Bulgaria: 'Bulgārija',
    },
    cities: {
      // Estonia
      Tallinn: 'Tallina', Tartu: 'Tartu', Narva: 'Narva', Pärnu: 'Pērnava',
      Viljandi: 'Viljandi', Rakvere: 'Rākvere', Maardu: 'Mārdu',
      Sillamäe: 'Sillame', Haapsalu: 'Hāpsalu', Võru: 'Veru',
      'Kohtla-Järve': 'Kohtla-Jerve', Jõhvi: 'Jehvi', Kuressaare: 'Kuresāre',
      Paide: 'Paide', Keila: 'Keila', Põlva: 'Pēlva', Valga: 'Valka',
      Jõgeva: 'Jogeva', Rapla: 'Rapla', Elva: 'Elva', Türi: 'Tiri',
      'Narva-Jõesuu': 'Narva-Joesuu', Tapa: 'Tapa', Paldiski: 'Paldiski',
      Kunda: 'Kunda', Põltsamaa: 'Pēltsamaa', Räpina: 'Rāpina',
      Antsla: 'Antsla', Kallaste: 'Kallaste', Mustvee: 'Mustvee',
      Võhma: 'Vēhma', Tõrva: 'Tērva', 'Suure-Jaani': 'Suure-Jani',
      'Abja-Paluoja': 'Abja-Paluoja', 'Karksi-Nuia': 'Karksi-Nuia',
      'Kilingi-Nõmme': 'Kilingi-Nemme', Lihula: 'Lihula',
      Mõisaküla: 'Mēisakiula', Püssi: 'Pēsi', Kiviõli: 'Kivioli',
      Loksa: 'Loksa', Tamsalu: 'Tamsalu',
      // Latvia — native Latvian names
      Riga: 'Rīga', Daugavpils: 'Daugavpils', Liepāja: 'Liepāja',
      Jelgava: 'Jelgava', Jūrmala: 'Jūrmala', Ventspils: 'Ventspils',
      Rēzekne: 'Rēzekne', Valmiera: 'Valmiera', Jēkabpils: 'Jēkabpils',
      Ogre: 'Ogre', Tukums: 'Tukums', Cēsis: 'Cēsis',
      Salaspils: 'Salaspils', Kuldīga: 'Kuldīga', Olaine: 'Olaine',
      Dobele: 'Dobele', Saldus: 'Saldus', Kraslava: 'Krāslava',
      Aizkraukle: 'Aizkraukle', Bauska: 'Bauska', Gulbene: 'Gulbene',
      Limbaži: 'Limbaži', Līvāni: 'Līvāni', Ludza: 'Ludza',
      Madona: 'Madona', Preiļi: 'Preiļi', Rūjiena: 'Rūjiena',
      Salacgrīva: 'Salacgrīva', Sigulda: 'Sigulda', Smiltene: 'Smiltene',
      Saulkrasti: 'Saulkrasti', Viesīte: 'Viesīte', Balvi: 'Balvi',
      Brocēni: 'Brocēni', Kandava: 'Kandava', Pļaviņas: 'Pļaviņas',
      Valdemārpils: 'Valdemārpils', Vangaži: 'Vangaži',
      // Lithuania
      Vilnius: 'Viļņa', Kaunas: 'Kauņa', Klaipėda: 'Klaipēda',
      Šiauliai: 'Šauļi', Panevėžys: 'Panevēža', Alytus: 'Alītus',
      Marijampolė: 'Marijampole', Mažeikiai: 'Mažeiķi', Tauragė: 'Tauraģe',
      Telšiai: 'Telši', Utena: 'Uteņa', Visaginas: 'Visagina',
      Plungė: 'Pluņģi', Kretinga: 'Kretinga', Radviliškis: 'Radviļķi',
      Druskininkai: 'Druskininki', Palanga: 'Palanga', Jonava: 'Jonava',
      Kėdainiai: 'Kēdaiņi', Šilutė: 'Šilute', Gargždai: 'Gargždi',
      Kuršėnai: 'Kuršēni', Anykščiai: 'Anikščiai', Birštonas: 'Birštonas',
      Biržai: 'Biržai', Elektrėnai: 'Elektrēnai', Ignalina: 'Ignalina',
      Jurbarkas: 'Jurbarkas', Kaišiadorys: 'Kaišiadorys', Kalvarija: 'Kalvarija',
      'Kazlų Rūda': 'Kazlu Rūda', Kelmė: 'Kelme', Kybartai: 'Kybartai',
      Lentvaris: 'Lentvaris', 'Naujoji Akmenė': 'Naujoji Akmene',
      Pagėgiai: 'Pagēgiai', Pakruojis: 'Pakruojis', Prienai: 'Prienai',
      Raseiniai: 'Raseiniai', Rietavas: 'Rietavas', Rokiškis: 'Rokiškis',
      Skuodas: 'Skuodas', Šakiai: 'Šakiai', Šilalė: 'Šilale',
      Trakai: 'Trakai', Ukmergė: 'Ukmerge', Varėna: 'Varēna',
      Vilkaviškis: 'Vilkaviškis', Zarasai: 'Zarasai',
      // European — Latvian forms
      Berlin: 'Berlīne', Munich: 'Minhene', Hamburg: 'Hamburga',
      Frankfurt: 'Frankfurte', Cologne: 'Ķelne', Stuttgart: 'Štutgarte',
      Amsterdam: 'Amsterdama', Rotterdam: 'Roterdama', Brussels: 'Brisele',
      Antwerp: 'Antverpene', Paris: 'Parīze', Lyon: 'Liona',
      Marseille: 'Marseļa', Rome: 'Roma', Milan: 'Milāna',
      Naples: 'Neapole', Madrid: 'Madride', Barcelona: 'Barselona',
      Vienna: 'Vīne', Prague: 'Prāga', Warsaw: 'Varšava', Krakow: 'Krakova',
      Wrocław: 'Vroclava', Oslo: 'Oslo', Bergen: 'Bergena',
      Stockholm: 'Stokholma', Gothenburg: 'Gēteborga', Malmö: 'Malme',
      Uppsala: 'Upsala', Linköping: 'Linšēpinga',
      Copenhagen: 'Kopenhāgena', Aarhus: 'Orhusa', London: 'Londona',
      Manchester: 'Mančestra', Birmingham: 'Birmingema',
      Zurich: 'Cīrihe', Geneva: 'Ženēva', Bern: 'Berne',
      Lisbon: 'Lisabona', Porto: 'Porto', Athens: 'Atēnas',
      Thessaloniki: 'Saloniki', Dublin: 'Dublina', Helsinki: 'Helsinki',
      Tampere: 'Tampere', Turku: 'Turku', Oulu: 'Oulu', Espoo: 'Espo',
      Vantaa: 'Vanta', Budapest: 'Budapešta',
      Bratislava: 'Bratislava', Ljubljana: 'Ļubļana', Zagreb: 'Zagreba',
      Belgrade: 'Belgrada', Bucharest: 'Bukareste', Sofia: 'Sofija',
    },
  },
  lt: {
    countries: {
      Estonia: 'Estija', Latvia: 'Latvija', Lithuania: 'Lietuva',
      Germany: 'Vokietija', Finland: 'Suomija', Sweden: 'Švedija',
      Poland: 'Lenkija', Russia: 'Rusija', Belarus: 'Baltarusija',
      Ukraine: 'Ukraina', Netherlands: 'Nyderlandai', Belgium: 'Belgija',
      France: 'Prancūzija', Italy: 'Italija', Spain: 'Ispanija',
      Austria: 'Austrija', Switzerland: 'Šveicarija', Denmark: 'Danija',
      Norway: 'Norvegija', 'Czech Republic': 'Čekija',
      'United Kingdom': 'Jungtinė Karalystė', UK: 'Jungtinė Karalystė',
      Portugal: 'Portugalija', Greece: 'Graikija', Ireland: 'Airija',
      Hungary: 'Vengrija', Slovakia: 'Slovakija', Slovenia: 'Slovėnija',
      Croatia: 'Kroatija', Serbia: 'Serbija', Romania: 'Rumunija',
      Bulgaria: 'Bulgarija',
    },
    cities: {
      // Estonia
      Tallinn: 'Talinas', Tartu: 'Tartu', Narva: 'Narva', Pärnu: 'Piarnu',
      Viljandi: 'Viljandis', Rakvere: 'Rakverė', Maardu: 'Maardu',
      Sillamäe: 'Sillamė', Haapsalu: 'Haapsalu', Võru: 'Veru',
      'Kohtla-Järve': 'Kohtla-Jervė', Jõhvi: 'Jehvis', Kuressaare: 'Kuresarė',
      Paide: 'Paide', Keila: 'Keila', Põlva: 'Pelva', Valga: 'Valka',
      Jõgeva: 'Jogeva', Rapla: 'Rapla', Elva: 'Elva', Türi: 'Tiri',
      'Narva-Jõesuu': 'Narva-Joesu', Tapa: 'Tapa', Paldiski: 'Paldiskis',
      Kunda: 'Kunda', Põltsamaa: 'Põltsamaa', Räpina: 'Rapina',
      Antsla: 'Antsla', Kallaste: 'Kallaste', Mustvee: 'Mustvee',
      Võhma: 'Vohma', Tõrva: 'Tirva', 'Suure-Jaani': 'Suure-Jani',
      'Abja-Paluoja': 'Abja-Paluoja', 'Karksi-Nuia': 'Karksi-Nuia',
      'Kilingi-Nõmme': 'Kilingi-Nume', Lihula: 'Lihula',
      Mõisaküla: 'Moisakula', Püssi: 'Piusi', Kiviõli: 'Kiviolis',
      Loksa: 'Loksa', Tamsalu: 'Tamsalu',
      // Latvia
      Riga: 'Ryga', Daugavpils: 'Daugpilis', Liepāja: 'Liepoja',
      Jelgava: 'Jelgava', Jūrmala: 'Jurmala', Ventspils: 'Ventspilis',
      Rēzekne: 'Rėzeknė', Valmiera: 'Valmiera', Jēkabpils: 'Jekabpilis',
      Ogre: 'Ogrė', Tukums: 'Tukumas', Cēsis: 'Cesis',
      Salaspils: 'Salaspilis', Kuldīga: 'Kuldiga', Olaine: 'Olainė',
      Dobele: 'Dobelė', Saldus: 'Saldus', Kraslava: 'Kraslava',
      Aizkraukle: 'Aizkrauklė', Bauska: 'Bauska', Gulbene: 'Gulbenė',
      Limbaži: 'Limbažiai', Līvāni: 'Lyvanai', Ludza: 'Ludza',
      Madona: 'Madona', Preiļi: 'Preiliai', Rūjiena: 'Ruiana',
      Salacgrīva: 'Salacgriva', Sigulda: 'Sigulda', Smiltene: 'Smiltene',
      Saulkrasti: 'Saulkrastai', Viesīte: 'Viesite', Balvi: 'Balvi',
      Brocēni: 'Brocenai', Kandava: 'Kandava', Pļaviņas: 'Pliavinios',
      Valdemārpils: 'Valdemarpilsas', Vangaži: 'Vangažiai',
      // Lithuania — native Lithuanian names
      Vilnius: 'Vilnius', Kaunas: 'Kaunas', Klaipėda: 'Klaipėda',
      Šiauliai: 'Šiauliai', Panevėžys: 'Panevėžys', Alytus: 'Alytus',
      Marijampolė: 'Marijampolė', Mažeikiai: 'Mažeikiai', Tauragė: 'Tauragė',
      Telšiai: 'Telšiai', Utena: 'Utena', Visaginas: 'Visaginas',
      Plungė: 'Plungė', Kretinga: 'Kretinga', Radviliškis: 'Radviliškis',
      Druskininkai: 'Druskininkai', Palanga: 'Palanga', Jonava: 'Jonava',
      Kėdainiai: 'Kėdainiai', Šilutė: 'Šilutė', Gargždai: 'Gargždai',
      Kuršėnai: 'Kuršėnai', Anykščiai: 'Anykščiai', Birštonas: 'Birštonas',
      Biržai: 'Biržai', Elektrėnai: 'Elektrėnai', Ignalina: 'Ignalina',
      Jurbarkas: 'Jurbarkas', Kaišiadorys: 'Kaišiadorys', Kalvarija: 'Kalvarija',
      'Kazlų Rūda': 'Kazlų Rūda', Kelmė: 'Kelmė', Kybartai: 'Kybartai',
      Lentvaris: 'Lentvaris', 'Naujoji Akmenė': 'Naujoji Akmenė',
      Pagėgiai: 'Pagėgiai', Pakruojis: 'Pakruojis', Prienai: 'Prienai',
      Raseiniai: 'Raseiniai', Rietavas: 'Rietavas', Rokiškis: 'Rokiškis',
      Skuodas: 'Skuodas', Šakiai: 'Šakiai', Šilalė: 'Šilalė',
      Trakai: 'Trakai', Ukmergė: 'Ukmergė', Varėna: 'Varėna',
      Vilkaviškis: 'Vilkaviškis', Zarasai: 'Zarasai',
      // European — Lithuanian forms
      Berlin: 'Berlynas', Munich: 'Miunchenas', Hamburg: 'Hamburgas',
      Frankfurt: 'Frankfurtas', Cologne: 'Kelnas', Stuttgart: 'Štutgartas',
      Amsterdam: 'Amsterdamas', Rotterdam: 'Roterdamas',
      Brussels: 'Briuselis', Antwerp: 'Antverpenas', Paris: 'Paryžius',
      Lyon: 'Liona', Marseille: 'Marselis', Rome: 'Roma', Milan: 'Milanas',
      Naples: 'Neapolis', Madrid: 'Madridas', Barcelona: 'Barselona',
      Vienna: 'Viena', Prague: 'Praha', Warsaw: 'Varšuva',
      Krakow: 'Krokuva', Wrocław: 'Vroclavas', Oslo: 'Oslas',
      Bergen: 'Bergenas', Stockholm: 'Stokholmas', Gothenburg: 'Geteborgas', Malmö: 'Malmė',
      Uppsala: 'Upsala', Linköping: 'Linšėpingas',
      Copenhagen: 'Kopenhaga', Aarhus: 'Orhusas', London: 'Londonas',
      Manchester: 'Mančesteris', Birmingham: 'Birmingamas',
      Zurich: 'Ciurichas', Geneva: 'Ženeva', Bern: 'Bernas',
      Lisbon: 'Lisabona', Porto: 'Portas', Athens: 'Atėnai',
      Thessaloniki: 'Salonikai', Dublin: 'Dublinas', Helsinki: 'Helsinkis',
      Tampere: 'Tamerė', Turku: 'Turku', Oulu: 'Oulu', Espoo: 'Espas',
      Vantaa: 'Vanta', Budapest: 'Budapeštas',
      Bratislava: 'Bratislava', Ljubljana: 'Liubliana', Zagreb: 'Zagrebas',
      Belgrade: 'Belgradas', Bucharest: 'Bukareštas', Sofia: 'Sofija',
    },
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function getLang() {
  const lng = i18n.language || 'ru';
  return lng.split('-')[0]; // 'en-US' → 'en'
}

/**
 * Build a reverse-lookup index: for every canonical key, map every locale's
 * translated value back to the canonical key.  This lets us resolve a city
 * stored in ANY language form (ru, et, lv, lt) to the canonical key.
 */
const REVERSE_CITY_INDEX = (() => {
  const idx = {};
  for (const [enKey, aliasKey] of Object.entries(CITY_ALIASES)) {
    idx[aliasKey.toLowerCase()] = enKey;
  }
  for (const lang of Object.keys(TRANSLATIONS)) {
    const cities = TRANSLATIONS[lang]?.cities || {};
    for (const [enKey, translated] of Object.entries(cities)) {
      idx[translated.toLowerCase()] = enKey;
    }
    // Also index the canonical key itself (so "Tallinn" → "Tallinn")
  }
  for (const enKey of CITY_KEYS) {
    idx[enKey.toLowerCase()] = enKey;
  }
  return idx;
})();

export function getLocationSearchVariants(value, kind = 'cities', partial = false) {
  const normalize = text => String(text).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const needle = normalize(value);
  if (!needle) return [];
  const codes = { Estonia: 'EE', Latvia: 'LV', Lithuania: 'LT' };
  const keys = kind === 'cities' ? CITY_KEYS : Object.keys(TRANSLATIONS.en.countries);
  const result = new Set([String(value).trim()]);
  for (const key of keys) {
    const names = new Set([key, ...Object.values(TRANSLATIONS).map(lang => lang[kind]?.[key]).filter(Boolean)]);
    if (kind === 'cities') Object.entries(CITY_ALIASES).forEach(([alias, canonical]) => { if (canonical === key) names.add(alias); });
    if (kind === 'countries' && codes[key]) names.add(codes[key]);
    if ([...names].some(name => partial ? normalize(name).includes(needle) : normalize(name) === needle)) names.forEach(name => result.add(name));
  }
  return [...result];
}

export function translateCountry(_t, country) {
  if (!country) return '';
  const lang = getLang();
  const map = TRANSLATIONS[lang]?.countries || TRANSLATIONS.ru.countries;
  if (map[country]) return map[country];
  // Reverse lookup across all locales
  for (const l of Object.keys(TRANSLATIONS)) {
    const countries = TRANSLATIONS[l]?.countries || {};
    const entry = Object.entries(countries).find(([, v]) => v === country);
    if (entry) return map[entry[0]] || entry[0];
  }
  return country;
}

export function translateCity(_t, city) {
  if (!city) return city || '';
  const lang = getLang();
  const map = TRANSLATIONS[lang]?.cities || {};

  // 1. Direct match (canonical key or alias)
  if (map[city]) return map[city];
  // For English, canonical keys ARE the translation
  if (lang === 'en' && CITY_KEYS.includes(city)) return city;

  // 2. Alias match (non-diacritic → canonical)
  const aliasKey = CITY_ALIASES[city];
  if (aliasKey) {
    if (lang === 'en') return aliasKey;
    if (map[aliasKey]) return map[aliasKey];
  }

  // 3. Case-insensitive direct match
  const lowerCity = city.toLowerCase();
  for (const key of Object.keys(map)) {
    if (key.toLowerCase() === lowerCity) return map[key];
  }
  if (lang === 'en') {
    for (const key of CITY_KEYS) {
      if (key.toLowerCase() === lowerCity) return key;
    }
  }

  // 4. Reverse lookup: city might be stored in another locale's form
  const canonicalKey = REVERSE_CITY_INDEX[lowerCity];
  if (canonicalKey) {
    if (lang === 'en') return canonicalKey;
    if (map[canonicalKey]) return map[canonicalKey];
    return canonicalKey;
  }

  return city;
}

export function translateLocation(_t, location, country) {
  const loc = translateCity(null, location) || location || '';
  const cnt = translateCountry(null, country) || country || '';
  if (loc && cnt) return `${loc}, ${cnt}`;
  return loc || cnt;
}

// ─── Role translations (unchanged) ─────────────────────────────────────────
const ROLE_TRANSLATIONS = {
  ru: {
    'Manager': 'Менеджер', 'Sales': 'Продавец-консультант', 'Consultant': 'Консультант',
    'Director': 'Директор', 'Owner': 'Владелец', 'CEO': 'Генеральный директор',
    'Менеджер': 'Менеджер', 'Продавец': 'Продавец-консультант', 'Консультант': 'Консультант',
    'Директор': 'Директор', 'Владелец': 'Владелец', 'Генеральный директор': 'Генеральный директор',
    'Продавец-консультант': 'Продавец-консультант',
  },
  en: {
    'Manager': 'Manager', 'Sales': 'Sales Consultant', 'Consultant': 'Consultant',
    'Director': 'Director', 'Owner': 'Owner', 'CEO': 'CEO',
    'Менеджер': 'Manager', 'Продавец': 'Sales Consultant', 'Консультант': 'Consultant',
    'Директор': 'Director', 'Владелец': 'Owner', 'Генеральный директор': 'CEO',
    'Продавец-консультант': 'Sales Consultant', 'Продавец': 'Sales Consultant',
  },
  et: {
    'Manager': 'Müügikonsultant', 'Sales': 'Müügikonsultant', 'Consultant': 'Konsultant',
    'Director': 'Direktor', 'Owner': 'Omanik', 'CEO': 'Tegevjuht',
    'Менеджер': 'Müügikonsultant', 'Продавец': 'Müügikonsultant', 'Консультант': 'Konsultant',
    'Директор': 'Direktor', 'Владелец': 'Omanik', 'Генеральный директор': 'Tegevjuht',
    'Продавец-консультант': 'Müügikonsultant',
  },
  lv: {
    'Manager': 'Pārdošanas konsultants', 'Sales': 'Pārdošanas konsultants', 'Consultant': 'Konsultants',
    'Director': 'Direktors', 'Owner': 'Īpašnieks', 'CEO': 'Valdes priekšsēdētājs',
    'Менеджер': 'Pārdošanas konsultants', 'Продавец': 'Pārdošanas konsultants', 'Консультант': 'Konsultants',
    'Директор': 'Direktors', 'Владелец': 'Īpašnieks', 'Генеральный директор': 'Valdes priekšsēdētājs',
    'Продавец-консультант': 'Pārdošanas konsultants',
  },
  lt: {
    'Manager': 'Pardavimų konsultantas', 'Sales': 'Pardavimų konsultantas', 'Consultant': 'Konsultantas',
    'Director': 'Direktorius', 'Owner': 'Savininkas', 'CEO': 'Generalinis direktorius',
    'Менеджер': 'Pardavimų konsultantas', 'Продавец': 'Pardavimų konsultantas', 'Консультант': 'Konsultantas',
    'Директор': 'Direktorius', 'Владелец': 'Savininkas', 'Генеральный директор': 'Generalinis direktorius',
    'Продавец-консультант': 'Pardavimų konsultantas',
  },
};

export function translateRole(_t, role) {
  if (!role) return role || '';
  const lang = getLang();
  const map = ROLE_TRANSLATIONS[lang] || ROLE_TRANSLATIONS.ru;
  return map[role] || role;
}

export function translateAddressText(_t, address) {
  if (!address) return address || '';
  const lang = getLang();
  const currentMap = TRANSLATIONS[lang]?.cities || {};

  const allCityKeys = new Set([
    ...CITY_KEYS,
    ...Object.keys(CITY_ALIASES),
    ...Object.keys(TRANSLATIONS.ru?.cities || {}),
    ...Object.keys(TRANSLATIONS.et?.cities || {}),
    ...Object.keys(TRANSLATIONS.lv?.cities || {}),
    ...Object.keys(TRANSLATIONS.lt?.cities || {}),
  ]);

  const replacements = {};
  allCityKeys.forEach(enKey => {
    const translated = currentMap[enKey] || (lang === 'en' ? enKey : null);
    if (!translated) return;
    const ruForm = TRANSLATIONS.ru?.cities?.[enKey];
    if (enKey !== translated) replacements[enKey] = translated;
    if (ruForm && ruForm !== enKey && ruForm !== translated) replacements[ruForm] = translated;
  });

  let result = address;
  const sortedVariants = Object.keys(replacements).sort((a, b) => b.length - a.length);
  for (const variant of sortedVariants) {
    const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'g');
    result = result.replace(regex, replacements[variant]);
  }
  return result;
}