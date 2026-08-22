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
  Monitor
} from 'lucide-react';
import { LiveWebsitePreviewFrame } from '../common/LiveWebsitePreviewFrame';
import { Template } from '../../types';

export const ClientWebsite: React.FC = () => {
  const { 
    activeCustomer, 
    templates, 
    updateCustomer, 
    openPreviewModal, 
    showToast 
  } = useApp();

  if (!activeCustomer) return null;

  const currentTemplate = templates.find((t) => t.id === activeCustomer.templateId);

  // Content Editor States
  const [headline, setHeadline] = useState(activeCustomer.customContent?.headline || '');
  const [tagline, setTagline] = useState(activeCustomer.customContent?.tagline || '');
  const [contactEmail, setContactEmail] = useState(activeCustomer.customContent?.contactEmail || activeCustomer.email);
  const [contactPhone, setContactPhone] = useState(activeCustomer.customContent?.contactPhone || activeCustomer.phone);
  const [address, setAddress] = useState(activeCustomer.customContent?.address || '100 Innovation Blvd, Suite 400');
  
  // Migration Template Modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer(activeCustomer.id, {
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
    updateCustomer(activeCustomer.id, {
      templateId: newTemplateId,
    });
    setShowTemplateModal(false);
    showToast('Template switched! Your preview is now rendering the new design layout.', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Website Configuration & Live Content
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your live domain content, view interactive device previews, and request design revisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Switch Template</span>
          </button>

          <a
            href={`https://${activeCustomer.websiteUrl}`}
            target="_blank"
            rel="noreferrer"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Visit Live Domain</span>
          </a>
        </div>
      </div>

      {/* Domain & Infrastructure Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">SSL 256-Bit Certificate</div>
            <div className="text-[10px] text-emerald-400">Active & Auto-Renewing</div>
          </div>
        </div>

        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">NVMe Global Edge Hosting</div>
            <div className="text-[10px] text-sky-400">99.9% SLA Operational</div>
          </div>
        </div>

        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Automated Daily Backups</div>
            <div className="text-[10px] text-indigo-300">Protected snapshot synced</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Preview & Content Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Live Preview Frame */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950/90 p-4 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-sm text-white">Interactive Website Simulation</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{activeCustomer.websiteUrl}</span>
            </div>

            <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
              <LiveWebsitePreviewFrame customer={activeCustomer} template={currentTemplate} initialDevice="desktop" />
            </div>
          </div>
        </div>

        {/* Right Column: Instant Content Editor */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950/90 p-6 rounded-3xl border border-slate-800 space-y-4">
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
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tagline & Subtitle</label>
                <textarea
                  rows={2}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={currentTemplate?.description || 'Your service description'}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Phone Hotline</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Physical Business Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-indigo-500"
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
                const isCurrent = tpl.id === activeCustomer.templateId;
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
