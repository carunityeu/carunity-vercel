import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Parses latest automotive news from multiple sources:
// Motor1.com (RSS), auto.ru/mag (RSS), autoreview.ru (RSS)
// Rewrites + translates via LLM, saves as drafts for moderation.

const SOURCES = [
  {
    name: 'Motor1.com',
    rssUrl: 'https://www.motor1.com/rss/news/all/',
    type: 'rss'
  },
  {
    name: 'Drom.ru',
    rssUrl: 'https://www.drom.ru/export/xml/news.rss',
    type: 'rss'
  },
  {
    name: 'Autoreview.ru',
    rssUrl: 'https://www.autoreview.ru/feed/news/rss',
    type: 'rss'
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Check existing articles to avoid duplicates
    const existingArticles = await base44.asServiceRole.entities.Article.list('-created_date', 200);
    const existingSourceUrls = new Set(
      existingArticles.filter(a => a.source_url).map(a => a.source_url)
    );

    // Support running a single source at a time via ?source= param or body
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const filterSource = body.source || null;
    const activeSources = filterSource
      ? SOURCES.filter(s => s.name.toLowerCase().includes(filterSource.toLowerCase()))
      : SOURCES;

    const allResults = [];
    const sourceStats = [];

    for (const source of activeSources) {
      try {
        // Fetch RSS feed
        const rssRes = await fetch(source.rssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CarUnityNewsBot/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*'
          }
        });

        if (!rssRes.ok) {
          sourceStats.push({ source: source.name, status: 'fetch_failed', code: rssRes.status });
          continue;
        }

        const rssText = await rssRes.text();
        const items = parseRssItems(rssText);

        if (items.length === 0) {
          sourceStats.push({ source: source.name, status: 'no_items' });
          continue;
        }

        const newItems = items.filter(item => !existingSourceUrls.has(item.url));

        // Process up to 2 new articles per source per run
        const toProcess = newItems.slice(0, 2);

        for (const item of toProcess) {
          try {
            const fullContent = await fetchArticleContent(item.url);
            const bodyText = fullContent || item.description;

            if (!bodyText || bodyText.length < 50) {
              allResults.push({ source: source.name, url: item.url, status: 'skipped', reason: 'too short' });
              continue;
            }

            const processed = await processWithLLM(base44, item.title, bodyText);
            if (!processed) {
              allResults.push({ source: source.name, url: item.url, status: 'error', reason: 'LLM failed' });
              continue;
            }

            const today = new Date().toISOString().split('T')[0];
            await base44.asServiceRole.entities.Article.create({
              title: processed.title_en,
              title_ru: processed.title_ru,
              title_et: processed.title_et,
              title_lv: processed.title_lv,
              title_lt: processed.title_lt,
              content: processed.content_en,
              content_ru: processed.content_ru,
              content_et: processed.content_et,
              content_lv: processed.content_lv,
              content_lt: processed.content_lt,
              cover_image: item.imageUrl || '',
              author_name: source.name,
              published_at: today,
              is_published: false,
              source_url: item.url,
              source_name: source.name
            });

            // Mark as seen to avoid duplicates within the same run
            existingSourceUrls.add(item.url);

            allResults.push({ source: source.name, url: item.url, title: processed.title_en, status: 'saved' });
          } catch (err) {
            allResults.push({ source: source.name, url: item.url, status: 'error', error: err.message });
          }
        }

        sourceStats.push({
          source: source.name,
          total_items: items.length,
          new_items: newItems.length,
          processed: toProcess.length
        });

      } catch (err) {
        sourceStats.push({ source: source.name, status: 'error', error: err.message });
      }
    }

    const saved = allResults.filter(r => r.status === 'saved').length;

    return Response.json({
      message: `Processed ${saved} articles from ${SOURCES.length} sources`,
      sources: sourceStats,
      results: allResults
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseRssItems(rssText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(rssText)) !== null) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) 
      || itemXml.match(/<title>(.*?)<\/title>/s);
    const linkMatch = itemXml.match(/<link>(.*?)<\/link>/s)
      || itemXml.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/s);
    const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s)
      || itemXml.match(/<description>(.*?)<\/description>/s);
    const imgMatch = itemXml.match(/<media:content[^>]*url="([^"]+)"/i)
      || itemXml.match(/<enclosure[^>]*url="([^"]+)"/i);

    const title = titleMatch ? titleMatch[1].trim() : '';
    const url = linkMatch ? linkMatch[1].trim() : '';
    const description = descMatch ? stripHtml(descMatch[1]).trim().slice(0, 500) : '';
    const imageUrl = imgMatch ? imgMatch[1] : '';

    if (title && url && url.startsWith('http')) {
      items.push({ title, url, description, imageUrl });
    }
  }

  return items;
}

async function fetchArticleContent(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Extract og:image if better than RSS image
    const paragraphRegex = /<p[^>]*class="[^"]*articleContent[^"]*"[^>]*>(.*?)<\/p>/gsi;
    const genericParagraphRegex = /<p[^>]*>(.*?)<\/p>/gsi;

    const paragraphs = [];
    let pMatch;

    // Try article-specific paragraphs first
    while ((pMatch = paragraphRegex.exec(html)) !== null) {
      const text = stripHtml(pMatch[1]).trim();
      if (text.length > 60) paragraphs.push(text);
    }

    // Fall back to all paragraphs
    if (paragraphs.length < 2) {
      while ((pMatch = genericParagraphRegex.exec(html)) !== null) {
        const text = stripHtml(pMatch[1]).trim();
        if (text.length > 60 && !text.includes('cookie') && !text.includes('subscribe')) {
          paragraphs.push(text);
        }
      }
    }

    return paragraphs.slice(0, 20).join('\n\n').slice(0, 8000) || null;
  } catch {
    return null;
  }
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function processWithLLM(base44, originalTitle, bodyText) {
  const prompt = `You are an automotive news editor for a Baltic car marketplace (serving Estonia, Latvia, Lithuania).

ORIGINAL ARTICLE:
Title: ${originalTitle}
Content: ${bodyText}

YOUR TASK:
1. Rewrite the article in a fresh, engaging style suitable for a European car buyer audience. Keep all key facts but make it feel original (not copied).
2. Translate the rewritten article into Russian, Estonian, Latvian, and Lithuanian.
3. Return ONLY a valid JSON object with these exact keys:
   - title_en: rewritten English title (max 100 chars, catchy)
   - title_ru: Russian title
   - title_et: Estonian title
   - title_lv: Latvian title
   - title_lt: Lithuanian title
   - content_en: rewritten English article body (4-6 paragraphs, ~400-600 words, plain text, no HTML, no markdown). Be detailed — cover the main news, context, specs/prices where available, and what it means for buyers.
   - content_ru: Russian translation of content_en (same length, natural fluent Russian)
   - content_et: Estonian translation of content_en (same length, natural fluent Estonian)
   - content_lv: Latvian translation of content_en (same length, natural fluent Latvian)
   - content_lt: Lithuanian translation of content_en (same length, natural fluent Lithuanian)

Return ONLY the JSON, nothing else.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        title_en: { type: 'string' },
        title_ru: { type: 'string' },
        title_et: { type: 'string' },
        title_lv: { type: 'string' },
        title_lt: { type: 'string' },
        content_en: { type: 'string' },
        content_ru: { type: 'string' },
        content_et: { type: 'string' },
        content_lv: { type: 'string' },
        content_lt: { type: 'string' }
      },
      required: ['title_en', 'title_ru', 'title_et', 'title_lv', 'title_lt', 'content_en', 'content_ru', 'content_et', 'content_lv', 'content_lt']
    }
  });

  return result;
}