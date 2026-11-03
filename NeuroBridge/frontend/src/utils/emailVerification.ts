import { API_BASE } from '../config/api';
/** Helpers for the sign-up "check your email" step. */
export const EMAIL_AUTH_API = `${API_BASE}/api/auth/email`;
const SUBJECT = 'Verify Your NeuroBridge Account';
export const AUTH_CHANNEL = 'neurobridge-auth';

export interface MailProvider {
  name: string;
  url: string;
}

/**
 * Pick the web inbox for an address. Gmail opens straight onto a search for
 * our verification email, signed in as that address when the person has
 * several Google accounts. Unknown domains (often Google Workspace, e.g.
 * college addresses) fall back to Gmail.
 */
export function mailProviderFor(email: string): MailProvider {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  const subjectQuery = encodeURIComponent(`subject:"${SUBJECT}"`);

  if (/^(outlook|hotmail|live|msn)\.[a-z.]+$/.test(domain)) {
    return { name: 'Outlook', url: 'https://outlook.live.com/mail/0/' };
  }
  if (/^(yahoo|ymail|rocketmail)\.[a-z.]+$/.test(domain)) {
    return { name: 'Yahoo Mail', url: 'https://mail.yahoo.com/' };
  }
  if (/^(icloud|me|mac)\.com$/.test(domain)) {
    return { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' };
  }
  if (domain === 'proton.me' || domain === 'protonmail.com') {
    return { name: 'Proton Mail', url: 'https://mail.proton.me/' };
  }
  return {
    name: 'Gmail',
    url: `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(email)}#search/${subjectQuery}`,
  };
}

/**
 * Open the inbox in a popup window docked to the right half of the screen,
 * so NeuroBridge stays visible beside it. Falls back to a new tab when
 * popups are blocked. (Mail sites cannot be embedded inside our page.)
 */
export function openInboxBeside(url: string): Window | null {
  const scr = window.screen as Screen & { availLeft?: number; availTop?: number };
  const availW = scr.availWidth || window.innerWidth;
  const availH = scr.availHeight || window.innerHeight;
  const width = Math.round(Math.min(Math.max(availW * 0.45, 480), 820));
  const height = Math.round(availH * 0.92);
  const left = Math.round((scr.availLeft ?? 0) + availW - width);
  const top = Math.round((scr.availTop ?? 0) + (availH - height) / 2);

  const popup = window.open(
    url,
    'neurobridge-inbox',
    `popup=yes,width=${width},height=${height},left=${left},top=${top}`,
  );
  if (popup) {
    popup.focus();
    return popup;
  }
  // Popup blocked: a normal new tab still works
  return window.open(url, '_blank', 'noopener');
}
