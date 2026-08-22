import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAgentAvailability } from '../../utils/agentAvailability';
import { MessageCircle, X, Send, Sparkles, Clock, ShieldCheck } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { settings, addToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(settings.whatsAppDefaultMessage);
  const availability = useAgentAvailability(settings);

  const cleanNumber = settings.whatsAppNumber.replace(/[^0-9]/g, '');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const encoded = encodeURIComponent(message || settings.whatsAppDefaultMessage);
    const url = `https://wa.me/${cleanNumber}?text=${encoded}`;
    addToast('info', 'Connecting to WhatsApp', `Opening direct chat with WebRunzo (${settings.whatsAppNumber})...`);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
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
    <aside aria-label="WhatsApp quick chat" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 [bottom:calc(1rem+env(safe-area-inset-bottom,0px))] [right:calc(1rem+env(safe-area-inset-right,0px))]">
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-150 right-0">
          {/* Header */}
          <div className={`${headerBgClass} p-4 text-white transition-colors duration-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg backdrop-blur shadow-sm">
                  W
                </div>
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-2">
                    <span>WebRunzo WhatsApp</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeBg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${availability.dotColor} ${availability.dotPulse ? 'animate-pulse' : ''}`}></span>
                      {availability.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/90 font-medium">
                    {availability.statusMessage}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-2.5 -mr-1.5 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation cursor-pointer"
                aria-label="Close WhatsApp chat popup"
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
          <div className="p-4 bg-slate-50 space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 shadow-sm leading-relaxed">
              {availability.status === 'Online' && (
                <>👋 <strong>Hi there!</strong> An agent is currently <strong>Online</strong>. Ready to build your dream website or have a question about our templates? Send us a quick WhatsApp message below for an instant reply.</>
              )}
              {availability.status === 'Away' && (
                <>👋 <strong>Hi there!</strong> Our concierge team is currently <strong>Away</strong> on a brief break or shift transition. Leave your message below and we will reply within ~15 minutes.</>
              )}
              {availability.status === 'Offline' && (
                <>👋 <strong>Hi there!</strong> We are currently <strong>Offline</strong> outside scheduled business hours ({availability.hoursSummary}). Send your request below and we will reply first thing on the next business day.</>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hotline: {settings.whatsAppNumber}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Verified Direct Line</span>
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-2.5">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message or project question..."
                rows={3}
                className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white resize-none text-slate-800 placeholder-slate-400"
              />
              <button
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
                <span>Start WhatsApp Chat ({availability.status})</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Trigger Button with Expanded Hit Area & Zero-Lag Touch */}
      <button
        id="btn-floating-whatsapp"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-xl shadow-emerald-600/35 flex items-center justify-center transition-transform duration-75 active:scale-90 group relative cursor-pointer touch-manipulation select-none before:absolute before:-inset-2 before:content-[''] before:rounded-full before:z-0"
        aria-label={`Chat on WhatsApp (${availability.status})`}
        title={`WebRunzo Concierge (${availability.status})`}
      >
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-white/20 relative z-10 transition-transform duration-75 group-active:scale-95" />
        
        {/* Dynamic Status Indicator Dot */}
        <span 
          className={`absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-20 ${triggerDotColor} ${
            availability.dotPulse ? 'animate-pulse' : ''
          }`}
        >
          <span className="sr-only">Status: {availability.status}</span>
        </span>
      </button>
    </aside>
  );
};

