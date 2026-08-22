import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAgentAvailability } from '../../utils/agentAvailability';
import { Sparkles, ArrowRight, ShieldCheck, Zap, PhoneCall } from 'lucide-react';

export const FinalCTASection: React.FC = () => {
  const { openEnquiryModal, settings } = useApp();
  const availability = useAgentAvailability(settings);

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Launch Your Website In Days</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto">
          Ready to Elevate Your Business with a Professional Website?
        </h2>

        <p className="text-sm sm:text-base text-indigo-200 max-w-2xl mx-auto leading-relaxed">
          Select your favorite template, share your business goals, and let our dedicated engineers build and launch your high-converting online presence.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => openEnquiryModal()}
            className="w-full sm:w-auto bg-white text-indigo-950 hover:bg-slate-100 font-extrabold text-sm px-8 py-4 rounded-xl shadow-xl shadow-black/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Get Started with WebRunzo</span>
          </button>

          <a
            href={`https://wa.me/${settings.whatsAppNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full sm:w-auto font-bold text-sm px-7 py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2.5 ${
              availability.status === 'Online'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                : availability.status === 'Away'
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
                : 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-950/40'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Chat on WhatsApp ({settings.whatsAppNumber})</span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-black/20 text-white`}>
              <span className={`w-1.5 h-1.5 rounded-full ${availability.dotColor} ${availability.dotPulse ? 'animate-pulse' : ''}`}></span>
              {availability.status}
            </span>
          </a>
        </div>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-indigo-300 font-medium">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>3-5 Day Rapid Turnaround</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Free 1st Year Domain & SSL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>✓ No Coding Required</span>
          </div>
        </div>

      </div>
    </section>
  );
};
