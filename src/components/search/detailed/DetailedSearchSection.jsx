import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import DetailedFilterField from '@/components/search/detailed/DetailedFilterField';

export default function DetailedSearchSection({ section, form, update, t, children }) {
  const [open,setOpen] = useState(!!section.open);
  const id = useId();
  return <section className="ds-card">
    <h2><button type="button" className="ds-heading" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}><span>{t(section.title)}</span><ChevronDown aria-hidden="true" className={open?'h-4 w-4 rotate-180':'h-4 w-4'} /></button></h2>
    {open && <div id={id} className="ds-body">{children || <div className="ds-fields">{section.fields.map(field=><DetailedFilterField key={field.key} field={field} form={form} update={update} t={t} />)}</div>}</div>}
  </section>;
}