import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export const PricingSection: React.FC = () => {
  const { plans, settings, openEnquiryModal } = useApp();

  return (
    <section id="pricing" className="py-20 bg-slate-900/40 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Simple & Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Turnkey Web Packages Built for Growth
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Clean, modern, and high-converting websites designed to establish your brand and drive real results.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isPopular = plan.id === 'plan-pro' || plan.popularBadge;
            const price = plan.annualPrice || plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                  isPopular
                    ? 'bg-slate-900 text-white shadow-2xl ring-2 ring-indigo-500 md:-translate-y-2 border border-indigo-500/40'
                    : 'bg-slate-900/90 text-white border border-slate-800 shadow-xl hover:border-slate-700'
                }`}
              >
                {/* Most Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[11px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-indigo-500/30 flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>MOST POPULAR</span>
                  </div>
                )}

                <div>
                  {/* Plan Name */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-extrabold text-white uppercase tracking-wide">
                      {plan.name}
                    </h3>
                  </div>

                  <p className="text-xs mb-6 text-slate-400 leading-relaxed min-h-[32px]">
                    {plan.description}
                  </p>

                  {/* Price Block */}
                  <div className="mb-6 pb-6 border-b border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white">
                        {formatINR(price, settings?.currencySymbol)}
                      </span>
                    </div>
                    <div className="text-[11px] mt-1.5 text-slate-400 font-medium flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Turnkey website build & setup</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      What's Included:
                    </div>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <span className={`${feat.includes('Unlimited Revisions') ? 'text-indigo-200 font-semibold' : 'text-slate-300'}`}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear CTA Button */}
                <button
                  onClick={() => openEnquiryModal(undefined, plan.id)}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                    isPopular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Policy & Guarantee Note */}
        <div className="mt-12 max-w-3xl mx-auto bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-300">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-white text-sm">Transparent Delivery & Revisions Policy</div>
            <div className="text-slate-400 leading-relaxed">
              Every package includes dedicated build revisions during the active design phase. After the website is approved and delivered, additional changes are treated as paid maintenance/custom work.
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

