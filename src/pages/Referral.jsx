import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  ensureUserReferralCode,
  getReferralLink,
  getQrCodeUrl,
  getReferralStats,
  getReferredUsers,
  BONUS_CONFIG,
  captureReferralCode
} from '@/lib/referralUtils';
import {
  Gift, Copy, Check, Share2, Users, UserPlus, Award,
  TrendingUp, QrCode, Link2, MessageCircle, Send, ChevronLeft,
  Sparkles, Trophy, Clock, CheckCircle2, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Referral() {
  const { t } = useTranslation();
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const [referralCode, setReferralCode] = useState(null);
  const [stats, setStats] = useState({ total: 0, registered: 0, completed: 0, bonusDays: 0 });
  const [referredUsers, setReferredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    captureReferralCode();
  }, []);

  const loadData = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const code = await ensureUserReferralCode(user);
      setReferralCode(code);

      const [s, referrals] = await Promise.all([
        getReferralStats(user.email),
        getReferredUsers(user.email)
      ]);
      setStats(s);
      setReferredUsers(referrals);
    } catch (e) {
      console.error('Failed to load referral data:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, loadData]);

  const referralLink = referralCode ? getReferralLink(referralCode) : '';
  const qrUrl = referralLink ? getQrCodeUrl(referralLink) : '';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Join me on CarUnity! ${referralLink}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join me on CarUnity!')}`,
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CarUnity — Invite friends',
          text: 'Join me on CarUnity and get bonuses!',
          url: referralLink
        });
      } catch (e) { /* user cancelled */ }
    } else {
      copyLink();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{t('referral.login_required_title')}</h2>
          <p className="text-slate-400 mb-6">{t('referral.login_required_desc')}</p>
          <button
            onClick={navigateToLogin}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
          >
            {t('nav.login')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              {t('referral.title')}
            </h1>
          </div>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-900 border border-emerald-800/30 p-6 sm:p-8"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wide">{t('referral.earn_premium')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t('referral.hero_title')}</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg">{t('referral.hero_desc')}</p>

            {/* Bonus badges */}
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-none">+{BONUS_CONFIG.INSTANT_DAYS}</p>
                  <p className="text-slate-400 text-xs">{t('referral.instant_bonus_short')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-none">+{BONUS_CONFIG.MAIN_DAYS}</p>
                  <p className="text-slate-400 text-xs">{t('referral.main_bonus_short')}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Referral link card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-semibold">{t('referral.your_link')}</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 min-w-0">
              <span className="text-slate-300 text-sm font-mono truncate flex-1">{referralLink}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm">{copied ? t('referral.copied') : t('referral.copy')}</span>
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors border border-slate-700"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* QR Code */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex flex-col items-center"
            >
              <div className="bg-white p-4 rounded-2xl">
                <img src={qrUrl} alt="QR Code" className="w-48 h-48 sm:w-56 sm:h-56" />
              </div>
              <p className="text-slate-400 text-sm mt-3 text-center">{t('referral.qr_scan')}</p>
            </motion.div>
          )}

          {/* Share buttons */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-slate-500 text-sm">{t('referral.share')}:</span>
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-green-600/20 hover:bg-green-600/30 flex items-center justify-center transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-green-400" />
            </a>
            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 flex items-center justify-center transition-colors"
              title="Telegram"
            >
              <Send className="w-5 h-5 text-blue-400" />
            </a>
            <button
              onClick={shareNative}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-700"
              title={t('referral.share_more')}
            >
              <Share2 className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Users} label={t('referral.stats_total')} value={stats.total} color="emerald" />
          <StatCard icon={UserPlus} label={t('referral.stats_registered')} value={stats.registered} color="blue" />
          <StatCard icon={CheckCircle2} label={t('referral.stats_completed')} value={stats.completed} color="amber" />
          <StatCard icon={TrendingUp} label={t('referral.stats_bonus_days')} value={stats.bonusDays} color="purple" suffix={t('referral.days')} />
        </div>

        {/* How it works */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            {t('referral.how_it_works')}
          </h3>
          <div className="space-y-4">
            <Step number={1} title={t('referral.step1_title')} desc={t('referral.step1_desc')} icon={Share2} />
            <Step number={2} title={t('referral.step2_title')} desc={t('referral.step2_desc')} icon={UserPlus} />
            <Step number={3} title={t('referral.step3_title')} desc={t('referral.step3_desc')} icon={Gift} />
          </div>
        </div>

        {/* Referred users */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            {t('referral.referred_list')}
          </h3>
          {referredUsers.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm">{t('referral.empty')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {referredUsers.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {(r.invited_name || r.invited_email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{r.invited_name || r.invited_email}</p>
                    <p className="text-slate-500 text-xs">{r.invited_email}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {r.main_bonus_granted ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-lg">
                        <Trophy className="w-3.5 h-3.5" />
                        {t('referral.badge_completed')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        {t('referral.badge_pending')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, suffix }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    purple: 'text-purple-400 bg-purple-500/10'
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-white leading-none">{value}{suffix && <span className="text-sm text-slate-400 ml-1">{suffix}</span>}</p>
      <p className="text-slate-500 text-xs mt-1">{label}</p>
    </div>
  );
}

function Step({ number, title, desc, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1 pt-0.5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <p className="text-white text-sm font-medium">{title}</p>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">{desc}</p>
      </div>
    </div>
  );
}