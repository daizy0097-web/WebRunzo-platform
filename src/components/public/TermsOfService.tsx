import React from 'react';
import { useApp } from '../../context/AppContext';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { FileText, ArrowLeft, CheckCircle2, AlertCircle, CreditCard, RefreshCw } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Last Updated: August 2026 • WebRunzo Digital Systems Inc.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
          <section className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using WebRunzo services, turnkey website platforms, client portals, or purchasing a managed subscription, you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions, you must discontinue use immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              2. Subscription Plans, Billing & Cancellations
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-xs sm:text-sm">
              <li><strong>Billing Cycle:</strong> All subscription plans (e.g. Starter, Growth, Enterprise VIP) are billed on a recurring monthly or annual basis as agreed at signup.</li>
              <li><strong>Turnkey Setup:</strong> Initial build and custom template personalization begin promptly upon order confirmation and content asset submission.</li>
              <li><strong>Cancellation:</strong> You may cancel your subscription at any time via the Client Portal or by notifying WebRunzo Support with 14 days notice before the next billing date.</li>
              <li><strong>No Lock-in:</strong> Clients retain ownership of their custom business text, media assets, and registered domain names.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              3. Maintenance, Updates & Work Orders
            </h2>
            <p>
              WebRunzo provides managed webmaster services under defined plan allowances:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-xs sm:text-sm">
              <li>Included maintenance covers copy revisions, photo replacements, menu/pricing updates, and technical security patching.</li>
              <li>Requests are processed according to the response SLA associated with your active plan tier.</li>
              <li>Major site overhauls or third-party custom software integrations outside standard plan scope are quoted separately in advance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              4. Client Content & Intellectual Property
            </h2>
            <p>
              You represent and warrant that you hold all necessary licenses and copyrights for any logos, trademarks, images, and content provided to WebRunzo for inclusion on your website. WebRunzo retains intellectual property rights to its proprietary platform code, framework libraries, and design templates.
            </p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <h2 className="text-lg font-bold text-white">5. Questions & Legal Inquiries</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              For billing inquiries, contracts, or compliance questions:
            </p>
            <div className="text-xs text-slate-400 font-mono">
              Email: {settings.supportEmail} • Support: {settings.supportPhone}
            </div>
            <div className="pt-2">
              <button
                onClick={() => openConciergeModal()}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
              >
                <span>Talk to WebRunzo Concierge →</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
