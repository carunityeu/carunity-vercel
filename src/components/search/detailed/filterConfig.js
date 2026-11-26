import { carBrands, getModelsForBrand, BODY_VALUES, FUEL_VALUES, TRANSMISSION_VALUES, DRIVE_VALUES, EMISSION_CLASSES } from '@/components/listings/create/constants';
import { translateCountry } from '@/utils/locationUtils';

const select = (key, label, options, prefix) => ({ key, label, options, prefix, kind: 'select' });
const text = (key, label, kind = 'text') => ({ key, label, kind });
const range = (key, label, unit = '') => ({ key, label, unit, kind: 'range' });
export const RANGE_FIELDS = [
  ['engine_volume','engine_volume','listing.cr_engine_volume','l'], ['co2_emissions','co2_emissions','listing.cr_co2','g/km'],
  ['fuel_consumption_city','fuel_consumption_city','listing.cr_fc_urban','l/100km'], ['fuel_consumption_highway','fuel_consumption_highway','listing.cr_fc_highway','l/100km'], ['fuel_consumption_combined','fuel_consumption_combined','listing.cr_fc_combined','l/100km'],
  ['energy_consumption','energy_consumption','car.energy_consumption','kWh/100km'],
  ['length_mm','length_mm','listing.cr_length','mm'], ['width_mm','width_mm','listing.cr_width','mm'], ['height_mm','height_mm','listing.cr_height','mm'], ['wheelbase_mm','wheelbase_mm','listing.cr_wheelbase','mm'],
  ['clearance_mm','clearance_mm','listing.cr_clearance','mm'], ['weight_empty_kg','weight_empty_kg','listing.cr_curb_weight','kg'], ['weight_max_kg','weight_max_kg','listing.cr_max_weight','kg'], ['trunk_volume','trunk_volume','listing.cr_trunk','l'],
  ['max_speed_kmh','max_speed_kmh','listing.cr_top_speed','km/h'], ['acceleration_0_100','acceleration_0_100','listing.cr_accel','s'],
];
export const EXTRA_PARAMS = ['trim','month_of_manufacture','engine_code','fuel_system','transmission_type','sellerType','isDamaged','emissionClass','technical_inspection_until', ...RANGE_FIELDS.flatMap(([key]) => [key+'From',key+'To'])];
export const EMPTY_SEARCH = { powerUnit: 'kw', features: [] };
export function getFilterSections(form, t) {
  const models = getModelsForBrand(form.brand);
  const months = Array.from({length:12},(_,i)=>({value:String(i+1),label:t('months.'+['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'][i])}));
  const ranges = keys => RANGE_FIELDS.filter(([key])=>keys.includes(key)).map(([key,,label,unit])=>range(key,label,unit));
  return [
    { key:'main', title:'detailed_search.section_main', open:true, fields:[select('brand','listing.cr_make',carBrands), models.length ? select('model','listing.cr_model',models) : text('model','listing.cr_model'), range('year','listing.cr_year'), select('month_of_manufacture','listing.cr_month',months),range('price','detailed_search.price'),range('mileage','listing.cr_mileage','km')] },
    { key:'technical',title:'listing.step_model_details',open:true,fields:[select('bodyType','listing.cr_body_type',BODY_VALUES,'body_types.'),select('fuelType','listing.cr_fuel_type',FUEL_VALUES,'fuel_types.'),select('transmission','listing.cr_transmission',TRANSMISSION_VALUES,'transmission_types.'),select('driveType','listing.cr_drive',DRIVE_VALUES,'drive_types.'),range('power','listing.cr_power',form.powerUnit==='hp'?t('car.hp'):t('car.kw')),select('powerUnit','listing.cr_power_unit',[{value:'kw',label:t('car.kw')},{value:'hp',label:t('car.hp')}]),...ranges(['engine_volume']),text('trim','listing.cr_trim'),text('transmission_type','listing.cr_transmission'),text('engine_code','listing.cr_engine_code'),text('fuel_system','listing.cr_fuel_system')] },
    { key:'ecology',title:'listing.step_ecology',fields:[select('emissionClass','listing.cr_emission_class',EMISSION_CLASSES),...ranges(['co2_emissions','fuel_consumption_city','fuel_consumption_highway','fuel_consumption_combined','energy_consumption']),text('particulateFilter','listing.cr_particle_filter','check')] },
    { key:'dimensions',title:'searchRef.dimensions',fields:[...ranges(['length_mm','width_mm','height_mm','wheelbase_mm','clearance_mm','weight_empty_kg','weight_max_kg','trunk_volume','max_speed_kmh','acceleration_0_100']),text('doors','listing.cr_doors','number'),text('seats','listing.cr_seats','number')] },
    { key:'condition',title:'detailed_search.section_condition',fields:[select('condition','listing.condition',['new','used'],'conditions.'),text('ownersCount','detailed_search.owners_count','number'),select('isDamaged','detailed_search.after_accident',[{value:'hide',label:t('detailed_search.hide_accident')},{value:'only',label:t('detailed_search.only_accident')}]),text('technical_inspection_until','listing.tech_inspection','date'),...['warranty','serviceBook','nonSmoker','vatDeductible'].map((key,i)=>text(key,['detailed_search.warranty','detailed_search.service_book','detailed_search.non_smoker','detailed_search.vat_deductible'][i],'check'))] },
    { key:'location',title:'detailed_search.section_location',fields:[select('country','detailed_search.country',['Estonia','Latvia','Lithuania'].map(country=>({value:country,label:translateCountry(null,country)}))),text('city','detailed_search.city'),select('sellerType','detailed_search.seller',[{value:'dealer',label:t('car.dealer')},{value:'private',label:t('car.private')}])] },
  ];
}
export function serializeDetailedFilters(form) {
  const params = new URLSearchParams();
  Object.entries(form).forEach(([key,value])=>{if(value!==''&&value!==false&&value!=null&&(!Array.isArray(value)||value.length))params.set(key,Array.isArray(value)?value.join(','):String(value));});
  return params.toString();
}