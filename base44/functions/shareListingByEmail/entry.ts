import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function fetchImageAsBase64(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    const b64 = btoa(binary);
    const ct = res.headers.get('content-type') || 'image/jpeg';
    const ext = (ct.split('/')[1] || 'jpeg').split(';')[0];
    return { b64, ext };
  } catch (e) {
    console.error('Image fetch error:', e.message);
    return null;
  }
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { to, carTitle, carPrice, imageUrl, shareUrl, locale } = body;

    if (!to || !shareUrl) {
      return Response.json({ error: 'Missing recipient or share url' }, { status: 400 });
    }

    const lang = (locale || 'ru').startsWith('en') ? 'en' : 'ru';

    const subject = carTitle
      ? (lang === 'en'
          ? `Check out ${carTitle} on CarUnity`
          : `Посмотрите ${carTitle} на CarUnity`)
      : (lang === 'en' ? 'A car listing on CarUnity' : 'Объявление на CarUnity');

    const intro = lang === 'en' ? 'Take a look at this listing' : 'Посмотрите это объявление';
    const priceLabel = lang === 'en' ? 'Price' : 'Цена';
    const linkLabel = lang === 'en' ? 'Link' : 'Ссылка';

    const plainBody = `${intro}:\n\n${carTitle || ''}${carPrice ? `\n${priceLabel}: ${carPrice}` : ''}\n\n${linkLabel}: ${shareUrl}\n\n— CarUnity`;

    const safeTitle = escapeHtml(carTitle || '');
    const safePrice = escapeHtml(carPrice || '');
    const safeUrl = escapeHtml(shareUrl);
    const safeImg = imageUrl ? escapeHtml(imageUrl) : '';

    const htmlBody = `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b">
  <div style="padding:20px 24px;background:linear-gradient(135deg,#10b981,#0ea5a4);color:#fff">
    <div style="font-size:20px;font-weight:700;letter-spacing:.5px">CarUnity</div>
  </div>
  <div style="padding:24px">
    ${safeImg ? `<img src="${safeImg}" alt="${safeTitle}" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;margin-bottom:16px" />` : ''}
    <h2 style="color:#f1f5f9;margin:0 0 8px;font-size:20px">${safeTitle}</h2>
    ${safePrice ? `<p style="color:#34d399;font-size:24px;font-weight:700;margin:0 0 16px">${safePrice}</p>` : ''}
    <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 20px">${intro}</p>
    <a href="${safeUrl}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px">${lang === 'en' ? 'Open listing' : 'Открыть объявление'}</a>
  </div>
  <div style="padding:12px 24px;background:#020617;color:#64748b;font-size:12px;text-align:center">carunity.eu</div>
</div>`;

    const emailPayload = {
      from: 'CarUnity <noreply@carunity.eu>',
      to: [to],
      subject,
      html: htmlBody,
      text: plainBody,
    };

    // Attach the first image if available
    if (imageUrl) {
      const img = await fetchImageAsBase64(imageUrl);
      if (img) {
        emailPayload.attachments = [{
          filename: `carunity-${Date.now()}.${img.ext}`,
          content: img.b64,
        }];
      }
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('Resend error:', err);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('shareListingByEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}