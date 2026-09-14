import { useState, useEffect, useRef, useCallback } from 'react';
import { saveAlert } from '../services/alertStore';

const TOTAL_SECONDS = 180; // 3 minutes total
const WARNING_1_SECONDS = 120; // At 2:00 remaining (1 min elapsed)
const WARNING_2_SECONDS = 60;  // At 1:00 remaining (2 mins elapsed)

export interface EscapeTimerState {
  isActive: boolean;
  secondsRemaining: number;
  formattedTime: string;
  progressPercent: number; // 0 to 100
  warningLevel: 'none' | 'warning_1' | 'warning_2' | 'expired';
  warningMessage: string | null;
  startTimer: () => void;
  confirmSafe: () => void;
  extendTimer: (extraSeconds?: number) => void;
  dismissWarning: () => void;
  cancelTimer: () => void;
}

export const useEscapeSafetyTimer = (
  onAutoEmergencyTrigger: (reason: string) => void,
  userLocationName: string = 'Current GPS Location'
): EscapeTimerState => {
  const [isActive, setIsActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(TOTAL_SECONDS);
  const [warningLevel, setWarningLevel] = useState<'none' | 'warning_1' | 'warning_2' | 'expired'>('none');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const warned1Ref = useRef(false);
  const warned2Ref = useRef(false);
  const expiredRef = useRef(false);

  // Helper for voice alert
  const speakWarning = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Helper for haptic vibration
  const triggerVibrate = useCallback((pattern: number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const startTimer = useCallback(() => {
    setIsActive(true);
    setSecondsRemaining(TOTAL_SECONDS);
    setWarningLevel('none');
    setWarningMessage(null);
    warned1Ref.current = false;
    warned2Ref.current = false;
    expiredRef.current = false;

    speakWarning("Evacuation safety timer activated. You have 3 minutes to reach the safe shelter.");
    triggerVibrate([200, 100, 200]);
  }, [speakWarning, triggerVibrate]);

  const confirmSafe = useCallback(() => {
    setIsActive(false);
    setWarningLevel('none');
    setWarningMessage(null);
    setSecondsRemaining(TOTAL_SECONDS);

    speakWarning("Safety check-in confirmed. You are safe. Standby protocol engaged.");
    saveAlert({
      title: "Evacuation Check-In: Citizen Reached Safety",
      type: "EVAC_CONFIRMED",
      severity: "LOW",
      location: userLocationName,
      advice: "Citizen safely reached shelter within 3-minute evacuation window."
    });
  }, [speakWarning, userLocationName]);

  const extendTimer = useCallback((extraSeconds: number = 120) => {
    setSecondsRemaining(prev => prev + extraSeconds);
    setWarningLevel('none');
    setWarningMessage(null);
    warned1Ref.current = false;
    warned2Ref.current = false;
    speakWarning(`Evacuation window extended by ${Math.round(extraSeconds / 60)} minutes.`);
  }, [speakWarning]);

  const dismissWarning = useCallback(() => {
    setWarningMessage(null);
  }, []);

  const cancelTimer = useCallback(() => {
    setIsActive(false);
    setWarningLevel('none');
    setWarningMessage(null);
    setSecondsRemaining(TOTAL_SECONDS);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Monitor warnings and expiration
  useEffect(() => {
    if (!isActive) return;

    // 1. WARNING 1 (At 2 minutes remaining)
    if (secondsRemaining <= WARNING_1_SECONDS && secondsRemaining > WARNING_2_SECONDS && !warned1Ref.current) {
      warned1Ref.current = true;
      setWarningLevel('warning_1');
      const msg = "Warning 1 of 2: You have 2 minutes left to reach safety! Please confirm you are safe.";
      setWarningMessage(msg);
      speakWarning(msg);
      triggerVibrate([300, 150, 300]);
      
      saveAlert({
        title: "Evacuation Warning 1: 2 Minutes Remaining",
        type: "SAFETY_TIMER_WARN",
        severity: "HIGH",
        location: userLocationName,
        advice: "Evacuation safety check: 2 minutes left to confirm arrival at safe house."
      });
    }

    // 2. WARNING 2 (At 1 minute remaining)
    if (secondsRemaining <= WARNING_2_SECONDS && secondsRemaining > 0 && !warned2Ref.current) {
      warned2Ref.current = true;
      setWarningLevel('warning_2');
      const msg = "Final Warning: 60 seconds remaining! If you do not check in, an automatic emergency AI call will be dispatched to 108.";
      setWarningMessage(msg);
      speakWarning(msg);
      triggerVibrate([500, 200, 500, 200, 500]);

      saveAlert({
        title: "Evacuation Final Warning: 60 Seconds Remaining",
        type: "SAFETY_TIMER_URGENT",
        severity: "CRITICAL",
        location: userLocationName,
        advice: "Final 60-second warning before automated AI rescue dispatch."
      });
    }

    // 3. EXPIRED (0 seconds remaining)
    if (secondsRemaining === 0 && !expiredRef.current) {
      expiredRef.current = true;
      setWarningLevel('expired');
      setIsActive(false);
      const msg = "Safety timer expired. Citizen failed to check in. Initiating automatic emergency AI rescue call now.";
      setWarningMessage(msg);
      speakWarning(msg);
      triggerVibrate([1000, 300, 1000]);

      saveAlert({
        title: "AUTOMATIC SOS: Evacuation Timeout (3 Mins Expired)",
        type: "TIMEOUT_AUTO_DISPATCH",
        severity: "CRITICAL",
        location: userLocationName,
        advice: "Citizen did not check in within 3-minute evacuation window. Automated AI voice call dispatched to 108 Emergency."
      });

      // Automatically trigger the AI emergency call!
      onAutoEmergencyTrigger("Evacuation Timeout: Citizen failed to reach safe shelter in 3 minutes");
    }
  }, [secondsRemaining, isActive, speakWarning, triggerVibrate, onAutoEmergencyTrigger, userLocationName]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;
  const progressPercent = Math.max(0, Math.min(100, Math.round(((TOTAL_SECONDS - secondsRemaining) / TOTAL_SECONDS) * 100)));

  return {
    isActive,
    secondsRemaining,
    formattedTime,
    progressPercent,
    warningLevel,
    warningMessage,
    startTimer,
    confirmSafe,
    extendTimer,
    dismissWarning,
    cancelTimer
  };
};
