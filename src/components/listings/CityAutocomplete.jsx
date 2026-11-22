import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

// Cities by country with translations: { name (canonical), ru, et, lv, lt }
const CITIES_BY_COUNTRY = {
  Latvia: [
    { name: 'Riga', ru: 'Рига', et: 'Riia', lv: 'Rīga', lt: 'Ryga' },
    { name: 'Daugavpils', ru: 'Даугавпилс', et: 'Daugavpils', lv: 'Daugavpils', lt: 'Daugpilis' },
    { name: 'Liepāja', ru: 'Лиепая', et: 'Liepāja', lv: 'Liepāja', lt: 'Liepora' },
    { name: 'Jelgava', ru: 'Елгава', et: 'Jelgava', lv: 'Jelgava', lt: 'Jelgava' },
    { name: 'Jūrmala', ru: 'Юрмала', et: 'Jūrmala', lv: 'Jūrmala', lt: 'Jūrmala' },
    { name: 'Jēkabpils', ru: 'Екабпилс', et: 'Jēkabpils', lv: 'Jēkabpils', lt: 'Jēkabpils' },
    { name: 'Jaunjelgava', ru: 'Яунелгава', et: 'Jaunjelgava', lv: 'Jaunjelgava', lt: 'Jaunjelgava' },
    { name: 'Rēzekne', ru: 'Резекне', et: 'Rēzekne', lv: 'Rēzekne', lt: 'Rėzeknė' },
    { name: 'Valmiera', ru: 'Валмиера', et: 'Valmiera', lv: 'Valmiera', lt: 'Valmiera' },
    { name: 'Ventspils', ru: 'Вентспилс', et: 'Ventspils', lv: 'Ventspils', lt: 'Ventspilis' },
    { name: 'Ogre', ru: 'Огре', et: 'Ogre', lv: 'Ogre', lt: 'Ogrė' },
    { name: 'Tukums', ru: 'Тукумс', et: 'Tukums', lv: 'Tukums', lt: 'Tukumas' },
    { name: 'Cēsis', ru: 'Цесис', et: 'Võnnu', lv: 'Cēsis', lt: 'Cēsis' },
    { name: 'Sigulda', ru: 'Сигулда', et: 'Sigulda', lv: 'Sigulda', lt: 'Sigulda' },
    { name: 'Salaspils', ru: 'Саласпилс', et: 'Salaspils', lv: 'Salaspils', lt: 'Salaspilis' },
    { name: 'Dobele', ru: 'Добеле', et: 'Dobele', lv: 'Dobele', lt: 'Dobelė' },
    { name: 'Kuldīga', ru: 'Кулдига', et: 'Kuldīga', lv: 'Kuldīga', lt: 'Kuldyga' },
    { name: 'Saldus', ru: 'Салдус', et: 'Saldus', lv: 'Saldus', lt: 'Saldus' },
    { name: 'Talsi', ru: 'Талси', et: 'Talsi', lv: 'Talsi', lt: 'Talsi' },
    { name: 'Bauska', ru: 'Бауска', et: 'Bauska', lv: 'Bauska', lt: 'Bauska' },
    { name: 'Limbaži', ru: 'Лимбажи', et: 'Limbaži', lv: 'Limbaži', lt: 'Limbaži' },
    { name: 'Ludza', ru: 'Лудза', et: 'Ludza', lv: 'Ludza', lt: 'Ludza' },
    { name: 'Madona', ru: 'Мадона', et: 'Madona', lv: 'Madona', lt: 'Madona' },
    { name: 'Preiļi', ru: 'Прейли', et: 'Preiļi', lv: 'Preiļi', lt: 'Preiļi' },
    { name: 'Balvi', ru: 'Балви', et: 'Balvi', lv: 'Balvi', lt: 'Balvi' },
    { name: 'Gulbene', ru: 'Гулбене', et: 'Gulbene', lv: 'Gulbene', lt: 'Gulbenė' },
    { name: 'Alūksne', ru: 'Алуксне', et: 'Alūksne', lv: 'Alūksne', lt: 'Alūksne' },
    { name: 'Smiltene', ru: 'Смилтене', et: 'Smiltene', lv: 'Smiltene', lt: 'Smiltene' },
    { name: 'Valka', ru: 'Валка', et: 'Valga', lv: 'Valka', lt: 'Valka' },
    { name: 'Krāslava', ru: 'Краслава', et: 'Krāslava', lv: 'Krāslava', lt: 'Krāslava' },
  ],
  Lithuania: [
    { name: 'Vilnius', ru: 'Вильнюс', et: 'Vilnius', lv: 'Viļņa', lt: 'Vilnius' },
    { name: 'Kaunas', ru: 'Каунас', et: 'Kaunas', lv: 'Kauņa', lt: 'Kaunas' },
    { name: 'Klaipėda', ru: 'Клайпеда', et: 'Klaipėda', lv: 'Klaipēda', lt: 'Klaipėda' },
    { name: 'Šiauliai', ru: 'Шяуляй', et: 'Šiauliai', lv: 'Šauļi', lt: 'Šiauliai' },
    { name: 'Panevėžys', ru: 'Паневежис', et: 'Panevėžys', lv: 'Panevežis', lt: 'Panevėžys' },
    { name: 'Alytus', ru: 'Алитус', et: 'Alytus', lv: 'Alitus', lt: 'Alytus' },
    { name: 'Marijampolė', ru: 'Мариямполе', et: 'Marijampolė', lv: 'Marijampolė', lt: 'Marijampolė' },
    { name: 'Mažeikiai', ru: 'Мажейкяй', et: 'Mažeikiai', lv: 'Mažeikiai', lt: 'Mažeikiai' },
    { name: 'Jonava', ru: 'Йонава', et: 'Jonava', lv: 'Jonava', lt: 'Jonava' },
    { name: 'Utena', ru: 'Утена', et: 'Utena', lv: 'Utena', lt: 'Utena' },
    { name: 'Kėdainiai', ru: 'Кедайняй', et: 'Kėdainiai', lv: 'Kėdainiai', lt: 'Kėdainiai' },
    { name: 'Telšiai', ru: 'Тельшяй', et: 'Telšiai', lv: 'Telšiai', lt: 'Telšiai' },
    { name: 'Visaginas', ru: 'Висагинас', et: 'Visaginas', lv: 'Visaginass', lt: 'Visaginas' },
    { name: 'Tauragė', ru: 'Таураге', et: 'Tauragė', lv: 'Tauragė', lt: 'Tauragė' },
    { name: 'Ukmergė', ru: 'Укмерге', et: 'Ukmergė', lv: 'Ukmergė', lt: 'Ukmergė' },
    { name: 'Plungė', ru: 'Плунге', et: 'Plungė', lv: 'Plungė', lt: 'Plungė' },
    { name: 'Kretinga', ru: 'Кретинга', et: 'Kretinga', lv: 'Kretinga', lt: 'Kretinga' },
    { name: 'Palanga', ru: 'Паланга', et: 'Palanga', lv: 'Palanga', lt: 'Palanga' },
    { name: 'Šilutė', ru: 'Шилуте', et: 'Šilutė', lv: 'Šilutė', lt: 'Šilutė' },
    { name: 'Radviliškis', ru: 'Радвилишкис', et: 'Radviliškis', lv: 'Radviliškis', lt: 'Radviliškis' },
    { name: 'Druskininkai', ru: 'Друскининкай', et: 'Druskininkai', lv: 'Druskininkai', lt: 'Druskininkai' },
    { name: 'Rokiškis', ru: 'Рокишкис', et: 'Rokiškis', lv: 'Rokiškis', lt: 'Rokiškis' },
    { name: 'Biržai', ru: 'Биржай', et: 'Biržai', lv: 'Biržai', lt: 'Biržai' },
    { name: 'Elektrėnai', ru: 'Электренай', et: 'Elektrėnai', lv: 'Elektrėnai', lt: 'Elektrėnai' },
    { name: 'Kuršėnai', ru: 'Куршенай', et: 'Kuršėnai', lv: 'Kuršēni', lt: 'Kuršėnai' },
    { name: 'Gargždai', ru: 'Гаргждай', et: 'Gargždai', lv: 'Gargždi', lt: 'Gargždai' },
    { name: 'Skuodas', ru: 'Скуодас', et: 'Skuodas', lv: 'Skuodas', lt: 'Skuodas' },
    { name: 'Jurbarkas', ru: 'Юрбаркас', et: 'Jurbarkas', lv: 'Jurbarkas', lt: 'Jurbarkas' },
    { name: 'Anykščiai', ru: 'Аникщяй', et: 'Anykščiai', lv: 'Anykščiai', lt: 'Anykščiai' },
    { name: 'Švenčionys', ru: 'Швенченис', et: 'Švenčionys', lv: 'Švenčionys', lt: 'Švenčionys' },
    { name: 'Trakai', ru: 'Тракай', et: 'Trakai', lv: 'Trakai', lt: 'Trakai' },
    { name: 'Neringa', ru: 'Неринга', et: 'Neringa', lv: 'Neringa', lt: 'Neringa' },
  ],
  Estonia: [
    { name: 'Tallinn', ru: 'Таллин', et: 'Tallinn', lv: 'Tallina', lt: 'Talinas' },
    { name: 'Tartu', ru: 'Тарту', et: 'Tartu', lv: 'Tartu', lt: 'Tartu' },
    { name: 'Narva', ru: 'Нарва', et: 'Narva', lv: 'Narva', lt: 'Narva' },
    { name: 'Pärnu', ru: 'Пярну', et: 'Pärnu', lv: 'Pērnava', lt: 'Pernava' },
    { name: 'Kohtla-Järve', ru: 'Кохтла-Ярве', et: 'Kohtla-Järve', lv: 'Kohtla-Järve', lt: 'Kohtla-Jervė' },
    { name: 'Viljandi', ru: 'Вильянди', et: 'Viljandi', lv: 'Viljandi', lt: 'Viljandi' },
    { name: 'Rakvere', ru: 'Раквере', et: 'Rakvere', lv: 'Rakvere', lt: 'Rakverė' },
    { name: 'Maardu', ru: 'Маарду', et: 'Maardu', lv: 'Maardu', lt: 'Maardu' },
    { name: 'Sillamäe', ru: 'Силламяэ', et: 'Sillamäe', lv: 'Sillamäe', lt: 'Sillamäė' },
    { name: 'Kuressaare', ru: 'Курессааре', et: 'Kuressaare', lv: 'Kuressaare', lt: 'Kuressaarė' },
    { name: 'Võru', ru: 'Выру', et: 'Võru', lv: 'Võru', lt: 'Võru' },
    { name: 'Haapsalu', ru: 'Хаапсалу', et: 'Haapsalu', lv: 'Haapsalu', lt: 'Haapsalu' },
    { name: 'Valga', ru: 'Валга', et: 'Valga', lv: 'Valka', lt: 'Valga' },
    { name: 'Keila', ru: 'Кейла', et: 'Keila', lv: 'Keila', lt: 'Keila' },
    { name: 'Jõhvi', ru: 'Йыхви', et: 'Jõhvi', lv: 'Jēhvi', lt: 'Jõhvi' },
    { name: 'Võhma', ru: 'Выхма', et: 'Võhma', lv: 'Vēhma', lt: 'Vohma' },
    { name: 'Põlva', ru: 'Пылва', et: 'Põlva', lv: 'Pēlva', lt: 'Pelva' },
    { name: 'Elva', ru: 'Эльва', et: 'Elva', lv: 'Elva', lt: 'Elva' },
    { name: 'Paide', ru: 'Пайде', et: 'Paide', lv: 'Paide', lt: 'Paide' },
    { name: 'Tapa', ru: 'Тапа', et: 'Tapa', lv: 'Tapa', lt: 'Tapa' },
    { name: 'Rapla', ru: 'Рапла', et: 'Rapla', lv: 'Rapla', lt: 'Rapla' },
    { name: 'Türi', ru: 'Тюри', et: 'Türi', lv: 'Tiri', lt: 'Tiri' },
    { name: 'Saue', ru: 'Сауэ', et: 'Saue', lv: 'Saue', lt: 'Saue' },
    { name: 'Jõgeva', ru: 'Йыгева', et: 'Jõgeva', lv: 'Jogeva', lt: 'Jogeva' },
    { name: 'Kiviõli', ru: 'Кивиыли', et: 'Kiviõli', lv: 'Kivioli', lt: 'Kiviolis' },
  ],
};

// All city names for searching (including translations)
function buildSearchIndex() {
  const index = [];
  Object.entries(CITIES_BY_COUNTRY).forEach(([country, cities]) => {
    cities.forEach(city => {
      index.push({ ...city, country, searchTerms: [city.name, city.ru, city.et, city.lv, city.lt].map(s => s?.toLowerCase()) });
    });
  });
  return index;
}
const SEARCH_INDEX = buildSearchIndex();
const MAX_SUGGESTIONS = 30;

// Cities of the selected country, filtered by the typed query.
// An empty query returns the full list so the dropdown opens on click.
function findCities(country, query) {
  let pool = country ? SEARCH_INDEX.filter(c => c.country === country) : SEARCH_INDEX;
  const needle = String(query || '').trim().toLowerCase();
  if (needle) pool = pool.filter(c => c.searchTerms.some(term => term?.includes(needle)));
  return pool.slice(0, MAX_SUGGESTIONS);
}

export default function CityAutocomplete({ value, onChange, country, error, className }) {
  const { i18n, t } = useTranslation();
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const lang = i18n.language?.slice(0, 2) || 'en';

  // Sync external value changes
  useEffect(() => {
    if (value !== query) setQuery(value || '');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  const getDisplayName = (city) => {
    if (lang === 'ru') return city.ru || city.name;
    if (lang === 'et') return city.et || city.name;
    if (lang === 'lv') return city.lv || city.name;
    if (lang === 'lt') return city.lt || city.name;
    return city.name;
  };

  const openList = (val) => {
    setSuggestions(findCities(country, val));
    setOpen(true);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // allow free text
    openList(val);
  };

  const handleSelect = (city) => {
    const displayName = getDisplayName(city);
    setQuery(displayName);
    onChange(displayName);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setSuggestions(findCities(country, ''));
    setOpen(false);
  };

  const baseCls = "h-11 w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 pr-10 text-sm outline-none transition-colors focus:border-[rgba(53,0,81,1)] focus:ring-1 focus:ring-[rgba(53,0,81,0.3)] placeholder:text-slate-400";

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => openList(query)}
          onClick={() => openList(query)}
          placeholder={t('listing.city_placeholder', 'Введите город...')}
          className={cn(baseCls, 'pl-9', error && 'border-red-400 focus:border-red-400 ring-red-400/20', className)}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {query && (
          <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-[60] top-full mt-1 left-0 right-0 max-h-[260px] overflow-y-auto overscroll-contain bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl" role="listbox">
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{t('listing.city_none', 'Ничего не найдено — можно ввести вручную')}</p>
          ) : suggestions.map((city, i) => (
            <button
              key={`${city.country}-${city.name}`}
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(city); }}
              className={cn(
                "w-full min-h-[44px] flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors",
                i > 0 && "border-t border-slate-100 dark:border-slate-700/50"
              )}
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{getDisplayName(city)}</span>
                {getDisplayName(city) !== city.name && (
                  <span className="text-xs text-slate-400 ml-1.5">{city.name}</span>
                )}
              </div>
              {!country && (
                <span className="text-xs text-slate-400 flex-shrink-0">{t(`listing.country_${city.country.toLowerCase()}`, city.country)}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Export cities list for use elsewhere
export { CITIES_BY_COUNTRY, findCities };