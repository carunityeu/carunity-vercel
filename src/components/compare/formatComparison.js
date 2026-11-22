import { translateCountry, translateCity } from '@/utils/locationUtils';
export default function formatComparison(car, [key,, unit], t, language) {
  const value=car[key];
  if(value===null||value===undefined||value===''||(Array.isArray(value)&&!value.length))return t('comparePage.missing');
  if(key==='year')return String(value);
  const number=new Intl.NumberFormat(language,{maximumFractionDigits:2});
  if(unit==='EUR')return new Intl.NumberFormat(language,{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);
  if(unit==='month')return new Intl.DateTimeFormat(language,{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2020,Number(value)-1,1)));
  if(unit==='date'){const date=new Date(value);return Number.isNaN(date.getTime())?t('comparePage.missing'):new Intl.DateTimeFormat(language,{month:'long',year:'numeric'}).format(date);}
  if(unit==='country')return translateCountry(null,value);
  if(key==='location')return translateCity(null,value);
  if(unit==='seller')return t('car.'+value,{defaultValue:String(value)});
  if(key==='condition'&&['excellent','good','fair','damaged'].includes(value))return t('comparePage.condition_'+value);
  if(unit==='features')return value.map(item=>t('feature_items.'+item,{defaultValue:item})).join(' · ');
  if(['conditions','body_types','colors','fuel_types','transmission_types','drive_types'].includes(unit))return t(unit+'.'+value,{defaultValue:String(value)});
  if(unit)return `${number.format(unit==='kw'?value/1.35962:value)} ${t('car.'+unit)}`;
  return typeof value==='number'?number.format(value):String(value);
}