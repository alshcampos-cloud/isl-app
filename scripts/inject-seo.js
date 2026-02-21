#!/usr/bin/env node
/**
 * inject-seo.js — Post-build script that creates route-specific HTML files
 * with unique <title>, <meta description>, OG tags, and canonical URLs.
 *
 * WHY: Vite SPAs serve the same index.html for every route. Googlebot may not
 * execute JavaScript, so it sees identical meta tags for /nurse, /star-method-guide, etc.
 * This script creates dist/nurse/index.html, dist/star-method-guide/index.html, etc.
 * with the correct meta tags already baked in — no JS execution needed.
 *
 * HOW: Runs after `vite build`. Reads dist/index.html as template, replaces meta tags
 * per route, writes to dist/<route>/index.html. Vercel serves these automatically.
 *
 * USAGE: Add to package.json: "build": "vite build && node scripts/inject-seo.js"
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

// Route-specific SEO data
const ROUTES = {
  '/nurse': {
    title: 'NurseInterviewPro - AI Nursing Interview Practice | SBAR & STAR Coaching',
    description: 'Practice nursing interview questions with AI coaching. SBAR communication drills, STAR method feedback, and specialty-specific questions for ED, ICU, OR, L&D, Pediatrics, and more. Built by nurses, for nurses.',
    canonical: 'https://www.interviewanswers.ai/nurse',
    keywords: 'nursing interview questions, nurse interview practice, nursing job interview, SBAR interview, STAR method nursing, RN interview questions, nursing interview preparation',
  },
  '/star-method-guide': {
    title: 'The Complete STAR Method Guide (2026) — How to Answer Behavioral Interview Questions | InterviewAnswers.ai',
    description: 'Learn the STAR method for behavioral interviews. Step-by-step guide with real examples for Situation, Task, Action, Result answers. Practice with AI coaching. Free.',
    canonical: 'https://www.interviewanswers.ai/star-method-guide',
    keywords: 'STAR method, STAR method examples, behavioral interview questions, STAR interview technique, situation task action result, interview preparation',
  },
  '/behavioral-interview-questions': {
    title: '40 Behavioral Interview Questions by Category (2026) | InterviewAnswers.ai',
    description: '40 behavioral interview questions organized by category: leadership, problem solving, teamwork, conflict, and more. Practice with AI mock interviews. Free question bank.',
    canonical: 'https://www.interviewanswers.ai/behavioral-interview-questions',
    keywords: 'behavioral interview questions, common behavioral interview questions, STAR method questions, leadership interview questions, teamwork interview questions',
  },
  '/nursing-interview-questions': {
    title: '35 Nursing Interview Questions by Category (2026) | NurseInterviewPro',
    description: '35 nursing interview questions for RNs, new grads, and specialty nurses. Covers patient care, SBAR communication, teamwork, ethics, and more. Practice with AI coaching.',
    canonical: 'https://www.interviewanswers.ai/nursing-interview-questions',
    keywords: 'nursing interview questions, nurse interview questions and answers, new grad nurse interview questions, SBAR interview, RN interview questions',
  },
  '/onboarding': {
    title: 'Get Started Free — InterviewAnswers.ai',
    description: 'Create your free account and start practicing interviews with AI coaching, STAR method feedback, and mock interviews. No credit card required.',
    canonical: 'https://www.interviewanswers.ai/onboarding',
    keywords: 'interview preparation sign up, AI interview practice, free interview coaching',
  },
  '/privacy': {
    title: 'Privacy Policy — InterviewAnswers.ai',
    description: 'Privacy policy for InterviewAnswers.ai. Learn how we protect your data and interview practice history.',
    canonical: 'https://www.interviewanswers.ai/privacy',
    keywords: 'privacy policy, data protection',
  },
  '/terms': {
    title: 'Terms of Service — InterviewAnswers.ai',
    description: 'Terms of service for InterviewAnswers.ai interview preparation platform.',
    canonical: 'https://www.interviewanswers.ai/terms',
    keywords: 'terms of service, terms and conditions',
  },
  '/login': {
    title: 'Sign In — InterviewAnswers.ai',
    description: 'Sign in to your InterviewAnswers.ai account to continue practicing interviews.',
    canonical: 'https://www.interviewanswers.ai/login',
    keywords: 'interview answers login, sign in',
    robots: 'noindex, follow',
  },
  '/nursing': {
    title: 'Nursing Interview Dashboard | NurseInterviewPro by InterviewAnswers.ai',
    description: 'Access your nursing interview practice dashboard. Track progress across 8 specialties with AI-powered mock interviews.',
    canonical: 'https://www.interviewanswers.ai/nursing',
    keywords: 'nursing interview dashboard, nursing interview practice',
    robots: 'noindex, follow',
  },
  '/app': {
    title: 'Interview Practice Dashboard — InterviewAnswers.ai',
    description: 'Your AI interview practice dashboard. Access mock interviews, STAR method coaching, live prompter, and track your progress.',
    canonical: 'https://www.interviewanswers.ai/app',
    keywords: 'interview practice dashboard, AI interview coach',
    robots: 'noindex, follow',
  },
};

function injectSEO(html, seo) {
  let result = html;

  // Replace <title>
  result = result.replace(
    /<title>[^<]*<\/title>/,
    `<title>${seo.title}</title>`
  );

  // Replace meta description
  result = result.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${seo.description}" />`
  );

  // Replace meta keywords
  if (seo.keywords) {
    result = result.replace(
      /<meta name="keywords" content="[^"]*"\s*\/?>/,
      `<meta name="keywords" content="${seo.keywords}" />`
    );
  }

  // Replace canonical URL
  result = result.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${seo.canonical}" />`
  );

  // Replace OG tags
  result = result.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${seo.title}" />`
  );
  result = result.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${seo.description}" />`
  );
  result = result.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${seo.canonical}" />`
  );

  // Replace Twitter tags
  result = result.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${seo.title}" />`
  );
  result = result.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${seo.description}" />`
  );

  // Add robots meta if specified (noindex for auth pages)
  if (seo.robots) {
    result = result.replace(
      '</head>',
      `    <meta name="robots" content="${seo.robots}" />\n  </head>`
    );
  }

  return result;
}

// Main
console.log('🔍 inject-seo: Starting SEO meta tag injection...');

const templatePath = join(DIST, 'index.html');
if (!existsSync(templatePath)) {
  console.error('❌ inject-seo: dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const template = readFileSync(templatePath, 'utf-8');
let created = 0;

for (const [route, seo] of Object.entries(ROUTES)) {
  const routeDir = join(DIST, route.slice(1)); // Remove leading /
  const routeHtml = join(routeDir, 'index.html');

  // Create directory if it doesn't exist
  if (!existsSync(routeDir)) {
    mkdirSync(routeDir, { recursive: true });
  }

  // Inject SEO data and write
  const html = injectSEO(template, seo);
  writeFileSync(routeHtml, html, 'utf-8');
  created++;
  console.log(`  ✅ ${route} → ${seo.title.substring(0, 60)}...`);
}

console.log(`\n🎉 inject-seo: Created ${created} route-specific HTML files.`);
