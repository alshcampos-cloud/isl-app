// Native In-App Purchase handler for iOS and Android
// Uses @capgo/native-purchases for direct StoreKit 2 (no RevenueCat, no third-party cut).
// Web payments continue to use Stripe via GeneralPricing.jsx.

import { isNativeApp, isIOS, getPaymentProvider } from './platform';

// Product IDs — must match App Store Connect / Google Play Console
const PRODUCTS = {
  GENERAL_30DAY: 'ai.interviewanswers.general.30day',
  NURSING_30DAY: 'ai.interviewanswers.nursing.30day',
  ANNUAL_ALL_ACCESS: 'ai.interviewanswers.annual.allaccess',
};

let NativePurchases = null;
let storeReady = false;
let productCache = {};
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

/**
 * Initialize the native purchase system.
 * Call once on app startup (only activates on native platforms).
 */
export async function initializePurchases() {
  if (!isNativeApp()) return;

  try {
    // Dynamic import — only loads on native platforms
    const mod = await import('@capgo/native-purchases');
    NativePurchases = mod.NativePurchases;

    // Check if billing is available
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported) {
      console.warn('[Purchases] Billing not supported on this device');
      return;
    }
    console.log('[Purchases] Billing supported');

    // Prefetch product info
    const productIds = Object.values(PRODUCTS);
    try {
      const { products } = await NativePurchases.getProducts({
        productIdentifiers: productIds,
        productType: 'INAPP',
      });

      products.forEach(p => {
        productCache[p.productIdentifier] = p;
        console.log(`[Purchases] Product: ${p.productIdentifier} — ${p.price}`);
      });
    } catch (prodErr) {
      console.warn('[Purchases] Could not fetch products:', prodErr.message);
    }

    storeReady = true;
    console.log(`[Purchases] Initialized for ${getPaymentProvider()}, ${Object.keys(productCache).length} products loaded`);
  } catch (err) {
    console.error('[Purchases] Init error:', err);
    initAttempts++;
    if (initAttempts < MAX_INIT_ATTEMPTS) {
      console.log(`[Purchases] Retrying (attempt ${initAttempts + 1}/${MAX_INIT_ATTEMPTS})...`);
      setTimeout(() => initializePurchases(), 2000);
    }
  }
}

/**
 * Check if the store is ready.
 */
export function isStoreReady() {
  return storeReady;
}

/**
 * Get a product's display info (price string, title, etc.)
 * @param {string} productId — one of PRODUCTS values
 * @returns {object|null}
 */
export function getProduct(productId) {
  return productCache[productId] || null;
}

/**
 * Start the native purchase flow.
 * @param {string} productId — product identifier
 * @param {string} userId — Supabase user ID (for receipt validation)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function purchaseProduct(productId, userId) {
  if (!isNativeApp()) {
    return { success: false, error: 'Not a native platform — use Stripe' };
  }

  if (!NativePurchases || !storeReady) {
    console.log('[Purchases] Store not ready, attempting re-initialization...');
    await initializePurchases();
    if (!NativePurchases || !storeReady) {
      return { success: false, error: 'Store not initialized. Please close and reopen the app, then try again.' };
    }
  }

  try {
    // Open the native payment sheet
    const result = await NativePurchases.purchaseProduct({
      productIdentifier: productId,
      productType: 'INAPP',
      quantity: 1,
    });

    console.log('[Purchases] Purchase result:', JSON.stringify(result));

    // Validate server-side
    const transactionId = result.transactionId || result.transaction?.transactionId;
    if (transactionId) {
      const validated = await validateTransaction(userId, transactionId, productId);
      return validated;
    }

    return { success: true };
  } catch (err) {
    console.error('[Purchases] Purchase error:', err);
    // User cancelled
    if (err.message?.includes('cancel') || err.code === 'PAYMENT_CANCELLED') {
      return { success: false, error: 'cancelled' };
    }
    return { success: false, error: err.message || 'Purchase failed' };
  }
}

// Backwards-compatible wrapper used by NativeCheckout.jsx
export async function purchaseProNative(userId) {
  return purchaseProduct(PRODUCTS.GENERAL_30DAY, userId);
}

/**
 * Restore previous purchases (required by Apple guidelines).
 * @param {string} userId — Supabase user ID
 */
export async function restorePurchases(userId) {
  if (!isNativeApp()) return { restored: false };

  if (!NativePurchases || !storeReady) {
    return { restored: false, error: 'Store not initialized' };
  }

  try {
    const result = await NativePurchases.restorePurchases();
    console.log('[Purchases] Restore result:', JSON.stringify(result));

    // Check if any transactions were restored
    const transactions = result.transactions || [];
    if (transactions.length > 0) {
      // Validate the most recent transaction
      const latest = transactions[transactions.length - 1];
      const transactionId = latest.transactionId || latest.transaction?.transactionId;
      if (transactionId) {
        const validated = await validateTransaction(userId, transactionId, latest.productIdentifier || PRODUCTS.GENERAL_30DAY);
        if (validated.success) {
          return { restored: true };
        }
      }
    }

    return { restored: false, error: 'No active purchases found to restore' };
  } catch (err) {
    console.error('[Purchases] Restore error:', err);
    return { restored: false, error: err.message };
  }
}

/**
 * Validate a transaction server-side.
 * Sends transactionId to Edge Function which verifies with Apple's App Store Server API.
 */
async function validateTransaction(userId, transactionId, productId) {
  try {
    const { supabase } = await import('../lib/supabase');

    const { data, error } = await supabase.functions.invoke('validate-native-receipt', {
      body: {
        userId,
        transactionId,
        productId,
        provider: getPaymentProvider(),
      }
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
