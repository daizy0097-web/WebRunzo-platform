import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  Search, 
  Headphones, 
  Layers, 
  Sparkles,
  Clock,
  TrendingUp
} from 'lucide-react';

export const WhyWebRunzo: React.FC = () => {
  const benefits = [
    {
      icon: Clock,
      title: 'Fast Turnaround',
      description: 'Go from concept to live website in 7–8 business days (or 2–3 days expedited for Business VIP) without months of agency delays.',
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Technical Headaches',
      description: 'We manage everything under one roof: cloud hosting, DNS, SSL certificates, automated daily backups, and security patches.',
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    },
    {
      icon: Smartphone,
      title: '100% Mobile & Touch Optimized',
      description: 'Engineered with responsive precision so your business looks immaculate on iPhones, Androids, tablets, and 4K displays.',
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    },
    {
      icon: Search,
      title: 'Built-in Local SEO & Google Speed',
      description: 'Clean semantic code and 95+ PageSpeed optimizations ensure your website ranks high on Google local search results.',
      color: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    },
    {
      icon: Layers,
      title: 'Dedicated Client Portal',
      description: 'Easily update your headlines, business hours, contact numbers, and images with live instant preview reflection.',
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    },
    {
      icon: Headphones,
      title: 'Human WhatsApp & Email Support',
      description: 'Direct access to your dedicated WebRunzo website specialist for ongoing tweaks, questions, and feature expansions.',
      color: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    },
  ];

  return (
    <section id="why-webrunzo" className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Why WebRunzo
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Modern Way to Build & Manage Your Business Website
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Traditional web agencies are slow and expensive. DIY page builders are frustrating. WebRunzo delivers the perfect sweet spot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-900 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 transition transform group-hover:scale-110 ${b.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{b.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{b.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
