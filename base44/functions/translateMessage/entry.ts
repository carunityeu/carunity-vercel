import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, targetLang } = await req.json();
    if (!text || !targetLang) return Response.json({ error: 'Missing text or targetLang' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Translate the following text to ${targetLang}. Return ONLY the translated text, nothing else, no explanations.\n\nText: ${text}`,
    });

    return Response.json({ translated: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});