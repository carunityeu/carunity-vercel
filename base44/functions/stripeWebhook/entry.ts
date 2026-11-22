import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { DEALER_PLANS, PLAN_DAYS, CURRENCY } from '../../shared/paymentCatalog.ts';
import { grantPurchase } from '../../shared/paymentFulfillment.ts';

const MAX_SKEW_SECONDS = 300;

async function hmacHex(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hasValidSignature(rawBody, header, secret) {
  if (!header) return false;
  const parts = { t: '', v1: '' };
  for (const chunk of header.split(',')) {
    const [key, value] = chunk.split('=');
    if (key === 't') parts.t = value;
    if (key === 'v1') parts.v1 = value;
  }
  if (!parts.t || !parts.v1) return false;
  const skew = Math.abs(Math.floor(Date.now() / 1000) - Number(parts.t));
  if (!Number.isFinite(skew) || skew > MAX_SKEW_SECONDS) return false;
  const expected = await hmacHex(secret, `${parts.t}.${rawBody}`);
  return expected === parts.v1;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();
    const secret = secrets.get('STRIPE_WEBHOOK_SECRET');
    if (!secret) {
      console.error('stripeWebhook: STRIPE_WEBHOOK_SECRET is not set');
      return Response.json({ error: 'not_configured' }, { status: 500 });
    }
    if (!(await hasValidSignature(rawBody, req.headers.get('stripe-signature'), secret))) {
      console.error('stripeWebhook: invalid signature');
      return Response.json({ error: 'invalid_signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const session = event?.data?.object || {};

    if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
      return Response.json({ received: true, ignored: event.type });
    }

    // Base44's own self-test charge is not a customer order.
    if (session.metadata?.base44_test_checkout === 'true') {
      return Response.json({ received: true, skipped: 'self_test' });
    }
    if (session.payment_status !== 'paid') {
      return Response.json({ received: true, skipped: 'unpaid' });
    }
    if (session.currency !== CURRENCY) {
      console.error('stripeWebhook: unexpected currency', session.currency);
      return Response.json({ received: true, skipped: 'currency_mismatch' });
    }

    const buyerEmail = session.customer_details?.email || session.metadata?.user_email || '';

    if (session.metadata?.plan_id) {
      const planId = session.metadata.plan_id;
      const plan = DEALER_PLANS[planId];
      if (!plan) {
        console.error('stripeWebhook: unknown plan', planId);
        return Response.json({ received: true, skipped: 'unknown_plan' });
      }
      const billing = session.metadata.plan_billing === 'yearly' ? 'yearly' : 'monthly';
      if (Number(session.amount_total) !== plan[billing]) {
        console.error('stripeWebhook: plan amount mismatch', planId, session.amount_total);
        return Response.json({ received: true, skipped: 'amount_mismatch' });
      }
      await grantPurchase(base44, {
        sessionId: session.id,
        buyerEmail,
        dealerId: session.metadata.dealer_id || null,
        items: [],
        plan: {
          id: planId,
          name: plan.name,
          amount: plan[billing],
          days: PLAN_DAYS[billing],
          dealerId: session.metadata.dealer_id || null,
        },
      });
      return Response.json({ received: true, granted: 'plan' });
    }

    let purchase = null;
    try {
      purchase = JSON.parse(session.metadata?.purchase || 'null');
    } catch (error) {
      purchase = null;
    }
    if (!purchase?.items?.length) {
      console.error('stripeWebhook: session has no purchase items', session.id);
      return Response.json({ received: true, skipped: 'no_items' });
    }

    const expected = purchase.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    if (Number(session.amount_total) !== expected) {
      console.error('stripeWebhook: amount mismatch', session.id, session.amount_total, expected);
      return Response.json({ received: true, skipped: 'amount_mismatch' });
    }

    await grantPurchase(base44, {
      sessionId: session.id,
      buyerEmail,
      dealerId: purchase.dealerId || null,
      items: purchase.items,
      plan: null,
    });
    return Response.json({ received: true, granted: 'items' });
  } catch (error) {
    console.error('stripeWebhook error', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}