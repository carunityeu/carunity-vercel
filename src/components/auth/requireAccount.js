import { base44 } from '@/api/base44Client';

export function redirectToAccount(returnTo = window.location.pathname + window.location.search + window.location.hash) {
  window.location.assign('/login?returnTo=' + encodeURIComponent(returnTo));
}

export default async function requireAccount(returnTo) {
  if (await base44.auth.isAuthenticated()) return true;
  redirectToAccount(returnTo);
  return false;
}