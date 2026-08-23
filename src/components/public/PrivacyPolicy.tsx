import React from 'react';
import { useApp } from '../../context/AppContext';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { ShieldCheck, ArrowLeft, Lock, Eye, Server, RefreshCw, Mail, Phone } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Privacy & Security</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Last Updated: August 2026 • WebRunzo Digital Systems Inc.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
          <section className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              1. Overview & Scope
            </h2>
            <p>
              WebRunzo (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting the privacy and security of your business and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website, utilize our website design and management services, or access the WebRunzo Client Portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              2. Information We Collect
            </h2>
            <p>
              When onboarding with WebRunzo or requesting a website demonstration, we may collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-xs sm:text-sm">
              <li><strong>Contact Details:</strong> Name, business email, WhatsApp contact number, and company name.</li>
              <li><strong>Business Assets:</strong> Brand logos, color palettes, photo galleries, business operating hours, menu lists, service pricing, and textual copy.</li>
              <li><strong>Technical Metadata:</strong> Domain records (DNS, CNAME), SSL certification logs, IP addresses, browser types, and hosting diagnostic analytics.</li>
              <li><strong>Billing & Invoicing Records:</strong> Transaction timestamps, selected subscription tiers, and invoice statuses (credit card processing is handled securely via PCI-compliant gateway partners).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              3. How We Use Your Information
            </h2>
            <p>We process collected data exclusively to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-xs sm:text-sm">
              <li>Engineer, deploy, and maintain your custom business website.</li>
              <li>Fulfill maintenance work orders, copy updates, and image asset swaps requested through our Support & Concierge service.</li>
              <li>Monitor website uptime, response latency, and SSL certificate renewals.</li>
              <li>Send critical service notifications regarding domain renewals, security patches, and invoice receipts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              4. Data Retention & Security
            </h2>
            <p>
              We enforce strict industry-standard encryption protocols (TLS 1.3, AES-256 for snapshot archives) for all customer assets and automated nightly backups. Customer data is retained for the active duration of your subscription plan and can be exported or purged upon verified written request.
            </p>
          </section>

          <section className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              5. Contact & Privacy Inquiries
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              For any questions regarding this policy, data access requests, or privacy compliance:
            </p>
            <div className="text-xs text-slate-400 space-y-1 font-mono pt-1">
              <div>Email: {settings.supportEmail}</div>
              <div>Hotline: {settings.supportPhone}</div>
              <div>WhatsApp Concierge: {settings.whatsAppNumber}</div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => openConciergeModal()}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
              >
                <span>Open Support & Concierge Desk →</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
