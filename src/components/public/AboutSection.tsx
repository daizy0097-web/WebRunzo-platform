import React from 'react';
import { 
  Building2, 
  Users, 
  Award, 
  ShieldCheck, 
  Globe2, 
  Sparkles,
  HeartHandshake
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-slate-950 border-t border-slate-800/80 text-white relative overflow-hidden">
      {/* Glow */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Story & Mission */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About WebRunzo</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Democratizing World-Class Digital Presence for Every Growing Business
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              WebRunzo was founded on a simple observation: small and medium businesses shouldn't have to choose between clunky $20/mo DIY page builders that take dozens of hours to configure, or $8,000+ agency contracts filled with unnecessary delays.
            </p>

            <p className="text-sm text-slate-400 leading-relaxed">
              We engineered a turnkey infrastructure that delivers custom-engineered web design, ultra-fast hosting, SSL security, and ongoing updates in one seamless, transparent package. Today, WebRunzo powers websites across healthcare, gastronomy, fitness, real estate, professional services, and e-commerce.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">500+</div>
                <div className="text-xs text-slate-400 mt-1">Websites Launched</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">99.9%</div>
                <div className="text-xs text-slate-400 mt-1">Uptime SLA</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">3.2 Days</div>
                <div className="text-xs text-slate-400 mt-1">Avg Launch Time</div>
              </div>
            </div>
          </div>

          {/* Right Column: Core Values Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur space-y-2 hover:border-slate-700 transition">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Honest, Predictable Pricing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No hidden hourly bills or hostage domains. Everything is bundled into transparent packages.
              </p>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur space-y-2 hover:border-slate-700 transition">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Zero Maintenance Burden</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We handle code updates, SSL certificates, and security patches 24/7 so you never get hacked or go offline.
              </p>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur space-y-2 hover:border-slate-700 transition">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Global Edge Infrastructure</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hosted across global NVMe cloud clusters for sub-second page loads anywhere in the world.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
