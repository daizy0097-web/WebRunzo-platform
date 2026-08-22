import React from 'react';
import { 
  Layout, 
  FileText, 
  Rocket, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HowItWorksSection: React.FC = () => {
  const { openEnquiryModal } = useApp();

  const steps = [
    {
      stepNumber: '01',
      icon: Layout,
      title: 'Choose a Template',
      subtitle: 'Browse 20 curated industry layouts',
      description: 'Explore our rich gallery of industry-specific templates designed for maximum conversion, aesthetic balance, and mobile responsiveness.',
      points: ['Search by industry & niche', 'Full interactive live preview', 'Custom color palette matching'],
    },
    {
      stepNumber: '02',
      icon: FileText,
      title: 'Provide Your Content',
      subtitle: 'Send your details or let our team write it',
      description: 'Share your logo, business info, services, and photography—or let our content specialists curate professional copy and imagery for you.',
      points: ['Simple onboarding form', 'WhatsApp direct file sharing', 'Free stock photography curation'],
    },
    {
      stepNumber: '03',
      icon: Rocket,
      title: 'We Build & Launch',
      subtitle: 'Live in 7 to 8 business days',
      description: 'Our senior web engineers configure your custom domain, set up high-speed cloud hosting, test all forms, and launch your website to the world.',
      points: ['Domain & SSL connected', 'Client Panel access handed over', 'Unlimited initial revision support'],
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            From Selection to Live Website in 3 Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            We eliminated the friction of web design. Here is how your new website comes to life with WebRunzo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-16 right-16 h-0.5 bg-slate-800 -translate-y-8 z-0"></div>

          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative z-10 bg-slate-900 rounded-2xl p-7 border border-slate-800 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-extrabold text-slate-700 font-mono">
                      {s.stepNumber}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{s.title}</h3>
                  <div className="text-xs font-semibold text-indigo-400 mb-3">{s.subtitle}</div>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {s.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  {s.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <button
            onClick={() => openEnquiryModal()}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <span>Start Step 1: Choose Your Template Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
