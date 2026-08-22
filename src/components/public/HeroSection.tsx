import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Layout,
  Play
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { openEnquiryModal, openPreviewModal, templates } = useApp();

  const scrollToTemplates = () => {
    const el = document.getElementById('templates');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-800/80">
      {/* Subtle Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-40 right-1/4 w-[400px] h-[300px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Turnkey Website Solutions & Infrastructure</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            High-Performance Websites, Built & Launched in <span className="text-indigo-400 underline decoration-indigo-500/50 decoration-wavy decoration-2">Days</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            No complex builders, no agency markups, and no technical headaches. WebRunzo provides curated industry templates, custom managed engineering, lightning-fast hosting, and ongoing updates so you can focus on growing your business.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-btn-explore-templates"
              onClick={scrollToTemplates}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layout className="w-4 h-4" />
              <span>Explore All Templates</span>
            </button>

            <button
              id="hero-btn-get-started"
              onClick={() => openEnquiryModal()}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700/80 font-bold text-sm px-7 py-3.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </button>
          </div>

          {/* Trust Value Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-300 border-t border-slate-800 mt-10">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>7 - 8 Day Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Free SSL & Hosting</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>99.9% Uptime Guarantee</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Full Content Portal</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Showcase Mockup */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-slate-900 p-2 sm:p-3 shadow-2xl border border-slate-800 overflow-hidden relative group">
          <div className="bg-slate-800/90 rounded-xl px-4 py-2 flex items-center justify-between border-b border-slate-700/60 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              </div>
              <span className="text-[11px] font-mono text-slate-300 ml-2">https://preview.webrunzo.app/marketplace</span>
            </div>
            <button
              onClick={() => openPreviewModal(templates[0])}
              className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 font-semibold"
            >
              <Play className="w-3 h-3 fill-indigo-400" />
              <span>Launch Interactive Preview</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2 bg-slate-950 rounded-lg">
            {templates.slice(0, 3).map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => openPreviewModal(tpl)}
                className="cursor-pointer bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-indigo-500 transition group/card"
              >
                <div className="h-36 overflow-hidden relative">
                  <img
                    src={tpl.previewImage}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {tpl.category}
                  </span>
                </div>
                <div className="p-3">
                  <div className="text-white text-xs font-bold truncate">{tpl.name}</div>
                  <div className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{tpl.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
