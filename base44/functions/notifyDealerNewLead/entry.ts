import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { getUserPreferredLanguage } from '../../shared/notificationTranslations.ts';
import { getEmailStrings, getEmailSubject } from '../../shared/emailTranslations.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { dealerId, leadId } = await req.json();

    const dealers = await base44.asServiceRole.entities.Dealer.filter({ id: dealerId });
    const dealer = dealers[0];
    if (!dealer) return Response.json({ error: 'Dealer not found' }, { status: 404 });

    const leads = await base44.asServiceRole.entities.DealerLead.filter({ id: leadId });
    const lead = leads[0];
    if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 });

    const recipientEmail = dealer.email || dealer.owner_email;
    const lang = await getUserPreferredLanguage(base44, recipientEmail);
    const s = getEmailStrings('dealer_new_lead', lang);
    const scoreLabel = lead.intent_score >= 70 ? s.hotLabel : lead.intent_score >= 40 ? s.warmLabel : s.coldLabel;
    const ctx = { carTitle: lead.car_title, dealerName: dealer.name };
    const subject = getEmailSubject('dealer_new_lead', lang, ctx);

    const actionsHtml = lead.buyer_profile?.actions?.length > 0
      ? `<div style="background:#f0fdf4;border-radius:8px;padding:12px;margin-bottom:16px;border:1px solid #bbf7d0;">
           <p style="margin:0 0 8px;font-weight:600;color:#166534;">⚡ ${s.actionsLabel}:</p>
           <p style="margin:0;color:#15803d;">${lead.buyer_profile.actions.join(' · ')}</p>
         </div>` : '';

    const htmlBody = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
  <h2 style="color:#0f172a;margin-bottom:8px;">🎯 ${s.greeting}</h2>
  <p style="color:#64748b;margin-bottom:20px;">${s.intro(ctx)}</p>
  <div style="background:white;border-radius:8px;padding:16px;margin-bottom:16px;border:1px solid #e2e8f0;">
    <h3 style="margin:0 0 8px;color:#0f172a;">${lead.car_title}</h3>
    <p style="margin:4px 0;color:#64748b;">💰 ${s.priceLabel}: <strong style="color:#059669;">${lead.car_price ? lead.car_price.toLocaleString() + ' €' : '—'}</strong></p>
    <p style="margin:4px 0;color:#64748b;">📊 ${s.scoreLabel}: <strong style="color:#0f172a;">${lead.intent_score} / 100</strong> · ${scoreLabel}</p>
    <p style="margin:4px 0;color:#64748b;">👤 ${s.buyerLabel}: <strong>${lead.user_email}</strong></p>
  </div>
  ${actionsHtml}
  <p style="color:#94a3b8;font-size:13px;">${s.footer}</p>
</div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject,
      body: htmlBody,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});