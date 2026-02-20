// useDocumentHead — Custom hook for per-route SEO meta tag management
// Zero external dependencies (no react-helmet needed)
// Updates document <title>, <meta>, <link>, and Open Graph tags dynamically
//
// Usage:
//   useDocumentHead({
//     title: 'Page Title',
//     description: 'Page description for SEO',
//     keywords: 'comma, separated, keywords',
//     canonical: 'https://www.interviewanswers.ai/page',
//     og: { title, description, url, type, image }
//   });

import { useEffect } from 'react';

const DEFAULT_TITLE = 'InterviewAnswers.ai - AI-Powered Interview Preparation';
const DEFAULT_DESCRIPTION = 'Ace your next interview with AI-powered practice, real-time prompts, and STAR-method feedback. Prepare smarter, not harder.';

function setMetaTag(attribute, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function useDocumentHead({
  title,
  description,
  keywords,
  canonical,
  robots,
  og = {},
  twitter = {},
} = {}) {
  useEffect(() => {
    // Store originals for cleanup
    const prevTitle = document.title;

    // Title
    if (title) {
      document.title = title;
    }

    // Standard meta tags
    if (description) {
      setMetaTag('name', 'description', description);
    }
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // Robots directive (e.g., 'noindex, nofollow')
    if (robots) {
      setMetaTag('name', 'robots', robots);
    }

    // Canonical URL
    if (canonical) {
      setLinkTag('canonical', canonical);
    }

    // Open Graph
    if (og.title) setMetaTag('property', 'og:title', og.title);
    if (og.description) setMetaTag('property', 'og:description', og.description);
    if (og.url) setMetaTag('property', 'og:url', og.url);
    if (og.type) setMetaTag('property', 'og:type', og.type);
    if (og.image) setMetaTag('property', 'og:image', og.image);

    // Twitter Card
    if (twitter.title) setMetaTag('name', 'twitter:title', twitter.title);
    if (twitter.description) setMetaTag('name', 'twitter:description', twitter.description);
    if (twitter.image) setMetaTag('name', 'twitter:image', twitter.image);

    // Cleanup: restore defaults when component unmounts
    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      setMetaTag('name', 'description', DEFAULT_DESCRIPTION);
      setMetaTag('name', 'keywords', 'interview preparation, job interview, STAR method, behavioral interview, interview practice, AI interview coach');
      setLinkTag('canonical', 'https://www.interviewanswers.ai/');
      setMetaTag('property', 'og:title', DEFAULT_TITLE);
      setMetaTag('property', 'og:description', DEFAULT_DESCRIPTION);
      setMetaTag('property', 'og:url', 'https://www.interviewanswers.ai');
      setMetaTag('name', 'twitter:title', DEFAULT_TITLE);
      setMetaTag('name', 'twitter:description', DEFAULT_DESCRIPTION);
      // Remove robots tag on cleanup (default to indexable)
      const robotsEl = document.querySelector('meta[name="robots"]');
      if (robotsEl) robotsEl.remove();
    };
  }, [title, description, keywords, canonical, robots, og.title, og.description, og.url, og.type, og.image, twitter.title, twitter.description, twitter.image]);
}
