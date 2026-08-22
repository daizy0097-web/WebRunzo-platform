import React from 'react';
import { 
  Palette, 
  Server, 
  RefreshCw, 
  TrendingUp, 
  ShoppingCart, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ServicesSection: React.FC = () => {
  const { openEnquiryModal } = useApp();

  const services = [
    {
      icon: Palette,
      title: 'Custom Website Design & Build',
      description: 'Bespoke, conversion-focused design based on curated high-performance industry templates tailored to your brand identity.',
      badge: 'Turnkey',
    },
    {
      icon: Server,
      title: 'Managed High-Speed Cloud Hosting',
      description: 'Ultra-fast global edge hosting with NVMe SSD servers, free SSL certificate, and 99.9% uptime SLA included with every plan.',
      badge: 'Included',
    },
    {
      icon: RefreshCw,
      title: 'Ongoing Maintenance & Revisions',
      description: 'Never worry about outdated content, broken plugins, or security vulnerabilities. We keep your digital infrastructure pristine.',
      badge: 'Managed',
    },
    {
      icon: TrendingUp,
      title: 'Search Engine Optimization (SEO)',
      description: 'Complete on-page SEO, Google Business Profile schema markup, automated XML sitemaps, and indexing for local visibility.',
      badge: 'Growth',
    },
    {
      icon: ShoppingCart,
      title: 'Booking, Leads & E-commerce Integrations',
      description: 'Seamless integration with Stripe payments, Calendly scheduling, OpenTable, contact forms, and WhatsApp live chat.',
      badge: 'Interactive',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Security & Daily Backups',
      description: 'Automated daily cloud backups with one-click restore points, DDoS mitigation, and continuous malware monitoring.',
      badge: 'Protection',
    },
  ];

  return (
    <section id="services" className="py-20 bg-slate-900/50 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Professional Services
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Full-Stack Digital Solutions for Growing Businesses
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              We handle every layer of your website lifecycle so you never have to hire freelance developers or manage servers again.
            </p>
          </div>

          <button
            onClick={() => openEnquiryModal()}
            className="self-start md:self-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
          >
            <span>Request Custom Service</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900 p-7 rounded-2xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{s.description}</p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800 flex items-center text-xs font-semibold text-indigo-400">
                  <span>Included in WebRunzo Packages</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
