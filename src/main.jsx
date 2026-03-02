import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './Components/ErrorBoundary.jsx'
import ScrollToTop from './Components/ScrollToTop.jsx'
import './index.css'
import { isNativeApp } from './utils/platform'

// Add 'capacitor' class to <html> when running as native app
// This enables native-only CSS rules. On web, this never fires.
if (isNativeApp()) {
  document.documentElement.classList.add('capacitor')

  // Initialize native platform features (status bar, splash screen, haptics)
  import('./utils/nativeInit').then(({ initializeNativePlatform }) => {
    initializeNativePlatform()
  })

  // IAP DISABLED — Using external Stripe checkout per May 2025 court ruling
  // (Epic v. Apple: developers can use external payment links, no Apple commission)
  // Users subscribe at InterviewAnswers.ai/pricing via Stripe, then log into the app.
  // See: nativePurchases.js (preserved for reference but not initialized)

  // Refresh app state when returning from background
  import('@capacitor/core').then(({ App }) => {
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // Dispatch a custom event that App.jsx can listen for
        window.dispatchEvent(new Event('capacitor-resume'))
      }
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </ErrorBoundary>,
)
