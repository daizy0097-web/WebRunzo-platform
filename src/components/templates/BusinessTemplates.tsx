import React, { useState } from 'react';
import { Template, Customer } from '../../types';
import { 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Download, 
  Calculator, 
  CheckCircle2, 
  Award, 
  FileText, 
  Sparkles, 
  BarChart3, 
  Layers, 
  Compass, 
  Phone, 
  Mail, 
  ExternalLink,
  ChevronRight,
  Play,
  Star
} from 'lucide-react';

interface TemplateProps {
  template: Template;
  customer?: Customer | null;
  onUseTemplate?: () => void;
  onBookingSubmitted?: (msg: string) => void;
}

// ============================================================================
// 1. NEXUS CORPORATE PRO (tpl-biz-1 / nexus-corporate)
// Institutional Corporate Advisory, Capital Markets & Enterprise Solutions
// ============================================================================
export const NexusCorporateDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [activeTab, setActiveTab] = useState<'advisory' | 'capital' | 'restructuring'>('advisory');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', dealSize: '$10M - $50M' });

  const primary = customer?.customContent?.primaryColor || template.colorScheme.accent || '#2563eb';
  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (onBookingSubmitted) onBookingSubmitted(`Consultation requested for ${formData.company || formData.name}`);
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Ticker Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> SEC & FINRA Regulated Advisory
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline">Q3 Capital Markets Index: <strong className="text-emerald-400">+14.2% YoY</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>Global Desks: NY • LDN • SGP</span>
          <a href="#contact" className="text-blue-400 hover:text-blue-300 font-medium">Client Portal →</a>
        </div>
      </div>

      {/* Corporate Nav */}
      <nav className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-600/30">
            N
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-white">{bizName}</div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Capital Advisory & Holdings</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#practices" className="hover:text-blue-400 transition">Practices</a>
          <a href="#track-record" className="hover:text-blue-400 transition">Transactions</a>
          <a href="#leadership" className="hover:text-blue-400 transition">Partners</a>
          <a href="#insights" className="hover:text-blue-400 transition">Quarterly Outlook</a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <span>Request Prospectus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative px-6 py-16 sm:py-24 border-b border-slate-800 overflow-hidden bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Strategic Capital & Corporate Advisory for Global Enterprises</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl">
            Structuring High-Stakes Mergers, Debt Financing & Enterprise Growth.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Over $14.8B in closed aggregate transactions. We advise corporate boards, private equity sponsors, and growth leaders on strategic capital structuring, cross-border M&A, and balance sheet resilience.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              <span>Schedule Boardroom Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#track-record"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Download 2026 M&A Outlook (PDF)</span>
            </a>
          </div>

          {/* Institutional Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 mt-10 border-t border-slate-800/80">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black text-white">$14.8B+</div>
              <div className="text-xs text-slate-400 mt-0.5">Closed Deal Value</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black text-white">240+</div>
              <div className="text-xs text-slate-400 mt-0.5">Enterprise Mandates</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black text-white">98.4%</div>
              <div className="text-xs text-slate-400 mt-0.5">Closing Success Ratio</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black text-white">18 Days</div>
              <div className="text-xs text-slate-400 mt-0.5">Avg. Term-Sheet Speed</div>
            </div>
          </div>
        </div>
      </header>

      {/* Advisory Practices Section */}
      <section id="practices" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400">Core Advisory</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Specialized Financial Capabilities</h2>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('advisory')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'advisory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              M&A Advisory
            </button>
            <button
              onClick={() => setActiveTab('capital')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'capital' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Capital Raising
            </button>
            <button
              onClick={() => setActiveTab('restructuring')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'restructuring' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Restructuring
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeTab === 'advisory' && (
            <>
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">01</div>
                <h3 className="font-bold text-white text-base">Buy-Side Strategic Acquisition</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Identifying proprietary targets, competitive valuation models, synergy auditing, and confidential negotiation structuring.</p>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Target Pipeline Sourcing</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Post-Merger Integration Plan</li>
                </ul>
              </div>
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">02</div>
                <h3 className="font-bold text-white text-base">Sell-Side Corporate Divestiture</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Maximizing institutional valuation through controlled auction dynamics, data room preparation, and bidder qualification.</p>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> CIM & Financial Modeling</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Multi-Bidder Price Defense</li>
                </ul>
              </div>
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">03</div>
                <h3 className="font-bold text-white text-base">Cross-Border Regulatory Clearance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Navigating multi-jurisdictional anti-trust frameworks, CFIUS approvals, and FX risk mitigation for global deals.</p>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Regulatory Risk Audits</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Escrow & Cross-Border Settlement</li>
                </ul>
              </div>
            </>
          )}

          {activeTab === 'capital' && (
            <>
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">01</div>
                <h3 className="font-bold text-white text-base">Senior & Subordinated Debt</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Syndicated credit facilities, asset-backed loans, and mezzanine debt structuring with Tier-1 institutional lenders.</p>
              </div>
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">02</div>
                <h3 className="font-bold text-white text-base">Growth Equity & PIPE Financing</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Structuring private placements in public equity and structured growth equity rounds with sovereign and PE funds.</p>
              </div>
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">03</div>
                <h3 className="font-bold text-white text-base">Special Situation Capital</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Rescue financing, bridge facilities, and liquidity provisions during rapid market shifts or asset spin-offs.</p>
              </div>
            </>
          )}

          {activeTab === 'restructuring' && (
            <>
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">01</div>
                <h3 className="font-bold text-white text-base">Balance Sheet Optimization</h3>
                <p className="text-xs text-slate-400 leading-relaxed">De-leveraging frameworks, covenant waivers, maturity extension negotiations, and debt-for-equity swaps.</p>
              </div>
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">02</div>
                <h3 className="font-bold text-white text-base">Operational Turnaround</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Working capital recovery, unprofitable business unit carve-outs, and cash runway stabilization within 60 days.</p>
              </div>
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">03</div>
                <h3 className="font-bold text-white text-base">Fiduciary & Independent Board Support</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Solvency opinions, fairness opinions, and expert valuation testimony for major shareholder transactions.</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Track Record Showcase */}
      <section id="track-record" className="py-16 px-6 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400">Selected Tombstones</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Recent Landmark Transactions</h2>
            <p className="text-xs text-slate-400">Representative transactions closed across North America, Europe, and Asia-Pacific.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center space-y-2">
              <div className="text-xs text-blue-400 font-bold uppercase">Enterprise Cloud SaaS</div>
              <div className="text-xl font-black text-white">$450,000,000</div>
              <div className="text-[11px] text-slate-300 font-semibold">Strategic Sale to Global Tech Conglomerate</div>
              <div className="text-[10px] text-slate-500">Exclusive Financial Advisor</div>
            </div>
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center space-y-2">
              <div className="text-xs text-emerald-400 font-bold uppercase">CleanTech Infrastructure</div>
              <div className="text-xl font-black text-white">$820,000,000</div>
              <div className="text-[11px] text-slate-300 font-semibold">Syndicated Green Bond & Project Debt</div>
              <div className="text-[10px] text-slate-500">Lead Structuring Agent</div>
            </div>
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center space-y-2">
              <div className="text-xs text-purple-400 font-bold uppercase">MedTech Biopharma</div>
              <div className="text-xl font-black text-white">$210,000,000</div>
              <div className="text-[11px] text-slate-300 font-semibold">Cross-Border Cross-License & Equity Sale</div>
              <div className="text-[10px] text-slate-500">Sole M&A Counsel</div>
            </div>
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center space-y-2">
              <div className="text-xs text-amber-400 font-bold uppercase">Advanced Logistics</div>
              <div className="text-xl font-black text-white">$630,000,000</div>
              <div className="text-[11px] text-slate-300 font-semibold">Corporate Carve-out & Private Equity Buyout</div>
              <div className="text-[10px] text-slate-500">Financial Advisor to Board</div>
            </div>
          </div>
        </div>
      </section>

      {/* Boardroom Consultation Form */}
      <section id="contact" className="py-16 px-6 max-w-4xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-8">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400">Strictly Confidential</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Initiate a Boardroom Inquiry</h2>
            <p className="text-xs text-slate-400">Direct engagement with Managing Partners. All discussions are protected under standard bilateral NDA terms.</p>
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-blue-950/40 border border-blue-500/30 rounded-2xl space-y-3">
              <CheckCircle2 className="w-10 h-10 text-blue-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Mandate Request Received</h3>
              <p className="text-xs text-slate-300">A Senior Managing Director will review your parameters and respond within 4 business hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Executive Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Robert Sterling"
                    className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="r.sterling@enterprise.com"
                    className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Entity</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Apex Global Corp"
                    className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Deal Size / Capital Needed</label>
                  <select
                    value={formData.dealSize}
                    onChange={(e) => setFormData({ ...formData, dealSize: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option>$5M - $20M</option>
                    <option>$20M - $100M</option>
                    <option>$100M - $500M</option>
                    <option>$500M+</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request NDA & Schedule Advisory Call</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500 bg-slate-950">
        <p>© {new Date().getFullYear()} {bizName}. All rights reserved. Securities offered through regulated institutional affiliates.</p>
      </footer>
    </div>
  );
};

// ============================================================================
// 2. VANGUARD CONSULTING HUB (tpl-biz-2 / vanguard-consulting)
// Management Consulting, Operational Scaling & Margin Improvement
// ============================================================================
export const VanguardConsultingDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [teamSize, setTeamSize] = useState(50);
  const [revenue, setRevenue] = useState(10); // in millions
  const [submitted, setSubmitted] = useState(false);

  const estMarginIncrease = Math.round(revenue * 0.18 * 10) / 10;
  const estHoursSaved = teamSize * 14;

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-slate-900 text-slate-100 font-sans">
      {/* Top Bar */}
      <div className="bg-teal-950 border-b border-teal-800/60 px-6 py-2.5 text-xs text-teal-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span>Accepting Q3-Q4 Growth Acceleration Engagements</span>
        </div>
        <div className="text-teal-200 font-medium hidden sm:block">
          Average Client EBITDA Expansion: <strong className="text-white">+28.4% in 9 Months</strong>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-slate-900/95 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-teal-600/30">
            V
          </div>
          <div>
            <div className="font-extrabold text-base text-white">{bizName}</div>
            <div className="text-[10px] text-teal-400 font-mono">Management & Strategy Consulting</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#calculator" className="hover:text-teal-400 transition">ROI Impact Model</a>
          <a href="#framework" className="hover:text-teal-400 transition">4-Stage Sprint</a>
          <a href="#case-studies" className="hover:text-teal-400 transition">Case Studies</a>
        </div>

        <a
          href="#book-consult"
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-teal-600/30"
        >
          Book 30-Min Diagnostic
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-16 sm:py-20 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Operational Excellence & Executive Scaling</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Unlocking Sustainable Profit Margins Through Operational Re-Engineering.
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          We embed alongside executive leadership to eliminate workflow bottlenecks, modernize technology stacks, and convert operating friction into high-velocity revenue.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#calculator"
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-teal-600/30 transition flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            <span>Calculate Your Margin Upside</span>
          </a>
          <a
            href="#book-consult"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition"
          >
            Request Enterprise Diagnostic
          </a>
        </div>
      </header>

      {/* Interactive ROI Calculator Section */}
      <section id="calculator" className="py-12 px-6 max-w-4xl mx-auto">
        <div className="bg-slate-950 border border-teal-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs uppercase font-bold text-teal-400 tracking-wider">Interactive Assessment</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Estimate Potential Operational Yield</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Current Annual Revenue</span>
                  <span className="text-teal-400 font-bold text-sm">${revenue}M USD</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="100"
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Full-Time Headcount</span>
                  <span className="text-teal-400 font-bold text-sm">{teamSize} Employees</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-teal-950/50 p-6 rounded-2xl border border-teal-500/30 space-y-4">
              <div>
                <div className="text-xs text-teal-300 font-semibold uppercase">Estimated Annual Profit Lift</div>
                <div className="text-3xl sm:text-4xl font-black text-white">+${estMarginIncrease}M / yr</div>
                <div className="text-[11px] text-teal-400 mt-1">Based on historical 18% average operational margin recapture</div>
              </div>
              <div className="pt-3 border-t border-teal-800/60">
                <div className="text-xs text-slate-400">Monthly Team Capacity Reclaimed:</div>
                <div className="text-xl font-bold text-teal-300">{estHoursSaved.toLocaleString()} Hours / month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Stage Sprint Roadmap */}
      <section id="framework" className="py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Proven Methodology</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">The 90-Day Transformation Sprint</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">W1-2</div>
            <h3 className="font-bold text-white text-sm">Diagnostic Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Full operational stack, cost center mapping, and high-impact leak identification.</p>
          </div>
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">W3-5</div>
            <h3 className="font-bold text-white text-sm">Process Redesign</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Restructuring operational pipelines and implementing high-leverage software automation.</p>
          </div>
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">W6-9</div>
            <h3 className="font-bold text-white text-sm">Team Enablement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Cross-functional training, KPI dashboarding, and leadership accountability pods.</p>
          </div>
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">W10-12</div>
            <h3 className="font-bold text-white text-sm">Margin Harvest</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Measurement of EBITDA expansion, executive review, and long-term playbook handover.</p>
          </div>
        </div>
      </section>

      {/* Book Consult Section */}
      <section id="book-consult" className="py-16 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Book an Executive Growth Session</h2>
          <p className="text-xs text-slate-400">Directly review your current unit economics with our Senior Practice Directors.</p>
          
          {submitted ? (
            <div className="p-6 rounded-2xl bg-teal-950/60 border border-teal-500/30 text-teal-300 text-sm font-semibold">
              ✓ Consultation request confirmed. We will reach out within 2 hours with our executive schedule.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); if (onBookingSubmitted) onBookingSubmitted('Diagnostic session requested'); }} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Your Full Name & Title"
                className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <input
                type="email"
                required
                placeholder="Work Email"
                className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/30 transition cursor-pointer"
              >
                Schedule Free Diagnostic Session
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-900">
        © {new Date().getFullYear()} {bizName}. Transforming operational complexity into margin dominance.
      </footer>
    </div>
  );
};

// ============================================================================
// 3. SYNERGY CREATIVE AGENCY (tpl-biz-3 / synergy-agency)
// High-Impact Digital Brand, UI/UX & Web Development Agency
// ============================================================================
export const SynergyAgencyDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [filter, setFilter] = useState<'all' | 'branding' | 'digital' | '3d'>('all');
  const [submitted, setSubmitted] = useState(false);

  const projects = [
    { title: 'Aetheria Fintech Ecosystem', cat: 'digital', tags: ['UI/UX', 'Next.js', 'Fintech'], img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80' },
    { title: 'Volta Hyper-Electric Supercar', cat: '3d', tags: ['3D WebGL', 'Brand Identity'], img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80' },
    { title: 'Oasis Spatial Audio Experience', cat: 'branding', tags: ['Sound Design', 'Brand Story'], img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80' },
    { title: 'Kroma Sustainable Skincare', cat: 'branding', tags: ['Packaging', 'E-commerce'], img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80' },
  ];

  const filtered = filter === 'all' ? projects : projects.filter(p => p.cat === filter);
  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#09090b] text-white font-sans selection:bg-indigo-600 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center font-black text-white text-xs">
            S
          </div>
          <span className="font-extrabold text-base tracking-tighter">{bizName}</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <a href="#work" className="hover:text-white transition">Showcase</a>
          <a href="#services" className="hover:text-white transition">Capabilities</a>
          <a href="#pricing" className="hover:text-white transition">Retainers</a>
        </div>

        <a
          href="#contact"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-600/30"
        >
          Start a Project
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 sm:py-28 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Award-Winning Brand & Product Studio</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-400 bg-clip-text text-transparent">
          We Build Iconic Digital Brands That Dominate Markets.
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Crafting unforgettable digital identities, high-conversion web applications, and immersive 3D interactive experiences for world-class founders.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#work"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-xl shadow-indigo-600/40 transition"
          >
            Explore Selected Work
          </a>
          <a
            href="#pricing"
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition"
          >
            View Pricing Tiers
          </a>
        </div>
      </header>

      {/* Filterable Portfolio */}
      <section id="work" className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <span className="text-xs uppercase font-bold text-indigo-400">Featured Work</span>
            <h2 className="text-2xl sm:text-3xl font-black">Case Studies & Launches</h2>
          </div>
          <div className="flex gap-2">
            {(['all', 'branding', 'digital', '3d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  filter === t ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filtered.map((item, idx) => (
            <div key={idx} className="group bg-zinc-900/60 rounded-2xl border border-zinc-800 overflow-hidden hover:border-indigo-500/50 transition">
              <div className="h-60 overflow-hidden relative">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex gap-1">
                  {item.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="bg-black/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-zinc-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <h3 className="font-bold text-base text-white">{item.title}</h3>
                <span className="text-indigo-400 text-xs font-semibold group-hover:translate-x-1 transition-transform">View →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Retainers */}
      <section id="pricing" className="py-16 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold text-indigo-400">Transparent Collaboration</span>
            <h2 className="text-2xl sm:text-3xl font-black">Agency Sprint Packages</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
              <h3 className="font-bold text-lg text-white">Brand Identity Sprint</h3>
              <div className="text-3xl font-black text-white">$4,500 <span className="text-xs text-zinc-500 font-normal">/ one-time</span></div>
              <p className="text-xs text-zinc-400">Full visual system, typography, vector logo suite, color strategy, and brand guideline book in 10 days.</p>
              <ul className="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li>✓ 3 Creative Concepts</li>
                <li>✓ Figma Brand Kit</li>
                <li>✓ Social Media Assets</li>
              </ul>
            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-indigo-500 shadow-xl shadow-indigo-950 space-y-4 relative">
              <span className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">POPULAR</span>
              <h3 className="font-bold text-lg text-white">Full-Stack Web Launch</h3>
              <div className="text-3xl font-black text-white">$8,500 <span className="text-xs text-zinc-500 font-normal">/ one-time</span></div>
              <p className="text-xs text-zinc-400">High-converting bespoke UI/UX, responsive React/Next.js frontend, CMS integration, and SEO optimization.</p>
              <ul className="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li>✓ Custom Interactions & Animations</li>
                <li>✓ Speed Optimized (under 0.6s)</li>
                <li>✓ Dedicated Senior Engineer</li>
              </ul>
            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
              <h3 className="font-bold text-lg text-white">Monthly Creative Retainer</h3>
              <div className="text-3xl font-black text-white">$5,000 <span className="text-xs text-zinc-500 font-normal">/ month</span></div>
              <p className="text-xs text-zinc-400">Continuous design & frontend execution for rapid-growth teams. Pause or cancel anytime.</p>
              <ul className="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-800">
                <li>✓ Unlimited Design Requests</li>
                <li>✓ 48-Hour Turnaround</li>
                <li>✓ Async Slack Channel</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Project Pitch */}
      <section id="contact" className="py-16 px-6 max-w-xl mx-auto text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black">Ready to build something unforgettable?</h2>
        <p className="text-xs text-zinc-400">Tell us about your timeline and vision. We will return a customized project scope within 24 hours.</p>

        {submitted ? (
          <div className="p-6 bg-indigo-950/60 border border-indigo-500/40 rounded-2xl text-indigo-300 text-sm font-bold">
            ⚡ Pitch received! Our creative director will review and send a Calendly link shortly.
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); if (onBookingSubmitted) onBookingSubmitted('Creative project inquiry sent'); }} className="space-y-3 text-left">
            <input type="text" required placeholder="Your Name" className="w-full text-xs p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="email" required placeholder="Your Email" className="w-full text-xs p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <textarea rows={3} required placeholder="Brief description of your project and timeline..." className="w-full text-xs p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer">
              Send Project Brief →
            </button>
          </form>
        )}
      </section>

      <footer className="py-6 text-center text-xs text-zinc-600 border-t border-zinc-900">
        © {new Date().getFullYear()} {bizName}. Impeccable digital craftsmanship.
      </footer>
    </div>
  );
};
