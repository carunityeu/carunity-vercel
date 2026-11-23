import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { checkIfPremiumCar } from '@/utils/premiumCarMatcher';
import { grantMainBonus } from '@/lib/referralUtils';
import { ensureShortId } from '@/lib/shortIdUtils';
import { startCheckout } from '@/lib/stripeCheckout';
import StepCard from '@/components/listings/create/StepCard';
import StepBasicInfo from '@/components/listings/create/StepBasicInfo';
import StepModelDetails from '@/components/listings/create/StepModelDetails';
import StepEcology from '@/components/listings/create/StepEcology';
import StepAdditional from '@/components/listings/create/StepAdditional';
import StepPhotosDescription from '@/components/listings/create/StepPhotosDescription';
import StepPlan from '@/components/listings/create/StepPlan';
import ListingVehicleBar from '@/components/listings/create/ListingVehicleBar';
import ListingEntryMode from '@/components/listings/create/ListingEntryMode';
import ListingNotice from '@/components/listings/create/ListingNotice';
import '@/components/listings/create/createListing.css';
import '@/components/listings/create/listingWizard.css';
const LISTING_SECTIONS = ['vehicle', 'equipment', 'details', 'contact', 'plan'];
import ListingContactSection from '@/components/listings/create/ListingContactSection';
import ListingColorInterior from '@/components/listings/create/ListingColorInterior';
import ListingEquipment from '@/components/listings/create/ListingEquipment';
import { TextField } from '@/components/listings/create/fields';
import { BASE_LISTING_PRICE, TOP_SPOT_PRICE } from '@/components/listings/create/constants';
import useListingDraft from '@/components/listings/create/useListingDraft';

export default function CreateListing() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [vehicleType, setVehicleType] = useState('car');
  const [vehicleChosen, setVehicleChosen] = useState(false);
  const [fillMode, setFillMode] = useState('manual');
  const [errors, setErrors] = useState({});
  const [descTranslations, setDescTranslations] = useState({});
  const [selectedBoost, setSelectedBoost] = useState(null);
  const [addTopSpot, setAddTopSpot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [createdCarId, setCreatedCarId] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [savedSections, setSavedSections] = useState({});

  const urlParams = new URLSearchParams(window.location.search);
  const urlDealerId = urlParams.get('dealer_id');
  // Dealer accounts always publish as their dealership, never as a private seller
  const dealerId = user?.user_type === 'dealer' ? user?.dealer_id || urlDealerId : urlDealerId;

  const [form, setForm] = useState({
    brand: '', model: '', year: '', month_of_manufacture: '', price: '', mileage: '',
    fuel_type: '', transmission: '', body_type: '', drive_type: '', color: '',
    engine_volume: '', engine_power: '', powerUnit: 'kw', trim_level: '',
    vin: '', license_plate: '', description: '', images: [],
    engine_volume_cc: '', length_mm: '', width_mm: '', height_mm: '', wheelbase_mm: '',
    clearance_mm: '', weight_empty_kg: '', weight_max_kg: '', max_speed_kmh: '',
    co2_emissions: '', fuel_consumption_city: '', fuel_consumption_highway: '',
    fuel_consumption_combined: '', energy_consumption: '', transmission_type: '',
    doors: '', fuel_tank_volume: '', trunk_volume: '', acceleration_0_100: '',
    engine_code: '', fuel_system: '', seats: '', owners_count: '', condition: '',
    location: '', country: '', seller_phone: '',
    features: [], metallic: false, color_interior: '', interior_material: '',
    emission_class: '', particulate_filter: false, auto_start_stop: false,
    warranty: false, service_book: false, non_smoker: false, vat_deductible: false,
    is_damaged: false, exclusive_listing: false,
  });

  useEffect(() => {
    (async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { base44.auth.redirectToLogin(); return; }
      setUser(await base44.auth.me());
    })();
  }, []);

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const step1Done = !!(form.brand && form.model && form.year && form.mileage);
  const step2Done = !!(step1Done && form.body_type && form.fuel_type && form.transmission);
  const tile1Valid = step1Done && step2Done;
  const step5Done = !!(form.images.length > 0 && form.description?.trim());
  const planTotal = ((form.is_damaged ? 0 : BASE_LISTING_PRICE) + (addTopSpot ? TOP_SPOT_PRICE : 0) + (selectedBoost?.price || 0)).toFixed(2);

  const completed = {
    vehicle: !!savedSections.vehicle && tile1Valid,
    equipment: !!savedSections.equipment,
    details: !!savedSections.details && step5Done && Number(form.price) > 0,
    contact: !!savedSections.contact && !!(form.country.trim() && form.location.trim() && (dealerId || form.seller_phone.trim())),
  };
  const values = { form, descTranslations, vehicleType, vehicleChosen, activeSection, fillMode, selectedBoost, addTopSpot, savedSections };
  const draft = useListingDraft({ user, dealerId, values, published, t, restore: saved => {
    if (saved.form) setForm(prev => ({ ...prev, ...saved.form }));
    setDescTranslations(saved.descTranslations || {});
    setVehicleType(saved.vehicleType || 'car');
    setFillMode(saved.fillMode || 'manual');
    setSelectedBoost(saved.selectedBoost || null);
    setAddTopSpot(!!saved.addTopSpot);
    setSavedSections(saved.savedSections || {});
    setVehicleChosen(saved.vehicleChosen ?? !!(saved.form?.brand || saved.savedSections?.vehicle));
    setActiveSection(LISTING_SECTIONS.includes(saved.activeSection) ? saved.activeSection : 'vehicle');
  } });
  const saveDraft = () => { if (draft.save()) toast.success(t('listing.cr_draft_saved')); };
  const openSection = section => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const saveSection = () => {
    const valid = {
      vehicle: tile1Valid,
      equipment: true,
      details: step5Done && Number(form.price) > 0,
      contact: !!(form.country.trim() && form.location.trim() && (dealerId || form.seller_phone.trim())),
    };
    if (!valid[activeSection]) { toast.error(t('listing.fix_errors')); return; }
    if (!draft.save()) return;
    setSavedSections(prev => ({ ...prev, [activeSection]: true }));
    toast.success(t('listing.cr_draft_saved'));
    openSection(LISTING_SECTIONS[LISTING_SECTIONS.indexOf(activeSection) + 1]);
  };
  const previousSection = () => {
    const index = LISTING_SECTIONS.indexOf(activeSection);
    if (index <= 0) { setVehicleChosen(false); openSection(null); }
    else openSection(LISTING_SECTIONS[index - 1]);
  };

  const handleSubmit = async () => {
    if (!Object.values(completed).every(Boolean)) { toast.error(t('listing.fix_errors')); return; }
    setIsSubmitting(true);
    const total = Number(planTotal) || 0;
    try {
      const features = [...form.features];
      if (form.auto_start_stop && !features.includes('auto_start_stop')) features.push('auto_start_stop');

      const powerHp = form.engine_power ? (form.powerUnit === 'kw' ? Math.round(parseFloat(form.engine_power) / 0.7355) : parseInt(form.engine_power)) : null;

      const carData = {
        title: `${form.brand} ${form.model} ${form.year}`,
        brand: form.brand, model: form.model, year: parseInt(form.year),
        month_of_manufacture: form.month_of_manufacture ? parseInt(form.month_of_manufacture) : null,
        price: parseInt(form.price) || 0, mileage: parseInt(form.mileage) || 0,
        fuel_type: form.fuel_type, transmission: form.transmission, body_type: form.body_type,
        drive_type: form.drive_type || null, color: form.color || null,
        engine_volume: form.engine_volume ? parseFloat(form.engine_volume) : null,
        engine_power: powerHp,
        vin: form.vin || null, license_plate: form.license_plate || null,
        trim_level: form.trim_level || null,
        description: form.description,
        description_en: descTranslations.en || null, description_ru: descTranslations.ru || null,
        description_et: descTranslations.et || null, description_lv: descTranslations.lv || null,
        description_lt: descTranslations.lt || null,
        images: form.images, location: form.location, country: form.country,
        features,
        length_mm: form.length_mm ? parseInt(form.length_mm) : null,
        width_mm: form.width_mm ? parseInt(form.width_mm) : null,
        height_mm: form.height_mm ? parseInt(form.height_mm) : null,
        wheelbase_mm: form.wheelbase_mm ? parseInt(form.wheelbase_mm) : null,
        clearance_mm: form.clearance_mm ? parseInt(form.clearance_mm) : null,
        weight_empty_kg: form.weight_empty_kg ? parseInt(form.weight_empty_kg) : null,
        weight_max_kg: form.weight_max_kg ? parseInt(form.weight_max_kg) : null,
        fuel_tank_volume: form.fuel_tank_volume ? parseInt(form.fuel_tank_volume) : null,
        trunk_volume: form.trunk_volume ? parseInt(form.trunk_volume) : null,
        transmission_type: form.transmission_type || null,
        engine_code: form.engine_code || null, fuel_system: form.fuel_system || null,
        max_speed_kmh: form.max_speed_kmh ? parseInt(form.max_speed_kmh) : null,
        acceleration_0_100: form.acceleration_0_100 ? parseFloat(form.acceleration_0_100) : null,
        seats: form.seats ? parseInt(form.seats) : null, doors: form.doors ? parseInt(form.doors) : null,
        owners_count: form.owners_count ? parseInt(form.owners_count) : null,
        condition: form.condition || null,
        co2_emissions: form.co2_emissions ? parseInt(form.co2_emissions) : null,
        fuel_consumption_city: form.fuel_consumption_city ? parseFloat(form.fuel_consumption_city) : null,
        fuel_consumption_highway: form.fuel_consumption_highway ? parseFloat(form.fuel_consumption_highway) : null,
        fuel_consumption_combined: form.fuel_consumption_combined ? parseFloat(form.fuel_consumption_combined) : null,
        energy_consumption: form.fuel_type === 'electric' && form.energy_consumption ? parseFloat(form.energy_consumption) : null,
        emission_class: form.emission_class || null,
        color_interior: form.color_interior || null, interior_material: form.interior_material || null,
        metallic: form.metallic, particulate_filter: form.particulate_filter,
        warranty: form.warranty, service_book: form.service_book,
        non_smoker: form.non_smoker, vat_deductible: form.vat_deductible,
        is_damaged: form.is_damaged, exclusive_listing: form.exclusive_listing,
        seller_phone: form.seller_phone.trim() || null,
        seller_type: dealerId ? 'dealer' : 'private', seller_id: user?.email,
        dealer_id: dealerId || user?.dealer_id || null,
        is_premium: addTopSpot, is_auto_premium: checkIfPremiumCar({ brand: form.brand, model: form.model, year: parseInt(form.year) }),
        status: total > 0 ? 'pending' : 'active', views_count: 0,
      };

      let carId = createdCarId;
      if (!carId) {
        const created = await entities.Car.create(carData);
        carId = created.id;
        setCreatedCarId(carId);
        if (user?.email) grantMainBonus(user.email, 'listing_created').catch(() => {});
      }

      if (total > 0) {
        const base = { listingId: carId, listingType: 'car', listingTitle: carData.title };
        const items = [];
        if (!form.is_damaged) items.push({ id: 'listing_30', ...base });
        if (addTopSpot) items.push({ id: 'top_spot_7', ...base });
        if (selectedBoost) {
          const boostId = { 1: 'boost_1', 3: 'boost_3', 7: 'boost_7', 14: 'boost_14', 30: 'boost_30' }[selectedBoost.days];
          if (boostId) items.push({ id: boostId, ...base });
        }
        if (items.length) {
          await startCheckout({ items, returnTo: user?.user_type === 'dealer' ? 'DealerDashboard' : 'Dashboard' });
        }
      }

      setPublished(true);
    } catch (e) {
      toast.error(e?.message === 'popup_blocked' ? t('payment.popup_blocked') : e?.message || t('listing.fix_errors'));
    }
    setIsSubmitting(false);
  };

  if (published) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6 mx-auto">
            <Check className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('listing.published_title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{t('listing.published_desc')}</p>
          <button onClick={() => window.location.href = createPageUrl(user?.user_type === 'dealer' ? 'DealerDashboard' : 'Dashboard')} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">
            {t('listing.view_listing')} →
          </button>
        </div>
      </div>
    );
  }

  if (!draft.ready) return <div className="min-h-[50vh] flex items-center justify-center" role="status"><span className="h-8 w-8 rounded-full border-2 border-border border-t-primary animate-spin" /><span className="sr-only">{t('listing.wizard_loading')}</span></div>;
  return <div className="listing-create">
    <div className={cn('lc-shell lc-content lc-wizard', !vehicleChosen && 'lc-vehicle-picker')}>
      {draft.error && <p role="alert" className="lc-draft-error">{draft.error}</p>}
      {!vehicleChosen ? <>
        <h1 className="lc-vehicle-picker-title">{t('listing.select_vehicle_type')}</h1>
        <ListingVehicleBar tiles onChange={type => { setVehicleType(type); setVehicleChosen(true); openSection('vehicle'); }} t={t} />
      </> : <div>
        <button type="button" className="lc-wizard-back" disabled={isSubmitting} onClick={previousSection}>← {t('listing.wizard_back')}</button>
        <div className="lc-card">
          {activeSection === 'vehicle' && <>
            <ListingEntryMode value={fillMode} onChange={setFillMode} t={t} />
            <StepCard title={t('listing.cr_basic_info')}><StepBasicInfo form={form} updateForm={updateForm} t={t} /></StepCard>
            <StepCard title={t('listing.cr_model_details')}><StepModelDetails form={form} updateForm={updateForm} t={t} showAppearance={false} /></StepCard>
            <StepCard title={t('listing.cr_ecology')} optional={t('listing.cr_optional')}><StepEcology form={form} updateForm={updateForm} t={t} /></StepCard>
            <StepCard title={t('listing.cr_additional')} optional={t('listing.cr_optional')}><StepAdditional form={form} updateForm={updateForm} t={t} showEquipment={false} /></StepCard>
          </>}
          {activeSection === 'equipment' && <StepCard title={t('listing.wizard_equipment')}><ListingColorInterior form={form} updateForm={updateForm} t={t} /><ListingEquipment form={form} updateForm={updateForm} t={t} /></StepCard>}
          {activeSection === 'details' && <StepCard title={t('listing.wizard_details')}>
            <StepPhotosDescription form={form} updateForm={updateForm} setDescTranslations={setDescTranslations} t={t} />
            <div className="mt-8"><TextField label={t('listing.wizard_price')} type="number" suffix="€" value={form.price} onChange={v => updateForm('price', v)} /></div>
          </StepCard>}
          {activeSection === 'contact' && <StepCard title={t('listing.wizard_contact')}><ListingContactSection form={form} updateForm={updateForm} dealerId={dealerId} t={t} /></StepCard>}
          {activeSection === 'plan' && <>
            <StepCard title={t('listing.cr_plan')}><StepPlan selectedBoost={selectedBoost} setSelectedBoost={setSelectedBoost} addTopSpot={addTopSpot} setAddTopSpot={setAddTopSpot} isDamaged={form.is_damaged} onDamagedChange={value => updateForm('is_damaged', value)} t={t} /></StepCard>
            <ListingNotice action={<Link to="/FAQ" target="_blank" rel="noopener noreferrer" onClick={saveDraft}>{t('listing.cr_open_faq')}</Link>}>{t('listing.cr_faq_hint')}</ListingNotice>
          </>}
          <div className="lc-actions">
            <button type="button" className="lc-next lc-next-ghost" disabled={isSubmitting} onClick={previousSection}>← {t('listing.wizard_back')}</button>
            {activeSection === 'plan' && <button type="button" className="lc-next" disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t('listing.publishing')}</> : `${t('listing.confirm_pay')} - ${planTotal} €`}
            </button>}
            {activeSection !== 'plan' && <button type="button" className="lc-next" onClick={saveSection}>{t('listing.wizard_save')}</button>}
          </div>
        </div>
      </div>}
    </div>
  </div>;
}