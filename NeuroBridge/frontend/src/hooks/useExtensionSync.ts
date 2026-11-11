import { useState, useEffect, useCallback, useRef } from 'react';
import { useDyslexia } from '../contexts/DyslexiaContext';
import {
  detectExtension,
  syncProfileToExtension,
  resetExtensionProfile,
  type ExtensionStatus,
  type SyncResult,
} from '../utils/extensionBridge';

export type ExtensionState = 'checking' | 'not_installed' | 'installed';
export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';

export function useExtensionSync() {
  const { readingProfile, isTestCompleted } = useDyslexia();
  const [extensionState, setExtensionState] = useState<ExtensionState>('checking');
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [extensionVersion, setExtensionVersion] = useState<string | null>(null);
  const [isExtensionEnabled, setIsExtensionEnabled] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncedLabel, setSyncedLabel] = useState<string | null>(null);

  const hasAutoSynced = useRef(false);

  const checkStatus = useCallback(async () => {
    try {
      const status: ExtensionStatus = await detectExtension();
      if (status.installed) {
        setExtensionState('installed');
        setExtensionVersion(status.version);
        setIsExtensionEnabled(!!status.enabled);
        if (status.hasProfile || status.assessmentDone) {
          setSyncState((prev) => (prev === 'idle' ? 'synced' : prev));
        }
      } else {
        setExtensionState('not_installed');
      }
    } catch (_) {
      setExtensionState('not_installed');
    }
  }, []);

  const sync = useCallback(async (): Promise<boolean> => {
    if (!readingProfile) {
      setSyncError('No reading profile available. Complete the assessment first.');
      setSyncState('error');
      return false;
    }

    setSyncState('syncing');
    setSyncError(null);

    try {
      const result: SyncResult = await syncProfileToExtension(readingProfile);
      if (result.success) {
        setSyncState('synced');
        setSyncedLabel(result.label || readingProfile.label);
        return true;
      } else {
        setSyncState('error');
        setSyncError(result.error || 'Failed to sync with extension');
        return false;
      }
    } catch (err: any) {
      setSyncState('error');
      setSyncError(err?.message || 'Sync failed');
      return false;
    }
  }, [readingProfile]);

  // Initial detection
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Detect when user switches tabs (e.g. returns from Chrome Web Store) or windows
  useEffect(() => {
    const handleFocus = () => {
      checkStatus();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkStatus();
      }
    };

    // Listen for extension announcement from content/bridge.js
    const handleMessage = (e: MessageEvent) => {
      if (e.source !== window || e.origin !== window.location.origin) return;
      if (e.data?.type === 'NEUROBRIDGE_EXTENSION_READY') {
        setExtensionState('installed');
        setExtensionVersion(e.data.version || null);
        setIsExtensionEnabled(!!e.data.enabled);
        if (e.data.hasProfile || e.data.assessmentDone) {
          setSyncState('synced');
        }
      } else if (e.data?.type === 'NEUROBRIDGE_APPLIED') {
        setSyncState('synced');
        setSyncedLabel(e.data.label);
        setIsExtensionEnabled(!!e.data.enabled);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('message', handleMessage);
    };
  }, [checkStatus]);

  // Auto-sync when extension is detected and readingProfile is ready
  useEffect(() => {
    if (
      extensionState === 'installed' &&
      readingProfile &&
      isTestCompleted &&
      !hasAutoSynced.current &&
      syncState !== 'syncing' &&
      syncState !== 'synced'
    ) {
      hasAutoSynced.current = true;
      sync();
    }
  }, [extensionState, readingProfile, isTestCompleted, syncState, sync]);

  return {
    extensionState,
    syncState,
    extensionVersion,
    isExtensionEnabled,
    syncError,
    syncedLabel,
    checkStatus,
    syncNow: sync,
    resetProfile: resetExtensionProfile,
  };
}

