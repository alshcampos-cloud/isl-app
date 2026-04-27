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
import { showNursingFeatures } from './appTarget';

// Product IDs — must match App Store Connect.
// Nursing-specific products are only exposed on builds where nursing is enabled
// (Apple 4.3(a) compliance — general builds must not surface nursing SKUs).
const PRODUCTS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
  // Legacy IDs (App Store Connect non-consumables)
  GENERAL_30DAY: 'ai.interviewanswers.general.30day',
  ANNUAL_ALL_ACCESS: 'ai.interviewanswers.annual.allaccess',
  ...(showNursingFeatures() ? { NURSING_30DAY: 'ai.interviewanswers.nursing.30day' } : {}),
};

// Entitlement ID — must match RevenueCat dashboard
const ENTITLEMENT_ID = 'Koda Labs Pro';

// RevenueCat API keys
const RC_APPLE_KEY = import.meta.env.VITE_REVENUECAT_APPLE_KEY || 'appl_EVayWIHevmksvikfiOFXvbzGpxd';
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

    // Prefetch offerings (the preferred path — packages with pricing display info)
    let offeringPackageCount = 0;
    try {
      const offerings = await Purchases.getOfferings();
      currentOffering = offerings.current;
      offeringPackageCount = currentOffering?.availablePackages?.length || 0;
      if (currentOffering) {
        console.log(`[IAP] Offering loaded: ${currentOffering.identifier}, ${offeringPackageCount} packages`);
      } else {
        console.warn('[IAP] No current offering — RevenueCat dashboard may not have a default offering set.');
      }
    } catch (err) {
      console.warn('[IAP] Could not fetch offerings:', err.message);
    }

    // Verify at least our known products are reachable. If the offering came
    // back empty AND getProducts can't find any of them, the store is not
    // actually ready — flag it loudly so the UI can show a clear error
    // instead of letting the user tap a Buy button that throws.
    let productFetchOk = offeringPackageCount > 0;
    if (!productFetchOk) {
      try {
        const knownIds = Object.values(PRODUCTS);
        const probe = await Purchases.getProducts({ productIdentifiers: knownIds });
        const found = probe?.products?.length || 0;
        if (found > 0) {
          productFetchOk = true;
          console.log(`[IAP] Offering empty but getProducts found ${found}/${knownIds.length} product(s).`);
        } else {
          console.error(`[IAP] storeReady=false: no offering and getProducts returned 0 of ${knownIds.length} known IDs. Check RevenueCat → default offering → packages.`);
        }
      } catch (err) {
        console.error('[IAP] storeReady=false: getProducts probe threw:', err?.message ?? err);
      }
    }

    isInitialized = true;
    storeReady = productFetchOk;
    console.log(`[IAP] RevenueCat initialized for ${platform} — storeReady=${storeReady}`);
    return storeReady;
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
    // Preferred path: find the package in the current offering. Packages
    // carry pricing/intro-offer metadata configured in RevenueCat.
    //
    // BUG FIX (Apr 26, 2026): RC Capacitor SDK v12 PurchasesStoreProduct
    // exposes the product ID via `identifier`, NOT `productIdentifier`.
    // The old comparison against `productIdentifier` always returned
    // undefined → package never found → forced into fallback path that
    // hit "Product parameter did not have identifier key" error from
    // RevenueCat's iOS Swift bridge.
    // Source: node_modules/@revenuecat/purchases-typescript-internal-esm/
    //         dist/offerings.d.ts → interface PurchasesStoreProduct
    //         { readonly identifier: string; ... }
    const pkg = currentOffering?.availablePackages?.find(
      p => p.storeProduct?.identifier === productId
    );

    if (pkg) {
      console.log(`[IAP] Purchasing via offering package: ${pkg.identifier}`);
      const result = await Purchases.purchasePackage({ aPackage: pkg });
      return checkEntitlement(result);
    }

    // Fallback: package not attached to current offering. Fetch the
    // StoreProduct directly via getProducts (returns a real StoreProduct
    // object) and purchase that. Critical: purchaseStoreProduct requires
    // the FULL StoreProduct, not a stub. Passing { productIdentifier: x }
    // (legacy key name) is what was breaking IAP and triggering the
    // App Store rejection.
    console.warn(
      `[IAP] Product "${productId}" not in offering "${currentOffering?.identifier ?? 'none'}" (offering had ${currentOffering?.availablePackages?.length ?? 0} packages). Falling back to getProducts.`
    );
    const productsResult = await Purchases.getProducts({
      productIdentifiers: [productId],
    });
    const storeProduct = productsResult?.products?.[0];
    if (!storeProduct) {
      console.error(
        `[IAP] getProducts returned 0 products for ID "${productId}". Verify product is in App Store Connect AND attached to RevenueCat default offering.`
      );
      return {
        success: false,
        error:
          'This purchase is temporarily unavailable. Please restart the app or contact support if it persists.',
      };
    }

    // Defensive: log the storeProduct shape so a future failure surfaces
    // the actual key set, not a generic "did not have identifier" error.
    console.log('[IAP] Fallback storeProduct keys:', Object.keys(storeProduct ?? {}));
    if (!storeProduct.identifier) {
      console.error(
        `[IAP] storeProduct missing 'identifier' key. Got keys: ${Object.keys(storeProduct).join(', ')}. SDK version mismatch?`
      );
      return {
        success: false,
        error: 'Purchase configuration error. Please restart the app and try again.',
      };
    }

    const result = await Purchases.purchaseStoreProduct({ product: storeProduct });
    return checkEntitlement(result);
  } catch (err) {
    // User cancelled — explicit handling so the UI doesn't show an error toast
    if (err.code === 1 || err.code === '1' || /cancel/i.test(err.message ?? '')) {
      return { success: false, error: 'cancelled' };
    }
    // User-facing error: replace native bridge error messages with something
    // a panicking user can act on.
    //
    // DIAGNOSTIC MODE (Apr 26 evening, Build 34): we're hunting a generic
    // "Purchase failed" error and need the underlying RC/StoreKit signal
    // to surface in the toast instead of being swallowed. Includes:
    //   - err.code (RC error code: 0=unknown, 2=storeProblem, 7=ineligibleError, etc.)
    //   - err.underlyingErrorMessage (the raw StoreKit / Apple error)
    //   - err.message (RC's own description)
    // This is verbose but actionable. Once IAP is verified working, we'll
    // shorten the user-facing message back to a friendly one.
    console.error('[IAP] Purchase error:', err);
    console.error('[IAP] err.code:', err.code, 'err.message:', err.message);
    console.error('[IAP] err.underlyingErrorMessage:', err.underlyingErrorMessage);
    console.error('[IAP] full err keys:', Object.keys(err ?? {}));

    const friendly = (() => {
      const msg = (err.message ?? '').toLowerCase();
      const underlying = err.underlyingErrorMessage ?? '';
      if (msg.includes('payment') || msg.includes('card')) {
        return 'Payment failed. Please check your payment method and try again.';
      }
      if (msg.includes('network') || msg.includes('connection')) {
        return 'Network issue. Please check your connection and try again.';
      }
      if (msg.includes('not allowed') || msg.includes('not permitted')) {
        return 'Purchases are restricted on this device. Please check Screen Time or Family Sharing settings.';
      }
      if (msg.includes('agreement') || underlying.includes('agreement') || msg.includes('paid apps')) {
        return 'Apple Paid Apps Agreement requires action. App owner must check App Store Connect → Agreements.';
      }
      if (msg.includes('sandbox') || underlying.includes('sandbox')) {
        return 'Sandbox issue: ensure a sandbox tester is signed in via Settings → App Store → Sandbox Account.';
      }
      // DIAGNOSTIC: surface the raw error in the user toast so the founder
      // can see what's actually wrong instead of staring at "Purchase failed."
      const codeStr = err.code !== undefined ? `code ${err.code}` : 'unknown code';
      const detail = err.message || err.underlyingErrorMessage || 'no message';
      return `Purchase failed (${codeStr}): ${detail}. Tell support if this persists.`;
    })();
    return { success: false, error: friendly };
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
