import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCompare } from '@/components/compare/CompareContext';
import CompareAIAnalysis from '@/components/compare/CompareAIAnalysis';
import CompareSpecTable from '@/components/compare/CompareSpecTable';
import '@/components/compare/compare.css';

export default function Compare() {
  const {compareList,removeCar,clearAll}=useCompare();
  const {t,i18n}=useTranslation();
  return <div className="compare-page"><div className="compare-wrap">
    <Link to="/Catalog" className="mb-5 inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground">{t('car.back_to_catalog')}</Link>
    <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('comparePage.title')}</h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{t('comparePage.subtitle')}</p><p className="mt-3 text-xs text-muted-foreground">{t('comparePage.count',{count:compareList.length})}</p></div>
      {compareList.length>0&&<div className="flex shrink-0 flex-wrap gap-2"><Link to="/Catalog" className="flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-secondary">{t('comparePage.add')}</Link><button type="button" onClick={clearAll} className="min-h-11 flex-1 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-secondary">{t('comparePage.clear')}</button></div>}
    </header>
    {!compareList.length?<section className="rounded-[20px] border border-border bg-card px-6 py-14 text-center"><h2 className="text-xl font-semibold">{t('comparePage.empty')}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{t('comparePage.hint')}</p><Link to="/Catalog" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium hover:bg-secondary">{t('comparePage.catalog')}</Link></section>:<>
      {compareList.length<2?<p className="mb-6 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('comparePage.one')}</p>:<CompareAIAnalysis cars={compareList}/>}
      <CompareSpecTable cars={compareList} removeCar={removeCar} t={t} language={i18n.resolvedLanguage||i18n.language}/>
    </>}
  </div></div>;
}