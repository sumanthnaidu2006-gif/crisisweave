import { useState, useCallback, useEffect } from 'react';

export type PermissionState = 'granted' | 'prompt' | 'denied' | 'unsupported';

export interface CallPermissionsState {
  mic: PermissionState;
  gps: PermissionState;
  audio: PermissionState;
  isChecking: boolean;
  isRequesting: boolean;
  hasAllGranted: boolean;
  hasAttempted: boolean;
}

export const useCallPermissions = () => {
  const [permissions, setPermissions] = useState<CallPermissionsState>({
    mic: 'prompt',
    gps: 'prompt',
    audio: 'prompt',
    isChecking: true,
    isRequesting: false,
    hasAllGranted: false,
    hasAttempted: false
  });

  // Quietly inspect existing permission states on mount (ZERO prompt to user)
  const inspectExistingPermissions = useCallback(async () => {
    let micState: PermissionState = 'prompt';
    let gpsState: PermissionState = 'prompt';
    let audioState: PermissionState = 'granted';

    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      try {
        const gpsQuery = await navigator.permissions.query({ name: 'geolocation' as any });
        gpsState = gpsQuery.state as PermissionState;
        gpsQuery.onchange = () => {
          setPermissions(prev => ({
            ...prev,
            gps: gpsQuery.state as PermissionState,
            hasAllGranted: prev.mic === 'granted' && gpsQuery.state === 'granted'
          }));
        };
      } catch (e) {
        // query for geolocation unsupported or threw
      }

      try {
        const micQuery = await navigator.permissions.query({ name: 'microphone' as any });
        micState = micQuery.state as PermissionState;
        micQuery.onchange = () => {
          setPermissions(prev => ({
            ...prev,
            mic: micQuery.state as PermissionState,
            hasAllGranted: micQuery.state === 'granted' && prev.gps === 'granted'
          }));
        };
      } catch (e) {
        // microphone query not supported in all browsers
      }
    }

    setPermissions(prev => ({
      ...prev,
      mic: micState,
      gps: gpsState,
      audio: audioState,
      isChecking: false,
      hasAllGranted: micState === 'granted' && gpsState === 'granted'
    }));
  }, []);

  useEffect(() => {
    inspectExistingPermissions();
  }, [inspectExistingPermissions]);

  /**
   * Triggers the interactive permission requests for emergency calling:
   * 1. Microphone (navigator.mediaDevices.getUserMedia)
   * 2. Device GPS (navigator.geolocation via custom handler or native)
   * 3. Web Audio Context resume
   */
  const requestCallPermissions = useCallback(async (
    onDeviceGPSRequest?: () => Promise<{ lat: number; lng: number; locationName: string } | null>
  ): Promise<{ mic: boolean; gps: boolean; audio: boolean; success: boolean }> => {
    setPermissions(prev => ({ ...prev, isRequesting: true, hasAttempted: true }));

    let micGranted = false;
    let gpsGranted = false;
    let audioGranted = false;

    // 1. Audio Context initialization
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const ctx = new AudioCtxClass();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        audioGranted = ctx.state === 'running';
      } else {
        audioGranted = true;
      }
    } catch (e) {
      console.warn("AudioContext resume failed:", e);
      audioGranted = true; // Fallback
    }

    // 2. Microphone access
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micGranted = true;
        // Release immediate test stream; live call will establish its own active stream
        stream.getTracks().forEach(t => t.stop());
      } catch (err: any) {
        console.warn("Microphone permission denied:", err.message);
        micGranted = false;
      }
    } else {
      micGranted = false;
    }

    // 3. Precise Device GPS Coordinates
    if (onDeviceGPSRequest) {
      try {
        const gpsRes = await onDeviceGPSRequest();
        gpsGranted = !!gpsRes;
      } catch (e) {
        gpsGranted = false;
      }
    } else if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      gpsGranted = await new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 8000, enableHighAccuracy: true }
        );
      });
    }

    const updatedMic: PermissionState = micGranted ? 'granted' : 'denied';
    const updatedGps: PermissionState = gpsGranted ? 'granted' : 'denied';
    const updatedAudio: PermissionState = audioGranted ? 'granted' : 'prompt';
    const allGranted = micGranted && gpsGranted;

    setPermissions({
      mic: updatedMic,
      gps: updatedGps,
      audio: updatedAudio,
      isChecking: false,
      isRequesting: false,
      hasAllGranted: allGranted,
      hasAttempted: true
    });

    return {
      mic: micGranted,
      gps: gpsGranted,
      audio: audioGranted,
      success: micGranted || gpsGranted // allow call to proceed if at least partial
    };
  }, []);

  return {
    permissions,
    requestCallPermissions,
    inspectExistingPermissions
  };
};
