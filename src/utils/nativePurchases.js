// Native In-App Purchase handler for iOS and Android
// This module handles Apple/Google payments when running as a native app.
// Web payments continue to use the existing StripeCheckout.jsx flow.
//
// Uses cordova-plugin-purchase (v13+) for StoreKit 2 support.

import { isNativeApp, getPaymentProvider } from './platform';

// Product IDs — must match what's configured in App Store Connect / Google Play Console
const PRODUCTS = {
  PRO_MONTHLY: 'ai.interviewanswers.pro.monthly',
};

// Reference to the store instance (set during initialization)
let store = null;
let storeReady = false;
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

/**
 * Wait for the CdvPurchase plugin to become available.
 * The plugin loads asynchronously via Cordova, so it may not be
 * on window immediately.
 */
function waitForCdvPurchase(maxWaitMs = 10000) {
  return new Promise((resolve) => {
    if (window.CdvPurchase) {
      resolve(true);
      return;
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.CdvPurchase) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - startTime > maxWaitMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 200);
  });
}

/**
 * Initialize the native purchase system.
 * Call once on app startup (only activates on native platforms).
 * Includes retry logic in case the store takes time to connect.
 */
export async function initializePurchases() {
  if (!isNativeApp()) return;

  try {
    console.log('[Purchases] Waiting for CdvPurchase plugin...');
    const pluginAvailable = await waitForCdvPurchase();

    if (!pluginAvailable || !window.CdvPurchase) {
      console.warn('[Purchases] CdvPurchase not available after waiting — plugin may not be installed');
      return;
    }

    console.log('[Purchases] CdvPurchase plugin found, setting up store...');
    store = window.CdvPurchase.store;
    const { ProductType, Platform } = window.CdvPurchase;

    // Enable verbose logging in debug/TestFlight builds
    store.verbosity = window.CdvPurchase.LogLevel.DEBUG;

    // Register the Pro subscription product
    store.register({
      id: PRODUCTS.PRO_MONTHLY,
      type: ProductType.PAID_SUBSCRIPTION,
      platform: Platform.APPLE_APPSTORE,
    });

    // Listen for purchase approvals — finish the transaction after server validation
    store.when().approved(async (transaction) => {
      console.log('[Purchases] Transaction approved:', transaction.transactionId);
      // Transaction will be finished after we validate server-side
      // The NativeCheckout component handles calling validateReceipt
      transaction.finish();
    });

    // Listen for errors
    store.error((err) => {
      console.error('[Purchases] Store error:', err.code, err.message);
    });

    // Initialize the store
    console.log('[Purchases] Calling store.initialize([APPLE_APPSTORE])...');
    const errors = await store.initialize([Platform.APPLE_APPSTORE]);
    if (errors.length > 0) {
      console.error('[Purchases] Init errors:', JSON.stringify(errors));
      // Retry if under max attempts
      initAttempts++;
      if (initAttempts < MAX_INIT_ATTEMPTS) {
        console.log(`[Purchases] Retrying initialization (attempt ${initAttempts + 1}/${MAX_INIT_ATTEMPTS})...`);
        setTimeout(() => initializePurchases(), 2000);
        return;
      }
    } else {
      storeReady = true;
      const product = store.get(PRODUCTS.PRO_MONTHLY);
      console.log(`[Purchases] Initialized for ${getPaymentProvider()}`);
      console.log(`[Purchases] Product found: ${product ? product.title + ' - ' + (product.pricing?.price || 'no price') : 'NOT FOUND'}`);
    }
  } catch (err) {
    console.error('[Purchases] Init error:', err);
    // Retry on exception
    initAttempts++;
    if (initAttempts < MAX_INIT_ATTEMPTS) {
      console.log(`[Purchases] Retrying after error (attempt ${initAttempts + 1}/${MAX_INIT_ATTEMPTS})...`);
      setTimeout(() => initializePurchases(), 2000);
    }
  }
}

/**
 * Check if the store is ready. If not, attempt to initialize.
 */
export function isStoreReady() {
  return storeReady;
}

/**
 * Get the registered Pro product (for displaying price, etc.)
 * @returns {object|null} The product object or null
 */
export function getProProduct() {
  if (!store || !storeReady) return null;
  return store.get(PRODUCTS.PRO_MONTHLY) || null;
}

/**
 * Start the native purchase flow for Pro subscription.
 * @param {string} userId - Supabase user ID (for receipt validation)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function purchaseProNative(userId) {
  if (!isNativeApp()) {
    return { success: false, error: 'Not a native platform — use Stripe' };
  }

  if (!store || !storeReady) {
    // Try to initialize one more time before giving up
    console.log('[Purchases] Store not ready, attempting re-initialization...');
    await initializePurchases();
    if (!store || !storeReady) {
      return { success: false, error: 'Store not initialized. Please close and reopen the app, then try again.' };
    }
  }

  try {
    const product = store.get(PRODUCTS.PRO_MONTHLY);
    if (!product) {
      return { success: false, error: 'Subscription product not found' };
    }

    // Get the first available offer
    const offer = product.getOffer();
    if (!offer) {
      return { success: false, error: 'No offer available for this product' };
    }

    // Start the purchase flow — this opens the native Apple Pay sheet
    const orderResult = await store.order(offer);
    if (orderResult) {
      // orderResult is an error if the purchase failed
      if (orderResult.code === window.CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
        return { success: false, error: 'cancelled' };
      }
      return { success: false, error: orderResult.message || 'Purchase failed' };
    }

    // If order() returns undefined, the purchase was initiated successfully.
    // The 'approved' handler in initializePurchases will fire.
    // Now validate the receipt server-side.
    const latestReceipt = await getLatestReceipt();
    if (latestReceipt) {
      const validated = await validateReceipt(userId, latestReceipt, getPaymentProvider());
      return validated;
    }

    return { success: true };
  } catch (err) {
    console.error('[Purchases] Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get the latest Apple receipt from the store.
 * @returns {string|null} Base64-encoded receipt data
 */
async function getLatestReceipt() {
  if (!store) return null;
  try {
    const { Platform } = window.CdvPurchase;
    const receipt = store.localReceipts.find(r => r.platform === Platform.APPLE_APPSTORE);
    return receipt?.nativeData?.appStoreReceipt || null;
  } catch (err) {
    console.error('[Purchases] Error getting receipt:', err);
    return null;
  }
}

/**
 * Restore previous purchases (required by App Store guidelines).
 * Users can tap "Restore Purchases" to recover their subscription
 * on a new device.
 * @param {string} userId - Supabase user ID
 */
export async function restorePurchases(userId) {
  if (!isNativeApp()) return { restored: false };

  if (!store || !storeReady) {
    return { restored: false, error: 'Store not initialized' };
  }

  try {
    await store.restorePurchases();

    // After restore, check if we have a valid receipt
    const latestReceipt = await getLatestReceipt();
    if (latestReceipt) {
      const validated = await validateReceipt(userId, latestReceipt, getPaymentProvider());
      if (validated.success) {
        return { restored: true };
      }
    }

    return { restored: false, error: 'No active subscription found' };
  } catch (err) {
    console.error('[Purchases] Restore error:', err);
    return { restored: false, error: err.message };
  }
}

/**
 * Validate a purchase receipt server-side.
 * Sends the receipt to a Supabase Edge Function that verifies with Apple/Google
 * and updates the user's tier to 'pro' in the database.
 */
async function validateReceipt(userId, receipt, provider) {
  try {
    const { supabase } = await import('../lib/supabase');

    const { data, error } = await supabase.functions.invoke('validate-native-receipt', {
      body: { userId, receipt, provider }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: data?.valid || false, tier: data?.tier };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export { PRODUCTS };
