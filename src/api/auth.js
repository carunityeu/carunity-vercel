// Sign-in on Supabase Auth, with the same calls the pages used on base44.auth, so a page moves
// off Base44 by changing its import only (docs/AUTH_MIGRATION.md).
//
// The signed-in "user" object = the row in public.profiles (created by the on_auth_user_created
// trigger) plus id and email from the session. Profile fields: full_name, role, user_type,
// dealer_id, phone, avatar, city, country, preferred_language, notify_*, consents.
import { supabase } from './supabaseClient';

const SITE = () => window.location.origin;
const fail = (error, status = 400) => Object.assign(new Error(error?.message || String(error)), { status, details: error });

async function sessionUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw fail(error, 401);
  return data.session?.user || null;
}

/** Same-origin path for returning after sign-in (no open redirects). */
function localPath(url) {
  try {
    const u = new URL(url || '/', SITE());
    if (u.origin !== SITE()) return '/';
    const path = u.pathname + u.search + u.hash;
    return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') ? path : '/';
  } catch { return '/'; }
}

export const auth = {
  async isAuthenticated() {
    return !!(await sessionUser());
  },

  /** The signed-in user's profile; throws { status: 401 } for guests (as auth.me did). */
  async me() {
    const user = await sessionUser();
    if (!user) throw fail('Not signed in', 401);
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) throw fail(error);
    return {
      ...(profile || {}),
      id: user.id,
      email: (user.email || '').toLowerCase(),
      full_name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
      role: profile?.role || 'user',
    };
  },

  /** Update own profile fields (role, email and dealer link are protected by the database). */
  async updateMe(fields) {
    const user = await sessionUser();
    if (!user) throw fail('Not signed in', 401);
    const { error } = await supabase.from('profiles').update(fields).eq('id', user.id);
    if (error) throw fail(error);
    return this.me();
  },

  redirectToLogin(returnTo = window.location.href) {
    window.location.href = `/login?returnTo=${encodeURIComponent(localPath(returnTo))}`;
  },

  /** Deletes the signed-in account (supabase/migrations/…_delete_account.sql), then signs out. */
  async deleteAccount() {
    const { error } = await supabase.rpc('delete_my_account');
    if (error) throw fail(error);
    await supabase.auth.signOut();
    window.location.href = '/?account_deleted=1';
  },

  async logout(redirectTo) {
    await supabase.auth.signOut();
    window.location.href = redirectTo ? localPath(redirectTo) : '/';
  },

  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw fail(error, error.status || 400);
    return data;
  },

  /** Google (or another configured provider); returns to `returnTo` on this site. */
  async loginWithProvider(provider, returnTo = '/') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: SITE() + localPath(returnTo) },
    });
    if (error) throw fail(error);
  },

  /** Creates the account; Supabase e-mails a confirmation link and a 6-digit code. */
  async register({ email, password, full_name }) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: `${SITE()}/login?confirmed=1`, data: full_name ? { full_name } : undefined },
    });
    if (error) throw fail(error);
    return data;
  },

  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: otpCode, type: 'signup' });
    if (error) throw fail(error);
    return data;
  },

  async resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
    if (error) throw fail(error);
  },

  /** Sends the "set a new password" link; it opens /reset-password with a recovery session. */
  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${SITE()}/reset-password` });
    if (error) throw fail(error);
  },

  /** Sets the new password inside the recovery session opened by the e-mailed link. */
  async resetPassword({ newPassword }) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw fail(error);
  },

  /** Signed-in password change: checks the current password first. */
  async changePassword({ currentPassword, newPassword }) {
    const user = await sessionUser();
    if (!user) throw fail('Not signed in', 401);
    const { error: wrong } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (wrong) throw fail(wrong, 400);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw fail(error);
  },

  /** Base44 needed this after its own redirects; Supabase keeps the session itself. */
  setToken() {},

  /** Fires on sign-in, sign-out, token refresh and password recovery. Returns an unsubscribe. */
  onChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
    return () => data.subscription.unsubscribe();
  },
};
