import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAgentAvailability } from '../../utils/agentAvailability';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  LifeBuoy,
  CheckCircle2
} from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { settings, addToast, isConciergeOpen, setIsConciergeOpen } = useApp();
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const [message, setMessage] = useState(settings.whatsAppDefaultMessage);
  const availability = useAgentAvailability(settings);

  // Sync with global isConciergeOpen if triggered from elsewhere
  const isOpen = isConciergeOpen || localIsOpen;
  const toggleOpen = () => {
    if (isConciergeOpen) {
      setIsConciergeOpen(false);
      setLocalIsOpen(false);
    } else {
      const nextState = !localIsOpen;
      setLocalIsOpen(nextState);
      setIsConciergeOpen(nextState);
    }
  };

  const closeDialog = () => {
    setIsConciergeOpen(false);
    setLocalIsOpen(false);
  };

  const cleanNumber = settings.whatsAppNumber.replace(/[^0-9]/g, '');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const encoded = encodeURIComponent(message || settings.whatsAppDefaultMessage);
    const url = `https://wa.me/${cleanNumber}?text=${encoded}`;
    addToast('info', 'Connecting to WhatsApp', `Opening direct concierge chat with WebRunzo (${settings.whatsAppNumber})...`);
    window.open(url, '_blank', 'noopener,noreferrer');
    closeDialog();
  };

  // Status visual themes
  const headerBgClass = 
    availability.status === 'Online'
      ? 'bg-emerald-600'
      : availability.status === 'Away'
      ? 'bg-amber-600'
      : 'bg-slate-800';

  const triggerDotColor =
    availability.status === 'Online'
      ? 'bg-emerald-400'
      : availability.status === 'Away'
      ? 'bg-amber-400'
      : 'bg-slate-400';

  const statusBadgeBg =
    availability.status === 'Online'
      ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30'
      : availability.status === 'Away'
      ? 'bg-amber-400/20 text-amber-100 border border-amber-300/30'
      : 'bg-slate-700 text-slate-200 border border-slate-600';

  return (
    <aside 
      id="support-concierge-widget"
      aria-label="Support & Concierge Quick Access" 
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 [bottom:calc(1rem+env(safe-area-inset-bottom,0px))] [right:calc(1rem+env(safe-area-inset-right,0px))]"
    >
      {/* Support & Concierge Floating Interactive Panel */}
      {isOpen && (
        <div 
          id="support-concierge-panel"
          className="mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-150 right-0"
        >
          {/* Header */}
          <div className={`${headerBgClass} p-4 text-white transition-colors duration-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg backdrop-blur shadow-sm">
                  <LifeBuoy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-2">
                    <span>Support & Concierge</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeBg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${availability.dotColor} ${availability.dotPulse ? 'animate-pulse' : ''}`}></span>
                      {availability.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/90 font-medium">
                    WebRunzo Dedicated Assistance Desk
                  </div>
                </div>
              </div>
              <button
                id="btn-close-concierge-modal"
                type="button"
                onClick={closeDialog}
                className="text-white/80 hover:text-white p-2.5 -mr-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation cursor-pointer"
                aria-label="Close Support & Concierge modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Operating Hours Bar */}
            <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[10px] text-white/80">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-white/70" />
                <span>{availability.hoursSummary}</span>
              </div>
              <span className="font-mono text-white/90">{availability.currentTimeFormatted}</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-50 space-y-3 max-h-[75vh] overflow-y-auto">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 shadow-sm leading-relaxed">
              {availability.status === 'Online' && (
                <>👋 <strong>Welcome to WebRunzo Concierge!</strong> Our engineers and support webmasters are currently <strong>Online</strong>. Need a custom template consultation, turnaround estimate, or site maintenance? Connect instantly below.</>
              )}
              {availability.status === 'Away' && (
                <>👋 <strong>Welcome to WebRunzo Concierge!</strong> Our team is currently <strong>Away</strong> on a brief shift transition. Leave your message below and we will reply within ~15 minutes.</>
              )}
              {availability.status === 'Offline' && (
                <>👋 <strong>Welcome to WebRunzo Concierge!</strong> We are currently <strong>Offline</strong> outside regular scheduled hours ({availability.hoursSummary}). Send your request below and we will reply first thing on the next business day.</>
              )}
            </div>

            {/* Quick Contact Info Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-2xs">
                <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp Hotline</span>
                </div>
                <div className="font-bold text-slate-800 text-[11px] mt-1 font-mono truncate">
                  {settings.whatsAppNumber}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-2xs">
                <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-600" />
                  <span>Support Email</span>
                </div>
                <div className="font-bold text-slate-800 text-[11px] mt-1 truncate">
                  {settings.supportEmail}
                </div>
              </div>
            </div>

            {/* Concierge Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-2.5 pt-1">
              <label htmlFor="concierge-input-message" className="block text-[11px] font-bold text-slate-700">
                Direct Message to Concierge Desk:
              </label>
              <textarea
                id="concierge-input-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our concierge team assist you today?"
                rows={3}
                className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white resize-none text-slate-800 placeholder-slate-400 shadow-inner"
              />
              
              <button
                id="btn-submit-concierge-chat"
                type="submit"
                className={`w-full text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all touch-manipulation active:scale-[0.98] cursor-pointer ${
                  availability.status === 'Online'
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/20'
                    : availability.status === 'Away'
                    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-amber-600/20'
                    : 'bg-slate-800 hover:bg-slate-900 active:bg-slate-950 shadow-slate-800/20'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open Instant WhatsApp Chat ({availability.status})</span>
              </button>
            </form>

            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Concierge
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                24/7 Queue Monitoring
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating "Support & Concierge" Button - Crisp, high-contrast, visible text on desktop & mobile */}
      <button
        id="btn-support-concierge"
        data-testid="btn-support-concierge"
        type="button"
        onClick={toggleOpen}
        className="group relative inline-flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-emerald-950/50 hover:shadow-emerald-600/50 transition-all duration-150 active:scale-95 cursor-pointer touch-manipulation select-none border border-emerald-400/30"
        aria-label="Support & Concierge"
        title="Support & Concierge Desk"
      >
        {/* Pulsing Status Dot */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {availability.dotPulse && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${triggerDotColor}`}></span>
        </span>

        {/* Icon */}
        <LifeBuoy className="w-4 h-4 text-white shrink-0 group-hover:rotate-45 transition-transform duration-300" />

        {/* Clearly Visible Label Text */}
        <span className="font-extrabold text-white tracking-normal whitespace-nowrap text-xs sm:text-sm">
          Support & Concierge
        </span>

        {/* Small Status Tag */}
        <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/20 text-emerald-100 uppercase tracking-wider">
          {availability.status}
        </span>
      </button>
    </aside>
  );
};
