// Platform detection for native app vs web browser
// Used to route payments and adjust UI for iOS/Android/Web

import { Capacitor } from '@capacitor/core';

/**
 * Get the current platform
 * @returns {'ios' | 'android' | 'web'}
 */
export function getPlatform() {
  return Capacitor.getPlatform();
}

/**
 * Check if running inside a native app (iOS or Android)
 */
export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

/**
 * Check if running on iOS (App Store build)
 */
export function isIOS() {
  return Capacitor.getPlatform() === 'ios';
}

/**
 * Check if running on Android (Play Store build)
 */
export function isAndroid() {
  return Capacitor.getPlatform() === 'android';
}

/**
 * Check if running in a web browser (your existing Vercel site)
 */
export function isWeb() {
  return Capacitor.getPlatform() === 'web';
}

/**
 * Get the payment method that should be used on the current platform.
 *
 * As of May 2025 (Epic v. Apple ruling), developers can use external payment
 * links in U.S. iOS apps with zero Apple commission. We route ALL platforms
 * to Stripe via the website for a consistent, lower-cost payment flow.
 *
 * Native app users who need to subscribe are directed to the website checkout.
 */
export function getPaymentProvider() {
  // All platforms use Stripe via external web checkout
  return 'stripe';
}
