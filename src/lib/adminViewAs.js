import { entities } from '@/api/entities';

// Admin "view as" mode: the admin previews the site as a dealer or as a private
// account. The choice lives in localStorage so every screen can read it.
export const DEALER_KEY = 'admin_impersonate_email';
export const PRIVATE_KEY = 'admin_view_as_private';
const NAME_KEY = 'admin_view_as_name';
const ID_KEY = 'admin_view_as_id';

const read = (key) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(key));

export function readViewAs() {
  const name = read(NAME_KEY) || '';
  const id = read(ID_KEY) || '';
  const dealerEmail = read(DEALER_KEY);
  if (dealerEmail) return { type: 'dealer', email: dealerEmail, name, id };
  const privateEmail = read(PRIVATE_KEY);
  if (privateEmail) return { type: 'private', email: privateEmail, name, id };
  return null;
}

export function setViewAsDealer(email, name = '', id = '') {
  localStorage.removeItem(PRIVATE_KEY);
  localStorage.setItem(DEALER_KEY, email);
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(ID_KEY, id);
}

export function setViewAsPrivate(email, name = '', id = '') {
  localStorage.removeItem(DEALER_KEY);
  localStorage.setItem(PRIVATE_KEY, email);
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(ID_KEY, id);
}

export function clearViewAs() {
  localStorage.removeItem(DEALER_KEY);
  localStorage.removeItem(PRIVATE_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(ID_KEY);
}

const asItems = (result) => (Array.isArray(result) ? result : result?.items || []);

// Returns the admin merged with the previewed account, plus a small description
// of the active view mode (null when the admin sees the site normally).
export async function resolveViewAsUser(user) {
  if (!user || user.role !== 'admin') return { user, viewAs: null };
  const viewAs = readViewAs();
  if (!viewAs) return { user, viewAs: null };

  if (viewAs.type === 'dealer') {
    const dealer = viewAs.id
      ? await entities.Dealer.get(viewAs.id).catch(() => null)
      : asItems(await entities.Dealer.filter({ owner_email: viewAs.email }, { limit: 1 }))[0];
    if (!dealer) return { user, viewAs: null };
    return {
      viewAs: { type: 'dealer', email: dealer.owner_email || viewAs.email, id: dealer.id, name: dealer.name },
      user: {
        ...user,
        user_type: 'dealer',
        dealer_id: dealer.id,
        email: dealer.owner_email || viewAs.email,
        full_name: dealer.name,
      },
    };
  }

  // The picked account was stored with its id, name and email — no need to read
  // other users here (that read is reserved to the app owner).
  const account = viewAs.id
    ? { id: viewAs.id, email: viewAs.email, full_name: viewAs.name }
    : asItems(await entities.User.filter({ email: viewAs.email }))[0];
  if (!account) return { user, viewAs: null };
  return {
    viewAs: { type: 'private', email: account.email, id: account.id, name: account.full_name || account.email },
    user: {
      ...user,
      id: account.id,
      email: account.email,
      full_name: account.full_name || account.email,
      user_type: 'private',
      dealer_id: null,
    },
  };
}