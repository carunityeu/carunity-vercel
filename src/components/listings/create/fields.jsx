import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const inputCls = 'lc-input w-full focus-visible:ring-0 focus-visible:ring-offset-0';

export function Field({ label, className, children }) {
  return (
    <div className={cn('lc-field', className)}>
      {label && <label className="lc-label">{label}</label>}
      {children}
    </div>
  );
}

export function SelectField({ label, value, onChange, placeholder, options, disabled, className }) {
  return (
    <Field label={label} className={className}>
      <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger aria-label={label} className={inputCls}><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent className="max-h-64">
          {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function TextField({ label, value, onChange, placeholder, type = 'text', suffix, step, className }) {
  return (
    <Field label={label} className={className}>
      <div className="relative">
        <Input aria-label={label} type={type} step={step} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder ?? (type === 'number' ? (step ? '0,0' : '0') : label)} className={cn(inputCls, suffix && 'lc-with-suffix')} />
        {suffix && <span className="lc-suffix">{suffix}</span>}
      </div>
    </Field>
  );
}

export function Chip({ active, onClick, children, className }) {
  return (
    <button type="button" onClick={onClick} className={cn('min-h-8 px-2.5 rounded-md border text-xs flex items-center justify-center gap-1.5 transition-colors', active ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600', className)}>
      {children}
    </button>
  );
}