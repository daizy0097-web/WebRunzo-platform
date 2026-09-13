import React from 'react';
import { ClientOnboardingForm } from './ClientOnboardingForm';
import { useApp } from '../../context/AppContext';
import { ClipboardList, ArrowLeft, ShieldCheck, HelpCircle } from 'lucide-react';

export const ClientOnboardingView: React.FC = () => {
  const { setClientTab, currentClientCustomer } = useApp();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setClientTab('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portal Home</span>
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-medium">Encrypted & Isolated Workspace</span>
          </span>
        </div>
      </div>

      {/* Main Intake Form */}
      <ClientOnboardingForm isModal={false} />

      {/* Help & Support Footnote */}
      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80 flex items-start sm:items-center gap-3 text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1">
          <span className="text-slate-300 font-semibold">Need assistance with your requirements?</span>{' '}
          Our concierge engineering team is available 24/7. You can submit questions via the{' '}
          <button
            type="button"
            onClick={() => setClientTab('support')}
            className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
          >
            Support & Concierge
          </button>{' '}
          tab or reach out to your assigned WebRunzo project lead.
        </div>
      </div>
    </div>
  );
};
