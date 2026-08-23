import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  Lock 
} from 'lucide-react';

export const ClientPlan: React.FC = () => {
  const { activeCustomer, plans, settings, updateCustomer, showToast } = useApp();

  if (!activeCustomer) return null;

  const currentPlan = plans.find((p) => p.id === activeCustomer.planId);

  const handleUpgradePlan = (newPlanId: string) => {
    updateCustomer(activeCustomer.id, {
      planId: newPlanId,
    });
    showToast('Your subscription package has been upgraded successfully!', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Plan & Retainer Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review active features, turnaround SLAs, renewal dates, and package tiers.
        </p>
      </div>

      {/* Current Plan Overview Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-indigo-500/20">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Active Retainer Package
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-2">
              {currentPlan?.name || 'Professional Plan'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              {currentPlan?.description}
            </p>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-right space-y-1">
            <div className="text-2xl font-extrabold text-white font-mono">
              {formatINR(currentPlan?.annualPrice, settings?.currencySymbol)}<span className="text-xs text-slate-400 font-sans">/year</span>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center justify-end gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Paid & Guaranteed</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs">
          <div className="space-y-1">
            <div className="text-slate-400 font-semibold">Activation Date</div>
            <div className="font-mono text-white text-sm">{activeCustomer.planStartDate}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 font-semibold">Next Renewal Expiry</div>
            <div className="font-mono text-amber-400 text-sm font-bold">{activeCustomer.planExpiryDate}</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400 font-semibold">Turnaround SLA</div>
            <div className="text-emerald-400 text-sm font-bold">⚡ {currentPlan?.turnaroundDays} Business Days</div>
          </div>
        </div>
      </div>

      {/* Available Plans & Upgrades */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">All WebRunzo Packages</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = p.id === activeCustomer.planId;

            return (
              <div
                key={p.id}
                className={`p-6 rounded-3xl border flex flex-col justify-between transition ${
                  isCurrent
                    ? 'bg-slate-950 border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-xl'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-base text-white">{p.name}</h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <div className="text-xl font-extrabold text-white font-mono mb-4">
                    {formatINR(p.annualPrice, settings?.currencySymbol)}<span className="text-xs text-slate-400 font-sans">/yr</span>
                  </div>

                  <div className="space-y-2 mb-6 text-xs text-slate-300">
                    {(p.features || []).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  disabled={isCurrent}
                  onClick={() => handleUpgradePlan(p.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md'
                  }`}
                >
                  {isCurrent ? (
                    <span>Active Current Plan</span>
                  ) : (
                    <>
                      <span>Switch to {p.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
