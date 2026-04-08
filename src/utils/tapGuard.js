// tapGuard.js — Prevents accidental taps during scroll on mobile
//
// Problem: onTouchEnd with e.preventDefault() fires during scroll gestures,
// causing buttons/icons to activate when users are trying to scroll.
//
// Solution: Track touch start position, only fire action if finger moved < 10px.
//
// Usage:
//   import { trackTouch, isTap, guardedTap } from '../utils/tapGuard';
//
//   <button
//     onClick={handleAction}
//     onTouchStart={trackTouch}
//     onTouchEnd={guardedTap(handleAction)}
//   >
//
// Or use the inline check:
//   onTouchEnd={(e) => { if (isTap(e)) { e.preventDefault(); doThing(); } }}

let _startX = 0;
let _startY = 0;
let _startTime = 0;

const TAP_THRESHOLD_PX = 10;
const TAP_THRESHOLD_MS = 500;

export function trackTouch(e) {
  const t = e.touches?.[0];
  if (t) {
    _startX = t.clientX;
    _startY = t.clientY;
    _startTime = Date.now();
  }
}

export function isTap(e) {
  const t = e.changedTouches?.[0];
  if (!t) return true;
  const dx = t.clientX - _startX;
  const dy = t.clientY - _startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const elapsed = Date.now() - _startTime;
  return dist < TAP_THRESHOLD_PX && elapsed < TAP_THRESHOLD_MS;
}

export function guardedTap(action) {
  return (e) => {
    if (isTap(e)) {
      e.preventDefault();
      action();
    }
  };
}

export function tapHandlers(action) {
  return {
    onTouchStart: trackTouch,
    onTouchEnd: guardedTap(action),
  };
}
