import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  PhoneDisconnect, 
  Robot, 
  CheckCircle, 
  SpeakerHigh, 
  SpeakerSlash,
  Microphone,
  MapPin
} from '@phosphor-icons/react';
import { saveAlert } from '../../services/alertStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  disasterName?: string;
  locationName?: string;
  isAutoTriggered?: boolean;
  reason?: string;
  batteryLevel?: number | null;
  signalStrength?: string;
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  micAuthorized?: boolean;
  gpsAuthorized?: boolean;
}

export const AICallModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  disasterName = "Flood Hazard",
  locationName = "Your Current Location",
  isAutoTriggered = false,
  reason,
  batteryLevel,
  signalStrength = "4G Online",
  lat,
  lng,
  accuracyMeters = 5,
  micAuthorized = true,
  gpsAuthorized = true
}) => {
  const [callSeconds, setCallSeconds] = useState(0);
  const [callStatus, setCallStatus] = useState<'dialing' | 'speaking' | 'operator_reply' | 'dispatched'>('dialing');
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Setup live microphone audio visualizer when modal is open and mic is authorized
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const startMicMonitoring = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (!isMounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          mediaStreamRef.current = stream;

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateMeter = () => {
              if (!isMounted) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(updateMeter);
            };
            updateMeter();
          }
        }
      } catch (e) {
        console.warn("Live microphone visualizer unavailable:", e);
      }
    };

    startMicMonitoring();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCallSeconds(0);
      setCallStatus('dialing');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Timer for call duration
    const timer = setInterval(() => {
      setCallSeconds(prev => prev + 1);
    }, 1000);

    const speechText = isAutoTriggered
      ? `Emergency dispatch 108. Automatic evacuation timeout. A citizen did not check in within the 3 minute escape window. Coordinates: ${locationName}. Phone battery is at ${batteryLevel || 85} percent. Immediate search and rescue team required.`
      : `Emergency dispatch. A citizen is trapped at ${locationName}. Immediate rescue boat and medical assistance required.`;

    // Sequence of AI Call
    const step1 = setTimeout(() => {
      setCallStatus('speaking');
      speakAI(speechText);
    }, 1800);

    const step2 = setTimeout(() => {
      setCallStatus('operator_reply');
    }, 7500);

    const step3 = setTimeout(() => {
      setCallStatus('dispatched');
      saveAlert({
        title: isAutoTriggered ? "AUTOMATIC 108 RESCUE CALL (3-Min Timeout)" : "AI Emergency Call Dispatched to 108",
        type: isAutoTriggered ? "TIMEOUT_AUTO_DISPATCH" : "AI_VOICE_CALL",
        severity: "CRITICAL",
        location: locationName,
        advice: isAutoTriggered
          ? `Automatic AI voice call completed to 108. Rescue unit en route to ${locationName}. Battery: ${batteryLevel || 85}%.`
          : "AI contacted 108 Emergency. Rescue team dispatched. Stay on high ground."
      });
    }, 12000);

    return () => {
      clearInterval(timer);
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, locationName, isAutoTriggered, batteryLevel, disasterName]);

  const speakAI = (text: string) => {
    if ('speechSynthesis' in window && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-red-500/40 rounded-3xl p-5 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-red-600/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            {isAutoTriggered ? "🚨 Automatic Timeout Dispatch" : "AI Emergency Call"}
          </div>

          <button 
            onClick={() => {
              setIsMuted(!isMuted);
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            title="Toggle Voice Sound"
          >
            {isMuted ? <SpeakerSlash size={16} /> : <SpeakerHigh size={16} />}
          </button>
        </div>

        {/* Device Permissions Status Badges */}
        <div className="w-full flex items-center justify-between gap-1.5 mb-2.5 px-1">
          <div className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg border text-[10px] font-bold ${
            micAuthorized 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <Microphone size={12} weight="bold" />
            <span>Mic Active</span>
            {micAuthorized && (
              <span className="flex items-center gap-0.5 ml-1">
                <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(4, audioLevel * 0.14)}px` }} />
                <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(4, audioLevel * 0.2)}px` }} />
                <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(4, audioLevel * 0.1)}px` }} />
              </span>
            )}
          </div>

          <div className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg border text-[10px] font-bold ${
            gpsAuthorized 
              ? 'bg-blue-950/40 border-blue-500/40 text-blue-300' 
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <MapPin size={12} weight="bold" />
            <span>GPS ±{accuracyMeters || 5}m</span>
          </div>
        </div>

        {/* Reason banner if auto triggered */}
        {isAutoTriggered && (
          <div className="w-full mb-3 p-2 bg-red-950/80 border border-red-500/60 rounded-xl text-[11px] text-red-200 font-medium">
            ⏱️ <strong>Safety Timeout Expired:</strong> {reason || "3 minutes elapsed without safe check-in. Automated AI voice protocol engaged."}
          </div>
        )}

        {/* Pulsing Avatar */}
        <div className="relative mb-2">
          <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 animate-pulse">
            <Robot size={36} className="text-red-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-slate-950">
            <PhoneCall size={12} weight="fill" />
          </div>
        </div>

        {/* Contact info */}
        <h2 className="text-base font-extrabold text-slate-100">
          108 Disaster Response
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {callStatus === 'dialing' && "Connecting to emergency dispatch..."}
          {callStatus === 'speaking' && "AI is speaking to 108 operator..."}
          {callStatus === 'operator_reply' && "Operator answering call..."}
          {callStatus === 'dispatched' && "Rescue Unit En Route"}
        </p>

        {lat && lng && (
          <div className="text-[10px] font-mono text-cyan-400/90 mt-0.5">
            Coord: {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
          </div>
        )}

        <div className="mt-1 font-mono text-xs text-amber-400 font-bold">
          {formatTime(callSeconds)}
        </div>

        {/* Live 2-Way Transcript */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3 my-2.5 text-left space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-sm shrink-0">🤖</span>
            <div className="bg-red-950/40 p-2 rounded-xl border border-red-500/20 text-red-200 text-[11px]">
              <strong className="block text-[9px] text-red-400 uppercase">CrisisWeave AI Voice:</strong>
              {isAutoTriggered
                ? `"Automated evacuation timeout. Citizen at ${locationName} failed to check in after 3-minute survival window. Telemetry: Battery ${batteryLevel || 85}%, Signal ${signalStrength}. Requesting immediate search and rescue."`
                : `"Reporting citizen trapped at ${locationName}. Immediate rescue required for ${disasterName}. Citizen unable to speak."`}
            </div>
          </div>

          {(callStatus === 'operator_reply' || callStatus === 'dispatched') && (
            <div className="flex items-start gap-2">
              <span className="text-sm shrink-0">👨‍💼</span>
              <div className="bg-blue-950/40 p-2 rounded-xl border border-blue-500/20 text-blue-200 text-[11px]">
                <strong className="block text-[9px] text-blue-400 uppercase">108 Emergency Operator:</strong>
                {isAutoTriggered
                  ? `"Timeout distress beacon confirmed for ${locationName}. Ground Search Team #4 dispatched with medical kit. Stay on high ground."`
                  : `"Coordinates received on our screen. Stay on high ground. Rescue Boat Team #3 dispatched now."`}
              </div>
            </div>
          )}
        </div>

        {/* Dispatched Confirmation */}
        {callStatus === 'dispatched' && (
          <div className="w-full p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-2 mb-2.5 animate-fade-in">
            <CheckCircle size={16} weight="fill" />
            <span className="font-bold">Rescue Team En Route • ETA 8 Mins</span>
          </div>
        )}

        {/* End Call Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-transform active:scale-95"
        >
          <PhoneDisconnect size={16} weight="bold" />
          End Emergency Call
        </button>

      </div>
    </div>
  );
};
