/**
 * NeuroBridge Website-to-Chrome Extension Bridge
 * 
 * Provides communication utilities between the NeuroBridge web application
 * and the NeuroBridge Chrome Extension.
 *
 * Supports two communication channels:
 * 1. window.postMessage via content/bridge.js (injected into authorized domains)
 * 2. chrome.runtime.sendMessage via externally_connectable (when extension ID is provided)
 */

import {
  toExtensionResultPayload,
  type NeuroBridgeReadingProfile,
  type ExtensionResultPayload,
} from './profileGenerator';

export interface ExtensionStatus {
  installed: boolean;
  version: string | null;
  assessmentDone?: boolean;
  hasProfile?: boolean;
  enabled?: boolean;
}

export interface SyncResult {
  success: boolean;
  label?: string;
  level?: string;
  error?: string;
}

const EXTENSION_ID = (import.meta.env.VITE_EXTENSION_ID || '').trim();

/**
 * Checks if the extension has marked the DOM at document_start.
 */
export function getDomExtensionVersion(): string | null {
  if (typeof document === 'undefined') return null;
  return document.documentElement.dataset.neurobridgeExtension || null;
}

/**
 * Attempts to detect the extension via DOM attribute, window.postMessage,
 * or chrome.runtime.sendMessage.
 */
export async function detectExtension(timeoutMs = 1200): Promise<ExtensionStatus> {
  if (typeof window === 'undefined') {
    return { installed: false, version: null };
  }

  // 1. Check DOM marker immediately (set by content/bridge.js at document_start)
  const domVersion = getDomExtensionVersion();

  // 2. Try chrome.runtime.sendMessage if extension ID is configured
  if (EXTENSION_ID && typeof (window as any).chrome?.runtime?.sendMessage === 'function') {
    try {
      const resp = await new Promise<any>((resolve) => {
        const timer = setTimeout(() => resolve(null), timeoutMs);
        try {
          (window as any).chrome.runtime.sendMessage(EXTENSION_ID, { type: 'NEUROBRIDGE_PING' }, (response: any) => {
            clearTimeout(timer);
            if ((window as any).chrome.runtime.lastError) {
              resolve(null);
            } else {
              resolve(response);
            }
          });
        } catch {
          clearTimeout(timer);
          resolve(null);
        }
      });

      if (resp && resp.ok) {
        return {
          installed: true,
          version: resp.version || domVersion || '3.0.0',
          assessmentDone: resp.assessmentDone,
          hasProfile: resp.hasProfile,
          enabled: resp.enabled,
        };
      }
    } catch (_) {}
  }

  // 3. Try window.postMessage ping with bridge.js
  return new Promise<ExtensionStatus>((resolve) => {
    let resolved = false;

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timer);
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.source !== window || e.origin !== window.location.origin) return;
      const data = e.data;
      if (!data) return;

      if (data.type === 'NEUROBRIDGE_EXTENSION_READY') {
        resolved = true;
        cleanup();
        resolve({
          installed: true,
          version: data.version || domVersion || '3.0.0',
          assessmentDone: data.assessmentDone,
          hasProfile: data.hasProfile,
          enabled: data.enabled,
        });
      }
    };

    window.addEventListener('message', handleMessage);

    // Send PING to trigger immediate announcement from bridge.js
    window.postMessage({ type: 'NEUROBRIDGE_PING' }, window.location.origin);

    const timer = setTimeout(() => {
      cleanup();
      if (!resolved) {
        // Fall back to DOM check
        const fallbackVersion = getDomExtensionVersion();
        resolve({
          installed: !!fallbackVersion,
          version: fallbackVersion,
        });
      }
    }, timeoutMs);
  });
}

/**
 * Transfers a personalized reading profile to the extension.
 * Never sets enabled: true on the extension.
 */
export async function syncProfileToExtension(
  profile: NeuroBridgeReadingProfile,
  timeoutMs = 3000
): Promise<SyncResult> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window not available' };
  }

  const payload: ExtensionResultPayload = toExtensionResultPayload(profile);

  // Method A: chrome.runtime.sendMessage (if extension ID configured)
  if (EXTENSION_ID && typeof (window as any).chrome?.runtime?.sendMessage === 'function') {
    try {
      const resp = await new Promise<any>((resolve) => {
        const timer = setTimeout(() => resolve(null), timeoutMs);
        try {
          (window as any).chrome.runtime.sendMessage(
            EXTENSION_ID,
            { type: 'NEUROBRIDGE_PROFILE_SYNC', result: payload },
            (response: any) => {
              clearTimeout(timer);
              if ((window as any).chrome.runtime.lastError) {
                resolve(null);
              } else {
                resolve(response);
              }
            }
          );
        } catch {
          clearTimeout(timer);
          resolve(null);
        }
      });

      if (resp && resp.ok) {
        return {
          success: true,
          label: resp.label,
          level: resp.level,
        };
      }
    } catch (e: any) {
      console.warn('Direct extension messaging failed, falling back to bridge:', e?.message);
    }
  }

  // Method B: window.postMessage through content/bridge.js
  return new Promise<SyncResult>((resolve) => {
    let resolved = false;

    const cleanup = () => {
      window.removeEventListener('message', handleApplied);
      clearTimeout(timer);
    };

    const handleApplied = (e: MessageEvent) => {
      if (e.source !== window || e.origin !== window.location.origin) return;
      const data = e.data;
      if (data && data.type === 'NEUROBRIDGE_APPLIED') {
        resolved = true;
        cleanup();
        resolve({
          success: true,
          label: data.label,
          level: data.level,
        });
      }
    };

    window.addEventListener('message', handleApplied);

    // Post result to bridge.js
    window.postMessage({ type: 'NEUROBRIDGE_RESULT', result: payload }, window.location.origin);

    const timer = setTimeout(() => {
      cleanup();
      if (!resolved) {
        resolve({
          success: false,
          error: 'Extension did not respond in time. Make sure the NeuroBridge extension is installed and active.',
        });
      }
    }, timeoutMs);
  });
}

/**
 * Resets profile data on the extension (e.g. on test retake).
 */
export function resetExtensionProfile(): void {
  if (typeof window === 'undefined') return;

  if (EXTENSION_ID && typeof (window as any).chrome?.runtime?.sendMessage === 'function') {
    try {
      (window as any).chrome.runtime.sendMessage(EXTENSION_ID, { type: 'NEUROBRIDGE_RESET' });
    } catch (_) {}
  }

  window.postMessage({ type: 'NEUROBRIDGE_RESET' }, window.location.origin);
}

