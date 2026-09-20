import React, { useState, useEffect } from 'react';
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
    publicPage,
    setPublicPage,
    openEnquiryModal,
    openConciergeModal,
    session 
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    if (publicPage !== 'home') {
      setActiveSection('');
      return;
    }

    const sectionIds = [
      'hero',
      'why-webrunzo',
      'services',
      'how-it-works',
      'templates',
      'pricing',
      'about',
      'faq',
      'contact',
    ];

    const handleScroll = () => {
      if (window.scrollY < 120) {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const observer = new IntersectionObserver(
      (entries) => {
        if (window.scrollY < 120) {
          setActiveSection('home');
          return;
        }

        const intersecting = entries.filter((entry) => entry.isIntersecting);
        if (intersecting.length > 0) {
          const topEntry = intersecting.sort(
            (a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top)
          )[0];
          const id = topEntry.target.id;
          setActiveSection(id === 'hero' ? 'home' : id);
        }
      },
      {
        rootMargin: '-20% 0px -65% 0px',
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [publicPage]);

  const navigateToHome = () => {
    setActiveSection('home');
    setPublicPage('home');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setPublicPage('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const getDesktopLinkClass = (section: string) => {
    const isActive = activeSection === section;
    return `cursor-pointer transition-colors duration-150 relative py-1 text-xs ${
      isActive
        ? 'text-white font-bold after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-500 after:rounded-full'
        : 'text-slate-400 hover:text-slate-200 font-semibold'
    }`;
  };

  const getMobileLinkClass = (section: string) => {
    const isActive = activeSection === section;
    return `block w-full text-left py-2 px-3 rounded-r-lg transition-colors cursor-pointer text-sm ${
      isActive
        ? 'bg-slate-800/80 text-indigo-400 border-l-2 border-indigo-500 font-bold'
        : 'text-slate-300 hover:text-indigo-400 border-l-2 border-transparent font-semibold'
    }`;
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
              <span className="hidden sm:block text-xs text-slate-400 font-medium tracking-wider uppercase mt-0.5">Turnkey Websites</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            <button onClick={navigateToHome} className={getDesktopLinkClass('home')}>
              Home
            </button>
            <button onClick={() => scrollToSection('why-webrunzo')} className={getDesktopLinkClass('why-webrunzo')}>
              Why Us
            </button>
            <button onClick={() => scrollToSection('services')} className={getDesktopLinkClass('services')}>
              Services
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className={getDesktopLinkClass('how-it-works')}>
              How It Works
            </button>
            <button onClick={() => scrollToSection('templates')} className={`${getDesktopLinkClass('templates')} flex items-center gap-1`}>
              <span>Templates</span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-2 py-0.5 rounded-full">20</span>
            </button>
            <button onClick={() => scrollToSection('pricing')} className={getDesktopLinkClass('pricing')}>
              Pricing
            </button>
            <button onClick={() => scrollToSection('about')} className={getDesktopLinkClass('about')}>
              About
            </button>
            <button onClick={() => scrollToSection('faq')} className={getDesktopLinkClass('faq')}>
              FAQ
            </button>
            <button onClick={() => scrollToSection('contact')} className={getDesktopLinkClass('contact')}>
              Contact
            </button>
          </div>

          {/* Right Action CTA & Portal Links */}
          <div className="hidden sm:flex items-center gap-3">
            {session.role !== 'guest' && (
              <button
                onClick={() => setCurrentExperience(session.role === 'admin' ? 'admin' : 'client')}
                className="text-xs font-bold text-slate-200 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 border border-slate-700/80 hover:border-slate-600 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                {session.role === 'admin' ? 'Admin Portal' : 'Client Portal'}
              </button>
            )}
            
            <button
              id="btn-nav-get-started"
              onClick={() => openEnquiryModal()}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => openEnquiryModal()}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-indigo-600/30 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Get Started
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-6 py-5 space-y-2 text-sm shadow-2xl animate-in fade-in slide-in-from-top-2">
          <button onClick={navigateToHome} className={getMobileLinkClass('home')}>
            Home
          </button>
          <button onClick={() => scrollToSection('why-webrunzo')} className={getMobileLinkClass('why-webrunzo')}>
            Why WebRunzo
          </button>
          <button onClick={() => scrollToSection('services')} className={getMobileLinkClass('services')}>
            Services
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className={getMobileLinkClass('how-it-works')}>
            How It Works
          </button>
          <button onClick={() => scrollToSection('templates')} className={`${getMobileLinkClass('templates')} flex items-center justify-between`}>
            <span>Template Gallery</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">20 Demo Templates</span>
          </button>
          <button onClick={() => scrollToSection('pricing')} className={getMobileLinkClass('pricing')}>
            Pricing Plans
          </button>
          <button onClick={() => scrollToSection('about')} className={getMobileLinkClass('about')}>
            About WebRunzo
          </button>
          <button onClick={() => scrollToSection('faq')} className={getMobileLinkClass('faq')}>
            FAQ
          </button>
          <button onClick={() => scrollToSection('contact')} className={getMobileLinkClass('contact')}>
            Contact Us
          </button>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              id="btn-nav-mobile-support-concierge"
              onClick={() => {
                setMobileMenuOpen(false);
                openConciergeModal();
              }}
              className="w-full text-center py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <LifeBuoy className="w-4 h-4 text-emerald-400" />
              <span>Support & Concierge</span>
            </button>

            {session.role !== 'guest' ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentExperience(session.role === 'admin' ? 'admin' : 'client');
                }}
                className="w-full text-center py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-bold text-xs cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {session.role === 'admin' ? 'Admin Portal' : 'Client Portal'}
              </button>
            ) : (
              <button
                id="btn-nav-mobile-client-login"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentExperience('client');
                }}
                className="w-full text-center py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 font-medium text-xs cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Client Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
