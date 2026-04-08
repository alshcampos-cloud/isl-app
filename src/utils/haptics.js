// Haptic feedback utility for premium mobile feel
// Uses the Vibration API where available (Android, some iOS via Capacitor)
// Gracefully degrades to no-op on unsupported browsers.
//
// Usage:
//   haptics.light()   — subtle tap (button press, selection change)
//   haptics.medium()  — medium (timer start/stop, save success)
//   haptics.heavy()   — strong (error, delete confirm)
//   haptics.success() — pattern (save complete, milestone achieved)
//   haptics.warning() — pattern (approaching limit, important notice)

const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

const haptics = {
  /** Subtle tap feedback — button presses, selections */
  light() {
    if (canVibrate) navigator.vibrate(10);
  },

  /** Medium feedback — save, timer start/stop */
  medium() {
    if (canVibrate) navigator.vibrate(25);
  },

  /** Heavy feedback — errors, destructive actions */
  heavy() {
    if (canVibrate) navigator.vibrate(50);
  },

  /** Success pattern — celebratory double-tap */
  success() {
    if (canVibrate) navigator.vibrate([15, 50, 15]);
  },

  /** Warning pattern — attention-getting */
  warning() {
    if (canVibrate) navigator.vibrate([30, 30, 30]);
  },

  /** Timer tick — very subtle */
  tick() {
    if (canVibrate) navigator.vibrate(5);
  },
};

export default haptics;
