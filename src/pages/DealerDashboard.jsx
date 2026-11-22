import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import ListPagination from '@/components/ui/ListPagination';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Car, Building2, Plus, Edit2, Trash2, Eye,
  Loader2, Save, Image, MoveHorizontal,
  BarChart2, Target, ShoppingBag, RefreshCw, Zap,
  Menu, X, Rocket, Sparkles, Languages, AlertTriangle, Crown, Lock, LogOut, UserCog
} from 'lucide-react';
import Footer from '@/components/ui/Footer';
import DealerSidebar from '@/components/dealer/DealerSidebar';
import DealerFavorites from '@/components/dealer/DealerFavorites';
import AccountWorkspace from '@/components/account/AccountWorkspace';
import DealerOverview from '@/components/dealer/DealerOverview';
import FastSaleCars from '@/components/dealer/FastSaleCars';
import DealerGetOffers from '@/components/get-offers/DealerGetOffers';
import SocialLinksEditor, { SOCIAL_PLATFORMS } from '@/components/dealer/SocialLinksEditor';
import DealerTeamAssignments from '@/components/dealer/DealerTeamAssignments';
import WorkingHoursEditor from '@/components/dealer/WorkingHoursEditor';
import ListingSellerSelect from '@/components/dealer/ListingSellerSelect';
import DealerAnalytics from '@/components/dealer/DealerAnalytics';
import DealerAnalyticsBasic from '@/components/dealer/DealerAnalyticsBasic';
import DealerAnalyticsPremium from '@/components/dealer/DealerAnalyticsPremium';
import DealerLeads from '@/components/dealer/DealerLeads';
import DealerMarketInsights from '@/components/dealer/DealerMarketInsights';
import DealerImportForm from '@/components/dealer/DealerImportForm';
import PromoteListingModal, { isPromotionActive } from '@/components/listings/PromoteListingModal';
import ViewDeclineBanner from '@/components/dealer/ViewDeclineBanner';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { getPlan, canAddListing, getRemainingSlots } from '@/lib/dealerPlans';
import { readViewAs, clearViewAs } from '@/lib/adminViewAs';

const TAB_LABEL_KEYS = {
  dashboard: 'dealer.tab_dashboard',
  cars: 'dealer.tab_cars',
  favorites: 'account.nav_favorites',
  analytics: 'dealer.tab_analytics',
  leads: 'dealer.tab_leads',
  'fast-sale': 'dealer.tab_fast_sale',
  'get-offers': 'dealer.tab_get_offers',
  import: 'dealer.tab_import',
  profile: 'dealer.tab_profile',
};

export default function DealerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [dealerIds, setDealerIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [coverForm, setCoverForm] = useState({ cover_image: '', cover_image_position: '50% 50%', logo: '' });
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    return Object.prototype.hasOwnProperty.call(TAB_LABEL_KEYS, tab) ? tab : 'dashboard';
  });
  const [employeesForm, setEmployeesForm] = useState([]);
  const queryClient = useQueryClient();
  const [promoteCars, setPromoteCars] = useState([]);
  const [promotePickerOpen, setPromotePickerOpen] = useState(false);
  const [pickerPreselected, setPickerPreselected] = useState([]);
  const [impersonating, setImpersonating] = useState(false);

  const markViewDeclineAsRead = async (carId) => {
    try {
      const notifs = await base44.entities.Notification.filter({
        user_email: dealer?.email, type: 'view_decline', car_id: carId, is_read: false,
      });
      for (const n of notifs) {
        await base44.entities.Notification.update(n.id, { is_read: true });
      }
      queryClient.invalidateQueries(['viewDeclineNotifs', dealer?.email]);
    } catch (e) { console.error('markViewDeclineAsRead error:', e); }
  };

  const openPickerWithPreselect = (carIds) => {
    setPickerPreselected(carIds);
    setPromotePickerOpen(true);
  };

  const openPickerManual = () => {
    setPickerPreselected([]);
    setPromotePickerOpen(true);
  };

  const exitImpersonation = () => {
    clearViewAs();
    window.location.href = '/x9-admin';
  };

  const handlePromoteModalClose = () => setPromoteCars([]);

  const handlePromoteSuccess = (results = []) => {
    queryClient.invalidateQueries(['dealerOwnCars']);
    queryClient.invalidateQueries(['dealerCarDynamics', dealer?.id]);
    results.forEach(result => markViewDeclineAsRead(result.carId));
  };

  useEffect(() => {
    const load = async () => {
      try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { base44.auth.redirectToLogin(); return; }
      const userData = await base44.auth.me();
      setUser(userData);

      // Admin previews exactly the chosen salon (several salons may share an owner email)
      const impersonated = userData.role === 'admin' ? readViewAs() : null;
      const impersonateEmail = impersonated?.type === 'dealer' ? impersonated.email : null;
      if (impersonateEmail) setImpersonating(true);
      const dealerEmail = impersonateEmail || userData.email;
      const { items: requests } = await base44.entities.DealerApplication.filter({ applicant_email: dealerEmail }, { sort: '-created_date', limit: 1, fields: ['status'] });
      if (requests[0] && requests[0].status !== 'approved') { navigate('/DealerRegister?apply=1', { replace: true }); return; }
      const impersonatedDealer = impersonated?.type === 'dealer' && impersonated.id
        ? await base44.entities.Dealer.get(impersonated.id).catch(() => null)
        : null;
      const dealers = impersonatedDealer ? [impersonatedDealer] : await base44.entities.Dealer.filter({ owner_email: dealerEmail });
      // Private accounts have no dealer panel at all
      if (dealers.length === 0 && userData.user_type !== 'dealer' && !impersonateEmail) {
        navigate(createPageUrl('Dashboard'), { replace: true });
        return;
      }
      if (dealers.length > 0) {
        const d = dealers[0];
        setDealer(d);
        // Leads may arrive for any salon of the same owner — collect them all
        setDealerIds(dealers.map(item => item.id));
        setEmployeesForm(Array.isArray(d.employees) ? d.employees : []);
        setProfileForm({
          name: d.name || '', description: d.description || '',
          description_en: d.description_en || '',
          description_ru: d.description_ru || '',
          description_et: d.description_et || '',
          description_lv: d.description_lv || '',
          description_lt: d.description_lt || '',
          phone: d.phone || '', email: d.email || '', website: d.website || '',
          contact_person: d.contact_person || '',
          address: d.address || '', city: d.city || '', country: d.country || '',
          working_hours: d.working_hours || '',
          social_youtube: d.social_youtube || '', social_instagram: d.social_instagram || '',
          social_tiktok: d.social_tiktok || '', social_facebook: d.social_facebook || '',
          social_telegram: d.social_telegram || '', social_whatsapp: d.social_whatsapp || '',
          social_twitter: d.social_twitter || '',
          social_linkedin: d.social_linkedin || '',
        });
        setCoverForm({ cover_image: d.cover_image || '', cover_image_position: d.cover_image_position || '50% 50%', logo: d.logo || '' });
      }
      } catch (error) {
        if ((error.status || error.response?.status) === 401) base44.auth.redirectToLogin(window.location.href);
        else throw error;
      } finally { setIsLoading(false); }
    };
    load();
  }, [navigate]);

  const { data: dealerCars = [], isLoading: loadingCars } = useQuery({
    queryKey: ['dealerOwnCars', dealer?.id],
    queryFn: () => base44.entities.Car.filter({ dealer_id: dealer.id, seller_type: 'dealer' }, '-created_date', 200),
    enabled: !!dealer?.id
  });

  const [carsPage, setCarsPage] = useState(1);
  const CARS_PAGE_SIZE = 10;
  const carsTotalPages = Math.max(1, Math.ceil(dealerCars.length / CARS_PAGE_SIZE));
  const pagedDealerCars = dealerCars.slice((carsPage - 1) * CARS_PAGE_SIZE, carsPage * CARS_PAGE_SIZE);

  const { data: dealerReviews = [] } = useQuery({
    queryKey: ['dealerReviews', dealer?.id],
    queryFn: () => base44.entities.Review.filter({ dealer_id: dealer.id }, '-created_date', 50),
    enabled: !!dealer?.id
  });

  const { data: dealerMessages = [] } = useQuery({
    queryKey: ['dealerMessages', dealer?.email],
    queryFn: () => base44.entities.Message.filter({ receiver_email: dealer.email }, '-created_date', 50),
    enabled: !!dealer?.email
  });

  const { data: priceOffers = [] } = useQuery({
    queryKey: ['dealerOffers', dealer?.email],
    queryFn: () => base44.entities.PriceOffer.filter({ seller_email: dealer.email }, '-created_date', 50),
    enabled: !!dealer?.email
  });

  const deleteCar = useMutation({
    mutationFn: (id) => base44.entities.Car.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['dealerOwnCars']); toast.success(t('dealer.listing_deleted')); }
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const promoteCarId = urlParams.get('promote');
    if (promoteCarId && dealer) {
      setPickerPreselected([promoteCarId]);
      setPromotePickerOpen(true);
    }
  }, [dealer]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Auto-translate description to all 5 languages if it changed
      const descChanged = profileForm.description !== (dealer.description || '');
      let formToSave = { ...profileForm };

      if (descChanged && profileForm.description?.trim()) {
        try {
          const LANG_CODES = ['en', 'ru', 'et', 'lv', 'lt'];
          const langNames = ['English', 'Русский', 'Eesti', 'Latviešu', 'Lietuvių'];
          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `Переведи следующее описание автосалона на эти языки: ${langNames.join(', ')}.

Верни JSON объект где ключи — коды языков (${LANG_CODES.join(', ')}), значения — переводы.
Сохрани стиль и тон оригинала. Переводи профессионально.

Описание для перевода:
${profileForm.description}`,
            response_json_schema: {
              type: 'object',
              properties: Object.fromEntries(LANG_CODES.map(c => [c, { type: 'string' }])),
            },
          });

          formToSave = {
            ...formToSave,
            description_en: result.en || formToSave.description_en,
            description_ru: result.ru || formToSave.description_ru,
            description_et: result.et || formToSave.description_et,
            description_lv: result.lv || formToSave.description_lv,
            description_lt: result.lt || formToSave.description_lt,
          };
          setProfileForm(formToSave);
        } catch {
          // Translation failed — still save the profile without translations
        }
      }

      await base44.entities.Dealer.update(dealer.id, formToSave);
      setDealer({ ...dealer, ...formToSave });
      toast.success(t('dealer.profile_saved'));
    } catch (e) {
      toast.error(e?.message || t('dealer.profile_saved'));
    }
    setIsSaving(false);
  };

  const handleSaveCover = async () => {
    setIsSaving(true);
    await base44.entities.Dealer.update(dealer.id, coverForm);
    setDealer({ ...dealer, ...coverForm });
    toast.success(t('dealer.profile_saved'));
    setIsSaving(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setCoverForm(prev => ({ ...prev, logo: file_url }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setCoverForm(prev => ({ ...prev, cover_image: file_url }));
  };

  const handleSaveEmployees = async (employees) => {
    setIsSaving(true);
    try {
      await base44.entities.Dealer.update(dealer.id, { employees });
      setEmployeesForm(employees);
      setDealer(prev => ({ ...prev, employees }));
      toast.success(t('dealerEmployees.saved'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSocials = async () => {
    setIsSaving(true);
    try {
      const socials = Object.fromEntries(SOCIAL_PLATFORMS.map(({ key }) => [key, profileForm[key] || '']));
      await base44.entities.Dealer.update(dealer.id, socials);
      setDealer({ ...dealer, ...socials });
      toast.success(t('dealer.profile_saved'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignEmployee = async (car, employeeName) => {
    await base44.entities.Car.update(car.id, { assigned_employee: employeeName });
    queryClient.invalidateQueries(['dealerOwnCars']);
    toast.success(t('dealerEmployees.assign_saved'));
  };

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    sold: 'bg-slate-700 text-slate-400',
    rejected: 'bg-red-500/20 text-red-400 border border-red-500/30'
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );

  if (!dealer) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">{t('dealer.no_profile_title')}</h1>
        <p className="text-slate-400 mb-6">{t('dealer.no_profile_desc')}</p>
        <Link to={createPageUrl('DealerRegister')}>
          <Button className="bg-emerald-500 hover:bg-emerald-600">{t('dealer.register_btn')}</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <AccountWorkspace sidebar={<DealerSidebar activeTab={activeTab} onTabChange={setActiveTab} carsCount={dealerCars.length} dealer={dealer} />}>
        <main className="min-w-0">
          {/* Impersonation banner */}
          {impersonating && (
            <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-amber-400">
                <UserCog className="w-4 h-4 flex-shrink-0" />
                <span>{t('dealer.impersonating', { name: dealer?.name || '—' })}</span>
              </div>
              <button onClick={exitImpersonation} className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-white px-3 py-1.5 rounded-lg border border-amber-500/30 hover:bg-amber-500/20 transition-colors">
                <LogOut className="w-4 h-4" /> {t('dealer.exit_preview')}
              </button>
            </div>
          )}

          {/* Breadcrumb row with menu toggle + add car */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1.5">{t('dealer.panel_title')} <span className="mx-1">›</span> {t(TAB_LABEL_KEYS[activeTab], activeTab)}</p>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t(TAB_LABEL_KEYS[activeTab], activeTab)}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <Button
                onClick={openPickerManual}
                aria-label={t('view_decline.manual_promote')}
                className="gap-2 bg-card border border-border text-foreground hover:bg-border/50 hover:border-primary/40 text-sm h-9 px-3"
              >
                <Rocket className="w-4 h-4" /> <span>{t('view_decline.manual_promote', 'Продвинуть объявления')}</span>
              </Button>
              <Link to={canAddListing(dealer?.subscription_type, dealerCars.length) ? createPageUrl('CreateListing') + `?dealer_id=${dealer?.id}` : createPageUrl('DealerPricing')}>
                <Button aria-label={t('dealer.add_car')} className="gap-2 bg-card border border-border text-foreground hover:bg-border/50 hover:border-primary/40 text-sm h-9 px-3" disabled={loadingCars}>
                  <Plus className="w-4 h-4" /> <span>{t('dealer.add_car', 'Добавить авто')}</span>
                </Button>
              </Link>
            </div>
          </div>

          <ViewDeclineBanner dealer={dealer} onPromote={openPickerWithPreselect} />

          {/* Listing limit banner */}
          {!loadingCars && (() => {
            const plan = getPlan(dealer?.subscription_type);
            const remaining = getRemainingSlots(dealer?.subscription_type, dealerCars.length);
            if (plan.maxListings === Infinity) return null;
            const atLimit = remaining === 0;
            const nearLimit = remaining > 0 && remaining <= 2;
            if (!atLimit && !nearLimit) return null;
            return (
              <div className={cn(
                "mb-4 rounded-xl p-4 border flex items-center justify-between gap-3 flex-wrap",
                atLimit ? "bg-red-500/10 border-red-500/30" : "bg-amber-500/10 border-amber-500/30"
              )}>
                <div className="flex items-center gap-2 min-w-0">
                  {atLimit
                    ? <Lock className="w-5 h-5 text-red-400 flex-shrink-0" />
                    : <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                  <span className={cn("text-sm font-medium", atLimit ? "text-red-400" : "text-amber-400")}>
                    {atLimit
                      ? t('dealer.limit_reached', 'Достигнут лимит объявлений') + ` (${plan.maxListings})`
                      : t('dealer.limit_near', 'Осталось мало слотов') + `: ${remaining}`}
                  </span>
                </div>
                <Link to={createPageUrl('DealerPricing')}>
                  <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Crown className="w-3.5 h-3.5" /> {t('dealer.upgrade_plan', 'Улучшить тариф')}
                  </Button>
                </Link>
              </div>
            );
          })()}

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DealerOverview
              dealerCars={dealerCars}
              dealerMessages={dealerMessages}
              priceOffers={priceOffers}
              dealerReviews={dealerReviews}
              dealer={dealer}
              onTabChange={setActiveTab}
            />
          )}

          {/* CARS */}
          {activeTab === 'cars' && (
            loadingCars ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
            ) : dealerCars.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Car className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{t('dealer.no_cars_title')}</h3>
                <p className="text-slate-500 mb-6">{t('dealer.no_cars_desc')}</p>
                <Link to={createPageUrl('CreateListing') + `?dealer_id=${dealer?.id}`}>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2">
                    <Plus className="w-4 h-4" /> {t('dealer.add_car')}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {pagedDealerCars.map(car => (
                  <div key={car.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-full sm:w-32 h-20 rounded-lg overflow-hidden bg-border flex-shrink-0">
                      {car.images?.[0]
                        ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Car className="w-6 h-6 text-slate-500" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-medium text-white">{car.brand} {car.model} {car.year}</h3>
                        <Badge className={statusColors[car.status]}>{t('car.status_' + car.status, car.status)}</Badge>
                        {isPromotionActive(car) && (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1">
                            <Sparkles className="w-3 h-3" />
                            {t('promote.premium_until_short', 'Премиум')} {new Date(car.promotion_until).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-emerald-400 font-semibold">{car.price?.toLocaleString()} €</p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Eye className="w-3 h-3" /> {car.views_count || 0}</p>
                      <ListingSellerSelect car={car} employees={dealer.employees} onAssign={handleAssignEmployee} />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 gap-1" onClick={() => setPromoteCars([car])}>
                        <Rocket className="w-4 h-4" /> <span>{t('promote.button', 'Продвинуть')}</span>
                      </Button>
                      <Link to={createPageUrl('EditListing') + `?id=${car.id}`}>
                        <Button variant="outline" size="sm" className="border-border text-slate-300 hover:bg-border"><Edit2 className="w-4 h-4" /></Button>
                      </Link>
                      <Link to={getCarDetailsPath(car)}>
                        <Button variant="outline" size="sm" className="border-border text-slate-300 hover:bg-border"><Eye className="w-4 h-4" /></Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">{t('dealer.delete_confirm_title')}</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">{t('dealer.delete_confirm_desc')}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-border border-border text-white">{t('dashboard.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCar.mutate(car.id)} className="bg-red-600 hover:bg-red-700">{t('dealer.delete_btn')}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <ListPagination className="mt-0" page={carsPage} totalPages={carsTotalPages} onPageChange={setCarsPage} />
              </div>
              </>
            )
          )}

          {/* ANALYTICS + MARKET INSIGHTS (merged) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {getPlan(dealer.subscription_type).hasPremiumAnalytics
                ? <DealerAnalyticsPremium dealerCars={dealerCars} dealerMessages={dealerMessages} priceOffers={priceOffers} dealer={dealer} />
                : getPlan(dealer.subscription_type).hasGoodAnalytics
                  ? <DealerAnalyticsBasic dealerCars={dealerCars} dealerMessages={dealerMessages} priceOffers={priceOffers} dealer={dealer} />
                  : <DealerAnalytics dealerCars={dealerCars} dealerReviews={dealerReviews} dealerMessages={dealerMessages} priceOffers={priceOffers} />
              }
              <DealerMarketInsights dealer={dealer} dealerCars={dealerCars} />
            </div>
          )}

          {activeTab === 'favorites' && <DealerFavorites user={user} />}
          {activeTab === 'leads' && <DealerLeads dealerId={dealer?.id} dealerIds={dealerIds} cars={dealerCars} dealerEmail={dealer?.email} />}
          {activeTab === 'fast-sale' && <FastSaleCars dealer={dealer} />}
          {activeTab === 'get-offers' && <DealerGetOffers dealer={dealer} />}
          {activeTab === 'import' && <DealerImportForm dealer={dealer} />}

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Basic info */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">{t('dealer.dealer_info', 'Информация о дилере')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400 mb-1 block">{t('dealer.field_name', 'Название')}</Label>
                    <Input value={profileForm.name || ''} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="bg-background border-border text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-400 mb-1 block">{t('dashboard.field_phone', 'Телефон')}</Label>
                    <Input value={profileForm.phone || ''} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className="bg-background border-border text-white" />
                  </div>
                  <div>
                   <Label className="text-slate-400 mb-1 block">{t('account.email_label')}</Label>
                   <Input value={profileForm.email || ''} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} className="bg-background border-border text-white" />
                  </div>
                  <div>
                   <Label className="text-slate-400 mb-1 block">{t('dealer.field_website', 'Сайт')}</Label>
                    <Input value={profileForm.website || ''} onChange={e => setProfileForm(p => ({ ...p, website: e.target.value }))} className="bg-background border-border text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-400 mb-1 block">{t('dashboard.field_city', 'Город')}</Label>
                    <Input value={profileForm.city || ''} onChange={e => setProfileForm(p => ({ ...p, city: e.target.value }))} className="bg-background border-border text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-400 mb-1 block">{t('dashboard.field_country', 'Страна')}</Label>
                    <Input value={profileForm.country || ''} onChange={e => setProfileForm(p => ({ ...p, country: e.target.value }))} className="bg-background border-border text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-400 mb-1 block">{t('dealer.field_address', 'Адрес')}</Label>
                    <Input value={profileForm.address || ''} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} className="bg-background border-border text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-400 mb-2 block">{t('dealer.working_hours', 'Часы работы')}</Label>
                    <WorkingHoursEditor value={profileForm.working_hours || ''} onChange={val => setProfileForm(p => ({ ...p, working_hours: val }))} />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-400 mb-1 block">{t('dealer.field_description', 'Описание')}</Label>
                  <Textarea value={profileForm.description || ''} rows={4} onChange={e => setProfileForm(p => ({ ...p, description: e.target.value }))} className="bg-background border-border text-white" />
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-emerald-400" />
                    {t('dealer.auto_translate_hint', 'При сохранении описание автоматически переводится на все 5 языков')}
                  </p>
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t('dealer.save', 'Сохранить')}
                </Button>
              </div>

              {/* Social networks */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{t('dealer.social_links', 'Социальные сети')}</h2>
                  <p className="text-sm text-slate-500">{t('dealer.social_links_hint')}</p>
                </div>
                <SocialLinksEditor form={profileForm} onChange={(key, val) => setProfileForm(p => ({ ...p, [key]: val }))} />
                <Button onClick={handleSaveSocials} disabled={isSaving} className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 sm:w-auto">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t('dealer.save', 'Сохранить')}
                </Button>
              </div>

              {/* Logo & Cover */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-5">
                <h2 className="text-lg font-semibold text-white">{t('dealer.images', 'Изображения')}</h2>
                <div>
                  <Label className="text-slate-400 mb-2 block">{t('dealer.logo', 'Логотип')}</Label>
                  <div className="flex items-center gap-4">
                    {coverForm.logo && (
                      <img src={coverForm.logo} alt="logo" className="w-16 h-16 rounded-xl object-cover border border-border" />
                    )}
                    <label className="cursor-pointer">
                      <div className="px-4 py-2 rounded-lg border border-dashed border-border text-sm text-slate-400 hover:border-emerald-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                        <Image className="w-4 h-4" /> {t('dealer.upload_logo', 'Загрузить логотип')}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-400 mb-2 block">{t('dealer.cover_banner', 'Обложка')}</Label>
                  {coverForm.cover_image && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-border" style={{ height: '120px' }}>
                      <img src={coverForm.cover_image} alt="cover" className="w-full h-full object-cover" style={{ objectPosition: coverForm.cover_image_position || '50% 50%' }} />
                    </div>
                  )}
                  {coverForm.cover_image && (
                    <div className="mb-3 space-y-2 p-3 bg-background rounded-xl border border-border">
                      <p className="text-xs font-medium text-slate-400 flex items-center gap-1"><MoveHorizontal className="w-3.5 h-3.5" /> {t('dealer.banner_position', 'Позиция баннера')}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-16">{t('dealer.horizontal', 'Горизонталь')}</span>
                        <input type="range" min={0} max={100} value={parseInt((coverForm.cover_image_position || '50% 50%').split(' ')[0]) || 50}
                          onChange={e => { const y = (coverForm.cover_image_position || '50% 50%').split(' ')[1] || '50%'; setCoverForm(p => ({ ...p, cover_image_position: `${e.target.value}% ${y}` })); }}
                          className="flex-1 accent-emerald-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-16">{t('dealer.vertical', 'Вертикаль')}</span>
                        <input type="range" min={0} max={100} value={parseInt((coverForm.cover_image_position || '50% 50%').split(' ')[1]) || 50}
                          onChange={e => { const x = (coverForm.cover_image_position || '50% 50%').split(' ')[0] || '50%'; setCoverForm(p => ({ ...p, cover_image_position: `${x} ${e.target.value}%` })); }}
                          className="flex-1 accent-emerald-500" />
                      </div>
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 rounded-lg border border-dashed border-border text-sm text-slate-400 hover:border-emerald-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                      <Image className="w-4 h-4" /> {t('dealer.upload_cover', 'Загрузить обложку')}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  </label>
                </div>
                <Button onClick={handleSaveCover} disabled={isSaving} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t('dealer.save', 'Сохранить')}
                </Button>
              </div>

              {/* Dealership team */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
                <DealerTeamAssignments employees={employeesForm} cars={dealerCars} companyEmail={dealer.email} onSave={handleSaveEmployees} />
              </div>

            </div>
          )}
        </main>
      </AccountWorkspace>
      <Footer />
      <PromoteListingModal
        cars={promotePickerOpen ? dealerCars.filter(c => c.status === 'active') : promoteCars}
        initialSelectedIds={promotePickerOpen ? pickerPreselected : undefined}
        open={promotePickerOpen || promoteCars.length > 0}
        onClose={() => { setPromotePickerOpen(false); handlePromoteModalClose(); }}
        onSuccess={handlePromoteSuccess} sellerEmail={dealer?.email} dealerId={dealer?.id}
      />
    </>
  );
}