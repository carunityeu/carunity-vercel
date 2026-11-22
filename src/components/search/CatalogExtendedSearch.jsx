import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

const INTERIOR_COLORS = ['black', 'gray', 'brown', 'beige', 'red', 'blue', 'green', 'yellow', 'orange', 'white'];
const INTERIOR_MATERIALS = ['alcantara', 'leather', 'partial_leather', 'fabric', 'velour', 'other'];
const DOORS_OPTIONS = ['2/3', '4/5', '6/7'];
const SEATS_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9];

export const DEFAULT_EXTENDED = {
  condition: '', ownersCount: '', colorInterior: '', interiorMaterial: '',
  particulateFilter: false, warranty: false,
  serviceBook: false, vatDeductible: false,
  doors: '', seats: '',
};

const selectCls = 'h-9 bg-slate-100 dark:bg-slate-900 border-0 shadow-none focus:ring-0 focus:border-0 text-slate-900 dark:text-white rounded-xl text-xs';
const inputCls = 'h-9 bg-slate-100 dark:bg-slate-900 border-0 shadow-none focus:ring-0 focus:border-0 text-slate-900 dark:text-white rounded-xl text-xs';

export default function CatalogExtendedSearch({ value = {}, onApply, inline = false }) {
  const { t } = useTranslation();
  const [local, setLocal] = useState({ ...DEFAULT_EXTENDED, ...value });
  const [open, setOpen] = useState(false);

  // Auto-apply on every change
  const set = (k, v) => {
    const next = { ...local, [k]: v };
    setLocal(next);
    onApply(next);
  };

  const activeCount = useMemo(() => Object.entries(local).filter(([k, v]) => {
    if (typeof v === 'boolean') return v;
    return v !== '' && v !== 'any';
  }).length, [local]);

  const handleReset = () => { setLocal(DEFAULT_EXTENDED); onApply(DEFAULT_EXTENDED); };

  const FiltersContent = () => (
    <div className="flex flex-col gap-2">
      {/* Condition */}
      <Select value={local.condition || 'any'} onValueChange={v => set('condition', v === 'any' ? '' : v)}>
        <SelectTrigger className={selectCls}><SelectValue placeholder={t('listing.condition', 'Состояние')} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t('listing.condition', 'Состояние')}</SelectItem>
          <SelectItem value="new">{t('conditions.new', 'Новый')}</SelectItem>
          <SelectItem value="used">{t('conditions.used', 'Б/у')}</SelectItem>
        </SelectContent>
      </Select>

      {/* Owners count */}
      <Input type="number" min="0" value={local.ownersCount} onChange={e => set('ownersCount', e.target.value)} placeholder={t('detailed_search.owners_count')} className={inputCls} />

      {/* Interior color + Material */}
      <div className="grid grid-cols-2 gap-2">
        <Select value={local.colorInterior || 'all'} onValueChange={v => set('colorInterior', v === 'all' ? '' : v)}>
          <SelectTrigger className={selectCls}><SelectValue placeholder={t('listing.color_interior')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('listing.color_interior')}</SelectItem>
            {INTERIOR_COLORS.map(c => <SelectItem key={c} value={c}>{t('colors.' + c, c)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={local.interiorMaterial || 'all'} onValueChange={v => set('interiorMaterial', v === 'all' ? '' : v)}>
          <SelectTrigger className={selectCls}><SelectValue placeholder={t('listing.interior_material')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('listing.interior_material')}</SelectItem>
            {INTERIOR_MATERIALS.map(m => <SelectItem key={m} value={m}>{t('interior_materials.' + m, m)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Doors + Seats */}
      <div className="grid grid-cols-2 gap-2">
        <Select value={local.doors || 'all'} onValueChange={v => set('doors', v === 'all' ? '' : v)}>
          <SelectTrigger className={selectCls}><SelectValue placeholder={t('detailed_search.doors')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('detailed_search.doors')}</SelectItem>
            {DOORS_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={local.seats || 'all'} onValueChange={v => set('seats', v === 'all' ? '' : v)}>
          <SelectTrigger className={selectCls}><SelectValue placeholder={t('detailed_search.seats')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('detailed_search.seats')}</SelectItem>
            {SEATS_OPTIONS.map(s => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Checkboxes — 2 per row, same style as main filters */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
        {[
          ['particulateFilter', t('listing.particulate_filter')],
          ['warranty', t('detailed_search.warranty')],
          ['serviceBook', t('listing.service_book_field', t('detailed_search.service_book'))],
          ['vatDeductible', t('detailed_search.vat_deductible')],
        ].map(([key, lbl]) => (
          <div key={key} className="flex items-center space-x-2.5 py-1">
            <Checkbox
              id={`ext-${key}`}
              checked={!!local[key]}
              onCheckedChange={(checked) => set(key, !!checked)}
              className="h-5 w-5"
            />
            <label htmlFor={`ext-${key}`} className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              {lbl}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  // INLINE mode — collapsible section within the filter sidebar
  if (inline) {
    return (
      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-300 py-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4" />
            {t('catalog.extended_search')}
            {activeCount > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeCount}</span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="pt-1 pb-2">
            <FiltersContent />
          </div>
        )}
      </div>
    );
  }

  // POPOVER mode — for mobile toolbar (kept for backwards compat)
  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-300 py-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4" />
          {t('catalog.extended_search')}
          {activeCount > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeCount}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pt-1 pb-2">
          <FiltersContent />
        </div>
      )}
    </div>
  );
}