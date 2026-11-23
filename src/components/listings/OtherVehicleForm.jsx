import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { grantMainBonus } from '@/lib/referralUtils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, ArrowRight, Upload, X, Info, MapPin, Camera,
  Sparkles, Check, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ImageCropModal from '@/components/listings/ImageCropModal';
import CityAutocomplete from '@/components/listings/CityAutocomplete';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 35 }, (_, i) => currentYear - i);
const COUNTRIES = ['Latvia', 'Lithuania', 'Estonia'];

const COLORS = ['black','white','red','blue','green','yellow','orange','silver','gray','brown','purple','beige','gold'];

// Fields config per vehicle type
// Each field: { key, labelKey, type, placeholder, options?, required? }
const VEHICLE_FIELDS = {
  motorcycle: [
    { key: 'brand',        labelKey: 'listing.brand',        type: 'text',   placeholder: 'Honda',  required: true },
    { key: 'model',        labelKey: 'listing.model',        type: 'text',   placeholder: 'CB500F', required: true },
    { key: 'mileage',      labelKey: 'listing.mileage',      type: 'number', placeholder: '15000',  required: true },
    { key: 'engine_volume',labelKey: 'listing.engine_volume_cc',type: 'number', placeholder: '500' },
    { key: 'engine_power', labelKey: 'listing.engine_power_kw', type: 'number', placeholder: '26' },
    { key: 'fuel_type',    labelKey: 'listing.fuel_type',    type: 'select', options: ['petrol','electric','hybrid'] },
    { key: 'transmission', labelKey: 'listing.transmission', type: 'select', options: ['manual','automatic'] },
    { key: 'moto_type',    labelKey: 'listing.moto_type',    type: 'select', options: ['sport','naked','touring','cruiser','enduro','scooter','chopper','motocross','quad'] },
    { key: 'color',        labelKey: 'listing.color',        type: 'select', options: COLORS },
    { key: 'owners_count', labelKey: 'listing.owners_count', type: 'number', placeholder: '1' },
    { key: 'vin',          labelKey: 'listing.vin',          type: 'text',   placeholder: 'WBA...' },
    { key: 'emission_class',labelKey: 'listing.emission_class', type: 'text', placeholder: 'Euro 5' },
    { key: 'license_category', labelKey: 'listing.license_category', type: 'select', options: ['A1','A2','A'] },
    { key: 'abs',             labelKey: 'listing.abs',             type: 'select', options: ['yes','no'] },
  ],
  truck: [
    { key: 'brand',       labelKey: 'listing.brand',       type: 'text',   placeholder: 'Volvo',          required: true },
    { key: 'model',       labelKey: 'listing.model',       type: 'text',   placeholder: 'FH16',           required: true },
    { key: 'mileage',     labelKey: 'listing.mileage',     type: 'number', placeholder: '350000',         required: true },
    { key: 'engine_volume',  labelKey: 'listing.engine_volume',  type: 'number', placeholder: '16' },
    { key: 'engine_power',   labelKey: 'listing.engine_power',   type: 'number', placeholder: '600' },
    { key: 'fuel_type',   labelKey: 'listing.fuel_type',   type: 'select', options: ['diesel','petrol','electric','gas','hybrid'] },
    { key: 'transmission',labelKey: 'listing.transmission',type: 'select', options: ['manual','automatic'] },
    { key: 'truck_type',  labelKey: 'listing.truck_type',  type: 'select', options: ['semi_truck','box_truck','flatbed','refrigerated','tanker','tipper','curtainsider','other'] },
    { key: 'payload_kg',  labelKey: 'listing.payload_kg',  type: 'number', placeholder: '25000' },
    { key: 'axles',       labelKey: 'listing.axles',       type: 'number', placeholder: '3' },
    { key: 'color',       labelKey: 'listing.color',       type: 'text',   placeholder: '' },
    { key: 'emission_class', labelKey: 'listing.emission_class', type: 'text',   placeholder: 'Euro 6' },
    { key: 'sleeper_cab',  labelKey: 'listing.sleeper_cab',  type: 'select', options: ['sleeper','no_sleeper'] },
    { key: 'axle_config',  labelKey: 'listing.axle_config',  type: 'select', options: ['4x2','6x2','6x4','8x4','4x4'] },
    { key: 'tachograph',   labelKey: 'listing.tachograph',   type: 'select', options: ['digital','analog','none'] },
    { key: 'retarder',     labelKey: 'listing.retarder',     type: 'select', options: ['yes','no'] },
    { key: 'vin',          labelKey: 'listing.vin',          type: 'text',   placeholder: 'WV...' },
  ],
  bus: [
    { key: 'brand',        labelKey: 'listing.brand',        type: 'text',   placeholder: 'Mercedes-Benz', required: true },
    { key: 'model',        labelKey: 'listing.model',        type: 'text',   placeholder: 'Citaro',        required: true },
    { key: 'mileage',      labelKey: 'listing.mileage',      type: 'number', placeholder: '200000',        required: true },
    { key: 'engine_volume',labelKey: 'listing.engine_volume',type: 'number', placeholder: '7' },
    { key: 'engine_power', labelKey: 'listing.engine_power', type: 'number', placeholder: '280' },
    { key: 'fuel_type',    labelKey: 'listing.fuel_type',    type: 'select', options: ['diesel','petrol','electric','gas','hybrid'] },
    { key: 'transmission', labelKey: 'listing.transmission', type: 'select', options: ['manual','automatic'] },
    { key: 'bus_type',     labelKey: 'listing.bus_type',     type: 'select', options: ['minibus','midi','full_size','double_decker','school','tourist'] },
    { key: 'seats',        labelKey: 'listing.seats',        type: 'number', placeholder: '50' },
    { key: 'doors',        labelKey: 'listing.doors',        type: 'number', placeholder: '3' },
    { key: 'color',        labelKey: 'listing.color',        type: 'text',   placeholder: '' },
    { key: 'emission_class',labelKey: 'listing.emission_class', type: 'text', placeholder: 'Euro 6' },
    { key: 'vin',          labelKey: 'listing.vin',          type: 'text',   placeholder: 'WDB...' },
    { key: 'air_conditioning', labelKey: 'listing.air_conditioning', type: 'select', options: ['none','ac','climate_control'] },
    { key: 'luggage_volume',   labelKey: 'listing.luggage_volume',   type: 'number', placeholder: '4000' },
  ],
  boat: [
    { key: 'brand',       labelKey: 'listing.brand',       type: 'text',   placeholder: 'Bayliner', required: true },
    { key: 'model',       labelKey: 'listing.model',       type: 'text',   placeholder: 'VR5',      required: true },
    { key: 'engine_power',labelKey: 'listing.engine_power',type: 'number', placeholder: '150' },
    { key: 'length_m',    labelKey: 'listing.length_m',    type: 'number', placeholder: '7.5' },
    { key: 'fuel_type',   labelKey: 'listing.fuel_type',   type: 'select', options: ['petrol','diesel','electric','sail'] },
    { key: 'boat_type',   labelKey: 'listing.boat_type',   type: 'select', options: ['motorboat','sailboat','yacht','pontoon','speedboat','fishing','inflatable','catamaran','jet_ski','other'] },
    { key: 'color',       labelKey: 'listing.color',       type: 'text',   placeholder: '' },
    { key: 'mileage',     labelKey: 'listing.mileage_hours',type: 'number', placeholder: '500' },
    { key: 'seats',       labelKey: 'listing.seats',       type: 'number', placeholder: '6' },
    { key: 'hull_material',   labelKey: 'listing.hull_material',   type: 'select', options: ['fiberglass','aluminum','wood','steel','other'] },
    { key: 'trailer_included',labelKey: 'listing.trailer_included',type: 'select', options: ['yes','no'] },
    { key: 'ce_category',     labelKey: 'listing.ce_category',     type: 'select', options: ['A','B','C','D'] },
    { key: 'engines_count',   labelKey: 'listing.engines_count',   type: 'number', placeholder: '1' },
    { key: 'vin',             labelKey: 'listing.vin',             type: 'text',   placeholder: 'WBY...' },
  ],
  motorhome: [
    { key: 'brand',       labelKey: 'listing.brand',       type: 'text',   placeholder: 'Knaus',          required: true },
    { key: 'model',       labelKey: 'listing.model',       type: 'text',   placeholder: 'Van TI',         required: true },
    { key: 'mileage',     labelKey: 'listing.mileage',     type: 'number', placeholder: '50000',          required: true },
    { key: 'engine_power',   labelKey: 'listing.engine_power',   type: 'number', placeholder: '140' },
    { key: 'fuel_type',   labelKey: 'listing.fuel_type',   type: 'select', options: ['diesel','petrol','electric','hybrid'] },
    { key: 'transmission',labelKey: 'listing.transmission',type: 'select', options: ['manual','automatic'] },
    { key: 'motorhome_type', labelKey: 'listing.motorhome_type', type: 'select', options: ['alcove','semi_integrated','integrated','van_conversion','campervan','fifth_wheel'] },
    { key: 'berths',      labelKey: 'listing.berths',      type: 'number', placeholder: '4' },
    { key: 'length_m',    labelKey: 'listing.length_m',    type: 'number', placeholder: '7.0' },
    { key: 'color',       labelKey: 'listing.color',       type: 'text',   placeholder: '' },
  ],
  special: [
    { key: 'brand',         labelKey: 'listing.brand',          type: 'text',   placeholder: 'Caterpillar',    required: true },
    { key: 'model',         labelKey: 'listing.model',          type: 'text',   placeholder: '320',            required: true },
    { key: 'mileage',       labelKey: 'listing.mileage_hours',  type: 'number', placeholder: '3000' },
    { key: 'engine_power',     labelKey: 'listing.engine_power',     type: 'number', placeholder: '150' },
    { key: 'fuel_type',     labelKey: 'listing.fuel_type',      type: 'select', options: ['diesel','petrol','electric','gas'] },
    { key: 'equipment_type',labelKey: 'listing.equipment_type', type: 'select', options: ['excavator','bulldozer','crane','loader','tractor','harvester','forklift','compressor','generator','other'] },
    { key: 'color',         labelKey: 'listing.color',          type: 'text',   placeholder: '' },
    { key: 'operating_weight', labelKey: 'listing.operating_weight', type: 'number', placeholder: '20000' },
    { key: 'undercarriage',    labelKey: 'listing.undercarriage',    type: 'select', options: ['tracked','wheeled'] },
    { key: 'payload_kg',       labelKey: 'listing.payload_kg',       type: 'number', placeholder: '5000' },
    { key: 'attachments',      labelKey: 'listing.attachments',      type: 'text',   placeholder: '' },
  ],
};

// Translatable option keys per field
const OPTION_TRANSLATION_PREFIX = {
  fuel_type:       'fuel_types.',
  transmission:    'transmission_types.',
  moto_type:       'moto_types.',
  truck_type:      'truck_types.',
  bus_type:        'bus_types.',
  boat_type:       'boat_types.',
  motorhome_type:  'motorhome_types.',
  equipment_type:  'equipment_types.',
  color:           'colors.',
  sleeper_cab:     'cabin_types.',
  tachograph:      'tachograph_types.',
  retarder:        'yes_no.',
  air_conditioning:'ac_types.',
  hull_material:   'hull_materials.',
  trailer_included:'yes_no.',
  undercarriage:   'undercarriage_types.',
};

// Fallback labels when translation files are missing
const OPTION_FALLBACKS = {
  fuel_types:        { petrol:'Бензин', diesel:'Дизель', electric:'Электро', hybrid:'Гибрид', plugin_hybrid:'Плагин-гибрид', gas:'Газ', sail:'Парусный' },
  transmission_types:{ manual:'Механика', automatic:'Автомат' },
  moto_types:        { sport:'Спорт', naked:'Naked', touring:'Туринг', cruiser:'Крейсер', enduro:'Эндуро', scooter:'Скутер', chopper:'Чоппер', motocross:'Мотокросс', quad:'Квадроцикл' },
  truck_types:       { semi_truck:'Тягач', box_truck:'Фургон', flatbed:'Платформа', refrigerated:'Рефрижератор', tanker:'Цистерна', tipper:'Самосвал', curtainsider:'Тент', other:'Другой' },
  bus_types:         { minibus:'Минибус', midi:'Мидибус', full_size:'Полноразмерный', double_decker:'Двухэтажный', school:'Школьный', tourist:'Туристический' },
  boat_types:        { motorboat:'Моторная лодка', sailboat:'Парусная лодка', yacht:'Яхта', pontoon:'Понтон', speedboat:'Катер', fishing:'Рыболовная', inflatable:'Надувная', catamaran:'Катамаран', jet_ski:'Гидроцикл', other:'Другой' },
  motorhome_types:   { alcove:'Алькобен', semi_integrated:'Полуинтегрированный', integrated:'Интегрированный', van_conversion:'Кемпер-ван', campervan:'Кемпер', fifth_wheel:'Пятое колесо' },
  equipment_types:   { excavator:'Экскаватор', bulldozer:'Бульдозер', crane:'Кран', loader:'Погрузчик', tractor:'Трактор', harvester:'Комбайн', forklift:'Вилочный погрузчик', compressor:'Компрессор', generator:'Генератор', other:'Другой' },
  colors:            { black:'Чёрный', white:'Белый', red:'Красный', blue:'Синий', green:'Зелёный', yellow:'Жёлтый', orange:'Оранжевый', silver:'Серебристый', grey:'Серый', brown:'Коричневый', purple:'Фиолетовый', pink:'Розовый', beige:'Бежевый', other:'Другой' },
  yes_no:            { yes:'Да', no:'Нет' },
  cabin_types:       { sleeper:'Спальник', no_sleeper:'Без спальника' },
  tachograph_types:  { digital:'Цифровой', analog:'Аналоговый', none:'Нет' },
  ac_types:          { none:'Нет', ac:'Кондиционер', climate_control:'Климат-контроль' },
  hull_materials:    { fiberglass:'Стеклопластик', aluminum:'Алюминий', wood:'Дерево', steel:'Сталь', other:'Другой' },
  undercarriage_types:{ tracked:'Гусеничная', wheeled:'Колёсная' },
};

const ICON_MAP = { Info, MapPin, Camera, Sparkles };

const steps = [
  { num: 1, icon: 'Info',    titleKey: 'listing.step_basic' },
  { num: 2, icon: 'MapPin',  titleKey: 'listing.step_location' },
  { num: 3, icon: 'Camera',  titleKey: 'listing.step_photos' },
  { num: 4, icon: 'Sparkles',titleKey: 'listing.step_plan' },
];

const BASE_LISTING_PRICE = 9.99;

export default function OtherVehicleForm({ user, vehicleType, entityName, onBack }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropQueue, setCropQueue] = useState([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [errors, setErrors] = useState({});

  const fields = VEHICLE_FIELDS[vehicleType] || [];

  const initForm = () => {
    const base = { price: '', year: '', description: '', images: [], location: '', country: '' };
    fields.forEach(f => { base[f.key] = ''; });
    return base;
  };

  const [form, setForm] = useState(initForm);

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = (stepNum) => {
    const newErrors = {};
    if (stepNum === 1) {
      const required = fields.filter(f => f.required);
      required.forEach(f => { if (!form[f.key]) newErrors[f.key] = t('listing.err_required', 'Обязательное поле'); });
      if (!form.year) newErrors.year = t('listing.err_year');
      if (!form.price) newErrors.price = t('listing.err_price');
      else {
        const p = parseInt(form.price);
        if (p <= 0) newErrors.price = t('listing.err_price_zero');
        else if (p > 50000000) newErrors.price = t('listing.err_price_large');
      }
      if (form.mileage !== '' && form.mileage != null) {
        const m = parseInt(form.mileage);
        if (m < 0) newErrors.mileage = t('listing.err_mileage_neg');
        else if (m > 2000000) newErrors.mileage = t('listing.err_mileage_large');
      }
    }
    if (stepNum === 2) {
      if (!form.country) newErrors.country = t('listing.err_country');
      if (!form.location) newErrors.location = t('listing.err_location');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    if (!files.length) return;
    setCropQueue(prev => [...prev, ...files.map(f => ({ src: URL.createObjectURL(f) }))]);
  };

  const handleCropDone = async (blob) => {
    setCropQueue(prev => prev.slice(1));
    setUploadingCount(c => c + 1);
    const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
    const result = await base44.integrations.Core.UploadFile({ file });
    if (result?.file_url) setForm(prev => ({ ...prev, images: [...prev.images, result.file_url] }));
    setUploadingCount(c => c - 1);
  };
  const handleCropCancel = () => setCropQueue(prev => prev.slice(1));
  const removeImage = (idx) => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    if (!validate(step)) { toast.error(t('listing.fix_errors')); return; }
    setIsSubmitting(true);
    const data = {
      title: `${form.brand} ${form.model} ${form.year}`,
      ...form,
      year: parseInt(form.year) || undefined,
      price: parseInt(form.price) || 0,
      mileage: form.mileage ? parseInt(form.mileage) : undefined,
      engine_power: form.engine_power ? parseInt(form.engine_power) : undefined,
      engine_volume: form.engine_volume ? parseFloat(form.engine_volume) : undefined,
      payload_kg: form.payload_kg ? parseInt(form.payload_kg) : undefined,
      axles: form.axles ? parseInt(form.axles) : undefined,
      seats: form.seats ? parseInt(form.seats) : undefined,
      berths: form.berths ? parseInt(form.berths) : undefined,
      length_m: form.length_m ? parseFloat(form.length_m) : undefined,
      owners_count: form.owners_count ? parseInt(form.owners_count) : undefined,
      doors: form.doors ? parseInt(form.doors) : undefined,
      luggage_volume: form.luggage_volume ? parseInt(form.luggage_volume) : undefined,
      engines_count: form.engines_count ? parseInt(form.engines_count) : undefined,
      operating_weight: form.operating_weight ? parseInt(form.operating_weight) : undefined,
      seller_type: 'private',
      seller_id: user?.email,
      status: 'active',
      views_count: 0,
    };
    // Remove empty strings
    Object.keys(data).forEach(k => { if (data[k] === '' || data[k] === undefined) delete data[k]; });

    const created = await entities[entityName].create(data);
    setCreatedId(created.id);
    setIsSubmitting(false);
    setStep(4);
    if (user?.email) grantMainBonus(user.email, 'listing_created').catch(() => {});
  };

  const baseCls = "h-11 bg-slate-100 dark:bg-slate-900 border-transparent dark:border-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors focus:border-[rgba(53,0,81,1)] focus:ring-1 focus:ring-[rgba(53,0,81,0.3)] placeholder:text-slate-400";
  const fieldClass = (field) => cn(baseCls, errors[field] && 'border-red-400 focus:border-red-400');
  const triggerClass = (field) => cn(baseCls, errors[field] && 'border-red-400');
  const FieldError = ({ field }) => errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null;

  const countries = COUNTRIES.map(c => t('listing.country_' + c.toLowerCase()));

  const renderField = (field) => {
    const LABEL_FALLBACKS = {
    'listing.brand':          'Марка',
    'listing.model':          'Модель',
    'listing.mileage':        'Пробег (км)',
    'listing.engine_volume':  'Объём двигателя (л)',
    'listing.engine_volume_cc':'Объём двигателя (куб.см)',
    'listing.engine_power':   'Мощность (л.с.)',
    'listing.engine_power_kw':'Мощность (кВт)',
    'listing.fuel_type':      'Тип топлива',
    'listing.transmission':   'Коробка передач',
    'listing.color':          'Цвет',
    'listing.moto_type':      'Тип мотоцикла',
    'listing.truck_type':     'Тип грузовика',
    'listing.bus_type':       'Тип автобуса',
    'listing.boat_type':      'Тип лодки',
    'listing.motorhome_type': 'Тип дома на колёсах',
    'listing.equipment_type': 'Тип техники',
    'listing.payload_kg':     'Грузоподъёмность (кг)',
    'listing.axles':          'Кол-во осей',
    'listing.seats':          'Мест',
    'listing.berths':         'Спальных мест',
    'listing.length_m':       'Длина (м)',
    'listing.mileage_hours':  'Пробег / Моточасы',
    'listing.owners_count':   'Кол-во владельцев',
    'listing.vin':            'VIN номер',
    'listing.emission_class': 'Экологический класс',
    'listing.doors':          'Кол-во дверей',
    'listing.license_category':'Категория прав',
    'listing.abs':             'ABS',
    'listing.sleeper_cab':     'Тип кабины',
    'listing.axle_config':     'Конфигурация осей',
    'listing.tachograph':      'Тахограф',
    'listing.retarder':        'Ретардер / моторный тормоз',
    'listing.air_conditioning':'Кондиционер',
    'listing.luggage_volume':  'Объём багажного отделения (л)',
    'listing.hull_material':   'Материал корпуса',
    'listing.trailer_included':'Прицеп в комплекте',
    'listing.ce_category':     'Категория CE',
    'listing.engines_count':   'Количество двигателей',
    'listing.operating_weight':'Рабочий вес (кг)',
    'listing.undercarriage':   'Ходовая часть',
    'listing.attachments':     'Навесное оборудование',
  };
  const label = t(field.labelKey, LABEL_FALLBACKS[field.labelKey] || field.key);
    if (field.type === 'select') {
      const prefix = OPTION_TRANSLATION_PREFIX[field.key] || '';
      const fallbackMap = prefix ? OPTION_FALLBACKS[prefix.replace('.', '')] || {} : {};
      return (
        <div key={field.key}>
          <Label>{label}{field.required ? ' *' : ''}</Label>
          <Select value={form[field.key]||''} onValueChange={v => updateForm(field.key, v)}>
            <SelectTrigger className={triggerClass(field.key)}><SelectValue placeholder={t('listing.select_type')} /></SelectTrigger>
            <SelectContent>
              {field.options.map(opt => (
                <SelectItem key={opt} value={opt}>{prefix ? t(prefix + opt, fallbackMap[opt] || opt) : opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError field={field.key} />
        </div>
      );
    }
    return (
      <div key={field.key}>
        <Label>{label}{field.required ? ' *' : ''}</Label>
        <Input type={field.type} min={field.type === 'number' ? 0 : undefined} value={form[field.key]||''} onChange={e => updateForm(field.key, e.target.value)} placeholder={field.placeholder||''} className={fieldClass(field.key)} />
        <FieldError field={field.key} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" /> {t('common.back')}
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('listing.title')}</h1>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 mb-6 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => {
              const Icon = ICON_MAP[s.icon];
              return (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center">
                    <div className={cn("w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all", step >= s.num ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                      {step > s.num ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <span className={cn("text-[10px] sm:text-xs mt-1 sm:mt-2 text-center hidden sm:block", step >= s.num ? "text-slate-900 dark:text-white" : "text-slate-400")}>{t(s.titleKey)}</span>
                  </div>
                  {idx < steps.length - 1 && <div className={cn("flex-1 h-1 mx-1 sm:mx-2 rounded-full transition-colors", step > s.num ? "bg-emerald-500" : "bg-slate-100")} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form body */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-100 dark:border-slate-800">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic info */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-5">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('listing.step_basic')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vehicle-specific fields */}
                  {fields.map(f => renderField(f))}

                  {/* Year always shown */}
                  <div>
                    <Label>{t('listing.year')} *</Label>
                    <Select value={form.year} onValueChange={v => updateForm('year', v)}>
                      <SelectTrigger className={triggerClass('year')}><SelectValue placeholder={t('listing.year_placeholder')} /></SelectTrigger>
                      <SelectContent className="max-h-64">{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                    <FieldError field="year" />
                  </div>

                  {/* Price always shown */}
                  <div>
                    <Label>{t('listing.price')} (€) *</Label>
                    <Input type="number" min="1" max="50000000" value={form.price} onChange={e => updateForm('price', e.target.value)} placeholder="5000" className={fieldClass('price')} />
                    <FieldError field="price" />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <Label>{t('listing.condition', 'Состояние')}</Label>
                  <div className="flex gap-3 mt-1">
                    {['new','used'].map(v => (
                      <button key={v} type="button" onClick={() => updateForm('condition', v)} className={cn("flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all", form.condition===v ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400")}>
                        {t('condition_types.' + v, v === 'new' ? 'Новый' : 'Б/у')}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-5">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('listing.step_location')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('listing.country')} *</Label>
                    <Select value={form.country} onValueChange={v => updateForm('country', v)}>
                      <SelectTrigger className={triggerClass('country')}><SelectValue placeholder={t('listing.select_country')} /></SelectTrigger>
                      <SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <FieldError field="country" />
                  </div>
                  <div>
                    <Label>{t('listing.city')} *</Label>
                    <CityAutocomplete
                      country={form.country}
                      value={form.location}
                      onChange={v => updateForm('location', v)}
                      placeholder={t('listing.city_placeholder')}
                      error={!!errors.location}
                    />
                    <FieldError field="location" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Photos & description */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('listing.step_photos')}</h2>
                <div>
                  <Label className="mb-3 block">{t('listing.photos')}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <label className={`aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors ${uploadingCount>0?'pointer-events-none opacity-60':''}`}>
                      {uploadingCount > 0 ? <><Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-1" /><span className="text-xs text-slate-500">{t('listing.uploading')} {uploadingCount}...</span></> : <><Upload className="w-8 h-8 text-slate-400 mb-2" /><span className="text-sm text-slate-500">{t('listing.upload')}</span></>}
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                    </label>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{t('listing.photos_hint')}</p>
                </div>
                {cropQueue.length > 0 && <ImageCropModal imageSrc={cropQueue[0].src} onDone={handleCropDone} onCancel={handleCropCancel} />}
                <div>
                  <Label className="mb-1 block">{t('listing.description')}</Label>
                  <Textarea value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder={t('listing.description_placeholder')} rows={5} className="resize-none" />
                </div>
              </motion.div>
            )}

            {/* Step 4: Done / Plan */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-6">
                {paymentSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6"><Check className="w-12 h-12 text-emerald-500" /></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('listing.published_title')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">{t('listing.published_desc')}</p>
                    <button onClick={() => window.location.href = '/VehicleCatalog?type=' + (entityName?.toLowerCase() || '')} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">{t('listing.view_listing')} →</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('listing.choose_plan')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{t('listing.choose_plan_desc')}</p>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{t('listing.base_plan')}</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">{BASE_LISTING_PRICE}€ / 30 {t('listing.days')}</div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t('listing.base_plan_desc')}</p>
                      <ul className="space-y-1">{[t('listing.feat_1'),t('listing.feat_2'),t('listing.feat_3'),t('listing.feat_4'),t('listing.feat_5')].map(f => <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><Check className="w-4 h-4 text-slate-400 flex-shrink-0" />{f}</li>)}</ul>
                    </div>
                    <div className="pt-2">
                      <Button onClick={() => setPaymentSuccess(true)} className="w-full h-12 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-base gap-2">
                        {t('listing.pay_publish', { price: BASE_LISTING_PRICE.toFixed(2) })}
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {step < 4 && !paymentSuccess && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="gap-2 dark:border-slate-700 dark:text-slate-300">
                <ArrowLeft className="w-4 h-4" /> {t('common.back')}
              </Button>
              {step < 3 ? (
                <Button onClick={() => { if(validate(step)) setStep(s => s+1); else toast.error(t('listing.fix_errors')); }} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                  {t('listing.next')} <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {t('listing.next_plan')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}