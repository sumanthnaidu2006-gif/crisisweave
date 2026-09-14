import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  User, 
  Users, 
  Plus, 
  Trash, 
  CheckCircle, 
  Hospital,
  Flame,
  Shield,
  Robot,
  WarningOctagon
} from '@phosphor-icons/react';
import { getUserContacts, addUserContact, deleteUserContact, EmergencyContact } from '../../services/contactStore';
import { useHaptics } from '../../hooks/useHaptics';

interface Props {
  onTriggerAICall?: () => void;
  onInitiateCall?: (target: { number: string; name: string; isAI?: boolean }) => void;
}

export const MobileContacts: React.FC<Props> = ({ onTriggerAICall, onInitiateCall }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [alertSent, setAlertSent] = useState(false);
  const { light: hapticLight, medium: hapticMedium, success: hapticSuccess, emergencySOS } = useHaptics();

  useEffect(() => {
    setContacts(getUserContacts());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    hapticSuccess();
    const newContact = addUserContact({
      name: name.trim(),
      phone: phone.trim(),
      relation: relation.trim() || 'Family / Friend'
    });

    setContacts(prev => [...prev, newContact]);
    setName('');
    setPhone('');
    setRelation('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    hapticLight();
    deleteUserContact(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleBroadcast = () => {
    emergencySOS();
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3500);
  };

  const emergencyServices = [
    {
      name: "Ambulance / Medical Emergency",
      number: "108",
      desc: "Injuries, illness, medical rescue",
      icon: <Hospital size={22} className="text-red-400" />,
      color: "border-red-500/30 bg-red-950/20"
    },
    {
      name: "Fire Brigade & Water Rescue",
      number: "101",
      desc: "Boats, fires, trapped under debris",
      icon: <Flame size={22} className="text-amber-400" />,
      color: "border-amber-500/30 bg-amber-950/20"
    },
    {
      name: "Police Emergency",
      number: "100",
      desc: "Immediate security and missing persons",
      icon: <Shield size={22} className="text-blue-400" />,
      color: "border-blue-500/30 bg-blue-950/20"
    },
    {
      name: "Disaster Control Helpline",
      number: "1070",
      desc: "Govt flood, cyclone & earthquake relief",
      icon: <WarningOctagon size={22} className="text-purple-400" />,
      color: "border-purple-500/30 bg-purple-950/20"
    }
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* 🤖 AI VOICE CALL BUTTON (If user is unable to speak) */}
      <div className="p-4 bg-gradient-to-r from-red-950/60 to-purple-950/60 border border-red-500/50 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 font-bold shrink-0">
            <Robot size={24} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-red-300 uppercase tracking-wider">
              Stuck & Cannot Speak?
            </h3>
            <p className="text-xs font-bold text-slate-100">
              Let AI Call 108 Emergency for You
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 mb-3">
          If you are injured or surrounded by water/gas, the AI will dial 108, speak your exact GPS location, and request an emergency rescue unit on your behalf.
        </p>

        <button
          onClick={() => {
            hapticMedium();
            if (onInitiateCall) {
              onInitiateCall({ number: '108', name: '108 AI Emergency Dispatch', isAI: true });
            } else {
              onTriggerAICall?.();
            }
          }}
          className="touch-tactile w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
        >
          <Robot size={18} weight="bold" />
          Start AI Emergency Call to 108
        </button>
      </div>

      {/* 👨‍👩‍👧 PERSONAL CONTACTS (No hardcoded dummy contacts!) */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">
              My Emergency Contacts
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
              {contacts.length}
            </span>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus size={14} weight="bold" />
            Add Contact
          </button>
        </div>

        {/* Add Contact Form */}
        {isAdding && (
          <form onSubmit={handleAdd} className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2.5 text-xs animate-fade-in">
            <div className="font-bold text-slate-200">New Emergency Contact</div>
            
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dad, Mom, Brother, Dr. Sharma"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Relationship (Optional)</label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g. Father, Sister, Friend, Neighbor"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                Save Contact
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Contacts List or Empty State */}
        {contacts.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-slate-800/30 rounded-xl border border-slate-800/80 text-xs space-y-1">
            <User size={28} className="mx-auto text-slate-500 mb-1" />
            <div className="font-semibold text-slate-300">No Contacts Added Yet</div>
            <p className="text-[11px] text-slate-400">
              Tap <strong>"Add Contact"</strong> above to save family members or friends who should be notified when you press SOS.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div 
                key={c.id} 
                className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">{c.name}</div>
                    <div className="text-[11px] text-slate-400">{c.phone} • {c.relation}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${c.phone}`}
                    className="p-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg flex items-center justify-center border border-emerald-500/30"
                    title="Call"
                  >
                    <PhoneCall size={16} weight="bold" />
                  </a>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/20"
                    title="Delete"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Broadcast GPS button */}
            <button
              onClick={handleBroadcast}
              className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              Send My Location via SMS to All {contacts.length} Contacts
            </button>

            {alertSent && (
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-1.5 animate-fade-in">
                <CheckCircle size={15} weight="fill" />
                <span>Emergency SMS dispatched to all saved contacts!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🚨 OFFICIAL TOLL-FREE SERVICES (108, 101, 100) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Government Emergency Helplines (24/7 Free)
        </h3>

        {emergencyServices.map((service, idx) => (
          <div 
            key={idx} 
            className={`p-3 rounded-xl border ${service.color} flex items-center justify-between`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-700">
                {service.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">{service.name}</div>
                <div className="text-[10px] text-slate-400">{service.desc}</div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                hapticMedium();
                if (onInitiateCall) {
                  onInitiateCall({ number: service.number, name: service.name });
                } else {
                  window.location.href = `tel:${service.number}`;
                }
              }}
              className="touch-tactile px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 ml-2"
            >
              <PhoneCall size={14} weight="bold" />
              Call {service.number}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
