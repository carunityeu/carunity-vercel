import React from 'react';
import { compareGroups, bestValue } from '@/components/compare/compareSpecs';
import formatComparison from '@/components/compare/formatComparison';
import CompareCarHeading from '@/components/compare/CompareCarHeading';
export default function CompareSpecTable({cars,removeCar,t,language}) {
  return <>
    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t('comparePage.legend')}</p>
    <p className="mb-4 text-xs text-muted-foreground sm:hidden">{t('comparePage.scroll')}</p>
    <div className="compare-scroll" role="region" aria-label={t('comparePage.title')} tabIndex={0}>
      <div className="compare-matrix" style={{'--compare-columns':cars.length}}>
        <div className="compare-row"><div className="compare-spacer"/>{cars.map(car=><CompareCarHeading key={car.id} {...{car,removeCar,t,language}}/>)}</div>
        <div className="space-y-4">{compareGroups.map(([title,rows])=><section key={title} className="overflow-clip rounded-2xl border border-border bg-card">
          <h2 className="border-b border-border px-4 py-4 text-sm font-semibold sm:px-5">{t(title)}</h2>
          {rows.map(row=>{const [key,label]=row;const best=bestValue(key,cars);return <div key={key} className="compare-row border-b border-border last:border-0">
            <div className="compare-label">{t(label)}</div>
            {cars.map(car=><div key={car.id} className={`compare-cell text-xs leading-relaxed sm:text-sm ${best!==null&&car[key]===best?'bg-primary/5 font-semibold text-primary':'text-foreground'}`} aria-label={`${car.brand} ${car.model}: ${t(label)}`}>
              {formatComparison(car,row,t,language)}
            </div>)}
          </div>;})}
        </section>)}</div>
      </div>
    </div>
  </>;
}