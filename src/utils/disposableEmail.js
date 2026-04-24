// Disposable / throwaway email domain blocklist.
// Curated to avoid false positives on legitimate privacy services
// (ProtonMail, Apple Hide My Email, SimpleLogin, AnonAddy, DuckDuckGo, Tuta, etc.)
// and mainstream providers (Gmail, Outlook, iCloud, Fastmail, Hey, .edu, etc.).
//
// Pure function, no async, no network, no React imports.

export const DISPOSABLE_DOMAINS = new Set([
  // Mailinator family
  'mailinator.com', 'mailinator.net', 'mailinator.org', 'binkmail.com',
  'bobmail.info', 'chammy.info', 'devnullmail.com', 'letthemeatspam.com',
  'mailinater.com', 'notmailinator.com', 'reallymymail.com', 'safetymail.info',
  'sogetthis.com', 'spambooger.com', 'streondj.com', 'thisisnotmyrealemail.com',
  'tradermail.info', 'veryrealemail.com', 'zippymail.info',
  // 10-minute style
  '10minutemail.com', '10minutemail.net', '20minutemail.com', '30minutemail.com',
  'temp-mail.org', 'temp-mail.io', 'tempmail.com', 'tempmail.net', 'tempmailo.com',
  'tmpmail.org', 'tmpmail.net', 'tmpbox.net',
  // Guerrilla family
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz',
  'sharklasers.com', 'grr.la', 'pokemail.net', 'spam4.me',
  // Yopmail family
  'yopmail.com', 'yopmail.net', 'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf',
  // Throwaway / trash
  'throwawaymail.com', 'trashmail.com', 'trashmail.net', 'trashmail.de',
  'mailcatch.com', 'mailnesia.com', 'maildrop.cc', 'getnada.com', 'nada.email',
  'dispostable.com', 'fakeinbox.com', 'fakemailgenerator.com', 'fake-mail.net',
  'moakt.com', 'moakt.cc', 'tafmail.com', 'mohmal.com',
  // Known burners 2024-2026
  'emailondeck.com', 'mintemail.com', 'mytemp.email', 'inboxbear.com',
  'harakirimail.com', 'mailforspam.com', 'spamgourmet.com', 'spambox.us',
  'dropmail.me', 'minuteinbox.com', 'internxt.com', 'mail-temp.com',
  'mailtemp.info', 'burnermail.io'
]);

/**
 * Returns true if the email's domain is in DISPOSABLE_DOMAINS.
 * Returns false for malformed input (null, undefined, non-string, no `@`,
 * or trailing `@`). Never throws.
 *
 * @param {string} email
 * @returns {boolean}
 */
export function isDisposableEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const at = email.lastIndexOf('@');
  if (at === -1 || at === email.length - 1) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  return DISPOSABLE_DOMAINS.has(domain);
}
