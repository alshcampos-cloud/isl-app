// Native In-App Purchase handler for iOS and Android
// Uses RevenueCat for StoreKit 2 + automatic receipt validation.
// Web payments continue to use Stripe via GeneralPricing.jsx.
//
// RevenueCat Setup:
// 1. Create account at https://app.revenuecat.com
// 2. Add iOS app with Bundle ID + App Store Connect API Key (.p8)
// 3. Create products matching PRODUCTS below in App Store Connect
// 4. Import products into RevenueCat → create entitlement "pro" → create offering
// 5. Set VITE_REVENUECAT_APPLE_KEY in .env

import { isNativeApp, isIOS, isAndroid, getPaymentProvider } from './platform';

// Product IDs — must match App Store Connect
const PRODUCTS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
  // Legacy IDs (App Store Connect non-consumables)
  GENERAL_30DAY: 'ai.interviewanswers.general.30day',
  NURSING_30DAY: 'ai.interviewanswers.nursing.30day',
  ANNUAL_ALL_ACCESS: 'ai.interviewanswers.annual.allaccess',
};

// Entitlement ID — must match RevenueCat dashboard
const ENTITLEMENT_ID = 'Koda Labs Pro';

// RevenueCat API keys
const RC_APPLE_KEY = import.meta.env.VITE_REVENUECAT_APPLE_KEY || 'test_tWLPHzYPAPDEETSJUWdnhSebTlh';
const RC_GOOGLE_KEY = import.meta.env.VITE_REVENUECAT_GOOGLE_KEY || '';

let Purchases = null;
let isInitialized = false;
let storeReady = false;
let currentOffering = null;

/**
 * Initialize RevenueCat SDK.
 * Call once on app startup (only activates on native platforms).
 */
export async function initializePurchases(userId = null) {
  if (isInitialized) return true;
  if (!isNativeApp()) return false;

  try {
    const rc = await import('@revenuecat/purchases-capacitor');
    Purchases = rc.Purchases;

    const platform = isIOS() ? 'ios' : isAndroid() ? 'android' : null;
    const apiKey = platform === 'ios' ? RC_APPLE_KEY : RC_GOOGLE_KEY;

    if (!apiKey) {
      console.warn(`[IAP] No RevenueCat API key for ${platform}. Set VITE_REVENUECAT_${platform?.toUpperCase()}_KEY`);
      return false;
    }

    // Enable debug logs in development
    if (import.meta.env.DEV) {
      await Purchases.setLogLevel({ level: rc.LOG_LEVEL.DEBUG });
    }

    // Configure RevenueCat
    await Purchases.configure({ apiKey });

    // Identify user for cross-platform sync
    if (userId) {
      await Purchases.logIn({ appUserID: userId });
    }

    // Prefetch offerings
    try {
      const offerings = await Purchases.getOfferings();
      currentOffering = offerings.current;
      if (currentOffering) {
        console.log(`[IAP] Offering loaded: ${currentOffering.identifier}, ${currentOffering.availablePackages?.length || 0} packages`);
      }
    } catch (err) {
      console.warn('[IAP] Could not fetch offerings:', err.message);
    }

    isInitialized = true;
    storeReady = true;
    console.log(`[IAP] RevenueCat initialized for ${platform}`);
    return true;
  } catch (err) {
    console.error('[IAP] Init error:', err);
    return false;
  }
}

/**
 * Check if the store is ready.
 */
export function isStoreReady() {
  return storeReady;
}

/**
 * Get the current offering (product packages with pricing info).
 */
export function getCurrentOffering() {
  return currentOffering;
}

/**
 * Get a specific product's display info from the offering.
 */
export function getProduct(productId) {
  if (!currentOffering) return null;
  return currentOffering.availablePackages?.find(
    pkg => pkg.storeProduct?.productIdentifier === productId
  )?.storeProduct || null;
}

/**
 * Purchase a package by product ID.
 * RevenueCat handles receipt validation automatically.
 */
export async function purchaseProduct(productId, userId) {
  if (!isNativeApp()) {
    return { success: false, error: 'Not a native platform — use Stripe' };
  }

  if (!Purchases || !storeReady) {
    await initializePurchases(userId);
    if (!Purchases || !storeReady) {
      return { success: false, error: 'Store not initialized. Please close and reopen the app.' };
    }
  }

  try {
    // Find the package matching this product ID
    const pkg = currentOffering?.availablePackages?.find(
      p => p.storeProduct?.productIdentifier === productId
    );

    if (!pkg) {
      // Try purchasing by product ID directly
      const result = await Purchases.purchaseStoreProduct({
        product: { productIdentifier: productId }
      });
      return checkEntitlement(result);
    }

    // Purchase the package
    const result = await Purchases.purchasePackage({ aPackage: pkg });
    return checkEntitlement(result);
  } catch (err) {
    // User cancelled
    if (err.code === 1 || err.message?.includes('cancel') || err.message?.includes('Cancel')) {
      return { success: false, error: 'cancelled' };
    }
    console.error('[IAP] Purchase error:', err);
    return { success: false, error: err.message || 'Purchase failed' };
  }
}

/**
 * Check if purchase result grants pro entitlement.
 */
function checkEntitlement(result) {
  const isPro = result.customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
  if (isPro) {
    return { success: true, tier: 'pro' };
  }
  // Purchase went through but entitlement not active — might need server sync
  console.warn('[IAP] Purchase completed but entitlement not active yet');
  return { success: true, tier: 'pending' };
}

// Backwards-compatible wrapper used by NativeCheckout.jsx and GeneralPricing.jsx
export async function purchaseProNative(userId) {
  return purchaseProduct(PRODUCTS.GENERAL_30DAY, userId);
}

/**
 * Check if user has active pro entitlement.
 */
export async function checkSubscriptionStatus() {
  if (!isNativeApp() || !Purchases) {
    return { isPro: false, error: 'Not on native platform' };
  }

  try {
    const info = await Purchases.getCustomerInfo();
    const isPro = info.customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;
    return { isPro, customerInfo: info.customerInfo, error: null };
  } catch (err) {
    return { isPro: false, error: err.message };
  }
}

/**
 * Restore purchases — required by Apple Guideline 3.1.1.
 */
export async function restorePurchases(userId) {
  if (!isNativeApp()) {
    return { restored: false, error: 'Restore is available in the iOS app. Web subscriptions sync automatically.' };
  }

  if (!Purchases || !storeReady) {
    await initializePurchases(userId);
    if (!Purchases) return { restored: false, error: 'Store not initialized' };
  }

  try {
    const result = await Purchases.restorePurchases();
    const isPro = result.customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] !== undefined;

    if (isPro) {
      return { restored: true };
    }
    return { restored: false, error: 'No active purchases found' };
  } catch (err) {
    console.error('[IAP] Restore error:', err);
    return { restored: false, error: err.message || 'Failed to restore purchases' };
  }
}

/**
 * Identify user in RevenueCat (call after login).
 */
export async function identifyUser(userId) {
  if (!isNativeApp() || !Purchases || !userId) return;
  try {
    await Purchases.logIn({ appUserID: userId });
  } catch (err) {
    console.error('[IAP] identifyUser error:', err);
  }
}

/**
 * Log out from RevenueCat (call on sign out).
 */
export async function logoutIAP() {
  if (!isNativeApp() || !Purchases) return;
  try {
    await Purchases.logOut();
  } catch (err) {
    console.error('[IAP] logoutIAP error:', err);
  }
}

/**
 * Get the subscription management URL.
 */
export function getManageSubscriptionURL() {
  if (!isNativeApp()) return '/settings';
  if (isIOS()) return 'https://apps.apple.com/account/subscriptions';
  if (isAndroid()) return 'https://play.google.com/store/account/subscriptions';
  return '/settings';
}

export { PRODUCTS, ENTITLEMENT_ID };
