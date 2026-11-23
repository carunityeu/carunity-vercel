import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, ArrowRight, Upload, X, Car, Info, MapPin, Camera,
  Sparkles, Check, Loader2, Zap, RotateCcw, Lock, Star, Gift, Handshake, BadgeCheck,
} from 'lucide-react';
import { DamagedIcon } from '@/components/ui/QuickNavIcons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getModelsForBrand } from '@/utils/carData';
import { checkIfPremiumCar } from '@/utils/premiumCarMatcher';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LicensePlateInput from '@/components/cars/LicensePlateInput';
import LicensePlateAutoFill from '@/components/listings/LicensePlateAutoFill';
import ImageCropModal from '@/components/listings/ImageCropModal';
import DescriptionTranslator from '@/components/listings/DescriptionTranslator';
import CityAutocomplete from '@/components/listings/CityAutocomplete';
import { grantMainBonus } from '@/lib/referralUtils';
import { ensureShortId } from '@/lib/shortIdUtils';
import { generateListingConfirmationEmail, getListingEmailItemLabels, getListingEmailSubject } from '@/lib/listingConfirmationEmail';

const carBrands = [
  'Abarth','Acura','Aiways','Alfa Romeo','Alpine','Arcfox','Ariel','Aston Martin','Audi','BAIC',
  'Baojun','Bentley','BMW','Brilliance','Bugatti','Buick','BYD','BYTON','Cadillac','Changan',
  'Chery','Chevrolet','Chrysler','Citroën','Cupra','Daihatsu','Datsun','DeLorean','Dodge',
  'Dongfeng','DS','Exeed','FAW','Ferrari','Fiat','Fisker','Ford','Foton','GAC','Geely',
  'Genesis','GMC','Great Wall','Haval','Honda','Hongqi','Hummer','Hyundai','Ineos','Infiniti',
  'Isuzu','JAC','Jaguar','Jeep','Kia','Koenigsegg','Lada','Lamborghini','Lancia','Land Rover',
  'Leapmotor','Lexus','Li Auto','Lifan','Lincoln','Lotus','Lucid','Mahindra','Maserati','Maybach',
  'Mazda','McLaren','Mercedes-Benz','MG','Mini','Mitsubishi','NIO','Nissan','Oldsmobile','Opel',
  'Pagani','Peugeot','Perodua','Polestar','Pontiac','Porsche','Proton','Ram','Renault','Rivian',
  'Rolls-Royce','Saab','Scion','Seat','Skoda','Skywell','Smart','SsangYong','Subaru','Suzuki',
  'Tata','Tesla','Toyota','Vauxhall','VinFast','Volkswagen','Volvo','Wey','XPeng','ZEEKR',
];

const FUEL_VALUES = ['petrol','diesel','electric','hybrid','plugin_hybrid','gas','petrol_cng','petrol_lng','diesel_cng','diesel_lng','lpg','cng','lng','hydrogen','ethanol'];
const BODY_VALUES = ['sedan','hatchback','suv','crossover','wagon','coupe','convertible','minivan','pickup'];
const TRANSMISSION_VALUES = ['manual','automatic'];
const DRIVE_VALUES = ['fwd','rwd','awd'];
const COLOR_KEYS = ['white','black','grey','silver','blue','red','green','brown','beige','yellow','orange','other'];
const COUNTRIES = ['Latvia','Lithuania','Estonia'];
const INTERIOR_MATERIALS = ['alcantara','leather','partial_leather','fabric','velour','other'];
const ECO_STICKERS = ['2','3','4','5'];
const INTERIOR_COLORS = ['black','gray','brown','beige','red','blue','green','yellow','orange','white'];

const FEATURE_KEYS = {
  interior: ['leather_interior','velour_interior','alcantara','heated_seats','ventilated_seats','massage_seats','heated_steering','electric_seats','memory_seats','sport_seats','sunroof','panoramic_roof','glass_roof','climate_control','dual_zone_climate','triple_zone_climate','ac','rear_heated_seats','third_row','wood_trim'],
  multimedia: ['navigation','carplay','bluetooth','usb','aux','wireless_charging','wifi','audio_system','bose','harman_kardon','bang_olufsen','digital_dash','hud','rear_monitor','dvd_tv'],
  safety: ['abs','esp','airbags','lane_assist','auto_emergency_braking','blind_spot','adaptive_cruise','side_airbags','front_airbags','knee_airbags','pedestrian_warning','fatigue_sensor','lane_departure','night_vision','sign_recognition','parking_assist','auto_parking'],
  exterior: ['alloy_wheels','winter_tires','summer_tires','second_tires','front_parktronic','rear_parktronic','rear_camera','camera_360','electric_trunk','tow_bar','roof_rails','side_steps','spoiler','xenon','led','matrix_lights','adaptive_light','headlight_washers','tinting','chrome','heated_mirrors','folding_mirrors'],
  suspension: ['air_suspension','adaptive_suspension','sport_suspension','lowered_suspension','diff_lock','electronic_diff','drive_modes','regenerative_braking'],
  other: ['cruise_control','electric_windows','electric_mirrors','keyless','remote_start','alarm','immobilizer','spare_wheel','space_saver','tow_hook','engine_guard','floor_mats','trunk_mats','window_deflectors'],
  extras: ['camera_360','auto_start_stop','auto_dimming_mirror','climate_auto','climate_2zone','climate_3zone','climate_4zone','auto_tailgate','auto_high_beams','led_headlights','android_auto','rain_sensor','light_sensor','fog_lights','xenon_lights','heated_windshield','winter_package','smoker_package','parking_sensors','ambient_lighting','premium_sound','privacy_glass','tinted_windows','keyless_entry','power_mirror','heated_wheel'],
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

const BOOST_OPTIONS = [
  { days: 1, price: 1.99 }, { days: 3, price: 4.99 }, { days: 7, price: 9.99 },
  { days: 14, price: 17.99 }, { days: 30, price: 29.99 },
];
const BASE_LISTING_PRICE = 9.99;
const TOP_SPOT_PRICE = 79;

export default function CarForm({ user, dealerId, onBack }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [cropQueue, setCropQueue] = useState([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedBoost, setSelectedBoost] = useState(null);
  const [addTopSpot, setAddTopSpot] = useState(false);
  const [createdCarId, setCreatedCarId] = useState(null);
  const [errors, setErrors] = useState({});
  const [descTranslations, setDescTranslations] = useState({});
  const [fillMode, setFillMode] = useState('manual'); // 'manual' | 'plate'

  const [form, setForm] = useState({
    brand:'',model:'',year:'',month_of_manufacture:'',price:'',mileage:'',fuel_type:'',
    transmission:'',body_type:'',drive_type:'',color:'',engine_volume:'',engine_power:'',
    seller_phone:'',
    vin:'',license_plate:'',description:'',images:[],engine_volume_cc:'',length_mm:'',
    width_mm:'',height_mm:'',wheelbase_mm:'',clearance_mm:'',weight_empty_kg:'',
    weight_max_kg:'',max_speed_kmh:'',co2_emissions:'',fuel_consumption_city:'',
    fuel_consumption_highway:'',fuel_consumption_combined:'',energy_consumption:'',transmission_type:'',
    trim_level:'',doors:'',power_to_weight:'',fuel_tank_volume:'',trunk_volume:'',
    acceleration_0_100:'',location:'',country:'',features:[],technical_inspection_until:'',
    is_premium:false,exclusive_listing:false,dealer_distribution_mode:'none',is_damaged:false,
    get_offers_enabled:false,fast_sale_enabled:false,
    color_interior:'',interior_material:'',metallic:false,condition:'',seats:'',owners_count:'',
    eco_sticker:'',particulate_filter:false,warranty:false,service_book:false,non_smoker:false,vat_deductible:false,
  });

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateStep = (stepNum) => {
    const newErrors = {};
    if (stepNum === 1) {
      if (!form.brand) newErrors.brand = t('listing.err_brand');
      if (!form.model) newErrors.model = t('listing.err_model');
      if (!form.year) newErrors.year = t('listing.err_year');
      if (!form.price) { newErrors.price = t('listing.err_price'); }
      else {
        const p = parseInt(form.price);
        if (p <= 0) newErrors.price = t('listing.err_price_zero');
        else if (p > 50000000) newErrors.price = t('listing.err_price_large');
      }
    }
    if (stepNum === 2) {
      if (!form.fuel_type) newErrors.fuel_type = t('listing.err_fuel');
      if (!form.transmission) newErrors.transmission = t('listing.err_transmission');
      if (!form.mileage && form.mileage !== '0') { newErrors.mileage = t('listing.err_mileage'); }
      else {
        const m = parseInt(form.mileage);
        if (m < 0) newErrors.mileage = t('listing.err_mileage_neg');
        else if (m > 2000000) newErrors.mileage = t('listing.err_mileage_large');
      }
    }
    if (stepNum === 3) {
      if (!form.country) newErrors.country = t('listing.err_country');
      if (!form.location) newErrors.location = t('listing.err_location');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleFeature = (feature) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(feature) ? prev.features.filter(f => f !== feature) : [...prev.features, feature],
    }));
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
  const removeImage = (index) => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const handleSubmit = async () => {
    if (!validateStep(step)) { toast.error(t('listing.fix_errors')); return; }
    setIsSubmitting(true);
    const carData = {
      title: `${form.brand} ${form.model} ${form.year}`,
      brand: form.brand, model: form.model, year: parseInt(form.year),
      month_of_manufacture: form.month_of_manufacture ? parseInt(form.month_of_manufacture) : null,
      price: parseInt(form.price), mileage: parseInt(form.mileage) || 0,
      fuel_type: form.fuel_type, transmission: form.transmission, body_type: form.body_type,
      drive_type: form.drive_type, color: form.color,
      engine_volume: form.engine_volume ? parseFloat(form.engine_volume) : null,
      engine_power: form.engine_power ? (form.powerUnit === 'kw' ? Math.round(parseFloat(form.engine_power) / 0.7355) : parseInt(form.engine_power)) : null,
      vin: form.vin, license_plate: form.license_plate || null,
      engine_volume_cc: form.engine_volume_cc ? parseInt(form.engine_volume_cc) : null,
      length_mm: form.length_mm ? parseInt(form.length_mm) : null,
      width_mm: form.width_mm ? parseInt(form.width_mm) : null,
      height_mm: form.height_mm ? parseInt(form.height_mm) : null,
      wheelbase_mm: form.wheelbase_mm ? parseInt(form.wheelbase_mm) : null,
      clearance_mm: form.clearance_mm ? parseInt(form.clearance_mm) : null,
      weight_empty_kg: form.weight_empty_kg ? parseInt(form.weight_empty_kg) : null,
      weight_max_kg: form.weight_max_kg ? parseInt(form.weight_max_kg) : null,
      max_speed_kmh: form.max_speed_kmh ? parseInt(form.max_speed_kmh) : null,
      co2_emissions: form.co2_emissions ? parseInt(form.co2_emissions) : null,
      fuel_consumption_city: form.fuel_consumption_city ? parseFloat(form.fuel_consumption_city) : null,
      fuel_consumption_highway: form.fuel_consumption_highway ? parseFloat(form.fuel_consumption_highway) : null,
      fuel_consumption_combined: form.fuel_consumption_combined ? parseFloat(form.fuel_consumption_combined) : null,
      // kWh/100km — kept only for electric cars
      energy_consumption: form.fuel_type === 'electric' && form.energy_consumption ? parseFloat(form.energy_consumption) : null,
      transmission_type: form.transmission_type || null, trim_level: form.trim_level || null,
      doors: form.doors ? parseInt(form.doors) : null,
      power_to_weight: form.power_to_weight ? parseFloat(form.power_to_weight) : null,
      fuel_tank_volume: form.fuel_tank_volume ? parseInt(form.fuel_tank_volume) : null,
      trunk_volume: form.trunk_volume ? parseInt(form.trunk_volume) : null,
      acceleration_0_100: form.acceleration_0_100 ? parseFloat(form.acceleration_0_100) : null,
      engine_code: form.engine_code || null, fuel_system: form.fuel_system || null,
      turbo_type: form.turbo_type || null, engine_layout: form.engine_layout || null,
      car_class: form.car_class || null, emission_class: form.emission_class || null,
      front_suspension: form.front_suspension || null, rear_suspension: form.rear_suspension || null,
      front_brakes: form.front_brakes || null, rear_brakes: form.rear_brakes || null,
      description: form.description,
      description_en: descTranslations.en || null, description_ru: descTranslations.ru || null,
      description_et: descTranslations.et || null, description_lv: descTranslations.lv || null,
      description_lt: descTranslations.lt || null, description_de: descTranslations.de || null,
      description_fi: descTranslations.fi || null, description_pl: descTranslations.pl || null,
      images: form.images, location: form.location, country: form.country,
      features: form.features, technical_inspection_until: form.technical_inspection_until,
      is_premium: addTopSpot, is_auto_premium: checkIfPremiumCar({ brand: form.brand, model: form.model, trim_level: form.trim_level, year: parseInt(form.year), engine_volume: form.engine_volume ? parseFloat(form.engine_volume) : (form.engine_volume_cc ? parseInt(form.engine_volume_cc) / 1000 : null), engine_power: form.engine_power ? (form.powerUnit === 'kw' ? Math.round(parseFloat(form.engine_power) / 0.7355) : parseInt(form.engine_power)) : null, engine_code: form.engine_code, title: `${form.brand} ${form.model} ${form.year}` }), exclusive_listing: form.exclusive_listing, is_damaged: form.is_damaged,
      dealer_distribution_mode: form.dealer_distribution_mode || 'none',
      get_offers_enabled: form.get_offers_enabled || false,
      fast_sale_enabled: form.fast_sale_enabled || false,
      color_interior: form.color_interior || null, interior_material: form.interior_material || null,
      metallic: form.metallic || false, condition: form.condition || null,
      seats: form.seats ? parseInt(form.seats) : null, owners_count: form.owners_count ? parseInt(form.owners_count) : null,
      eco_sticker: form.eco_sticker || null, particulate_filter: form.particulate_filter || false,
      warranty: form.warranty || false, service_book: form.service_book || false,
      non_smoker: form.non_smoker || false, vat_deductible: form.vat_deductible || false,
      seller_phone: !dealerId && form.seller_phone ? form.seller_phone : null,
      seller_type: dealerId ? 'dealer' : 'private', seller_id: user?.email, dealer_id: dealerId || user?.dealer_id || null,
      status: 'active', views_count: 0,
    };
    const created = await entities.Car.create(carData);
    setCreatedCarId(created.id);
    setIsSubmitting(false);
    setStep(6);
    // Grant referral main bonus if this user was referred
    if (user?.email) grantMainBonus(user.email, 'listing_created').catch(() => {});
  };

  // Send the "Your listing is now active" confirmation email with receipt
  const sendConfirmationEmail = async () => {
    if (!user?.email || !createdCarId) return;
    try {
      const car = await entities.Car.get(createdCarId);
      const shortId = car.short_id || await ensureShortId(car);
      const listingUrl = shortId
        ? `${window.location.origin}/cardetails/${shortId}`
        : `${window.location.origin}/CarDetails?id=${createdCarId}`;
      const dashboardUrl = `${window.location.origin}/Dashboard`;

      const basePrice = form.is_damaged ? 0 : 9.99;
      const topSpotPrice = addTopSpot ? 79 : 0;
      const boostPrice = selectedBoost ? selectedBoost.price : 0;
      const gross = basePrice + topSpotPrice + boostPrice;
      const subtotalNet = gross / 1.24;
      const vatAmount = gross - subtotalNet;

      const lang = user?.preferred_language || localStorage.getItem('i18nextLng')?.split('-')[0] || 'ru';
      const labels = getListingEmailItemLabels(lang);

      const emailItems = [
        { service: labels.baseListing, amount: labels.days(30), price: `${basePrice.toFixed(2)}€` },
        { service: labels.topSpot, amount: addTopSpot ? labels.days(7) : '—', price: addTopSpot ? `${topSpotPrice.toFixed(2)}€` : '—' },
        { service: labels.boost, amount: selectedBoost ? labels.days(selectedBoost.days) : '—', price: selectedBoost ? `${boostPrice.toFixed(2)}€` : '—' },
        { service: labels.targeting, amount: '—', price: '—' },
      ];

      const html = generateListingConfirmationEmail({
        lang,
        carTitle: `${form.brand} ${form.model} ${form.year}`,
        carImage: form.images?.[0] || null,
        listingUrl,
        dashboardUrl,
        items: emailItems,
        subtotal: `${subtotalNet.toFixed(2)}€`,
        vat: `${vatAmount.toFixed(2)}€`,
        total: `${gross.toFixed(2)}€`,
      });

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: getListingEmailSubject(lang),
        html,
      });
    } catch (e) {
      console.error('Failed to send confirmation email:', e);
    }
  };

  const getTotalPrice = () => {
    let total = form.is_damaged ? 0 : BASE_LISTING_PRICE;
    if (selectedBoost) total += selectedBoost.price;
    if (addTopSpot) total += TOP_SPOT_PRICE;
    return total.toFixed(2);
  };

  const fuelTypes = FUEL_VALUES.map(v => ({ value: v, label: t('fuel_types.' + v) }));
  const bodyTypes = BODY_VALUES.map(v => ({ value: v, label: t('body_types.' + v) }));
  const transmissionTypes = TRANSMISSION_VALUES.map(v => ({ value: v, label: t('transmission_types.' + v) }));
  const driveTypes = DRIVE_VALUES.map(v => ({ value: v, label: t('drive_types.' + v) }));
  const colors = COLOR_KEYS;
  const countries = COUNTRIES.map(c => t('listing.country_' + c.toLowerCase()));

  const featureSections = [
    { titleKey: 'features.interior', keys: FEATURE_KEYS.interior },
    { titleKey: 'features.multimedia', keys: FEATURE_KEYS.multimedia },
    { titleKey: 'features.safety', keys: FEATURE_KEYS.safety },
    { titleKey: 'features.exterior', keys: FEATURE_KEYS.exterior },
    { titleKey: 'features.suspension', keys: FEATURE_KEYS.suspension },
    { titleKey: 'features.other', keys: FEATURE_KEYS.other },
    { titleKey: 'features.extras', keys: FEATURE_KEYS.extras },
  ].map(s => ({ title: t(s.titleKey), items: s.keys.map(k => t('feature_items.' + k, k)) }));

  const steps = [
    { num: 1, title: t('listing.step_basic'), icon: Car },
    { num: 2, title: t('listing.step_tech'), icon: Info },
    { num: 3, title: t('listing.step_location'), icon: MapPin },
    { num: 4, title: t('listing.step_additional', 'Дополнительные опции'), icon: Zap },
    { num: 5, title: t('listing.step_photos'), icon: Camera },
    { num: 6, title: t('listing.step_plan'), icon: Sparkles },
  ].filter(s => !(dealerId && s.num === 4));

  // Dealers skip the "Additional Options" step (4) — jump from 3 → 5
  const goNextStep = (s) => dealerId && s === 3 ? 5 : s + 1;
  const goPrevStep = (s) => dealerId && s === 5 ? 3 : Math.max(1, s - 1);

  const FieldError = ({ field }) => errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null;
  const baseCls = "h-11 bg-slate-100 dark:bg-slate-900 border-transparent dark:border-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors focus:border-[rgba(53,0,81,1)] focus:ring-1 focus:ring-[rgba(53,0,81,0.3)] placeholder:text-slate-400";
  const fieldClass = (field) => cn(baseCls, errors[field] && 'border-red-400 focus:border-red-400');
  const triggerClass = (field) => cn(baseCls, errors[field] && 'border-red-400');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" /> {t('common.back')}
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('listing.title')}</h1>
        </div>

        {/* Progress Steps */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 mb-6 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={cn("w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all", step >= s.num ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                    {step > s.num ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <span className={cn("text-[10px] sm:text-xs mt-1 sm:mt-2 text-center hidden sm:block", step >= s.num ? "text-slate-900 dark:text-white" : "text-slate-400")}>{s.title}</span>
                </div>
                {idx < steps.length - 1 && <div className={cn("flex-1 h-1 mx-1 sm:mx-2 rounded-full transition-colors", step > s.num ? "bg-emerald-500" : "bg-slate-100")} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-100 dark:border-slate-800">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('listing.step_basic')}</h2>

                {/* Fill mode toggle */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setFillMode('manual')}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                      fillMode === 'manual'
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    {t('listing.fill_manual', 'Заполнить вручную')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFillMode('plate')}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                      fillMode === 'plate'
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    {t('listing.fill_by_plate', 'По номеру авто')}
                  </button>
                </div>

                {/* Plate autofill block */}
                {fillMode === 'plate' && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t('listing.plate_autofill_hint', 'Введите государственный номерной знак — мы автоматически заполним марку, модель, год, двигатель и другие данные из реестра.')}
                    </p>
                    <LicensePlateAutoFill
                      onDataFilled={(data) => {
                        setForm(prev => ({ ...prev, ...data }));
                        setFillMode('manual');
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                      <span className="text-xs text-slate-400">{t('listing.or_fill_manual', 'или заполните вручную ниже')}</span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>{t('listing.brand')} *</Label>
                    <Select value={form.brand} onValueChange={v => updateForm('brand', v)}>
                      <SelectTrigger className={triggerClass('brand')}><SelectValue placeholder={t('listing.select_brand')} /></SelectTrigger>
                      <SelectContent className="max-h-64">{carBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                    <FieldError field="brand" />
                  </div>

                  <div>
                    <Label>{t('listing.model')} *</Label>
                    {(() => {
                      const models = getModelsForBrand(form.brand);
                      if (!models.length) return <Input value={form.model} onChange={e => updateForm('model', e.target.value)} placeholder={t('listing.model_placeholder')} className={fieldClass('model')} />;
                      const isCustom = form.model && !models.includes(form.model);
                      return (
                        <div className="space-y-2">
                          <Select value={isCustom ? '__custom__' : (form.model || '')} onValueChange={v => updateForm('model', v === '__custom__' ? '' : v)}>
                            <SelectTrigger className={triggerClass('model')}><SelectValue placeholder={t('listing.select_model')} /></SelectTrigger>
                            <SelectContent className="max-h-64">
                              {models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                              <SelectItem value="__custom__">✏️ {t('listing.enter_manual')}</SelectItem>
                            </SelectContent>
                          </Select>
                          {(isCustom || form.model === '') && <Input value={isCustom ? form.model : ''} onChange={e => updateForm('model', e.target.value)} placeholder={t('listing.model_manual_placeholder')} className={fieldClass('model')} autoFocus />}
                        </div>
                      );
                    })()}
                    <FieldError field="model" />
                  </div>

                  <div>
                    <Label>{t('listing.year')} *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={form.month_of_manufacture?.toString() || ''} onValueChange={v => updateForm('month_of_manufacture', v)}>
                        <SelectTrigger className={baseCls}><SelectValue placeholder={t('listing.month')} /></SelectTrigger>
                        <SelectContent>
                          {[t('months.jan'),t('months.feb'),t('months.mar'),t('months.apr'),t('months.may'),t('months.jun'),t('months.jul'),t('months.aug'),t('months.sep'),t('months.oct'),t('months.nov'),t('months.dec')].map((m,i) => <SelectItem key={i+1} value={(i+1).toString()}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={form.year} onValueChange={v => updateForm('year', v)}>
                        <SelectTrigger className={triggerClass('year')}><SelectValue placeholder={t('listing.year_placeholder')} /></SelectTrigger>
                        <SelectContent className="max-h-64">{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <FieldError field="year" />
                  </div>

                  <div>
                    <Label>{t('listing.price')} (€) *</Label>
                    <Input type="number" value={form.price} onChange={e => updateForm('price', e.target.value)} placeholder="15000" className={fieldClass('price')} />
                    <FieldError field="price" />
                  </div>

                  <div>
                    <Label>{t('listing.body_type')}</Label>
                    <Select value={form.body_type} onValueChange={v => updateForm('body_type', v)}>
                      <SelectTrigger className={baseCls}><SelectValue placeholder={t('listing.select_type')} /></SelectTrigger>
                      <SelectContent>{bodyTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('listing.color')}</Label>
                    <Select value={form.color} onValueChange={v => updateForm('color', v)}>
                      <SelectTrigger className={baseCls}><SelectValue placeholder={t('listing.select_color')} /></SelectTrigger>
                      <SelectContent>{colors.map(c => <SelectItem key={c} value={c}>{t('colors.' + c, c)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('listing.step_tech')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>{t('listing.mileage')} ({t('listing.km', 'km')}) *</Label>
                    <Input type="number" value={form.mileage} onChange={e => updateForm('mileage', e.target.value)} placeholder="150000" className={fieldClass('mileage')} />
                    <FieldError field="mileage" />
                  </div>
                  <div>
                    <Label>{t('listing.fuel_type')} *</Label>
                    <Select value={form.fuel_type} onValueChange={v => updateForm('fuel_type', v)}>
                      <SelectTrigger className={triggerClass('fuel_type')}><SelectValue placeholder={t('listing.select_type')} /></SelectTrigger>
                      <SelectContent>{fuelTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FieldError field="fuel_type" />
                  </div>
                  <div>
                    <Label>{t('listing.transmission')} *</Label>
                    <Select value={form.transmission} onValueChange={v => updateForm('transmission', v)}>
                      <SelectTrigger className={triggerClass('transmission')}><SelectValue placeholder={t('listing.select_type')} /></SelectTrigger>
                      <SelectContent>{transmissionTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FieldError field="transmission" />
                  </div>
                  <div>
                    <Label>{t('listing.drive_type')}</Label>
                    <Select value={form.drive_type} onValueChange={v => updateForm('drive_type', v)}>
                      <SelectTrigger className={baseCls}><SelectValue placeholder={t('listing.select_type')} /></SelectTrigger>
                      <SelectContent>{driveTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('listing.engine_volume')}</Label>
                    <Input type="number" step="0.1" value={form.engine_volume} onChange={e => updateForm('engine_volume', e.target.value)} placeholder="2.0" className={fieldClass('engine_volume')} />
                    <FieldError field="engine_volume" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label>{t('listing.engine_power')}</Label>
                      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                        {[['kw',t('car.kw','kW')],['hp',t('car.hp','hp')]].map(([val,label]) => (
                          <button key={val} type="button" onClick={() => updateForm('powerUnit', val)} className={cn("px-2 py-0.5 rounded-md text-xs font-medium transition-colors", (form.powerUnit||'hp')===val ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500")}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <Input type="number" value={form.engine_power} onChange={e => updateForm('engine_power', e.target.value)} placeholder={(form.powerUnit||'kw')==='kw' ? `110 ${t('car.kw','kW')}` : `150 ${t('car.hp','hp')}`} className={fieldClass('engine_power')} />
                    <FieldError field="engine_power" />
                    {form.engine_power && !errors.engine_power && (
                      <p className="text-xs text-slate-400 mt-1">{(form.powerUnit||'kw')==='kw' ? `≈ ${Math.round(parseFloat(form.engine_power)/0.7355)} ${t('car.hp')}` : `≈ ${Math.round(parseFloat(form.engine_power)*0.7355)} ${t('car.kw')}`}</p>
                    )}
                  </div>
                  <div>
                    <Label>{t('listing.vin')}</Label>
                    <Input value={form.vin} onChange={e => updateForm('vin', e.target.value)} placeholder="WVWZZZ3CZWE123456" className={baseCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-2 block">{t('listing.plate')}</Label>
                    <LicensePlateInput value={form.license_plate} onChange={v => updateForm('license_plate', v)} />
                    <p className="text-xs text-slate-400 mt-1">{t('listing.plate_hint')}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>{t('listing.tech_inspection')}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <select value={form.technical_inspection_until ? new Date(form.technical_inspection_until+'-01').getMonth()+1 : ''} onChange={e => { const month=e.target.value; const year=form.technical_inspection_until ? form.technical_inspection_until.split('-')[0] : new Date().getFullYear(); if(month) updateForm('technical_inspection_until',`${year}-${String(month).padStart(2,'0')}-01`); }} className="h-11 rounded-xl border-0 bg-slate-100 dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[rgba(53,0,81,0.3)]">
                        <option value="">{t('listing.month')}</option>
                        {[t('months.jan'),t('months.feb'),t('months.mar'),t('months.apr'),t('months.may'),t('months.jun'),t('months.jul'),t('months.aug'),t('months.sep'),t('months.oct'),t('months.nov'),t('months.dec')].map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
                      </select>
                      <select value={form.technical_inspection_until ? form.technical_inspection_until.split('-')[0] : ''} onChange={e => { const year=e.target.value; const parts=form.technical_inspection_until ? form.technical_inspection_until.split('-') : ['','01','01']; const month=parts[1]||'01'; if(year) updateForm('technical_inspection_until',`${year}-${month}-01`); }} className="h-11 rounded-xl border-0 bg-slate-100 dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[rgba(53,0,81,0.3)]">
                        <option value="">{t('listing.year_placeholder')}</option>
                        {Array.from({length:10},(_,i) => new Date().getFullYear()+i).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mb-4">{t('listing.extra_tech')}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      [t('car.spec_engine_cc'),'engine_volume_cc','number','1998'],
                      [t('car.spec_length'),'length_mm','number','4720'],
                      [t('car.spec_width'),'width_mm','number','1850'],
                      [t('car.spec_height'),'height_mm','number','1440'],
                      [t('car.spec_wheelbase'),'wheelbase_mm','number','2850'],
                      [t('car.spec_clearance'),'clearance_mm','number','155'],
                      [t('car.spec_weight_empty'),'weight_empty_kg','number','1450'],
                      [t('car.spec_weight_max'),'weight_max_kg','number','1950'],
                      [t('car.spec_max_speed'),'max_speed_kmh','number','240'],
                      [t('car.spec_co2'),'co2_emissions','number','135'],
                      [t('car.spec_fuel_city'),'fuel_consumption_city','number','9.5'],
                      [t('car.spec_fuel_highway'),'fuel_consumption_highway','number','6.2'],
                      [t('car.spec_fuel_combined'),'fuel_consumption_combined','number','7.4'],
                      // Electric cars only: consumption in kWh/100 km
                      ...(form.fuel_type === 'electric' ? [[t('car.energy_consumption'),'energy_consumption','number','18.5']] : []),
                      [t('car.spec_transmission_type'),'transmission_type','text','AT8'],
                      [t('car.spec_trim'),'trim_level','text','Sport Line'],
                      [t('car.spec_doors'),'doors','number','4'],
                      [t('car.spec_tank'),'fuel_tank_volume','number','60'],
                      [t('car.spec_trunk'),'trunk_volume','number','470'],
                      [t('car.spec_acceleration'),'acceleration_0_100','number','7.2'],
                      [t('listing.engine_code'),'engine_code','text','N46B20'],
                      [t('listing.fuel_system'),'fuel_system','text',''],
                      [t('listing.turbo_type'),'turbo_type','text',''],
                      [t('listing.engine_layout'),'engine_layout','text',''],
                      [t('listing.car_class'),'car_class','text','D'],
                      [t('listing.emission_class'),'emission_class','text','Euro 6'],
                      [t('listing.front_suspension'),'front_suspension','text',''],
                      [t('listing.rear_suspension'),'rear_suspension','text',''],
                      [t('listing.front_brakes'),'front_brakes','text',''],
                      [t('listing.rear_brakes'),'rear_brakes','text',''],
                    ].map(([label,field,type,placeholder]) => (
                      <div key={field}>
                        <Label className="text-xs">{label}</Label>
                        <Input type={type} value={form[field]||''} onChange={e => updateForm(field, e.target.value)} placeholder={placeholder} className={cn(baseCls,'mt-1')} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <Label className="mb-4 block">{t('listing.equipment')}</Label>
                  <div className="space-y-5">
                    {featureSections.map(section => (
                      <div key={section.title}>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{section.title}</p>
                        <div className="flex flex-wrap gap-2">
                          {section.items.map(feature => (
                            <button key={feature} type="button" onClick={() => toggleFeature(feature)} className={cn("px-3 py-1.5 rounded-full text-sm transition-colors", form.features.includes(feature) ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600")}>{feature}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Input placeholder={t('listing.add_custom_feature')} id="customFeatureInput" onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();const val=e.target.value.trim();if(val&&!form.features.includes(val)){toggleFeature(val);e.target.value='';}}} } className="flex-1" />
                    <Button type="button" variant="outline" size="sm" onClick={() => { const input=document.getElementById('customFeatureInput');const val=input?.value?.trim();if(val&&!form.features.includes(val)){toggleFeature(val);input.value='';} }}>{t('listing.add')}</Button>
                  </div>
                </div>

                {/* Additional parameters */}
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mb-4">{t('listing.section_extra')}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {/* Condition (free text) */}
                    <div className="sm:col-span-1">
                      <Label className="text-xs">{t('listing.condition_field')}</Label>
                      <Input value={form.condition} onChange={e => updateForm('condition', e.target.value)} placeholder={t('listing.condition_placeholder')} className={cn(baseCls,'mt-1')} />
                    </div>
                    {/* Seats */}
                    <div>
                      <Label className="text-xs">{t('listing.seats_field')}</Label>
                      <Input type="number" value={form.seats} onChange={e => updateForm('seats', e.target.value)} placeholder="5" className={cn(baseCls,'mt-1')} />
                    </div>
                    {/* Owners count */}
                    <div>
                      <Label className="text-xs">{t('listing.owners_count_field')}</Label>
                      <Input type="number" value={form.owners_count} onChange={e => updateForm('owners_count', e.target.value)} placeholder="1" className={cn(baseCls,'mt-1')} />
                    </div>
                    {/* Interior color */}
                    <div>
                      <Label className="text-xs">{t('listing.color_interior')}</Label>
                      <Select value={form.color_interior} onValueChange={v => updateForm('color_interior', v)}>
                        <SelectTrigger className={cn(baseCls,'mt-1')}><SelectValue placeholder={t('listing.select_color')} /></SelectTrigger>
                        <SelectContent>{INTERIOR_COLORS.map(c => <SelectItem key={c} value={c}>{t('colors.' + c, c)}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    {/* Interior material */}
                    <div>
                      <Label className="text-xs">{t('listing.interior_material')}</Label>
                      <Select value={form.interior_material} onValueChange={v => updateForm('interior_material', v)}>
                        <SelectTrigger className={cn(baseCls,'mt-1')}><SelectValue placeholder={t('listing.select_type')} /></SelectTrigger>
                        <SelectContent>{INTERIOR_MATERIALS.map(m => <SelectItem key={m} value={m}>{t('interior_materials.' + m, m)}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    {/* Eco sticker */}
                    <div>
                      <Label className="text-xs">{t('listing.eco_sticker')}</Label>
                      <Select value={form.eco_sticker} onValueChange={v => updateForm('eco_sticker', v)}>
                        <SelectTrigger className={cn(baseCls,'mt-1')}><SelectValue placeholder={t('listing.select_type')} /></SelectTrigger>
                        <SelectContent><SelectItem value={null}>{t('listing.select_type')}</SelectItem>{ECO_STICKERS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Checkboxes row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {[
                      ['metallic','listing.metallic'],['particulate_filter','listing.particulate_filter'],
                      ['warranty','listing.warranty'],['service_book','listing.service_book_field'],
                      ['non_smoker','listing.non_smoker'],['vat_deductible','listing.vat_deductible'],
                    ].map(([field, labelKey]) => (
                      <label key={field} className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
                        <input type="checkbox" checked={!!form[field]} onChange={e => updateForm(field, e.target.checked)} className="w-4 h-4 rounded accent-emerald-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{t(labelKey)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('listing.step_location')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>{t('listing.country')} *</Label>
                    <Select value={form.country} onValueChange={v => { updateForm('country', v); updateForm('location', ''); }}>
                      <SelectTrigger className={triggerClass('country')}><SelectValue placeholder={t('listing.select_country')} /></SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(c => <SelectItem key={c} value={c}>{t('listing.country_' + c.toLowerCase(), c)}</SelectItem>)}
                      </SelectContent>
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
                  {!dealerId && (
                    <div>
                      <Label>{t('listing.seller_phone', 'Номер телефона')}</Label>
                      <Input
                        type="tel"
                        value={form.seller_phone}
                        onChange={e => updateForm('seller_phone', e.target.value)}
                        placeholder="+371 20 000 000"
                        className={baseCls}
                      />
                      <p className="text-xs text-slate-400 mt-1">{t('listing.seller_phone_hint', 'Покупатели смогут видеть номер после нажатия кнопки')}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4go" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">{t('listing.step_additional', 'Дополнительные опции')}</h2>
                </div>
                <label htmlFor="exclusive_listing" className={cn("block rounded-xl p-4 flex items-start gap-3 cursor-pointer border transition-colors", form.exclusive_listing ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700" : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600")}>
                  <input type="checkbox" id="exclusive_listing" checked={form.exclusive_listing} onChange={e => updateForm('exclusive_listing', e.target.checked)} className="w-5 h-5 rounded-lg cursor-pointer mt-0.5 accent-emerald-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className={cn("font-semibold cursor-pointer block mb-1 flex items-center gap-1.5", form.exclusive_listing ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white")}>
                      <BadgeCheck className={cn("w-4 h-4 flex-shrink-0", form.exclusive_listing ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500")} />
                      {t('listing.exclusive_listing','Только на CarUnity')}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{t('listing.exclusive_listing_desc','Это объявление выставлено только на CarUnity и больше нигде')}</p>
                  </div>
                </label>

                <label htmlFor="is_damaged" className={cn("block rounded-xl p-4 flex items-start gap-3 cursor-pointer border transition-colors", form.is_damaged ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700" : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600")}>
                  <input type="checkbox" id="is_damaged" checked={form.is_damaged} onChange={e => updateForm('is_damaged', e.target.checked)} className="w-5 h-5 rounded cursor-pointer mt-0.5 accent-emerald-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className={cn("font-semibold block mb-1 flex items-center gap-1.5", form.is_damaged ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white")}>
                      <DamagedIcon className={cn("w-4 h-4 flex-shrink-0", form.is_damaged ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500")} />
                      {t('listing.damaged_car')}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{t('listing.damaged_free')}</p>
                  </div>
                </label>

                {/* Get Offers toggle */}
                <label htmlFor="get_offers_enabled" className={cn("block rounded-xl p-4 flex items-start gap-3 cursor-pointer border transition-colors", form.get_offers_enabled ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700" : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600")}>
                  <input type="checkbox" id="get_offers_enabled" checked={form.get_offers_enabled} onChange={e => updateForm('get_offers_enabled', e.target.checked)} className="w-5 h-5 rounded cursor-pointer mt-0.5 accent-emerald-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className={cn("font-semibold cursor-pointer block mb-1 flex items-center gap-1.5", form.get_offers_enabled ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white")}>
                      <Handshake className={cn("w-4 h-4 flex-shrink-0", form.get_offers_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500")} />
                      {t('listing.get_offers_title')}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{t('listing.get_offers_desc','Дилеры смогут делать вам предложения о покупке')}</p>
                  </div>
                </label>

                {/* Fast Sale toggle */}
                <label htmlFor="fast_sale_enabled" className={cn("block rounded-xl p-4 flex items-start gap-3 cursor-pointer border transition-colors", form.fast_sale_enabled ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700" : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600")}>
                  <input type="checkbox" id="fast_sale_enabled" checked={form.fast_sale_enabled} onChange={e => updateForm('fast_sale_enabled', e.target.checked)} className="w-5 h-5 rounded cursor-pointer mt-0.5 accent-emerald-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className={cn("font-semibold cursor-pointer block mb-1 flex items-center gap-1.5", form.fast_sale_enabled ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white")}>
                      <Zap className={cn("w-4 h-4 flex-shrink-0", form.fast_sale_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500")} />
                      {t('fast_sale.seller_title','Fast Sale')}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{t('fast_sale.seller_desc','Сравните предложения от дилеров и выберите лучшее')}</p>
                  </div>
                </label>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('listing.step_photos')}</h2>
                <div>
                  <Label className="mb-3 block">{t('listing.photos')}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <label className={`aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors ${uploadingCount>0 ? 'pointer-events-none opacity-60' : ''}`}>
                      {uploadingCount > 0 ? <><Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-1" /><span className="text-xs text-slate-500">{t('listing.uploading')} {uploadingCount}...</span></> : <><Upload className="w-8 h-8 text-slate-400 mb-2" /><span className="text-sm text-slate-500">{t('listing.upload')}</span></>}
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                    </label>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{t('listing.photos_hint')}</p>
                </div>
                {cropQueue.length > 0 && <ImageCropModal imageSrc={cropQueue[0].src} onDone={handleCropDone} onCancel={handleCropCancel} />}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>{t('listing.description')}</Label>
                    <Button type="button" size="sm" variant="outline" disabled={!form.brand||!form.model||!form.year||isGeneratingDesc}
                      onClick={async () => {
                        setIsGeneratingDesc(true);
                        try {
                          const res = await base44.integrations.Core.InvokeLLM({
                            prompt: `Write a compelling sales description for a car listing. Language: ${localStorage.getItem('i18nextLng')||'ru'}. Car: ${form.brand} ${form.model} ${form.year}, mileage: ${form.mileage}km, fuel: ${form.fuel_type}, transmission: ${form.transmission}, engine: ${form.engine_volume}L ${form.engine_power}hp, color: ${form.color}. Write 3-5 paragraphs, honest and compelling.`,
                          });
                          updateForm('description', typeof res === 'string' ? res : res?.description || res);
                          toast.success(t('listing.desc_generated'));
                        } catch { toast.error(t('listing.desc_error')); }
                        setIsGeneratingDesc(false);
                      }}
                      className="gap-1.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      {isGeneratingDesc ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('listing.generating')}</> : <><Sparkles className="w-3.5 h-3.5" /> {t('listing.generate_desc')}</>}
                    </Button>
                  </div>
                  <Textarea value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder={t('listing.description_placeholder')} rows={6} className="resize-none" />
                  {(!form.brand||!form.model||!form.year) && <p className="text-xs text-slate-400 mt-1">{t('listing.ai_hint')}</p>}
                </div>
                <DescriptionTranslator description={form.description} onTranslationsDone={setDescTranslations} />
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                {paymentSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6"><Check className="w-12 h-12 text-emerald-500" /></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('listing.published_title')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">{t('listing.published_desc')}</p>
                    <button onClick={() => window.location.href = createPageUrl('CarDetails') + `?id=${createdCarId}`} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">{t('listing.view_listing')} →</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{t('listing.choose_plan')}</h2>
                    <p className="text-slate-400 mb-5 sm:mb-6 text-sm sm:text-base">{t('listing.choose_plan_desc')}</p>

                    {/* Base plan */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-bold text-white text-sm sm:text-base">{t('listing.base_plan')}</h3>
                              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{t('listing.base_plan_desc')}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {form.is_damaged ? (
                                <span className="text-emerald-400 font-bold text-base sm:text-lg">0€</span>
                              ) : (
                                <span className="text-white font-bold text-base sm:text-lg">9.99€ <span className="text-xs text-slate-400 font-normal">/ 30 {t('listing.days')}</span></span>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-3 pt-3 border-t border-slate-800">
                            {[t('listing.feat_1'),t('listing.feat_2'),t('listing.feat_3'),t('listing.feat_4'),t('listing.feat_5')].map(f => (
                              <div key={f} className="flex items-center gap-2 text-xs sm:text-sm text-slate-400"><Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{f}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {form.is_damaged && (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm px-1">
                        <Gift className="w-4 h-4 flex-shrink-0" />
                        {t('listing.damaged_free')}
                      </div>
                    )}

                    {/* Boost */}
                    <div className="pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white text-sm sm:text-base">{t('listing.boost_title')}</h3>
                        <span className="text-xs text-slate-400">({t('listing.optional')})</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 mb-3">{t('listing.boost_desc')}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                        <button onClick={() => setSelectedBoost(null)} className={cn("relative rounded-xl border p-3 text-center transition-all", selectedBoost === null ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-900 hover:border-slate-600")}>
                          <div className={cn("w-4 h-4 rounded-full border-2 mx-auto mb-2 flex items-center justify-center", selectedBoost === null ? "border-emerald-500 bg-emerald-500" : "border-slate-600")}>{selectedBoost === null && <Check className="w-2.5 h-2.5 text-white" />}</div>
                          <div className="font-medium text-white text-xs sm:text-sm">{t('listing.no_boost')}</div>
                          <div className="text-slate-400 font-bold mt-0.5 text-sm">0€</div>
                        </button>
                        {BOOST_OPTIONS.map(opt => {
                          const isSelected = selectedBoost?.days === opt.days;
                          const badge = opt.days === 7 ? t('listing.boost_best_value') : opt.days === 30 ? t('listing.boost_max_reach') : null;
                          return (
                            <button key={opt.days} onClick={() => setSelectedBoost(opt)} className={cn("relative rounded-xl border p-3 text-center transition-all", isSelected ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-900 hover:border-slate-600")}>
                              {badge && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap font-medium">{badge}</span>}
                              <div className={cn("w-4 h-4 rounded-full border-2 mx-auto mb-2 flex items-center justify-center", isSelected ? "border-emerald-500 bg-emerald-500" : "border-slate-600")}>{isSelected && <Check className="w-2.5 h-2.5 text-white" />}</div>
                              <div className="font-medium text-white text-xs sm:text-sm">{opt.days} {t('listing.days')}</div>
                              <div className="text-emerald-400 font-bold mt-0.5 text-sm">{opt.price}€</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top Spot */}
                    <div onClick={() => setAddTopSpot(v => !v)} className={cn("bg-slate-900 border rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 cursor-pointer transition-all", addTopSpot ? "border-emerald-500" : "border-slate-800 hover:border-slate-700")}>
                      <Star className={cn("w-5 h-5 flex-shrink-0", addTopSpot ? "text-emerald-500 fill-emerald-500" : "text-slate-500")} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm sm:text-base">TOP SPOT</span>
                          <span className="text-xs text-slate-400">— {t('listing.top_spots')}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5 hidden sm:block">{t('listing.top_desc')}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-white font-bold text-sm sm:text-base">79€</span>
                        <span className="text-xs text-slate-400 ml-1">/ 7 {t('listing.days')}</span>
                      </div>
                      <div className={cn("w-11 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5", addTopSpot ? "bg-emerald-500" : "bg-slate-700")}>
                        <div className={cn("w-5 h-5 rounded-full bg-white transition-transform", addTopSpot ? "translate-x-5" : "translate-x-0")} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-slate-400 text-sm">{t('listing.total_to_pay')}</span>
                        <span className="text-2xl font-bold text-white">{getTotalPrice()}€</span>
                      </div>
                      <Button onClick={() => { setPaymentSuccess(true); sendConfirmationEmail(); }} className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white text-base gap-2">
                        {parseFloat(getTotalPrice()) === 0 ? t('listing.free_publish_btn') : t('listing.pay_publish', { price: getTotalPrice() })}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <div className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed px-1">
                        <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-500" />
                        <span>{t('listing.payment_notice_text')} <a href="/Terms" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300">{t('listing.payment_notice_link')}</a></span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {step < 6 && !paymentSuccess && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setStep(goPrevStep(step))} disabled={step === 1} className="gap-2 dark:border-slate-700 dark:text-slate-300">
                <ArrowLeft className="w-4 h-4" /> {t('common.back')}
              </Button>
              {step < 5 ? (
                <Button onClick={() => { if(validateStep(step)) setStep(goNextStep(step)); else toast.error(t('listing.fix_errors')); }} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
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