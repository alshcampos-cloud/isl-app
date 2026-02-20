/**
 * Google Ads Conversion Tracking Utility
 *
 * HOW TO SET UP:
 * 1. Create Google Ads account at ads.google.com
 * 2. Go to Tools → Conversions → New conversion action → Website
 * 3. Get your Conversion ID (e.g., AW-123456789)
 * 4. Create conversion actions and get their labels
 * 5. Replace the placeholder values below with real ones
 * 6. Add your Conversion ID to .env as VITE_GOOGLE_ADS_ID
 *
 * CONVERSION EVENTS:
 * - sign_up: User creates an account (most important)
 * - begin_practice: User starts first practice session
 * - purchase: User buys a 30-Day Pass or Annual plan
 * - page_view_pricing: User views pricing section
 */

// Get the Google Ads Conversion ID from environment
const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || null;

// Conversion labels — replace these after creating conversion actions in Google Ads
// Go to: Google Ads → Tools → Conversions → click each conversion → get the label
const CONVERSION_LABELS = {
  sign_up: import.meta.env.VITE_GADS_LABEL_SIGNUP || null,
  purchase: import.meta.env.VITE_GADS_LABEL_PURCHASE || null,
  begin_practice: import.meta.env.VITE_GADS_LABEL_PRACTICE || null,
  page_view_pricing: import.meta.env.VITE_GADS_LABEL_PRICING || null,
};

/**
 * Check if Google Ads tracking is configured
 */
function isConfigured() {
  return !!(GOOGLE_ADS_ID && typeof window.gtag === 'function');
}

/**
 * Track a Google Ads conversion event
 *
 * @param {string} eventName - One of: sign_up, purchase, begin_practice, page_view_pricing
 * @param {object} params - Optional parameters (value, currency, transaction_id)
 */
export function trackGoogleAdsConversion(eventName, params = {}) {
  if (!isConfigured()) {
    // Silently skip if not configured — this is expected in development
    // and before Google Ads account is set up
    if (import.meta.env.DEV) {
      console.log(`[Google Ads] Would track: ${eventName}`, params);
    }
    return;
  }

  const label = CONVERSION_LABELS[eventName];
  if (!label) {
    console.warn(`[Google Ads] No conversion label configured for: ${eventName}`);
    return;
  }

  const conversionData = {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
    ...params,
  };

  try {
    window.gtag('event', 'conversion', conversionData);
    console.log(`[Google Ads] Conversion tracked: ${eventName}`, conversionData);
  } catch (err) {
    // Never let tracking errors break the app
    console.warn('[Google Ads] Tracking error:', err);
  }
}

/**
 * Track sign-up conversion
 * Call this after successful account creation
 */
export function trackSignUp() {
  trackGoogleAdsConversion('sign_up', {
    value: 5.0,
    currency: 'USD',
  });
}

/**
 * Track purchase conversion
 * Call this after successful Stripe checkout
 *
 * @param {number} value - Purchase amount (e.g., 14.99, 19.99, 149.99)
 * @param {string} transactionId - Stripe session/payment ID
 */
export function trackPurchase(value, transactionId) {
  trackGoogleAdsConversion('purchase', {
    value: value,
    currency: 'USD',
    transaction_id: transactionId || undefined,
  });
}

/**
 * Track when user begins first practice session
 */
export function trackBeginPractice() {
  trackGoogleAdsConversion('begin_practice', {
    value: 2.0,
    currency: 'USD',
  });
}

/**
 * Track pricing page view (micro-conversion)
 */
export function trackPricingView() {
  trackGoogleAdsConversion('page_view_pricing', {
    value: 0.5,
    currency: 'USD',
  });
}
