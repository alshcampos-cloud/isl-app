import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './Components/ErrorBoundary.jsx'
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

  // Initialize native In-App Purchases (Apple IAP)
  // Wait for deviceready to ensure Cordova plugins are loaded
  document.addEventListener('deviceready', () => {
    import('./utils/nativePurchases').then(({ initializePurchases }) => {
      initializePurchases()
    })
  }, false)
  // Fallback: also try after a delay in case deviceready doesn't fire in Capacitor
  setTimeout(() => {
    import('./utils/nativePurchases').then(({ initializePurchases }) => {
      initializePurchases()
    })
  }, 3000)

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
      <App />
    </BrowserRouter>
  </ErrorBoundary>,
)
