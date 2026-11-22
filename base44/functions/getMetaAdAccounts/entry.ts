import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('meta_ads');

    const res = await fetch(
      'https://graph.facebook.com/v25.0/me/adaccounts?fields=account_id,name,account_status,currency,amount_spent,balance&limit=100',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json();

    if (data.error) {
      return Response.json({ error: data.error.message, code: data.error.code }, { status: 400 });
    }

    const accounts = (data.data || []).map((acc) => ({
      id: `act_${acc.account_id}`,
      name: acc.name,
      status: acc.account_status, // 1 = ACTIVE, 2 = DISABLED, 3 = UNSETTLED
      currency: acc.currency,
      amount_spent: acc.amount_spent,
      balance: acc.balance,
    }));

    return Response.json({ accounts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}