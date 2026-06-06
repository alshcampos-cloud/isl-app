// Blog Index — /blog
// Lists all published articles from the blog_posts table.
// Reads via Supabase REST API using the anon key (RLS allows SELECT on published rows).
// No auth required. Fully public and indexable.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowRight, BookOpen, Calendar, Tag } from 'lucide-react';
import useDocumentHead from '../../hooks/useDocumentHead';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function ArticleCard({ post }) {
  return (
    <article className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-teal-200 transition-all group">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {(post.keywords ?? []).slice(0, 2).map(kw => (
          <span key={kw} className="bg-teal-50 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {kw}
          </span>
        ))}
        {post.published_at && (
          <span className="text-gray-400 text-xs flex items-center gap-1 ml-auto">
            <Calendar className="w-3 h-3" />
            {formatDate(post.published_at)}
          </span>
        )}
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors leading-snug">
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      {post.meta_description && (
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {post.meta_description}
        </p>
      )}
      <Link
        to={`/blog/${post.slug}`}
        className="inline-flex items-center gap-1.5 text-teal-600 font-semibold text-sm hover:gap-2.5 transition-all"
      >
        Read article <ArrowRight className="w-4 h-4" />
      </Link>
    </article>
  );
}

export default function BlogIndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useDocumentHead({
    title: 'Interview Prep Blog — Research-Backed Tips | InterviewAnswers.ai',
    description: 'Evidence-based interview preparation articles. Psychology research, STAR method guides, anxiety tips, and practice strategies from InterviewAnswers.ai.',
    keywords: 'interview preparation, interview tips, STAR method, interview anxiety, behavioral interview, job interview advice',
    canonical: 'https://www.interviewanswers.ai/blog',
    og: {
      title: 'Interview Prep Blog — InterviewAnswers.ai',
      description: 'Research-backed interview preparation articles. Practice strategies grounded in cognitive psychology.',
      url: 'https://www.interviewanswers.ai/blog',
      type: 'website',
    },
    twitter: {
      title: 'Interview Prep Blog — InterviewAnswers.ai',
      description: 'Research-backed interview preparation articles.',
    },
  });

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&select=id,title,slug,meta_description,keywords,published_at&order=published_at.desc`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );
        if (!res.ok) throw new Error(`Failed to load articles (${res.status})`);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
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

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <span className="text-teal-700 font-semibold text-sm">Interview Prep Blog</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Research-Backed<br className="hidden sm:block" />
          <span className="text-teal-600">Interview Preparation</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
          Every article is grounded in cognitive psychology research — the testing effect, deliberate practice,
          and memory science. Practice before the interview. Never during it.
        </p>
      </header>

      {/* Article List */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-24 text-gray-500">
            <p className="text-lg">Could not load articles right now.</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-24 text-gray-500">
            <p className="text-lg">No articles published yet.</p>
            <p className="text-sm mt-1">Check back soon.</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map(post => <ArticleCard key={post.id} post={post} />)}
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="bg-gradient-to-r from-teal-600 to-emerald-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to Put It Into Practice?</h2>
          <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
            Reading about interview prep is step one. Practicing out loud is what builds the skill.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors text-lg"
          >
            Start Practicing Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-teal-200 text-sm mt-4">No credit card required.</p>
        </div>
      </section>

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
              <Link to="/blog" className="text-teal-400 font-medium">Blog</Link>
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
