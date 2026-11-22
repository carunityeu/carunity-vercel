import { base44 } from '@/api/base44Client';

// Account type is stored on the User record as user_type: 'private' | 'dealer'.
export function isDealerUser(user) {
  return user?.user_type === 'dealer' || !!user?.dealer_id;
}

// Makes sure every account carries its type tag in the database: a dealer is
// recognised by the Dealer record registered with the account email.
export async function syncAccountType(user) {
  if (!user?.email) return user;
  if (user.user_type === 'dealer' && user.dealer_id) return user;

  const dealers = await base44.entities.Dealer.filter({ owner_email: user.email }, { limit: 1 });
  const found = (Array.isArray(dealers) ? dealers : dealers?.items || [])[0];

  if (found) {
    await base44.auth.updateMe({ user_type: 'dealer', dealer_id: found.id }).catch(() => {});
    return { ...user, user_type: 'dealer', dealer_id: found.id };
  }

  if (!user.user_type) {
    await base44.auth.updateMe({ user_type: 'private' }).catch(() => {});
    return { ...user, user_type: 'private' };
  }

  return user;
}