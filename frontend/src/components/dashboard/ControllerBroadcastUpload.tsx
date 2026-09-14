import React, { useState, useRef } from 'react';
import { 
  Broadcast, 
  UploadSimple, 
  CheckCircle, 
  Trash, 
  ShieldCheck, 
  ShareNetwork
} from '@phosphor-icons/react';
import { publishControllerBroadcast, clearSyncState, ControllerBroadcast } from '../../services/syncService';
import { useHaptics } from '../../hooks/useHaptics';
import { saveAlert } from '../../services/alertStore';

interface Props {
  locationName?: string;
  onBroadcastSuccess?: (broadcast: ControllerBroadcast) => void;
  onClearSuccess?: () => void;
}

export const ControllerBroadcastUpload: React.FC<Props> = ({
  locationName = 'Active Sector',
  onBroadcastSuccess,
  onClearSuccess
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'>('HIGH');
  const [guidelinesText, setGuidelinesText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [broadcastedToast, setBroadcastedToast] = useState(false);
  const [clearedToast, setClearedToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { heavy: hapticHeavy, success: hapticSuccess, warning: hapticWarning } = useHaptics();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size exceeds 3MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        hapticSuccess();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    hapticHeavy();

    const guidelines = guidelinesText
      .split('\n')
      .map(g => g.trim())
      .filter(Boolean);

    const broadcast: ControllerBroadcast = {
      id: `bc-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      severity,
      locationName,
      imageUrl: imagePreview || undefined,
      guidelines: guidelines.length > 0 ? guidelines : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'Command Center Controller'
    };

    try {
      await publishControllerBroadcast(broadcast);
      saveAlert({
        title: broadcast.title,
        type: 'CONTROLLER_BROADCAST',
        severity: broadcast.severity,
        location: broadcast.locationName,
        advice: broadcast.message
      });

      if (onBroadcastSuccess) {
        onBroadcastSuccess(broadcast);
      }

      setBroadcastedToast(true);
      hapticSuccess();
      setTimeout(() => setBroadcastedToast(false), 3500);

      // Reset form
      setTitle('');
      setMessage('');
      setGuidelinesText('');
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Broadcast failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Broadcast ALL CLEAR to every connected citizen & device? This resets active disaster alerts.')) {
      return;
    }
    hapticWarning();
    await clearSyncState();
    if (onClearSuccess) onClearSuccess();
    setClearedToast(true);
    setTimeout(() => setClearedToast(false), 3000);
  };

  return (
    <div className="tactical-card relative overflow-hidden flex flex-col justify-between">
      {/* Live sync header bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Broadcast size={18} weight="fill" className="text-amber-400 animate-pulse" />
          <h2 className="section-header text-sm m-0 text-slate-100 font-orbitron tracking-wider">
            CONTROLLER BROADCAST & UPLOAD
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE SYNC SERVER ACTIVE
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mb-3">
        When you upload or broadcast an advisory, it updates <strong className="text-amber-300 font-bold">in real time on every phone & screen</strong> currently open.
      </p>

      {/* Success Toasts */}
      {broadcastedToast && (
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold animate-bounce">
          <CheckCircle size={16} weight="fill" />
          BROADCASTED LIVE TO ALL CONNECTED CITIZENS & DEVICES!
        </div>
      )}

      {clearedToast && (
        <div className="mb-3 p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2 font-bold">
          <ShieldCheck size={16} weight="fill" />
          ALL CLEAR SIGNAL SENT: Threat status reset on all devices.
        </div>
      )}

      <form onSubmit={handleBroadcast} className="space-y-3 flex-1">
        {/* Title and Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 font-mono">
              BULLETIN HEADLINE / TITLE *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flash Flood Advisory • Sector 4"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 font-mono">
              SEVERITY LEVEL
            </label>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none font-bold"
            >
              <option value="CRITICAL" className="text-red-400">CRITICAL ⚠️</option>
              <option value="HIGH" className="text-amber-400">HIGH 🔴</option>
              <option value="MEDIUM" className="text-yellow-400">MEDIUM 🟡</option>
              <option value="INFO" className="text-blue-400">ADVISORY ℹ️</option>
            </select>
          </div>
        </div>

        {/* Advisory Message */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1 font-mono">
            OFFICIAL ADVISORY / DIRECTIVES *
          </label>
          <textarea
            required
            rows={2}
            placeholder="e.g. Water tankers deployed at Community Hall. Avoid low-lying underpasses. Tap water is safe."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none resize-none"
          />
        </div>

        {/* Guidelines / Action steps */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1 font-mono">
            ACTION CHECKLIST (Optional, 1 per line)
          </label>
          <textarea
            rows={2}
            placeholder="Stay above 2nd floor&#10;Shut off gas main&#10;Charge power banks"
            value={guidelinesText}
            onChange={e => setGuidelinesText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono text-[11px] resize-none"
          />
        </div>

        {/* Image / Document Attachment */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1 font-mono flex items-center justify-between">
            <span>ATTACH FIELD PHOTO / MAP SNAPSHOT (Max 3MB)</span>
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[10px]"
              >
                <Trash size={12} /> Remove
              </button>
            )}
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!imagePreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 border border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl bg-slate-900/50 flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-amber-300 transition-colors"
            >
              <UploadSimple size={16} />
              <span>Choose Photo or Incident Image to Upload</span>
            </button>
          ) : (
            <div className="relative rounded-lg overflow-hidden border border-slate-700 max-h-24 bg-slate-950 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Attachment Preview"
                className="max-h-24 w-auto object-contain"
              />
              <span className="absolute bottom-1 right-1 text-[9px] bg-slate-950/80 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                Image Attached ✓
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <ShareNetwork size={16} weight="bold" />
            <span>{isSubmitting ? 'BROADCASTING...' : 'BROADCAST TO ALL CITIZENS (LIVE)'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
            title="Reset active emergency to calm state on all devices"
          >
            <ShieldCheck size={16} weight="bold" className="text-cyan-400" />
            <span>ALL CLEAR</span>
          </button>
        </div>
      </form>
    </div>
  );
};
