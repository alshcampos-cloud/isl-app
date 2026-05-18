// Blog Post — /blog/:slug
// Fetches and renders a single published article by slug.
// SEO: full useDocumentHead + JSON-LD Article structured data.
// Body renderer handles both ## Heading and ---H2--- styles from the writing agent.

import { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Brain, ArrowRight, ArrowLeft, Calendar, Tag } from 'lucide-react';
import useDocumentHead from '../../hooks/useDocumentHead';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Body Renderer ─────────────────────────────────────────────────────────────
// Converts the writing agent's plain-text body into React elements.
// Handles: ## Heading, ---H2--- + heading line, ---CONCLUSION--- markers,
//          --- horizontal rules, **bold**, *italic*, and paragraph blocks.

function applyInlineFormatting(text) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={match.index}>{match[3]}</em>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderBody(raw) {
  if (!raw) return null;

  // Normalize ---H2--- markers: replace `---H2---\nHeading` with `## Heading`
  let normalized = raw
    .replace(/---H2---\s*\n([^\n]+)/g, (_, heading) => `## ${heading.trim()}`)
    .replace(/---CONCLUSION---\s*\n?/gi, '## Conclusion\n')
    .replace(/---Conclusion---\s*\n?/g, '## Conclusion\n');

  const blocks = normalized.split(/\n{2,}/);
  const elements = [];

  blocks.forEach((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // H2 heading
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3).replace(/\*\*/g, '');
      elements.push(
        <h2 key={i} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          {text}
        </h2>
      );
      return;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      elements.push(<hr key={i} className="my-8 border-gray-200" />);
      return;
    }

    // Bullet list block
    const lines = trimmed.split('\n');
    const isList = lines.every(l => /^[-•*]\s/.test(l.trim()) || l.trim() === '');
    if (isList && lines.some(l => /^[-•*]\s/.test(l.trim()))) {
      elements.push(
        <ul key={i} className="list-disc list-outside ml-6 space-y-2 my-4 text-gray-700 leading-relaxed">
          {lines
            .filter(l => /^[-•*]\s/.test(l.trim()))
            .map((l, j) => (
              <li key={j}>{applyInlineFormatting(l.replace(/^[-•*]\s/, '').trim())}</li>
            ))}
        </ul>
      );
      return;
    }

    // Numbered list block
    const isNumbered = lines.every(l => /^\d+\.\s/.test(l.trim()) || l.trim() === '');
    if (isNumbered && lines.some(l => /^\d+\.\s/.test(l.trim()))) {
      elements.push(
        <ol key={i} className="list-decimal list-outside ml-6 space-y-2 my-4 text-gray-700 leading-relaxed">
          {lines
            .filter(l => /^\d+\.\s/.test(l.trim()))
            .map((l, j) => (
              <li key={j}>{applyInlineFormatting(l.replace(/^\d+\.\s/, '').trim())}</li>
            ))}
        </ol>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-gray-700 leading-relaxed text-lg mb-0">
        {applyInlineFormatting(trimmed)}
      </p>
    );
  });

  return elements;
}

// ── Component ─────────────────────────────────────────────────────────────────

function ArticleHead({ post }) {
  useDocumentHead({
    title: `${post.title} | InterviewAnswers.ai`,
    description: post.meta_description ?? undefined,
    keywords: (post.keywords ?? []).join(', '),
    canonical: `https://www.interviewanswers.ai/blog/${post.slug}`,
    og: {
      title: post.title,
      description: post.meta_description ?? undefined,
      url: `https://www.interviewanswers.ai/blog/${post.slug}`,
      type: 'article',
    },
    twitter: {
      title: post.title,
      description: post.meta_description ?? undefined,
    },
  });
  return null;
}

function JsonLd({ post }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description ?? '',
    url: `https://www.interviewanswers.ai/blog/${post.slug}`,
    datePublished: post.published_at ?? post.created_at,
    publisher: {
      '@type': 'Organization',
      name: 'InterviewAnswers.ai',
      url: 'https://www.interviewanswers.ai',
    },
    keywords: (post.keywords ?? []).join(', '),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=*&limit=1`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (!data.length) { setNotFound(true); return; }
        setPost(data[0]);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (notFound) return <Navigate to="/blog" replace />;

  return (
    <div className="min-h-screen bg-white">
      {post && <ArticleHead post={post} />}
      {post && <JsonLd post={post} />}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">InterviewAnswers.ai</span>
          </Link>
          <Link
            to="/onboarding"
            className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all"
          >
            Practice Free
          </Link>
        </div>
      </nav>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Article */}
      {!loading && post && (
        <>
          {/* Breadcrumb */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
            <nav className="text-sm text-gray-500 flex items-center gap-1">
              <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
              <span className="mx-1">/</span>
              <Link to="/blog" className="hover:text-teal-600 transition-colors">Blog</Link>
              <span className="mx-1">/</span>
              <span className="text-gray-900 truncate max-w-xs">{post.title}</span>
            </nav>
          </div>

          {/* Header */}
          <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-10">
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Interview Guide
              </span>
              {(post.keywords ?? []).slice(0, 1).map(kw => (
                <span key={kw} className="text-gray-500 text-xs flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {kw}
                </span>
              ))}
              {post.published_at && (
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDate(post.published_at)}
                </span>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              {post.title}
            </h1>
            {post.meta_description && (
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl border-l-4 border-teal-400 pl-4">
                {post.meta_description}
              </p>
            )}
          </header>

          {/* Body */}
          <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
            {renderBody(post.body)}

            {/* CTA */}
            <div className="mt-12 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-3">Put This Into Practice</h2>
              <p className="text-teal-100 mb-6 max-w-xl mx-auto">
                Reading builds awareness. Practicing out loud builds skill. InterviewAnswers.ai gives you
                realistic mock interviews and immediate feedback — free to start.
              </p>
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors"
              >
                Start Practicing Free <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-teal-200 text-sm mt-3">No credit card required.</p>
            </div>

            {/* Back link */}
            <div className="pt-4">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Back to all articles
              </Link>
            </div>
          </article>
        </>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">InterviewAnswers.ai</span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link to="/star-method-guide" className="hover:text-white transition-colors">STAR Method</Link>
              <Link to="/behavioral-interview-questions" className="hover:text-white transition-colors">Behavioral Questions</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} InterviewAnswers.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
