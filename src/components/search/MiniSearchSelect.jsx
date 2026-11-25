import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// triggerClassName replaces the default field look (the home search uses the design-code field)
export default function MiniSearchSelect({ value, onChange, options, placeholder, anyLabel, triggerClassName }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filtered = query
    ? options.filter(o => (typeof o === 'string' ? o : o.label).toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (val) => { onChange(val); setOpen(false); setQuery(''); };
  const handleClear = (e) => { e.stopPropagation(); onChange(''); };
  const getLabel = (val) => {
    if (!val) return null;
    const opt = options.find(o => (typeof o === 'string' ? o : o.value) === val);
    return opt ? (typeof opt === 'string' ? opt : opt.label) : val;
  };

  const clearLabel = anyLabel || t('common.any_option', 'Any');

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={triggerClassName || "w-full flex items-center justify-between h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white text-xs focus:outline-none"}
      >
        <span className={triggerClassName ? `truncate ${value ? 'text-ink' : 'text-ink-3'}` : (value ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>
          {getLabel(value) || placeholder}
        </span>
        <div className="flex items-center gap-0.5">
          {value && (
            <span onClick={handleClear} className="hover:text-red-400 text-slate-400 p-0.5">
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </button>

      {open && (
        <div className="absolute z-[200] top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[180px]">
          <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('common.search_input')}
              className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            <button type="button" onClick={() => handleSelect('')}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
              {clearLabel}
            </button>
            {filtered.length === 0 && (
              <div className="px-3 py-3 text-xs text-slate-400 text-center">{t('common.nothing_found')}</div>
            )}
            {filtered.map((opt, i) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const label = typeof opt === 'string' ? opt : opt.label;
              return (
                <button key={i} type="button" onClick={() => handleSelect(val)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${value === val ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}