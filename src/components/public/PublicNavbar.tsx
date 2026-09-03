import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Menu, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Layers,
  ChevronRight,
  LifeBuoy
} from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const { 
    setCurrentExperience, 
    setPublicPage,
    openEnquiryModal,
    openConciergeModal,
    session 
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateToHome = () => {
    setPublicPage('home');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    setPublicPage('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <nav className="bg-slate-950/85 backdrop-blur-md sticky top-[41px] z-40 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo - Sleek Minimalist Aesthetic */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={navigateToHome}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm sm:text-base tracking-tighter transition-transform group-hover:scale-105 shadow-sm">
              W
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight leading-none">
                Web<span className="text-indigo-400 font-semibold">Runzo</span>
              </span>
              <span className="hidden sm:block text-[9px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">Turnkey Websites</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <button onClick={navigateToHome} className="hover:text-indigo-400 transition cursor-pointer">
              Home
            </button>
            <button onClick={() => scrollToSection('why-webrunzo')} className="hover:text-indigo-400 transition">
              Why Us
            </button>
            <button onClick={() => scrollToSection('services')} className="hover:text-indigo-400 transition">
              Services
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-indigo-400 transition">
              How It Works
            </button>
            <button onClick={() => scrollToSection('templates')} className="hover:text-indigo-400 transition flex items-center gap-1">
              <span>Templates</span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded-full">20</span>
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-indigo-400 transition">
              Pricing
            </button>
            <button onClick={() => scrollToSection('about')} className="hover:text-indigo-400 transition">
              About
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-indigo-400 transition">
              FAQ
            </button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-indigo-400 transition">
              Contact
            </button>
          </div>

          {/* Right Action CTA & Portal Links */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setCurrentExperience('client')}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 border border-slate-800 transition cursor-pointer"
            >
              Client Login
            </button>
            
            <button
              id="btn-nav-get-started"
              onClick={() => openEnquiryModal()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => openEnquiryModal()}
              className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 p-2 rounded-lg hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-6 py-5 space-y-4 text-sm font-semibold text-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <button onClick={() => scrollToSection('why-webrunzo')} className="block w-full text-left py-2 hover:text-indigo-400">
            Why WebRunzo
          </button>
          <button onClick={() => scrollToSection('services')} className="block w-full text-left py-2 hover:text-indigo-400">
            Services
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 hover:text-indigo-400">
            How It Works
          </button>
          <button onClick={() => scrollToSection('templates')} className="block w-full text-left py-2 hover:text-indigo-400 flex items-center justify-between">
            <span>Template Gallery</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">20 Demo Templates</span>
          </button>
          <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2 hover:text-indigo-400">
            Pricing Plans
          </button>
          <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 hover:text-indigo-400">
            About WebRunzo
          </button>
          <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 hover:text-indigo-400">
            FAQ
          </button>
          <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 hover:text-indigo-400">
            Contact Us
          </button>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              id="btn-nav-mobile-support-concierge"
              onClick={() => {
                setMobileMenuOpen(false);
                openConciergeModal();
              }}
              className="w-full text-center py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <LifeBuoy className="w-4 h-4 text-emerald-400" />
              <span>Support & Concierge</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentExperience('client');
              }}
              className="w-full text-center py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 font-bold text-xs cursor-pointer"
            >
              Client Portal Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
