import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const PAGE = 200;

// Admin "view as" directory: dealers and every account that is not a salon owner.
// Runs with the service role so it answers the same for every admin, not only the app owner.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const sdk = base44.asServiceRole;

    const dealerPage = await sdk.entities.Dealer.list({ sort: 'name', limit: 500 });
    const dealers = (dealerPage?.items || dealerPage || []).map((d) => ({
      id: d.id,
      name: d.name,
      email: d.owner_email,
      logo: d.logo,
    }));

    const users = [];
    for (let skip = 0; skip < PAGE * 25; skip += PAGE) {
      const page = await sdk.entities.User.list('-created_date', PAGE, skip);
      const rows = Array.isArray(page) ? page : page?.items || [];
      users.push(...rows);
      if (rows.length < PAGE) break;
    }

    const salonOwners = new Set(dealers.map((d) => (d.email || '').toLowerCase()).filter(Boolean));
    const accounts = users
      .filter((u) => u.email && !salonOwners.has(u.email.toLowerCase()))
      .map((u) => ({ id: u.id, name: u.full_name || u.email, email: u.email }));

    return Response.json({ dealers, accounts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}