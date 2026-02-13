// NativeCheckout.jsx - Handles Apple In-App Purchase flow for iOS native app
// This is the iOS equivalent of StripeCheckout.jsx — same interface, different payment backend.
// Web users never see this component. Only rendered when isNativeApp() is true.

import { useState } from 'react';
import { purchaseProNative, restorePurchases } from '../utils/nativePurchases';

export default function NativeCheckout({
  user,
  onSuccess,
  onError,
  children,
  className = '',
  disabled = false
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState(null);

  const handlePurchase = async () => {
    if (!user?.id) {
      const err = 'You must be logged in to upgrade';
      setError(err);
      onError?.(err);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await purchaseProNative(user.id);

      if (result.error === 'cancelled') {
        // User cancelled — not an error
        setIsLoading(false);
        return;
      }

      if (!result.success && result.error) {
        throw new Error(result.error);
      }

      onSuccess?.();
    } catch (err) {
      console.error('[NativeCheckout] Error:', err);
      const errorMessage = err.message || 'Purchase failed. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!user?.id) return;

    setIsRestoring(true);
    setError(null);

    try {
      const result = await restorePurchases(user.id);
      if (result.restored) {
        onSuccess?.();
      } else {
        setError(result.error || 'No active subscription found to restore.');
      }
    } catch (err) {
      setError(err.message || 'Failed to restore purchases.');
    } finally {
      setIsRestoring(false);
    }
  };

  const defaultClassName = `
    w-full py-3 px-6 rounded-lg font-semibold text-white
    bg-gradient-to-r from-indigo-600 to-purple-600
    hover:from-indigo-700 hover:to-purple-700
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200 ease-in-out
    flex items-center justify-center gap-2
  `;

  return (
    <div className="native-checkout">
      <button
        onClick={handlePurchase}
        disabled={disabled || isLoading || isRestoring}
        className={className || defaultClassName}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          children || (
            <>
              <span>Subscribe to Pro - $29.99/mo</span>
            </>
          )
        )}
      </button>

      {/* Restore Purchases button — required by Apple App Store guidelines */}
      <button
        onClick={handleRestore}
        disabled={isLoading || isRestoring}
        className="w-full mt-2 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
      >
        {isRestoring ? 'Restoring...' : 'Restore Purchases'}
      </button>

      {/* Error display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
