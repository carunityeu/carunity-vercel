import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DetailedSearchSection from '@/components/search/detailed/DetailedSearchSection';
import DetailedSearchAppearance from '@/components/search/detailed/DetailedSearchAppearance';
import ListingEquipment from '@/components/listings/create/ListingEquipment';
import { EMPTY_SEARCH, getFilterSections, serializeDetailedFilters } from '@/components/search/detailed/filterConfig';
import '@/components/listings/create/createListing.css';
import '@/components/search/detailed/detailedSearch.css';

export default function DetailedSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters,setFilters] = useState({...EMPTY_SEARCH});
  const [error,setError] = useState(false);
  const update = (key,value) => {setError(false);setFilters(prev=>({...prev,[key]:value,...(key==='brand'?{model:''}:{})}));};
  const sections = getFilterSections(filters,t);
  const submit = event => {
    event.preventDefault();
    const invalid = Object.entries(filters).some(([key,value])=>key.endsWith('From')&&value!==''&&filters[key.slice(0,-4)+'To']!==undefined&&filters[key.slice(0,-4)+'To']!==''&&Number(value)>Number(filters[key.slice(0,-4)+'To']));
    if(invalid){setError(true);return;}
    navigate('/Catalog?'+serializeDetailedFilters(filters));
  };
  return <div className="listing-create detailed-search"><div className="ds-shell">
    <header className="ds-header"><div><Link to="/" className="inline-flex min-h-9 items-center gap-1 text-sm text-muted-foreground"><ChevronLeft className="h-4 w-4" />{t('detailed_search.back')}</Link><h1 className="ds-title">{t('detailed_search.title')}</h1><p className="ds-intro">{t('searchRef.intro')}</p></div><Button type="button" variant="outline" onClick={()=>{setFilters({...EMPTY_SEARCH});setError(false);}} className="min-h-11 gap-2 rounded-xl bg-card"><RotateCcw className="h-4 w-4" />{t('detailed_search.reset')}</Button></header>
    <form onSubmit={submit}>
      {sections.slice(0,2).map(section=><DetailedSearchSection key={section.key} section={section} form={filters} update={update} t={t} />)}
      <DetailedSearchSection section={{title:'listing.cr_color_interior'}} t={t}><DetailedSearchAppearance form={filters} update={update} t={t} /></DetailedSearchSection>
      {sections.slice(2).map(section=><DetailedSearchSection key={section.key} section={section} form={filters} update={update} t={t} />)}
      <DetailedSearchSection section={{title:'detailed_search.section_equipment'}} t={t}><ListingEquipment form={{features:filters.features}} updateForm={update} t={t} /></DetailedSearchSection>
      {error&&<p role="alert" className="mt-5 text-sm text-destructive">{t('searchRef.rangeError')}</p>}
      <div className="ds-actions"><button type="submit" className="lc-next"><Search className="h-4 w-4" />{t('detailed_search.show_results')}</button></div>
    </form>
  </div></div>;
}