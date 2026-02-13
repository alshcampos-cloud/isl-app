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
 * Get the payment method that should be used on the current platform
 * - Web → Stripe (existing flow)
 * - iOS → Apple In-App Purchase (required by App Store rules)
 * - Android → Google Play Billing (required by Play Store rules)
 */
export function getPaymentProvider() {
  const platform = getPlatform();
  switch (platform) {
    case 'ios':
      return 'apple';
    case 'android':
      return 'google';
    default:
      return 'stripe';
  }
}
