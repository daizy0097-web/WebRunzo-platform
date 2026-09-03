import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Globe, 
  Eye, 
  Save, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Edit3, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Server,
  Lock,
  Smartphone,
  Tablet,
  Monitor,
  HardDrive,
  Cpu,
  Terminal,
  Wifi,
  Radio,
  Check,
  AlertCircle
} from 'lucide-react';
import { LiveWebsitePreviewFrame } from '../common/LiveWebsitePreviewFrame';
import { ClientBackupSection } from './ClientBackupSection';
import { Template } from '../../types';

export const ClientWebsite: React.FC = () => {
  const { 
    activeCustomer, 
    currentClientCustomer,
    templates, 
    updateCustomer, 
    openPreviewModal,
    setClientTab,
    openConciergeModal,
    showToast,
    backups
  } = useApp();

  const customer = currentClientCustomer || activeCustomer;

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-400">
        Customer website profile not found.
      </div>
    );
  }

  const currentTemplate = templates.find((t) => t.id === customer.templateId);

  // Content Editor States
  const [headline, setHeadline] = useState(customer.customContent?.headline || '');
  const [tagline, setTagline] = useState(customer.customContent?.tagline || '');
  const [contactEmail, setContactEmail] = useState(customer.customContent?.contactEmail || customer.email);
  const [contactPhone, setContactPhone] = useState(customer.customContent?.contactPhone || customer.phone);
  const [address, setAddress] = useState(customer.customContent?.address || '100 Innovation Blvd, Suite 400');
  
  // Migration Template Modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Deployment Simulator
  const [isRedeploying, setIsRedeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string>('');
  const [dnsStatus, setDnsStatus] = useState<'verified' | 'verifying' | 'idle'>('verified');

  const deployment = customer.deployment || {
    id: `dep_${customer.id}`,
    status: 'ready',
    environment: 'production',
    framework: 'React / Vite SSR',
    edgeLocation: 'iad1 (US East / Global Anycast)',
    lastDeployedAt: 'Just now',
    buildDurationSeconds: 18,
    commitMessage: 'Automated CI/CD build sync',
    sslStatus: 'active',
    cdnStatus: 'active',
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer(customer.id, {
      customContent: {
        headline,
        tagline,
        contactEmail,
        contactPhone,
        address,
      },
    });
    showToast('Your website content updates have been saved and applied to your live preview!', 'success');
  };

  const handleSwitchTemplate = (newTemplateId: string) => {
    updateCustomer(customer.id, {
      templateId: newTemplateId,
    });
    setShowTemplateModal(false);
    showToast('Template switched! Your preview is now rendering the new design layout.', 'success');
  };

  const handleTriggerRedeploy = () => {
    setIsRedeploying(true);
    setDeployStep('Compiling Edge artifacts & optimizing WebP assets...');

    setTimeout(() => {
      setDeployStep('Purging Cloudflare Edge CDN cache (280+ POPs)...');
    }, 1000);

    setTimeout(() => {
      setDeployStep('Synchronizing DNS TLS 1.3 certificates...');
    }, 2000);

    setTimeout(() => {
      setIsRedeploying(false);
      setDeployStep('');
      showToast('Live Edge CDN cache purged and website redeployed successfully in 2.8s!', 'success');
    }, 3000);
  };

  const handleVerifyDns = () => {
    setDnsStatus('verifying');
    setTimeout(() => {
      setDnsStatus('verified');
      showToast('Cloudflare DNS propagation check completed: All records resolving with 100% health!', 'success');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 backdrop-blur shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3 h-3" /> Live Production Instance
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs font-mono">{customer.websiteUrl}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Website Configuration & Edge Deployment
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Manage your live domain content, monitor isolated edge deployment pipelines, inspect DNS routing, and test responsive layouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Switch Master Template</span>
          </button>

          <a
            href={`https://${customer.websiteUrl}`}
            target="_blank"
            rel="noreferrer"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Visit Live Domain</span>
          </a>
        </div>
      </div>

      {/* Deployment & Infrastructure Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Edge Status */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Vercel & Cloudflare Edge</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Live in {deployment.edgeLocation.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* SSL Certificate */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">SSL / TLS 1.3 Encryption</div>
            <div className="text-[10px] text-sky-400">Active & Auto-Renewing</div>
          </div>
        </div>

        {/* Storage Quota Quickview */}
        <div 
          onClick={() => setClientTab('storage')} 
          className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 cursor-pointer hover:border-slate-700 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Cloud Storage</div>
            <div className="text-[10px] text-purple-300">
              {customer.storage?.usedGB || 1.2} GB of {customer.storage?.totalUsableLimitGB || 5} GB used →
            </div>
          </div>
        </div>

        {/* Backups & Disaster Recovery Quickview */}
        <a 
          href="#section-client-backups"
          className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 hover:border-indigo-500/50 hover:bg-slate-850 transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Cloud Backups</span>
              <span className="text-[10px] text-emerald-400 font-mono">● Active</span>
            </div>
            <div className="text-[10px] text-indigo-300">
              {backups.filter((b) => b.customerId === customer.id).length} Snapshots Secured • View Ledger ↓
            </div>
          </div>
        </a>

      </div>

      {/* Isolated Deployment Control Center */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Edge Deployment Pipeline
            </div>
            <h3 className="font-extrabold text-base text-white mt-0.5">
              Production Build & Edge Cache Management
            </h3>
          </div>

          <button
            onClick={handleTriggerRedeploy}
            disabled={isRedeploying}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRedeploying ? 'animate-spin' : ''}`} />
            <span>{isRedeploying ? 'Purging & Redeploying...' : 'Purge CDN Cache & Redeploy'}</span>
          </button>
        </div>

        {isRedeploying && (
          <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/40 text-xs font-mono text-indigo-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span>CI/CD Edge Worker in progress...</span>
            </div>
            <div className="text-[11px] text-slate-400">{deployStep}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">Active Template</div>
            <div className="font-bold text-white truncate">{currentTemplate?.name || 'Default Business'}</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">Last Edge Sync</div>
            <div className="font-bold text-emerald-400 font-mono">{deployment.lastDeployedAt}</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">Anycast POP</div>
            <div className="font-bold text-white font-mono">{deployment.edgeLocation}</div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">Build Runtime</div>
            <div className="font-bold text-white font-mono">{deployment.buildDurationSeconds}s (Instant Coldstart)</div>
          </div>
        </div>

      </div>

      {/* Cloudflare DNS & Custom Domain Records Card */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>Custom Domain DNS Routing & Cloudflare Proxies</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verified records routing public traffic securely to your isolated WebRunzo tenant.
            </p>
          </div>

          <button
            onClick={handleVerifyDns}
            disabled={dnsStatus === 'verifying'}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
          >
            {dnsStatus === 'verifying' ? (
              <>
                <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Checking Propagation...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Re-verify DNS Propagation</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Host / Name</th>
                <th className="py-2.5 px-3">Target Value</th>
                <th className="py-2.5 px-3">Proxy Status</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-bold text-amber-400">A Record</td>
                <td className="py-2.5 px-3">@</td>
                <td className="py-2.5 px-3 text-white">76.76.21.21</td>
                <td className="py-2.5 px-3 text-emerald-400">Proxied (Cloudflare)</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">✓ Active</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-400">CNAME</td>
                <td className="py-2.5 px-3">www</td>
                <td className="py-2.5 px-3 text-white">cname.webrunzo.app</td>
                <td className="py-2.5 px-3 text-emerald-400">Proxied (Cloudflare)</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">✓ Active</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dedicated Client Backups & Disaster Recovery Ledger */}
      <ClientBackupSection customer={customer} />

      {/* Main Grid: Live Preview & Content Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Live Preview Frame */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-sm text-white">Interactive Website Simulation</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{customer.websiteUrl}</span>
            </div>

            <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
              <LiveWebsitePreviewFrame customer={customer} template={currentTemplate} initialDevice="desktop" />
            </div>
          </div>
        </div>

        {/* Right Column: Instant Content Editor */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>Instant Content Editor</span>
              </h3>
              <span className="text-[10px] text-slate-400">Live reflection</span>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Main Website Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={currentTemplate?.name || 'Your Company Headline'}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tagline & Subtitle</label>
                <textarea
                  rows={2}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={currentTemplate?.description || 'Your service description'}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Phone Hotline</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Physical Business Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Update My Website</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Switch Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl p-6 text-white space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg">Switch Your Website Template Architecture</h3>
                <p className="text-xs text-slate-400">Select any template from the WebRunzo gallery to migrate your website layout.</p>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {templates.map((tpl) => {
                const isCurrent = tpl.id === customer.templateId;
                return (
                  <div
                    key={tpl.id}
                    className={`rounded-2xl border p-3 flex flex-col justify-between space-y-3 transition ${
                      isCurrent ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <img src={tpl.previewImage} alt={tpl.name} className="w-full h-28 object-cover rounded-xl mb-2" />
                      <div className="font-bold text-xs text-white">{tpl.name}</div>
                      <div className="text-[10px] text-slate-400">{tpl.category}</div>
                    </div>

                    <button
                      onClick={() => handleSwitchTemplate(tpl.id)}
                      disabled={isCurrent}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                        isCurrent
                          ? 'bg-emerald-600/30 text-emerald-400 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                      }`}
                    >
                      {isCurrent ? 'Currently Applied' : 'Apply This Template'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
