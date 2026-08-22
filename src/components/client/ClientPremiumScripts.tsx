import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Code, 
  Sparkles, 
  CheckCircle2, 
  Save, 
  Plus, 
  Trash2, 
  FileCode, 
  ShieldCheck 
} from 'lucide-react';

export const ClientPremiumScripts: React.FC = () => {
  const { currentClientCustomer, addToast } = useApp();
  const customer = currentClientCustomer;

  const [ga4Id, setGa4Id] = useState('G-WEBRUNZO789');
  const [metaPixelId, setMetaPixelId] = useState('89234892384923');
  const [customHeadScript, setCustomHeadScript] = useState('<!-- Custom Live Chat or Analytics Header Script -->');
  const [customBodyScript, setCustomBodyScript] = useState('');

  const handleSaveScripts = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Scripts Injected', 'Custom tracking tags, GA4, and Meta Pixel scripts deployed to your website.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 p-6 rounded-3xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              VIP PREMIUM FEATURE
            </span>
            <span className="text-xs text-slate-400">Custom Code & Tracking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Tag Manager & Custom Scripts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inject Google Analytics 4, Meta Pixel, Hotjar, TikTok Ads tags, and custom header code securely.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CSP Sanitized & Safe</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveScripts} className="space-y-6 text-xs">
        
        {/* Quick Integrations */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Code className="w-4 h-4 text-amber-400" />
            <span>Quick Analytics Integrations</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Google Analytics 4 Measurement ID</label>
              <input
                type="text"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
              />
              <div className="text-[10px] text-slate-500 mt-1">Automatically tracks page views, outbound clicks, and lead form submissions.</div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Meta (Facebook) Pixel ID</label>
              <input
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="e.g. 123456789012345"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-blue-400 focus:outline-none focus:border-amber-500"
              />
              <div className="text-[10px] text-slate-500 mt-1">Enables conversion tracking and retargeting ads.</div>
            </div>
          </div>
        </div>

        {/* Custom Code Boxes */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>Custom &lt;head&gt; / &lt;body&gt; Injections</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Header Script (&lt;head&gt;)</label>
              <textarea
                rows={4}
                value={customHeadScript}
                onChange={(e) => setCustomHeadScript(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-300 focus:outline-none focus:border-amber-500 text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Footer Script (&lt;/body&gt;)</label>
              <textarea
                rows={3}
                value={customBodyScript}
                onChange={(e) => setCustomBodyScript(e.target.value)}
                placeholder="<!-- Scripts to execute at the end of the body -->"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-300 focus:outline-none focus:border-amber-500 text-[11px]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Deploy Custom Scripts to Live Site</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
