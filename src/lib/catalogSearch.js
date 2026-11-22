import { normalizeSearchQuery, cyrillicToLatin } from '@/utils/searchNormalizer';
import { EXTRA_PARAMS, RANGE_FIELDS } from '@/components/search/detailed/filterConfig';
import { DEFAULT_EXTENDED } from '@/components/search/CatalogExtendedSearch';

const textFields = {model:'model',city:'location',trim:'trim_level',engine_code:'engine_code',fuel_system:'fuel_system',transmission_type:'transmission_type'};
const exactFields = {fuelType:'fuel_type',transmission:'transmission',bodyType:'body_type',driveType:'drive_type',country:'country',color:'color',condition:'condition',sellerType:'seller_type',emissionClass:'emission_class',colorInterior:'color_interior',interiorMaterial:'interior_material',ecoSticker:'eco_sticker'};
const flagFields = {metallic:'metallic',particulateFilter:'particulate_filter',warranty:'warranty',serviceBook:'service_book',nonSmoker:'non_smoker',vatDeductible:'vat_deductible'};
const escape = value => String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const meaningful = value => value!==undefined&&value!==null&&value!==''&&value!=='any'&&value!=='all';
export function parseCatalogSearch(search) {
  const params = new URLSearchParams(search);
  const filters = {priceRange:[0,200000],powerRange:[0,400]};
  const ext = {...DEFAULT_EXTENDED};
  for(const key of ['brand','model','yearFrom','yearTo','fuelType','transmission','bodyType','driveType','country','city','color','condition','mileageFrom','mileageTo'])if(params.has(key))filters[key]=params.get(key);
  if(params.has('brands'))filters.brands=params.get('brands').split(',');
  else if(filters.brand)filters.brands=[filters.brand];
  if(filters.brands?.length)filters.brand=filters.brands[0];
  for(const [field,base,unit] of [['priceRange','price',1],['powerRange','power',params.get('powerUnit')==='kw'?1:1.36]]){
    if(params.get(base+'From'))filters[field][0]=Number(params.get(base+'From'))/unit;
    if(params.get(base+'To'))filters[field][1]=Number(params.get(base+'To'))/unit;
  }
  filters.explicitBounds={priceFrom:params.has('priceFrom'),priceTo:params.has('priceTo'),powerFrom:params.has('powerFrom'),powerTo:params.has('powerTo')};
  filters.advanced=Object.fromEntries(EXTRA_PARAMS.filter(key=>params.has(key)).map(key=>[key,params.get(key)]));
  if(params.get('premium'))filters.isPremium=true;
  if(params.get('damaged'))filters.isDamaged=true;
  if(params.get('q'))filters.q=params.get('q');
  if(params.get('features'))filters.features=params.get('features').split(',');
  for(const key of ['condition','ownersCount','colorInterior','interiorMaterial','ecoSticker','doors','seats','seatsFrom','seatsTo'])if(params.has(key))ext[key]=params.get(key);
  for(const key of Object.keys(flagFields))if(params.get(key)==='true')ext[key]=true;
  return {filters,ext};
}
export function buildCatalogQuery(filters, ext={}) {
  const query={status:'active'};
  const values={...filters,...filters.advanced,...Object.fromEntries(Object.entries(ext).filter(([,v])=>meaningful(v)&&v!==false))};
  if(filters.brands?.length)query.brand={$in:filters.brands};
  else if(meaningful(filters.brand))query.brand=filters.brand;
  for(const [key,field] of Object.entries(exactFields))if(meaningful(values[key])){const choices=String(values[key]).split(',');query[field]=choices.length>1?{$in:choices}:values[key];}
  for(const [key,field] of Object.entries(textFields))if(meaningful(values[key]))query[field]={$regex:escape(values[key]),$options:'i'};
  const range=(field,from,to)=>{const bounds={};if(meaningful(from)&&Number.isFinite(Number(from)))bounds.$gte=Number(from);if(meaningful(to)&&Number.isFinite(Number(to)))bounds.$lte=Number(to);if(Object.keys(bounds).length)query[field]=bounds;};
  range('year',filters.yearFrom,filters.yearTo);range('mileage',filters.mileageFrom,filters.mileageTo);
  for(const [key,field,max,multiplier] of [['priceRange','price',200000,1],['powerRange','engine_power',400,1.36]]){
    const selected=filters[key]||[0,max];const prefix=field==='price'?'price':'power';
    range(field,selected[0]>0||filters.explicitBounds?.[prefix+'From']?selected[0]*multiplier:undefined,selected[1]!==max||filters.explicitBounds?.[prefix+'To']?selected[1]*multiplier:undefined);
  }
  for(const [key,field] of RANGE_FIELDS)range(field,values[key+'From'],values[key+'To']);
  for(const [key,field] of Object.entries(flagFields))if(values[key]===true||values[key]==='true')query[field]=true;
  for(const key of ['month_of_manufacture','seats'])if(meaningful(values[key]))query[key]=Number(values[key]);
  if(meaningful(values.ownersCount))query.owners_count=values.ownersCount==='4+'?{$gte:4}:Number(values.ownersCount);
  if(meaningful(values.doors))query.doors=String(values.doors).includes('/')?{$in:String(values.doors).split('/').map(Number)}:Number(values.doors);
  if(meaningful(values.seatsFrom)||meaningful(values.seatsTo))range('seats',values.seatsFrom,values.seatsTo);
  if(values.isDamaged==='only'||filters.isDamaged)query.is_damaged=true;
  else if(values.isDamaged==='hide')query.is_damaged={$ne:true};
  if(meaningful(values.technical_inspection_until))query.technical_inspection_until={$gte:values.technical_inspection_until};
  if(filters.isPremium)query.is_premium=true;
  if(filters.features?.length)query.features={$all:filters.features};
  // Each word is searched as typed and in its Latin form, so "БМВ"/"х5" find BMW/X5
  const words=normalizeSearchQuery(filters.q).flatMap(word=>{const latin=cyrillicToLatin(word);return latin&&latin!==word?[word,latin]:[word];});
  if(words.length)query.$and=words.map(word=>({$or:[...['title','brand','model','description','trim_level','fuel_type','transmission','body_type','drive_type','color','condition','location','country','features'].map(field=>({[field]:{$regex:escape(word),$options:'i'}})),...(/^\d+$/.test(word)?['year','price','mileage','engine_power'].map(field=>({[field]:Number(word)})):[])]}));
  return query;
}