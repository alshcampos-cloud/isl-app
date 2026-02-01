# InterviewAnswers.ai

AI-powered interview preparation platform that helps you ace your next job interview with real-time coaching, STAR-method feedback, and personalized practice.

## Features

- **Live Prompter** - Real-time AI suggestions during actual interviews
- **AI Interviewer** - Practice with an AI that asks follow-up questions
- **Practice Mode** - Record answers and get STAR-method feedback
- **Template Library** - 44 curated interview questions across 6 categories
- **Usage Dashboard** - Track your practice sessions and progress

## Tech Stack

- **Frontend**: React 18.2 with Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **AI**: OpenAI GPT-4 for coaching and feedback
- **Payments**: Stripe Checkout + Customer Portal
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/isl-app.git
cd isl-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_PRO_PRICE_ID=your_stripe_price_id

# OpenAI (set in Supabase Edge Functions)
# OPENAI_API_KEY=your_openai_key
```

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
  App.jsx              # Main application component
  Auth.jsx             # Authentication flow
  Components/          # React components
    AIInterviewer/     # AI interview mode
    PricingPage.jsx    # Subscription plans
    Tutorial.jsx       # Onboarding tutorial
    ...
  lib/
    supabase.js        # Supabase client
  utils/
    creditSystem.js    # Usage tracking
    fetchWithRetry.js  # API resilience
supabase/
  functions/           # Edge Functions
  migrations/          # Database migrations
public/
  robots.txt           # SEO
  sitemap.xml          # SEO
```

## Subscription Tiers

| Feature | Free | Pro ($29.99/mo) |
|---------|------|-----------------|
| AI Interviewer | 5/day | Unlimited |
| Answer Assistant | 3/day | Unlimited |
| Live Prompter | 5 min/day | Unlimited |
| Practice Mode | Unlimited | Unlimited |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

Need help? Contact us at support@interviewanswers.ai

## License

Proprietary - All rights reserved
