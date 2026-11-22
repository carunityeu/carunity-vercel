import React, { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { inputCls } from '@/components/listings/create/fields';

export default function DetailedFilterField({ field, form, update, t }) {
  const id = useId();
  const label = t(field.label);
  const value = form[field.key] ?? '';
  if (field.kind === 'check') return <label className="ds-check" htmlFor={id}><Checkbox id={id} checked={!!value} onCheckedChange={checked=>update(field.key,!!checked)} /><span>{label}</span></label>;
  return <div className="lc-field">
    <label className="lc-label" htmlFor={id}>{label}{field.unit ? ` (${field.unit})` : ''}</label>
    {field.kind === 'range' ? <div className="grid grid-cols-2 gap-2">
      {['From','To'].map((side,index)=><Input key={side} id={index===0?id:undefined} aria-label={`${label}: ${t('detailed_search.'+(index===0?'from':'to'))}`} name={field.key+side} type="number" min="0" step={field.key==='year'?'1':'any'} className={inputCls} placeholder={t('detailed_search.'+(index===0?'from':'to'))} value={form[field.key+side]??''} onChange={event=>update(field.key+side,event.target.value)} />)}
    </div> : field.kind === 'select' ? <Select value={value||'__any__'} onValueChange={next=>update(field.key,next==='__any__'?'':next)}>
      <SelectTrigger id={id} aria-label={label} className={inputCls}><SelectValue /></SelectTrigger>
      <SelectContent className="max-h-72"><SelectItem value="__any__">{t('detailed_search.all')}</SelectItem>
        {field.options.map(option=>{const val=typeof option==='string'?option:option.value;return <SelectItem key={val} value={val}>{typeof option==='object'?option.label:field.prefix?t(field.prefix+val):val}</SelectItem>;})}
      </SelectContent>
    </Select> : <Input id={id} aria-label={label} name={field.key} min={field.kind==='number'?0:undefined} type={field.kind} value={value} className={inputCls} placeholder={field.kind==='date'?undefined:t('detailed_search.all')} onChange={event=>update(field.key,event.target.value)} />}
  </div>;
}