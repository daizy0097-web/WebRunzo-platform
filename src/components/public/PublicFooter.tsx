import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ShieldCheck, Mail, Phone, MapPin, Globe } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { settings, loginAsClient, openConciergeModal, setPublicPage } = useApp();

  const scrollTo = (id: string) => {
    setPublicPage('home');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg">
                W
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Web<span className="text-indigo-400">Runzo</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {settings.brandTagline}. We engineer modern, high-converting digital platforms for businesses, restaurants, medical practices, gyms, and luxury real estate.
            </p>

            <div className="pt-2 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{settings.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>{settings.supportPhone} (Hotline)</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Global Edge Delivery • Cloud Infrastructure</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <div className="font-bold text-white uppercase text-[11px] tracking-wider">Navigation</div>
            <ul className="space-y-2">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition">Home</button></li>
              <li><button onClick={() => scrollTo('why-webrunzo')} className="hover:text-white transition">Why WebRunzo</button></li>
              <li><button onClick={() => scrollTo('services')} className="hover:text-white transition">Services</button></li>
              <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition">How It Works</button></li>
              <li><button onClick={() => scrollTo('pricing')} className="hover:text-white transition">Pricing Plans</button></li>
              <li><button onClick={() => scrollTo('about')} className="hover:text-white transition">About Us</button></li>
              <li><button onClick={() => scrollTo('faq')} className="hover:text-white transition">FAQ</button></li>
            </ul>
          </div>

          {/* Col 3: Templates */}
          <div className="space-y-3">
            <div className="font-bold text-white uppercase text-[11px] tracking-wider">Top Niches</div>
            <ul className="space-y-2">
              <li><button onClick={() => scrollTo('templates')} className="hover:text-white transition">Corporate & Business</button></li>
              <li><button onClick={() => scrollTo('templates')} className="hover:text-white transition">Restaurants & Bars</button></li>
              <li><button onClick={() => scrollTo('templates')} className="hover:text-white transition">Gyms & Athletics</button></li>
              <li><button onClick={() => scrollTo('templates')} className="hover:text-white transition">Salons & Luxury Spas</button></li>
              <li><button onClick={() => scrollTo('templates')} className="hover:text-white transition">Real Estate & Estates</button></li>
              <li><button onClick={() => scrollTo('templates')} className="hover:text-white transition">E-commerce Stores</button></li>
              <li><button onClick={() => scrollTo('templates')} className="hover:text-white transition">Personal Brands & Coaches</button></li>
            </ul>
          </div>

          {/* Col 4: Portals & Legal */}
          <div className="space-y-3">
            <div className="font-bold text-white uppercase text-[11px] tracking-wider">Client Portal & Legal</div>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => loginAsClient()} 
                  className="text-amber-400 hover:text-amber-300 font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Client Dashboard Login →</span>
                </button>
              </li>
              <li>
                <button 
                  id="btn-footer-support-concierge"
                  onClick={() => openConciergeModal()} 
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Support & Concierge Desk</span>
                </button>
              </li>
              <li className="pt-2">
                <button
                  id="btn-footer-privacy-policy"
                  onClick={() => {
                    setPublicPage('privacy');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-white transition text-[11px] cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-terms-of-service"
                  onClick={() => {
                    setPublicPage('terms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-white transition text-[11px] cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-sla"
                  onClick={() => {
                    setPublicPage('sla');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-white transition text-[11px] cursor-pointer text-left"
                >
                  Service Level Agreement (SLA)
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} WebRunzo Digital Systems Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by WebRunzo Platform Engine</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">System Status: All Systems Operational (99.99%)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
