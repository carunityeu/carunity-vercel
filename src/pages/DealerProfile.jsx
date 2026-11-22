import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { redirectToAccount } from '@/components/auth/requireAccount';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Car, MessageSquare, Star, RefreshCw, Grid2x2, List, Loader2, Send
} from 'lucide-react';
import DealerProfileHeader from '@/components/dealer/DealerProfileHeader';
import DealerProfileContacts from '@/components/dealer/DealerProfileContacts';
import DealerProfileEmployees from '@/components/dealer/DealerProfileEmployees';
import DealerProfileListings from '@/components/dealer/DealerProfileListings';
import { cn } from '@/lib/utils';
import ListPagination from '@/components/ui/ListPagination';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function DealerProfile() {
  const { t, i18n } = useTranslation();
  const localeMap = { ru: 'ru-RU', en: 'en-GB', et: 'et-EE', lv: 'lv-LV', lt: 'lt-LT' };
  const dateLocale = localeMap[i18n.language?.slice(0, 2)] || 'ru-RU';
  const urlParams = new URLSearchParams(window.location.search);
  const dealerId = urlParams.get('id');

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');

  useEffect(() => {
    setPage(1);
  }, [filterBrand, filterModel]);

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) base44.auth.me().then(setUser);
    });
  }, []);

  const { data: dealer, isLoading } = useQuery({
    queryKey: ['dealer', dealerId],
    queryFn: async () => {
      const dealers = await base44.entities.Dealer.filter({ id: dealerId });
      return dealers[0] || null;
    },
    enabled: !!dealerId
  });

  const { data: cars = [] } = useQuery({
    queryKey: ['dealerCars', dealerId],
    queryFn: () => base44.entities.Car.filter({ dealer_id: dealerId, status: 'active' }, '-created_date'),
    enabled: !!dealerId
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['dealerReviews', dealerId],
    queryFn: () => base44.entities.Review.filter({ dealer_id: dealerId }, '-created_date'),
    enabled: !!dealerId
  });

  const handleSubmitReview = async () => {
    if (!user) { redirectToAccount(); return; }
    await base44.entities.Review.create({
      author_email: user.email,
      dealer_id: dealerId,
      rating: reviewRating,
      title: reviewTitle,
      content: reviewContent
    });
    toast.success(t('dealer.review_sent', 'Отзыв отправлен!'));
    setShowReviewForm(false);
    setReviewRating(5); setReviewTitle(''); setReviewContent('');
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );

  if (!dealer) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">{t('dealer.not_found', 'Дилер не найден')}</h1>
        <Link to={createPageUrl('Dealers')}><Button>{t('dealer.back_to_list', 'К списку дилеров')}</Button></Link>
      </div>
    </div>
  );

  const filteredCars = cars.filter(c => {
    if (filterBrand && c.brand !== filterBrand) return false;
    if (filterModel && c.model !== filterModel) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE));
  const pagedCars = filteredCars.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const brandCounts = cars.reduce((acc, c) => {
    acc[c.brand] = (acc[c.brand] || 0) + 1;
    return acc;
  }, {});
  const topBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const uniqueBrands = [...new Set(cars.map(c => c.brand).filter(Boolean))];
  const uniqueModels = [...new Set(cars.filter(c => !filterBrand || c.brand === filterBrand).map(c => c.model).filter(Boolean))];

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : null;

  const inputClass = "h-11 min-w-0 bg-background border-border border text-foreground rounded-xl text-sm placeholder:text-muted-foreground px-3 w-full focus:outline-none focus:ring-2 focus:ring-ring/30";

  const tabs = [
    { id: 'overview', label: t('dealer.tab_overview', 'Обзор') },
    { id: 'listings', label: t('dealer.tab_listings', 'Объявления'), count: cars.length },
    { id: 'reviews', label: t('dealer.tab_reviews', 'Отзывы'), count: reviews.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-3 px-4 py-4 sm:space-y-4 sm:px-6 sm:py-5">
        <DealerProfileHeader key={dealer.id} dealer={dealer} rating={avgRating} reviewCount={reviews.length} />
        <DealerProfileContacts key={dealer.id} dealer={dealer} />
        <DealerProfileEmployees key={`employees-${dealer.id}`} dealer={dealer} />
        <div className="min-w-0">
          <div className="min-w-0">
            {/* Tabs */}
            <div className="mb-5 overflow-hidden rounded-2xl border border-border bg-card px-1 sm:px-2">
              <div className="flex gap-0 items-end overflow-x-auto scrollbar-hide">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "min-h-12 flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap sm:flex-none sm:px-5",
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
                    )}
                  </button>
                ))}

              </div>
            </div>

            {/* ── LISTINGS TAB ── */}
            {activeTab === 'listings' && (
              <div>
                {/* Filters */}
                <div className="mb-4 space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Select value={filterBrand} onValueChange={v => { setFilterBrand(v === 'any' ? '' : v); setFilterModel(''); }}>
                      <SelectTrigger className="h-11 min-w-0 bg-background border-border text-foreground rounded-xl text-sm">
                        <SelectValue placeholder={t('home.search_brand', 'Марка')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t('dealer.all_brands', 'Все марки')}</SelectItem>
                        {uniqueBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filterModel} onValueChange={v => setFilterModel(v === 'any' ? '' : v)}>
                      <SelectTrigger className="h-11 min-w-0 bg-background border-border text-foreground rounded-xl text-sm">
                        <SelectValue placeholder={t('home.search_model', 'Модель')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t('dealer.all_models', 'Все модели')}</SelectItem>
                        {uniqueModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="h-11 min-w-0 bg-background border-border text-foreground rounded-xl text-sm">
                        <SelectValue placeholder={t('dealer.generation', 'Поколение')} />
                      </SelectTrigger>
                      <SelectContent><SelectItem value="any">{t('dealer.any', 'Любое')}</SelectItem></SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      t('dealer.filter_body', 'Кузов'),
                      t('dealer.filter_trans', 'Коробка'),
                      t('dealer.filter_engine', 'Двигатель'),
                      t('dealer.filter_drive', 'Привод')
                    ].map(p => (
                      <Select key={p}>
                        <SelectTrigger className="h-11 min-w-0 bg-background border-border text-foreground rounded-xl text-sm">
                          <SelectValue placeholder={p} />
                        </SelectTrigger>
                        <SelectContent><SelectItem value="any">{t('dealer.any', 'Любой')}</SelectItem></SelectContent>
                      </Select>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="grid grid-cols-2 gap-1">
                      <input className={inputClass} placeholder={t('dealer.year_from', 'Год от')} />
                      <input className={inputClass} placeholder={t('dealer.to', 'до')} />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <input className={inputClass} placeholder={t('dealer.mileage_from', 'Пробег от')} />
                      <input className={inputClass} placeholder={t('dealer.to', 'до')} />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <input className={inputClass} placeholder={t('dealer.price_from', 'Цена от, €')} />
                      <input className={inputClass} placeholder={t('dealer.to', 'до')} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="min-h-11 w-full px-6 rounded-xl text-sm font-semibold gap-2 sm:w-auto">
                      {t('dealer.show_count', 'Показать')} {filteredCars.length} {t('dealer.offers', 'предложений')}
                    </Button>
                  </div>
                </div>

                {/* Brand pills */}
                {topBrands.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {topBrands.map(([brand, count]) => (
                      <button
                        key={brand}
                        onClick={() => setFilterBrand(filterBrand === brand ? '' : brand)}
                        className={cn(
                          "flex min-h-11 items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-colors",
                          filterBrand === brand
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span className="font-medium">{brand}</span>
                        <span className="opacity-50">{count}</span>
                      </button>
                    ))}
                    {Object.keys(brandCounts).length > 8 && (
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border text-sm text-muted-foreground hover:border-slate-500">
                        {t('dealer.all_brands', 'Все марки')}
                      </button>
                    )}
                  </div>
                )}

                {/* Sort + view toggle */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <RefreshCw className="w-4 h-4" />
                    <span>{t('dealer.by_relevance', 'По актуальности')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewMode('grid')} aria-label={t('dealerProfile.grid')} aria-pressed={viewMode === 'grid'} className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", viewMode === 'grid' ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                      <Grid2x2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} aria-label={t('dealerProfile.list')} aria-pressed={viewMode === 'list'} className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", viewMode === 'list' ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground")}>
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Car list */}
                {filteredCars.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{t('dealer.no_cars', 'Нет автомобилей')}</p>
                  </div>
                ) : (
                  <DealerProfileListings cars={pagedCars} dealer={dealer} viewMode={viewMode} />
                )}
                <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
                {(dealer[`description_${i18n.language?.slice(0, 2)}`] || dealer.description)
                  ? <p className="leading-relaxed whitespace-pre-wrap text-sm text-muted-foreground">{dealer[`description_${i18n.language?.slice(0, 2)}`] || dealer.description}</p>
                  : <p className="text-muted-foreground">{t('dealer.no_description', 'Описание не добавлено')}</p>}
                {dealer.brands?.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2 text-foreground">{t('dealer.brands_label', 'Бренды')}</p>
                    <div className="flex flex-wrap gap-2">
                      {dealer.brands.map(b => (
                        <span key={b} className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">{b}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── REVIEWS TAB ── */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {avgRating && (
                      <>
                        <span className="text-3xl font-bold text-foreground">{avgRating}</span>
                        <div>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={cn("w-4 h-4", s <= Math.round(Number(avgRating)) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40")} />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{reviews.length} {t('dealer.reviews_count', 'отзывов')}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <Dialog open={showReviewForm} onOpenChange={(open) => { if (open && !user) { redirectToAccount(); return; } setShowReviewForm(open); }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2 rounded-xl min-h-11 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <MessageSquare className="w-4 h-4" /> {t('dealer.write_review', 'Написать отзыв')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl border-border bg-card">
                      <DialogHeader><DialogTitle>{t('dealer.write_review', 'Написать отзыв')}</DialogTitle></DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">{t('dealer.rating_label', 'Оценка')}</label>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(star => (
                              <button key={star} onClick={() => setReviewRating(star)} className="p-1">
                                <Star className={cn("w-8 h-8", star <= reviewRating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40")} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <input type="text" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} placeholder={t('dealer.review_title_placeholder', 'Заголовок')} className="h-10 bg-background border border-border text-foreground rounded-xl text-sm px-3 w-full" />
                        <Textarea placeholder={t('dealer.review_content_placeholder', 'Расскажите о вашем опыте...')} value={reviewContent} onChange={e => setReviewContent(e.target.value)} rows={4} className="bg-background border-border rounded-xl text-foreground" />
                        <Button onClick={handleSubmitReview} className="w-full gap-2 rounded-xl min-h-11 bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Send className="w-4 h-4" /> {t('dealer.send', 'Отправить')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-muted-foreground">{t('dealer.no_reviews', 'Пока нет отзывов')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map(review => (
                      <div key={review.id} className="border border-border rounded-2xl p-4 bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex gap-0.5 mb-1">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={cn("w-3.5 h-3.5", s <= review.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40")} />
                              ))}
                            </div>
                            {review.title && <p className="font-semibold text-sm text-foreground">{review.title}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(review.created_date).toLocaleDateString(dateLocale)}</span>
                        </div>
                        {review.content && <p className="text-sm text-muted-foreground">{review.content}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}