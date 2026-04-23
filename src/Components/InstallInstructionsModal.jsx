import React, { useState, useEffect } from 'react';

/**
 * InstallInstructionsModal — Clear, illustrated instructions for installing
 * InterviewAnswers.ai as a PWA on any device.
 *
 * Detects the user's platform and shows platform-specific steps:
 *   - iOS Safari: tap Share → Add to Home Screen
 *   - Android Chrome: tap ⋮ menu → Install app / Add to Home screen
 *   - Desktop Chrome/Edge: click install icon in URL bar
 *   - Firefox / other: show generic bookmark instructions
 *
 * Usage:
 *   <InstallInstructionsModal open={open} onClose={() => setOpen(false)} />
 *
 * Place a trigger button anywhere in your app, e.g. Settings page:
 *   <button onClick={() => setInstallModalOpen(true)}>Install the App</button>
 */
export default function InstallInstructionsModal({ open, onClose }) {
  const [platform, setPlatform] = useState('other');

  useEffect(() => {
    if (!open) return;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isAndroid = /Android/.test(ua);
    const isChrome = /Chrome/.test(ua) && !/Edge|Edg/.test(ua);
    const isEdge = /Edg/.test(ua);
    const isFirefox = /Firefox/.test(ua);
    const isMobile = /Mobi|Android/i.test(ua);

    if (isIOS && isSafari) setPlatform('ios-safari');
    else if (isIOS) setPlatform('ios-other');
    else if (isAndroid && isChrome) setPlatform('android-chrome');
    else if (isAndroid) setPlatform('android-other');
    else if (!isMobile && (isChrome || isEdge)) setPlatform('desktop-chrome');
    else if (isFirefox) setPlatform('firefox');
    else setPlatform('other');
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
              Install InterviewAnswers.ai
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Add to your home screen for faster access and a full-screen experience.
            </p>
          </div>
          <button
            onClick={onClose}
            onTouchEnd={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Platform-specific instructions */}
        {platform === 'ios-safari' && <IOSSafariSteps />}
        {platform === 'ios-other' && <IOSNonSafariWarning />}
        {platform === 'android-chrome' && <AndroidChromeSteps />}
        {platform === 'android-other' && <AndroidGenericSteps />}
        {platform === 'desktop-chrome' && <DesktopChromeSteps />}
        {platform === 'firefox' && <FirefoxSteps />}
        {platform === 'other' && <GenericSteps />}

        {/* Benefits */}
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
            borderRadius: '12px',
            border: '1px solid #5eead4',
          }}
        >
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#134e4a', marginBottom: '8px' }}>
            Benefits of installing:
          </p>
          <ul style={{ fontSize: '13px', color: '#0f766e', margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
            <li>Opens instantly from your home screen</li>
            <li>Full-screen experience, no browser bars</li>
            <li>Works offline for saved questions</li>
            <li>Notifications for daily practice reminders (coming soon)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Platform-specific instruction components
// ============================================================

function Step({ number, children }) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'start' }}>
      <div
        style={{
          flexShrink: 0,
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
          color: 'white',
          fontWeight: '700',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {number}
      </div>
      <div style={{ fontSize: '14px', color: '#1e293b', lineHeight: 1.5, paddingTop: '4px' }}>{children}</div>
    </div>
  );
}

function IOSSafariSteps() {
  return (
    <div>
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#475569',
        }}
      >
        <strong style={{ color: '#0f172a' }}>For iPhone / iPad (Safari)</strong>
      </div>
      <Step number="1">
        Tap the <strong>Share button</strong>{' '}
        <span
          style={{
            display: 'inline-flex',
            verticalAlign: 'middle',
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            background: '#e0f2fe',
            color: '#0284c7',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            margin: '0 2px',
          }}
          title="Share icon"
        >
          ⎋
        </span>{' '}
        at the bottom of your Safari screen (middle of the toolbar).
      </Step>
      <Step number="2">
        Scroll down in the share sheet and tap <strong>"Add to Home Screen"</strong>.
      </Step>
      <Step number="3">
        Tap <strong>"Add"</strong> in the top-right corner. The app icon will appear on your home screen.
      </Step>
      <Step number="4">
        Open it like any app — it runs full-screen with no Safari UI.
      </Step>
    </div>
  );
}

function IOSNonSafariWarning() {
  return (
    <div>
      <div
        style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#78350f',
        }}
      >
        <strong style={{ color: '#78350f' }}>Chrome / Firefox on iPhone can't install web apps.</strong>
        <br />
        Apple only allows this through Safari.
      </div>
      <Step number="1">
        Copy the URL: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>interviewanswers.ai</code>
      </Step>
      <Step number="2">Open Safari on your iPhone or iPad.</Step>
      <Step number="3">Paste the URL and open the site.</Step>
      <Step number="4">
        Tap the Share button, then <strong>"Add to Home Screen"</strong>.
      </Step>
    </div>
  );
}

function AndroidChromeSteps() {
  return (
    <div>
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#475569',
        }}
      >
        <strong style={{ color: '#0f172a' }}>For Android (Chrome)</strong>
      </div>
      <Step number="1">
        Tap the <strong>three-dot menu</strong> (⋮) in the top-right corner of Chrome.
      </Step>
      <Step number="2">
        Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
      </Step>
      <Step number="3">
        Confirm by tapping <strong>"Install"</strong>. The app appears on your home screen.
      </Step>
      <Step number="4">You may also see a banner at the bottom of the screen — just tap it.</Step>
    </div>
  );
}

function AndroidGenericSteps() {
  return (
    <div>
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#475569',
        }}
      >
        <strong style={{ color: '#0f172a' }}>For Android (non-Chrome browsers)</strong>
      </div>
      <Step number="1">Open the browser menu (usually a three-dot icon).</Step>
      <Step number="2">
        Look for <strong>"Install app"</strong>, <strong>"Add to Home screen"</strong>, or
        <strong> "Install site"</strong>.
      </Step>
      <Step number="3">Confirm the install prompt.</Step>
      <Step number="4">
        If your browser doesn't support installing web apps, try opening the site in Chrome or Samsung Internet.
      </Step>
    </div>
  );
}

function DesktopChromeSteps() {
  return (
    <div>
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#475569',
        }}
      >
        <strong style={{ color: '#0f172a' }}>For Desktop (Chrome / Edge)</strong>
      </div>
      <Step number="1">
        Look for the <strong>install icon</strong>{' '}
        <span
          style={{
            display: 'inline-block',
            padding: '2px 6px',
            background: '#e0f2fe',
            borderRadius: '4px',
            color: '#0284c7',
            fontSize: '12px',
            verticalAlign: 'middle',
          }}
        >
          ⊕
        </span>{' '}
        on the right side of the address bar.
      </Step>
      <Step number="2">Click the icon, then click <strong>"Install"</strong>.</Step>
      <Step number="3">
        Alternatively: Click the three-dot menu (⋮) → <strong>"Install InterviewAnswers.ai"</strong>.
      </Step>
      <Step number="4">
        The app opens in its own window and gets a desktop shortcut. Pin it to your taskbar for one-click access.
      </Step>
    </div>
  );
}

function FirefoxSteps() {
  return (
    <div>
      <div
        style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#78350f',
        }}
      >
        <strong>Firefox has limited PWA support.</strong>
        <br />
        We recommend using Chrome, Edge, or Safari for the best install experience.
      </div>
      <Step number="1">Bookmark this page (Ctrl+D or Cmd+D) for quick access.</Step>
      <Step number="2">On Firefox Android: tap the menu → "Install".</Step>
      <Step number="3">On desktop Firefox: installation is not currently supported — use a bookmark instead.</Step>
    </div>
  );
}

function GenericSteps() {
  return (
    <div>
      <p style={{ fontSize: '14px', color: '#1e293b', marginBottom: '12px', lineHeight: 1.6 }}>
        Your browser may support installing this web app. Check your browser menu for an
        <strong> "Install"</strong> or <strong>"Add to Home Screen"</strong> option.
      </p>
      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
        If you don't see an install option, simply bookmark the page (Ctrl+D / Cmd+D on desktop) for faster access
        next time.
      </p>
    </div>
  );
}
