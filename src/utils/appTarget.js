// App Target Configuration
// Controls which features are available in this build.
//
// VITE_APP_TARGET values:
//   'all'     — Web version: everything enabled (default)
//   'general' — General iOS app: no nursing features
//   'nursing' — Nursing iOS app: no general features (future)
//
// Usage: npm run build                         → all (web)
//        VITE_APP_TARGET=general npm run build  → general iOS
//        VITE_APP_TARGET=nursing npm run build  → nursing iOS

const APP_TARGET = import.meta.env.VITE_APP_TARGET || 'all';

/**
 * Check if nursing features should be shown in this build
 */
export function showNursingFeatures() {
  return APP_TARGET === 'all' || APP_TARGET === 'nursing';
}

/**
 * Check if general features should be shown in this build
 */
export function showGeneralFeatures() {
  return APP_TARGET === 'all' || APP_TARGET === 'general';
}

/**
 * Check if this is a native-only build (general or nursing, not web)
 */
export function isTargetedBuild() {
  return APP_TARGET === 'general' || APP_TARGET === 'nursing';
}

/**
 * Get the current app target string
 */
export function getAppTarget() {
  return APP_TARGET;
}
