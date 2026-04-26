import { isDisposableEmail } from './disposableEmail';

// CRITICAL: These 5 categories MUST return false (legitimate email services).
// If any fail, we've blocked real users from signing up.
describe('disposable email — false positive guards', () => {
  test('ProtonMail domains pass', () => {
    expect(isDisposableEmail('user@proton.me')).toBe(false);
    expect(isDisposableEmail('user@protonmail.com')).toBe(false);
  });
  test('Apple Hide My Email pass', () => {
    expect(isDisposableEmail('x@privaterelay.appleid.com')).toBe(false);
    expect(isDisposableEmail('user@icloud.com')).toBe(false);
  });
  test('Privacy email aliases pass', () => {
    expect(isDisposableEmail('x@simplelogin.io')).toBe(false);
    expect(isDisposableEmail('x@anonaddy.me')).toBe(false);
    expect(isDisposableEmail('x@duck.com')).toBe(false);
  });
  test('Common mainstream providers pass', () => {
    expect(isDisposableEmail('x@gmail.com')).toBe(false);
    expect(isDisposableEmail('x@fastmail.com')).toBe(false);
    expect(isDisposableEmail('x@hey.com')).toBe(false);
    expect(isDisposableEmail('x@tuta.io')).toBe(false);
    expect(isDisposableEmail('x@outlook.com')).toBe(false);
  });
  test('.edu domains pass', () => {
    expect(isDisposableEmail('student@stanford.edu')).toBe(false);
    expect(isDisposableEmail('prof@mit.edu')).toBe(false);
    expect(isDisposableEmail('nurse@ucsf.edu')).toBe(false);
  });
});

describe('disposable email — positive matches', () => {
  test('Mailinator detected', () => {
    expect(isDisposableEmail('user@mailinator.com')).toBe(true);
  });
  test('10minutemail detected', () => {
    expect(isDisposableEmail('user@10minutemail.com')).toBe(true);
  });
  test('Guerrilla detected', () => {
    expect(isDisposableEmail('user@guerrillamail.com')).toBe(true);
  });
});

describe('disposable email — edge cases', () => {
  test('malformed input returns false', () => {
    expect(isDisposableEmail('')).toBe(false);
    expect(isDisposableEmail('notanemail')).toBe(false);
    expect(isDisposableEmail(null)).toBe(false);
    expect(isDisposableEmail(undefined)).toBe(false);
    expect(isDisposableEmail('user@')).toBe(false);
  });
  test('case insensitive', () => {
    expect(isDisposableEmail('USER@MAILINATOR.COM')).toBe(true);
  });
});
