// GET /sitemap.xml — dynamic XML sitemap
// Routed here via the /sitemap.xml rewrite in vercel.json.
// Combines hardcoded static routes with published blog posts fetched
// live from Supabase. Falls back to static routes only if Supabase
// is unreachable — never returns an empty or broken sitemap.

const BASE_URL = 'https://www.interviewanswers.ai';

const STATIC_URLS = [
  { path: '/',                                priority: '1.0', changefreq: 'weekly',  lastmod: '2026-04-15' },
  { path: '/nursing',                         priority: '0.9', changefreq: 'weekly',  lastmod: '2026-04-15' },
  { path: '/star-method-guide',               priority: '0.9', changefreq: 'monthly', lastmod: '2026-04-15' },
  { path: '/behavioral-interview-questions',  priority: '0.9', changefreq: 'monthly', lastmod: '2026-04-15' },
  { path: '/nursing-interview-questions',     priority: '0.9', changefreq: 'monthly', lastmod: '2026-04-15' },
  { path: '/mock-interview-practice',         priority: '0.9', changefreq: 'monthly', lastmod: '2026-04-14' },
  { path: '/tell-me-about-yourself',          priority: '0.9', changefreq: 'monthly', lastmod: '2026-04-14' },
  { path: '/interview-questions-and-answers', priority: '0.9', changefreq: 'monthly', lastmod: '2026-04-14' },
  { path: '/interview-coaching-lessons',      priority: '0.9', changefreq: 'monthly', lastmod: '2026-04-14' },
  { path: '/interview-prep-podcast',          priority: '0.9', changefreq: 'monthly', lastmod: '2026-04-14' },
  { path: '/blog',                            priority: '0.8', changefreq: 'weekly',  lastmod: '2026-05-17' },
  { path: '/onboarding',                      priority: '0.7', changefreq: 'monthly', lastmod: '2026-04-15' },
  { path: '/ethics',                          priority: '0.9', changefreq: 'monthly', lastmod: '2026-04-23' },
  { path: '/privacy',                         priority: '0.3', changefreq: 'yearly',  lastmod: '2026-04-15' },
  { path: '/terms',                           priority: '0.3', changefreq: 'yearly',  lastmod: '2026-04-15' },
];

export default async function handler(req, res) {
  const SUPABASE_URL  = process.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;

  let blogPosts = [];
  if (SUPABASE_URL && SUPABASE_ANON) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,published_at&status=eq.published&order=published_at.desc`,
        {
          headers: {
            'apikey':        SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`,
          },
        }
      );
      if (response.ok) blogPosts = await response.json();
    } catch {
      // Non-fatal — returns static pages only if Supabase is unreachable
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  const entries = [
    ...STATIC_URLS.map(({ path, priority, changefreq, lastmod }) =>
      `\n  <url>\n    <loc>${BASE_URL}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    ),
    ...blogPosts.map(({ slug, published_at }) =>
      `\n  <url>\n    <loc>${BASE_URL}/blog/${slug}</loc>\n    <lastmod>${published_at ? published_at.slice(0, 10) : today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    ),
  ].join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(xml);
}
