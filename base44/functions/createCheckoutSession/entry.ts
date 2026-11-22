import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { CATALOG, DEALER_PLANS, PLAN_DAYS, CURRENCY, resolveItems } from '../../shared/paymentCatalog.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

    // Return URLs may only ever come from the server-set app origin.
    const appUrl = req.headers.get('X-Base44-App-Url');
    if (!appUrl) return Response.json({ error: 'app_url_missing' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const secretKey = secrets.get('STRIPE_SECRET_KEY');
    if (!secretKey) return Response.json({ error: 'stripe_not_configured' }, { status: 500 });

    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.set('customer_email', user.email);
    params.set('metadata[base44_app_id]', secrets.get('BASE44_APP_ID') || '');
    params.set('metadata[user_email]', user.email);
    params.set('payment_method_types[0]', 'card');

    let successPath = '/Dashboard?payment=success';
    let cancelPath = '/Dashboard?payment=cancelled';

    if (body.planId) {
      // Dealer subscription plan — one paid period at a time.
      const plan = DEALER_PLANS[body.planId];
      if (!plan) return Response.json({ error: 'unknown_plan' }, { status: 400 });
      const billing = body.billing === 'yearly' ? 'yearly' : 'monthly';
      const days = PLAN_DAYS[billing];

      const dealers = await base44.asServiceRole.entities.Dealer.filter({ owner_email: user.email }, { limit: 1 });
      const dealer = dealers?.items?.[0] || null;
      if (!dealer) return Response.json({ error: 'dealer_profile_required' }, { status: 400 });

      params.set('line_items[0][quantity]', '1');
      params.set('line_items[0][price_data][currency]', CURRENCY);
      params.set('line_items[0][price_data][unit_amount]', String(plan[billing]));
      params.set('line_items[0][price_data][product_data][name]', `${plan.name} — ${days} days`);
      params.set('metadata[plan_id]', body.planId);
      params.set('metadata[plan_billing]', billing);
      params.set('metadata[plan_days]', String(days));
      params.set('metadata[dealer_id]', dealer.id);
      successPath = '/DealerDashboard?payment=success';
      cancelPath = '/DealerDashboard?payment=cancelled';
    } else {
      const resolved = resolveItems(body.items);
      if (resolved.error) return Response.json({ error: resolved.error }, { status: 400 });

      // Every promotable listing must belong to the caller.
      const listingIds = [...new Set(resolved.items.filter((item) => item.listingId).map((item) => item.listingId))];
      let dealerId = null;
      if (listingIds.length) {
        const cars = await base44.asServiceRole.entities.Car.filter({ id: { $in: listingIds } }, { limit: 10 });
        const owned = (cars?.items || []).filter((car) =>
          car.created_by_id === user.id || car.seller_id === user.email || (user.dealer_id && car.dealer_id === user.dealer_id));
        if (owned.length !== listingIds.length) return Response.json({ error: 'listing_not_owned' }, { status: 403 });
        dealerId = owned.find((car) => car.dealer_id)?.dealer_id || null;
      }

      resolved.items.forEach((item, index) => {
        params.set(`line_items[${index}][quantity]`, '1');
        params.set(`line_items[${index}][price_data][currency]`, CURRENCY);
        params.set(`line_items[${index}][price_data][unit_amount]`, String(item.amount));
        params.set(`line_items[${index}][price_data][product_data][name]`, item.name);
        if (item.kind === 'meta') {
          params.set(`line_items[${index}][price_data][product_data][description]`, `Meta ads budget ${item.metaBudget}€ + CarUnity promotion`);
        }
      });

      params.set('metadata[purchase]', JSON.stringify({ items: resolved.items, dealerId }));
      const returnTo = body.returnTo === 'DealerDashboard' ? '/DealerDashboard' : '/Dashboard';
      successPath = `${returnTo}?payment=success`;
      cancelPath = `${returnTo}?payment=cancelled`;
    }

    params.set('success_url', `${appUrl}${successPath}`);
    params.set('cancel_url', `${appUrl}${cancelPath}`);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2025-10-29.clover',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: params.toString(),
      signal: AbortSignal.timeout(20000),
    });
    const session = await response.json();
    if (!response.ok) {
      console.error('Stripe checkout failed', session?.error?.message);
      return Response.json({ error: session?.error?.message || 'checkout_failed' }, { status: 502 });
    }
    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createCheckoutSession error', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}