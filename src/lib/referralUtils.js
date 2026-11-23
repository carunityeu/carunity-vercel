import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';

const STORAGE_KEY = 'cu_ref_code';
const INSTANT_BONUS_DAYS = 7;
const MAIN_BONUS_DAYS = 30;

/**
 * Generate a unique referral code: CU-XXXXXX
 */
export function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CU-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Capture referral code from URL (?ref=CODE) and store in localStorage
 */
export function captureReferralCode() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref && ref.startsWith('CU-')) {
    localStorage.setItem(STORAGE_KEY, ref);
    // Clean URL
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
  }
}

/**
 * Get stored referral code
 */
export function getStoredReferralCode() {
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Clear stored referral code
 */
export function clearStoredReferralCode() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get the full referral link for a code
 */
export function getReferralLink(code) {
  return `${window.location.origin}/?ref=${code}`;
}

/**
 * Get QR code URL for a link
 */
export function getQrCodeUrl(url) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&color=10-b981&bgcolor=0f-172a&data=${encodeURIComponent(url)}`;
}

/**
 * Ensure user has a referral code — generate and save via updateMe if missing
 */
export async function ensureUserReferralCode(user) {
  if (!user) return null;
  if (user.referral_code) return user.referral_code;

  const code = generateReferralCode();
  try {
    await base44.auth.updateMe({ referral_code: code });
    return code;
  } catch (e) {
    console.error('Failed to save referral code:', e);
    return code;
  }
}

/**
 * Process pending referral after user logs in:
 * - Get stored ref code from localStorage
 * - Create Referral record if not exists
 * - Grant instant bonus to inviter
 */
export async function processPendingReferral(user) {
  if (!user?.email) return;

  const refCode = getStoredReferralCode();
  if (!refCode) return;

  // Self-referral check
  if (user.referral_code === refCode) {
    clearStoredReferralCode();
    return;
  }

  // Check if referral already exists
  try {
    const existing = await entities.Referral.filter({
      invited_email: user.email,
      referral_code: refCode
    });

    if (existing && existing.length > 0) {
      clearStoredReferralCode();
      return;
    }

    // Find inviter by referral_code — search in User entity
    const users = await entities.User.filter({ referral_code: refCode });
    const inviter = users && users[0];

    if (!inviter || inviter.email === user.email) {
      clearStoredReferralCode();
      return;
    }

    // Create referral record
    const referral = await entities.Referral.create({
      inviter_email: inviter.email,
      inviter_code: refCode,
      invited_email: user.email,
      invited_name: user.full_name || user.email.split('@')[0],
      referral_code: refCode,
      status: 'registered',
      action_type: 'none',
      instant_bonus_granted: false,
      main_bonus_granted: false
    });

    // Grant instant bonus to inviter
    await grantInstantBonus(referral.id, inviter.email, user.full_name || user.email);

    clearStoredReferralCode();
  } catch (e) {
    console.error('Failed to process referral:', e);
  }
}

/**
 * Grant instant bonus to inviter (+7 days)
 */
async function grantInstantBonus(referralId, inviterEmail, invitedName) {
  try {
    // Try to extend dealer subscription
    const dealers = await entities.Dealer.filter({ owner_email: inviterEmail });
    if (dealers && dealers.length > 0) {
      const dealer = dealers[0];
      const newDate = extendSubscription(dealer.subscription_until, INSTANT_BONUS_DAYS);
      await entities.Dealer.update(dealer.id, { subscription_until: newDate });
    }

    // Create notification
    const ctx = { invitedName, bonusDays: INSTANT_BONUS_DAYS, kind: 'referral_instant' };
    await entities.Notification.create({
      user_email: inviterEmail,
      type: 'offer_received',
      title: `Friend registered!`,
      content: `Your friend ${invitedName} registered via your referral link. +${INSTANT_BONUS_DAYS} days Premium bonus!`,
      data: ctx,
      link: '/Referral'
    });

    // Mark instant bonus granted
    await entities.Referral.update(referralId, {
      instant_bonus_granted: true,
      instant_bonus_granted_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('Failed to grant instant bonus:', e);
  }
}

/**
 * Grant main bonus when referred user performs an action (listing created / dealer subscribed)
 * Called from listing creation flow and dealer registration
 */
export async function grantMainBonus(invitedEmail, actionType = 'listing_created') {
  try {
    const referrals = await entities.Referral.filter({
      invited_email: invitedEmail,
      main_bonus_granted: false
    });

    if (!referrals || referrals.length === 0) return;

    const referral = referrals[0];

    // Extend inviter's dealer subscription
    const dealers = await entities.Dealer.filter({ owner_email: referral.inviter_email });
    if (dealers && dealers.length > 0) {
      const dealer = dealers[0];
      const newDate = extendSubscription(dealer.subscription_until, MAIN_BONUS_DAYS);
      await entities.Dealer.update(dealer.id, { subscription_until: newDate });
    }

    // Create notification
    const ctx = { invitedName: referral.invited_name, actionType, bonusDays: MAIN_BONUS_DAYS, kind: 'referral_main' };
    await entities.Notification.create({
      user_email: referral.inviter_email,
      type: 'offer_received',
      title: `Friend completed an action!`,
      content: `Your friend ${referral.invited_name} ${actionType === 'dealer_subscribed' ? 'became a paying dealer' : 'created a listing'}. +${MAIN_BONUS_DAYS} days Premium bonus!`,
      data: ctx,
      link: '/Referral'
    });

    // Mark main bonus granted
    await entities.Referral.update(referral.id, {
      main_bonus_granted: true,
      main_bonus_granted_at: new Date().toISOString(),
      status: 'action_completed',
      action_type: actionType,
      action_completed_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('Failed to grant main bonus:', e);
  }
}

/**
 * Extend subscription date by N days
 */
function extendSubscription(currentUntil, days) {
  const base = currentUntil ? new Date(currentUntil) : new Date();
  const future = base > new Date() ? base : new Date();
  future.setDate(future.getDate() + days);
  return future.toISOString().split('T')[0];
}

/**
 * Get referral stats for a user
 */
export async function getReferralStats(inviterEmail) {
  try {
    const referrals = await entities.Referral.filter({ inviter_email: inviterEmail });
    if (!referrals) return { total: 0, registered: 0, completed: 0, bonusDays: 0 };

    const total = referrals.length;
    const registered = referrals.filter(r => r.instant_bonus_granted).length;
    const completed = referrals.filter(r => r.main_bonus_granted).length;
    const bonusDays = registered * INSTANT_BONUS_DAYS + completed * MAIN_BONUS_DAYS;

    return { total, registered, completed, bonusDays };
  } catch (e) {
    return { total: 0, registered: 0, completed: 0, bonusDays: 0 };
  }
}

/**
 * Get referred users list
 */
export async function getReferredUsers(inviterEmail) {
  try {
    const referrals = await entities.Referral.filter(
      { inviter_email: inviterEmail },
      '-created_date',
      50
    );
    return referrals || [];
  } catch (e) {
    return [];
  }
}

export const BONUS_CONFIG = {
  INSTANT_DAYS: INSTANT_BONUS_DAYS,
  MAIN_DAYS: MAIN_BONUS_DAYS
};