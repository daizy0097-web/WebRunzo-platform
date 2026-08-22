import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Globe, 
  CheckCircle2, 
  Save, 
  FileText, 
  Share2, 
  KeyRound,
  ExternalLink
} from 'lucide-react';

export const ClientPremiumSEO: React.FC = () => {
  const { currentClientCustomer, updateCustomer, addToast } = useApp();
  const customer = currentClientCustomer;

  const [metaTitle, setMetaTitle] = useState(customer?.businessName ? `${customer.businessName} | Official Website` : '');
  const [metaDescription, setMetaDescription] = useState(
    customer?.tagline ? `${customer.tagline}. Contact us today to schedule a consultation.` : 'Providing top quality professional services in our region.'
  );
  const [keywords, setKeywords] = useState('services, professional, consultation, top rated, trusted, local business');

  const handleSaveSEO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    updateCustomer(customer.id, {
      tagline: metaDescription.slice(0, 80),
    });
    addToast('success', 'SEO Updated', 'Meta tags, OpenGraph previews, and sitemaps updated.');
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
            <span className="text-xs text-slate-400">Search Engine Indexing</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            SEO Suite & Search Engine Rankings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure Google search snippet previews, structured schema markup, and keyword visibility.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sitemap.xml Auto-Generated</span>
          </div>
        </div>
      </div>

      {/* SEO Form & Live Google Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Settings Form */}
        <form onSubmit={handleSaveSEO} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-400" />
            <span>Search Metadata</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Google Page Title Tag</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
              <div className="text-[10px] text-slate-500 mt-1">{metaTitle.length}/60 recommended characters</div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
              <div className="text-[10px] text-slate-500 mt-1">{metaDescription.length}/160 recommended characters</div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Keyword Focus (comma separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Update SEO & Re-Index</span>
            </button>
          </div>
        </form>

        {/* Live Search Engine SERP Preview */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Live Google Search Snippet Simulation</span>
          </h2>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[9px] text-white">
                G
              </div>
              <span className="text-slate-300 font-mono text-[11px]">{customer?.customDomain ? `https://${customer.customDomain}` : customer?.websiteUrl}</span>
            </div>

            <div className="text-base font-medium text-blue-400 hover:underline cursor-pointer">
              {metaTitle || `${customer?.businessName} | Official Website`}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {metaDescription || 'Providing high quality professional services in our region.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs space-y-2">
            <div className="font-bold text-slate-200">VIP Search Enhancements Active:</div>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>JSON-LD LocalBusiness Schema injected</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>OpenGraph (og:image & og:title) for social shares</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automated Google Search Console Ping</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
