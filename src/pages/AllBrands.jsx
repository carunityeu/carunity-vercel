import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const allBrands = [
  'Abarth', 'Acura', 'Aiways', 'Alfa Romeo', 'Alpine', 'Arcfox', 'Ariel',
  'Aston Martin', 'Audi', 'BAIC', 'Baojun', 'Bentley', 'BMW', 'Brilliance',
  'Bugatti', 'Buick', 'BYD', 'BYTON', 'Cadillac', 'Changan', 'Chery',
  'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Daihatsu', 'Datsun',
  'DeLorean', 'Dodge', 'Dongfeng', 'DS', 'Exeed', 'FAW', 'Ferrari', 'Fiat',
  'Fisker', 'Ford', 'Foton', 'GAC', 'Geely', 'Genesis', 'GMC', 'Great Wall',
  'Haval', 'Honda', 'Hongqi', 'Hummer', 'Hyundai', 'Ineos', 'Infiniti',
  'Isuzu', 'JAC', 'Jaguar', 'Jeep', 'Kia', 'Koenigsegg', 'Lada',
  'Lamborghini', 'Lancia', 'Land Rover', 'Leapmotor', 'Lexus', 'Li Auto',
  'Lifan', 'Lincoln', 'Lotus', 'Lucid', 'Mahindra', 'Maserati', 'Maybach',
  'Mazda', 'McLaren', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi', 'NIO',
  'Nissan', 'Oldsmobile', 'Opel', 'Pagani', 'Peugeot', 'Perodua', 'Polestar',
  'Pontiac', 'Porsche', 'Proton', 'Ram', 'Renault', 'Rivian', 'Rolls-Royce',
  'Saab', 'Scion', 'Seat', 'Skoda', 'Skywell', 'Smart', 'SsangYong',
  'Subaru', 'Suzuki', 'Tata', 'Tesla', 'Toyota', 'Vauxhall', 'VinFast',
  'Volkswagen', 'Volvo', 'Wey', 'XPeng', 'ZEEKR'
];

export default function AllBrands() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  const filtered = allBrands.filter(b =>
    b.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, brand) => {
    const letter = brand[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(brand);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  const toggleBrand = (brand) => {
    setSelected(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleShowInCatalog = () => {
    if (selected.length === 1) {
      navigate(`/Catalog?brand=${encodeURIComponent(selected[0])}`);
    } else if (selected.length > 1) {
      navigate(`/Catalog?brands=${encodeURIComponent(selected.join(','))}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-[104px] md:pt-[120px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.back', 'Назад')}
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('allbrands.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{allBrands.length} {t('allbrands.count')}</p>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t('allbrands.search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Selected brands bar */}
        {selected.length > 0 && (
          <div className="sticky top-0 z-20 bg-white dark:bg-slate-950 py-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 mr-1">
                {t('allbrands.selected', 'Выбрано')}:
              </span>
              {selected.map(b => (
                <Badge key={b} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 gap-1 pl-2 pr-1">
                  {b}
                  <button onClick={() => toggleBrand(b)} className="ml-0.5 hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button
                size="sm"
                className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-4 text-sm"
                onClick={handleShowInCatalog}
              >
                {t('allbrands.show_catalog', 'Показать в каталоге')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 h-8 px-2 text-xs"
                onClick={() => setSelected([])}
              >
                {t('catalog.reset_all', 'Сбросить')}
              </Button>
            </div>
          </div>
        )}

        {/* Letter navigation */}
        {!search && (
          <div className="flex flex-wrap gap-1 mb-8">
            {letters.map(letter => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
        )}

        {/* Brand list */}
        <div className="space-y-8">
          {letters.map(letter => (
            <div key={letter} id={`letter-${letter}`}>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">
                {letter}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                {grouped[letter].map(brand => {
                  const isSelected = selected.includes(brand);
                  return (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors flex items-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </span>
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">{t('allbrands.not_found')}</div>
        )}
      </div>
    </div>
  );
}