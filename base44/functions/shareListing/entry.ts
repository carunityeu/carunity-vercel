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

export default async function(req) {
  try {
    const url = new URL(req.url);
    let sid = url.searchParams.get('sid');

    // Also check body for SDK calls
    if (!sid) {
      try {
        const body = await req.json();
        sid = body?.sid;
      } catch {}
    }

    if (!sid || !/^\d{9}$/.test(String(sid))) {
      return new Response('Not found', { status: 404 });
    }

    const base44 = createClientFromRequest(req);
    const cars = await base44.asServiceRole.entities.Car.filter({ short_id: Number(sid) });
    const car = cars[0];

    if (!car) {
      return new Response('Not found', { status: 404 });
    }

    const defaultImage = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/dbd70564b_2026-05-22115939.jpg';
    const imageUrl = car.images?.[0] || defaultImage;
    const priceStr = car.price ? `${car.price}€` : '';
    const titleStr = `${car.brand} ${car.model} ${car.year}${priceStr ? ' — ' + priceStr : ''} | CarUnity`;
    const descStr = `Buy ${car.brand} ${car.model} ${car.year} on CarUnity — the leading car marketplace in the Baltics`;
    const origin = `https://${url.hostname}`;
    const canonicalUrl = `${origin}/cardetails/${sid}`;

    const title = escapeHtml(titleStr);
    const description = escapeHtml(descStr);
    const image = escapeHtml(imageUrl);
    const canonical = escapeHtml(canonicalUrl);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:site_name" content="CarUnity" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta http-equiv="refresh" content="0;url=${canonical}">
  <link rel="canonical" href="${canonical}">
</head>
<body>
  <script>window.location.href = "${canonical}";</script>
  <p>Redirecting to <a href="${canonical}">${canonical}</a></p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
}