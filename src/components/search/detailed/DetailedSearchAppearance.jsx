import React from 'react';
import ListingColorInterior from '@/components/listings/create/ListingColorInterior';
import DetailedFilterField from '@/components/search/detailed/DetailedFilterField';

export default function DetailedSearchAppearance({ form, update, t }) {
  const map = {color_interior:'colorInterior',interior_material:'interiorMaterial'};
  const colors = {color:form.color,color_interior:form.colorInterior,interior_material:form.interiorMaterial};
  return <div>
    <ListingColorInterior form={colors} updateForm={(key,value)=>update(map[key]||key,colors[key]===value?'':value)} t={t} />
    <div className="mt-5"><DetailedFilterField field={{key:'metallic',label:'detailed_search.metallic',kind:'check'}} form={form} update={update} t={t} /></div>
  </div>;
}