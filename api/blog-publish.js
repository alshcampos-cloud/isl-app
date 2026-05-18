// Vercel Serverless Function — POST /api/blog-publish
// Called by the IAI writing agent to save a draft article to Supabase.
//
// Auth: Bearer token must match BLOG_AGENT_SECRET env var.
// DB writes use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
// Required env vars (set in Vercel dashboard):
//   BLOG_AGENT_SECRET        — shared secret between this endpoint and the writing agent
//   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (bypasses RLS)
//   VITE_SUPABASE_URL        — already set for the frontend; reused here

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verify agent secret
  const auth = req.headers['authorization'];
  const expected = `Bearer ${process.env.BLOG_AGENT_SECRET}`;
  if (!auth || auth !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { title, slug, body, meta_description, keywords, source_brief } = req.body ?? {};

  if (!title || !slug || !body) {
    return res.status(400).json({ error: 'title, slug, and body are required' });
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('[blog-publish] Missing Supabase env vars');
    return res.status(500).json({ error: 'Server misconfigured — missing Supabase credentials' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        title,
        slug,
        body,
        meta_description: meta_description ?? null,
        keywords: Array.isArray(keywords) ? keywords : (keywords ? [keywords] : []),
        status: 'draft',
        source_brief: source_brief ?? null,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Supabase ${response.status}: ${err}`);
    }

    const [post] = await response.json();
    console.log(`[blog-publish] Draft saved: ${post.id} — ${post.slug}`);
    return res.status(201).json({ id: post.id, slug: post.slug });

  } catch (err) {
    console.error('[blog-publish] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
