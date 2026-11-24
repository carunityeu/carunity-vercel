import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MiniSearchSelect({ value, onChange, options, placeholder, anyLabel }) {
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
        className="w-full flex items-center justify-between h-10 px-3 rounded-xl bg-raised text-ink text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-brand"
      >
        <span className={value ? 'text-ink' : 'text-ink-3'}>
          {getLabel(value) || placeholder}
        </span>
        <div className="flex items-center gap-0.5">
          {value && (
            <span onClick={handleClear} className="hover:text-red-400 text-ink-3 p-0.5">
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-ink-3" />
        </div>
      </button>

      {open && (
        <div className="absolute z-[200] top-full mt-1 left-0 right-0 bg-surface border border-line rounded-xl shadow-xl overflow-hidden min-w-[180px]">
          <div className="p-1.5 border-b border-line">
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('common.search_input')}
              className="w-full h-8 px-2.5 text-sm bg-raised text-ink border border-transparent rounded-lg outline-none focus:border-brand"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            <button type="button" onClick={() => handleSelect('')}
              className="w-full text-left px-3 py-2 text-sm text-ink-3 hover:bg-raised">
              {clearLabel}
            </button>
            {filtered.length === 0 && (
              <div className="px-3 py-3 text-sm text-ink-3 text-center">{t('common.nothing_found')}</div>
            )}
            {filtered.map((opt, i) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const label = typeof opt === 'string' ? opt : opt.label;
              return (
                <button key={i} type="button" onClick={() => handleSelect(val)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-raised transition-colors ${value === val ? 'bg-brand/15 text-brand-text font-medium' : 'text-ink-2'}`}>
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