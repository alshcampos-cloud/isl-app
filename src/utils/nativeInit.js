// Native platform initialization for Capacitor plugins
// Configures splash screen, status bar, and haptics for iOS/Android
// This file is only loaded when running as a native app (see main.jsx)

import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
