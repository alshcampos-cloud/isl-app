// Native platform initialization for Capacitor plugins
// Configures splash screen, status bar, and haptics for iOS/Android
// This file is only loaded when running as a native app (see main.jsx)

import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { initializePurchases } from './nativePurchases';

/**
 * Initialize native platform features.
 * Called once on app startup from main.jsx when isNativeApp() is true.
 */
export async function initializeNativePlatform() {
  try {
    // Configure status bar to match app's dark purple theme
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1e1b4b' });
  } catch (e) {
    // Status bar API may not be available on all platforms
    console.log('StatusBar setup skipped:', e.message);
  }

  try {
    // Hide splash screen after app is ready (with fade)
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (e) {
    console.log('SplashScreen hide skipped:', e.message);
  }

  // Initialize In-App Purchases (StoreKit 2)
  try {
    await initializePurchases();
  } catch (e) {
    console.log('IAP init skipped:', e.message);
  }

  // Offline detection for native apps (uses navigator.onLine — no extra dependency)
  try {
    if (!navigator.onLine) {
      showOfflineBanner();
    }
    window.addEventListener('offline', () => showOfflineBanner());
    window.addEventListener('online', () => hideOfflineBanner());
  } catch (e) {
    console.log('Offline detection skipped:', e.message);
  }
}

function showOfflineBanner() {
  if (document.getElementById('offline-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'offline-banner';
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#ef4444;color:white;text-align:center;padding:8px;font-size:14px;font-family:system-ui;';
  banner.textContent = 'No internet connection. Some features may be unavailable.';
  document.body.prepend(banner);
}

function hideOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (banner) banner.remove();
}

/**
 * Trigger a light haptic tap — use on button presses, navigation, etc.
 */
export async function hapticTap() {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) {
    // Haptics not available (web fallback — does nothing)
  }
}

/**
 * Trigger a medium haptic — use on successful actions (session complete, score)
 */
export async function hapticSuccess() {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (e) {
    // Haptics not available
  }
}

/**
 * Trigger a heavy haptic — use on errors or important alerts
 */
export async function hapticHeavy() {
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (e) {
    // Haptics not available
  }
}
