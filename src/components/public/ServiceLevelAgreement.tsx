import React from 'react';
import { useApp } from '../../context/AppContext';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { ShieldCheck, ArrowLeft, Clock, Zap, Server, Activity, CheckCircle2 } from 'lucide-react';

export const ServiceLevelAgreement: React.FC = () => {
  const { setPublicPage, settings, openConciergeModal } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back navigation */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                window.history.back();
              } else {
                setPublicPage('home');
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="border-b border-slate-800 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Activity className="w-3.5 h-3.5" />
            <span>Performance & Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Service Level Agreement (SLA)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Commitment to 99.9% Uptime, Rapid Maintenance Turnaround, and Concierge Availability.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
          
          {/* Uptime Guarantee Card */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">99.9% Uptime Guarantee</h2>
                  <p className="text-xs text-slate-400">Continuous cloud infrastructure monitoring with global edge failover</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
                99.9% TARGET
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              WebRunzo guarantees an annual uptime rate of 99.9% for all hosted client websites. Our high-availability global CDN ensures optimal speed, automated SSL renewal, and DDoS mitigation worldwide.
            </p>
          </div>

          {/* Response Turnaround Matrix */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              1. Maintenance Request Turnaround Times
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm">Starter Plan</div>
                <div className="text-indigo-400 font-mono font-bold text-lg">24-48 Hours</div>
                <p className="text-slate-400 text-[11px]">
                  Standard ticket queue for copy changes, photo swaps, and minor updates.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-indigo-500/40 space-y-2">
                <div className="font-bold text-white text-sm">Growth Plan</div>
                <div className="text-emerald-400 font-mono font-bold text-lg">Under 24 Hours</div>
                <p className="text-slate-400 text-[11px]">
                  Priority webmaster queue for dynamic content, menu uploads, and SEO adjustments.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/40 space-y-2">
                <div className="font-bold text-white text-sm flex items-center justify-between">
                  <span>VIP Enterprise</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">VIP</span>
                </div>
                <div className="text-amber-400 font-mono font-bold text-lg">Under 2 Hours</div>
                <p className="text-slate-400 text-[11px]">
                  Urgent hot-patch queue with direct WhatsApp concierge priority escalation.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              2. Incident Management & Critical Outage Response
            </h2>
            <p>
              In the rare event of an unplanned domain, DNS, or server outage, WebRunzo engineering activates immediate triage:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-xs sm:text-sm">
              <li><strong>P1 (Critical Site Outage):</strong> Response within 15 minutes; engineers dispatched immediately.</li>
              <li><strong>P2 (Degraded Performance / Minor Glitch):</strong> Response within 2 hours during active support hours.</li>
              <li><strong>P3 (Routine Content Revision):</strong> Handled according to your standard plan turnaround SLA.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              3. Automated Backups & Disaster Recovery
            </h2>
            <p>
              Every active website undergoes automated snapshot backups. In the event of unintended edits or rollbacks, complete system state restoration can be executed in minutes via the Admin Suite or upon support request.
            </p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <h2 className="text-lg font-bold text-white">4. Concierge Assistance</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Need immediate assistance or have questions regarding SLA terms?
            </p>
            <div className="text-xs text-slate-400 font-mono">
              WhatsApp Concierge: {settings.whatsAppNumber} • Direct: {settings.supportPhone}
            </div>
            <div className="pt-2">
              <button
                onClick={() => openConciergeModal()}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
              >
                <span>Connect with Concierge Team →</span>
              </button>
            </div>
          </section>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
