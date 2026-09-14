import React, { useState } from 'react';
import { 
  Broadcast, 
  X, 
  MapPin, 
  CheckSquare, 
  CaretDown, 
  CaretUp,
  Image as ImageIcon
} from '@phosphor-icons/react';
import { ControllerBroadcast } from '../../services/syncService';
import { useHaptics } from '../../hooks/useHaptics';

interface Props {
  broadcast: ControllerBroadcast | null;
  onDismiss: () => void;
  onNavigateToMap?: () => void;
}

export const EmergencySyncBanner: React.FC<Props> = ({
  broadcast,
  onDismiss,
  onNavigateToMap
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { light: hapticLight, medium: hapticMedium } = useHaptics();

  if (!broadcast) return null;

  const severityStyles = {
    CRITICAL: 'bg-red-950/90 border-red-500/80 text-red-100 shadow-red-900/40',
    HIGH: 'bg-amber-950/90 border-amber-500/80 text-amber-100 shadow-amber-900/40',
    MEDIUM: 'bg-yellow-950/90 border-yellow-500/80 text-yellow-100 shadow-yellow-900/40',
    INFO: 'bg-blue-950/90 border-blue-500/80 text-blue-100 shadow-blue-900/40'
  };

  const badgeStyles = {
    CRITICAL: 'bg-red-500 text-white',
    HIGH: 'bg-amber-500 text-slate-950',
    MEDIUM: 'bg-yellow-500 text-slate-950',
    INFO: 'bg-blue-500 text-white'
  };

  return (
    <>
      <div 
        className={`w-full border-b backdrop-blur-md px-3.5 py-2.5 shadow-lg transition-all animate-in slide-in-from-top-2 duration-300 z-50 ${severityStyles[broadcast.severity] || severityStyles.HIGH}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-3">
            {/* Icon + Title */}
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0 mt-0.5 animate-pulse">
                <Broadcast size={18} weight="fill" className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full ${badgeStyles[broadcast.severity]}`}>
                    {broadcast.severity} ALERT
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">
                    {broadcast.timestamp} • {broadcast.sender}
                  </span>
                </div>
                <h4 className="font-bold text-sm leading-tight text-white truncate">
                  {broadcast.title}
                </h4>
                <p className="text-xs text-slate-200 line-clamp-2 mt-0.5">
                  {broadcast.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onNavigateToMap && (
                <button
                  onClick={() => {
                    hapticMedium();
                    onNavigateToMap();
                  }}
                  className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg text-[11px] font-bold text-emerald-300 flex items-center gap-1 transition-colors"
                  title="View Hazard on Map"
                >
                  <MapPin size={14} weight="bold" />
                  <span className="hidden sm:inline">Safe Map</span>
                </button>
              )}

              {broadcast.imageUrl && (
                <button
                  onClick={() => {
                    hapticLight();
                    setIsImageModalOpen(true);
                  }}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[11px] font-bold text-amber-300 flex items-center gap-1 transition-colors"
                  title="View Attached Photo"
                >
                  <ImageIcon size={14} weight="bold" />
                  <span className="hidden sm:inline">Photo</span>
                </button>
              )}

              {(broadcast.guidelines && broadcast.guidelines.length > 0) && (
                <button
                  onClick={() => {
                    hapticLight();
                    setIsExpanded(!isExpanded);
                  }}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
                  title={isExpanded ? 'Collapse' : 'Expand Guidelines'}
                >
                  {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                </button>
              )}

              <button
                onClick={() => {
                  hapticLight();
                  onDismiss();
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
                title="Dismiss Banner"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Expanded guidelines */}
          {isExpanded && broadcast.guidelines && (
            <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-200 animate-in fade-in-50">
              {broadcast.guidelines.map((guide, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-black/20 p-1.5 rounded-md">
                  <CheckSquare size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{guide}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image inspection modal */}
      {isImageModalOpen && broadcast.imageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ImageIcon size={16} className="text-amber-400" />
                CONTROLLER ATTACHED PHOTO / REPORT
              </span>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-2 bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img
                src={broadcast.imageUrl}
                alt="Controller Attachment"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
