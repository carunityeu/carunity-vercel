import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, ChevronRight, ThumbsUp, ThumbsDown, Star, ArrowLeft, Loader2 } from 'lucide-react';
import CarCard from '@/components/cars/CarCard';
import { motion } from 'framer-motion';

function RatingBadge({ rating }) {
  const color = rating >= 8 ? 'bg-emerald-400' : rating >= 6 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="inline-flex flex-col items-center">
      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Оценка</span>
      <div className={`${color} rounded-xl px-4 py-2 text-center`}>
        <span className="text-2xl font-black text-white">{rating?.toFixed(1)}/10</span>
      </div>
    </div>
  );
}

export default function CarModelDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const modelId = urlParams.get('id');

  const [userRating, setUserRating] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const voted = localStorage.getItem(`voted_model_${modelId}`);
    if (voted) setHasVoted(true);
  }, [modelId]);

  const { data: modelInfo, isLoading } = useQuery({
    queryKey: ['carModelInfo', modelId],
    queryFn: () => entities.CarModelInfo.filter({ id: modelId }),
    select: (data) => data[0],
    enabled: !!modelId
  });

  const { data: cars = [] } = useQuery({
    queryKey: ['modelCars', modelInfo?.brand, modelInfo?.model],
    queryFn: () => entities.Car.filter({ brand: modelInfo.brand, model: modelInfo.model, status: 'active' }, '-created_date', 8),
    enabled: !!modelInfo?.brand && !!modelInfo?.model
  });

  const voteMutation = useMutation({
    mutationFn: async (rating) => {
      const currentRating = modelInfo.user_rating || 0;
      const currentVotes = modelInfo.rating_votes || 0;
      const newVotes = currentVotes + 1;
      const newRating = ((currentRating * currentVotes) + rating) / newVotes;
      return entities.CarModelInfo.update(modelId, {
        user_rating: Math.round(newRating * 10) / 10,
        rating_votes: newVotes
      });
    },
    onSuccess: (_, rating) => {
      setUserRating(rating);
      setHasVoted(true);
      localStorage.setItem(`voted_model_${modelId}`, '1');
      queryClient.invalidateQueries(['carModelInfo', modelId]);
    }
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );

  if (!modelInfo) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Модель не найдена</p>
        <Link to={createPageUrl('Home')}><Button className="mt-4">На главную</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to={createPageUrl('Home')} className="hover:text-emerald-600 transition-colors">Главная</Link>
          <ChevronRight className="w-4 h-4" />
          <span>{modelInfo.brand}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-700 dark:text-slate-300">{modelInfo.title}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
          {modelInfo.title}
        </h1>

        {/* Main block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left: Image */}
          <div>
            {modelInfo.cover_image ? (
              <img
                src={modelInfo.cover_image}
                alt={modelInfo.title}
                className="w-full rounded-2xl object-cover aspect-[4/3]"
              />
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <Car className="w-16 h-16 text-slate-400" />
              </div>
            )}
            {modelInfo.body_types?.length > 0 && (
              <p className="mt-3 text-sm text-slate-500">
                Типы кузова:{' '}
                {modelInfo.body_types.map((bt, i) => (
                  <span key={bt}>
                    <Link to={createPageUrl('Catalog') + `?brand=${modelInfo.brand}&model=${modelInfo.model}&bodyType=${bt}`} className="text-emerald-600 hover:underline">{bt}</Link>
                    {i < modelInfo.body_types.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            )}
            {modelInfo.years && (
              <p className="text-sm text-slate-400 mt-1">Годы выпуска: {modelInfo.years}</p>
            )}
          </div>

          {/* Right: Rating + Description */}
          <div className="space-y-4">
            {/* Rating card */}
            {modelInfo.user_rating > 0 && (
              <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white text-base font-medium">
                    Общая оценка — {modelInfo.user_rating?.toFixed(1)} из 10
                  </p>
                  {modelInfo.rating_votes > 0 && (
                    <p className="text-slate-400 text-sm mt-1">
                      На основе {modelInfo.rating_votes} голосов пользователей
                    </p>
                  )}
                </div>
                <RatingBadge rating={modelInfo.user_rating} />
              </div>
            )}

            {/* User voting */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white mb-3">
                {hasVoted ? 'Вы уже оценили эту модель' : 'Оцените эту модель'}
              </p>
              {!hasVoted ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      onClick={() => {
                        if (!user) { base44.auth.redirectToLogin(); return; }
                        voteMutation.mutate(score);
                      }}
                      className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 font-semibold text-sm text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {score}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600">
                  <Star className="w-5 h-5 fill-emerald-500" />
                  <span className="font-medium">Ваш голос учтён{userRating ? ` (${userRating}/10)` : ''}!</span>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
              <Link
                to={createPageUrl('Catalog') + `?brand=${modelInfo.brand}&model=${modelInfo.model}`}
                className="flex items-center justify-between text-emerald-600 hover:text-emerald-700 font-medium group"
              >
                <span>Объявления {modelInfo.title}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="border-t border-slate-100 dark:border-slate-800" />
              <Link
                to={createPageUrl('Catalog') + `?brand=${modelInfo.brand}`}
                className="flex items-center justify-between text-emerald-600 hover:text-emerald-700 font-medium group"
              >
                <span>Все {modelInfo.brand}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {modelInfo.gallery_images?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Галерея</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {modelInfo.gallery_images.map((img, i) => (
                <img key={i} src={img} alt={`${modelInfo.title} ${i + 1}`} className="rounded-xl object-cover aspect-[4/3] w-full" />
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {modelInfo.description && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">История и описание</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {modelInfo.description}
            </div>
          </div>
        )}

        {/* Pros & Cons */}
        {(modelInfo.pros?.length > 0 || modelInfo.cons?.length > 0) && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {modelInfo.pros?.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Что хорошо</h3>
                  <ul className="space-y-3">
                    {modelInfo.pros.map((pro, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm leading-none">+</span>
                        </span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {modelInfo.cons?.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Что не так хорошо</h3>
                  <ul className="space-y-3">
                    {modelInfo.cons.map((con, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm leading-none">−</span>
                        </span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Listings */}
        {cars.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Объявления {modelInfo.title}
              </h2>
              <Link
                to={createPageUrl('Catalog') + `?brand=${modelInfo.brand}&model=${modelInfo.model}`}
                className="text-sm text-emerald-600 hover:underline"
              >
                Все объявления →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}