import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { 
  ProjectStatus, 
  PROJECT_LIFECYCLE_STEPS 
} from '../../types';
import {
  getProjectStatus,
  getStatusBadgeStyle,
  getStatusProgressPercentage,
  getStatusPhaseDescription,
} from '../../utils/projectLifecycle';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText, 
  Sparkles, 
  ExternalLink,
  LifeBuoy,
  Edit3,
  Globe,
  Eye,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { ClientOnboardingModal } from './ClientOnboardingModal';

export const ClientOrders: React.FC = () => {
  const { currentClientCustomer, orders, plans, templates, setClientTab, openPreviewModal } = useApp();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  const customer = currentClientCustomer;
  const clientOrders = orders.filter((o) => o.customerId === customer?.id || o.email === customer?.email);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ClientOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            My Orders & Project Progress Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of your turnkey website build through our official 5-phase delivery pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowOnboardingModal(true)}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Onboarding & Scope</span>
          </button>
          <button
            onClick={() => setClientTab('support')}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition cursor-pointer"
          >
            <LifeBuoy className="w-4 h-4 text-indigo-400" />
            <span>Support & Revisions</span>
          </button>
        </div>
      </div>

      {clientOrders.length === 0 ? (
        <div className="bg-slate-950 p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No Active Development Orders</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your website has been deployed. Any future design expansions or add-ons will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {clientOrders.map((ord) => {
            const plan = plans.find((p) => p.id === ord.planId);
            const tpl = templates.find((t) => t.id === ord.templateId);
            const pStatus = ord.projectStatus || getProjectStatus(ord);
            const progressPct = getStatusProgressPercentage(pStatus);
            const badgeStyle = getStatusBadgeStyle(pStatus);
            const phaseDesc = getStatusPhaseDescription(pStatus);

            return (
              <div
                key={ord.id}
                className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-xl"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700">
                      {ord.orderNumber}
                    </span>
                    <div>
                      <h2 className="text-base font-extrabold text-white">{ord.businessName}</h2>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>Placed on: {ord.date}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-semibold">Target Launch: {ord.deliveryDueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border ${badgeStyle}`}>
                      {pStatus}
                    </span>
                    <span className="font-mono font-extrabold text-sm text-emerald-400">
                      {formatINR(ord.amount)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Phase Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-300">Project Lifecycle Pipeline</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-medium">{phaseDesc}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">{progressPct}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progressPct === 100 
                          ? 'bg-emerald-500' 
                          : progressPct >= 75 
                          ? 'bg-gradient-to-r from-indigo-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Canonical 5-Step Lifecycle Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {PROJECT_LIFECYCLE_STEPS.map((step, idx) => {
                    const stepIndex = PROJECT_LIFECYCLE_STEPS.indexOf(step);
                    const currentIndex = PROJECT_LIFECYCLE_STEPS.indexOf(pStatus);
                    const isCompleted = stepIndex < currentIndex || pStatus === 'Live';
                    const isCurrent = step === pStatus;

                    // Match date if milestone exists
                    const matchedMilestone = ord.milestones?.find(
                      (m) => m.title.toLowerCase().includes(step.toLowerCase()) || 
                             (step === 'Live' && m.title.toLowerCase().includes('launch'))
                    );

                    return (
                      <div
                        key={step}
                        className={`p-4 rounded-2xl border text-xs space-y-1.5 transition ${
                          isCurrent
                            ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                            : isCompleted
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                            : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-500">PHASE 0{idx + 1}</span>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                            isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-amber-400 border-amber-400 text-slate-950'
                              : 'border-slate-700'
                          }`}>
                            {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {isCurrent && <Clock className="w-2.5 h-2.5" />}
                          </div>
                        </div>
                        <div className={`font-bold text-sm ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                          {step}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {step === 'Submitted' && 'Scope & intake logged'}
                          {step === 'Accepted' && 'Approved & scheduled'}
                          {step === 'In Progress' && 'Active engineering'}
                          {step === 'Review' && 'QA & staging preview'}
                          {step === 'Live' && 'Deployed on Edge CDN'}
                        </div>
                        {matchedMilestone?.date && (
                          <div className="text-[10px] text-emerald-400 font-mono pt-1">
                            {matchedMilestone.date}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* State-Specific Action Callout */}
                {pStatus === 'Review' && (
                  <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span>Your Website Staging Build is Ready for Review!</span>
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          Inspect your staged pages, verify images and copy, and let our team know if any changes are needed before final DNS live launch.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                        {tpl && (
                          <button
                            onClick={() => openPreviewModal(tpl)}
                            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition cursor-pointer shadow-md"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Staging Website</span>
                          </button>
                        )}
                        <button
                          onClick={() => setClientTab('support')}
                          className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Request Revisions</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {pStatus === 'Live' && (
                  <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>Your Website is 100% Live on Global Edge CDN!</span>
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          Operating at {customer?.liveWebsiteUrl || `${customer?.businessName?.toLowerCase().replace(/\s+/g, '') || 'yourbrand'}.webrunzo.app`} with automated SSL certificates, firewall protection, and daily backup snapshots.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                        {customer?.liveWebsiteUrl && (
                          <a
                            href={customer.liveWebsiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-md"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Visit Live Website</span>
                          </a>
                        )}
                        {tpl && (
                          <button
                            onClick={() => openPreviewModal(tpl)}
                            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Mode</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Scope & Requirements */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Scope & Deliverables</div>
                  <p className="text-slate-300 leading-relaxed">
                    {ord.requirements || 'Standard Turnkey Package Setup: Mobile responsive website, secure SSL certification, DNS domain mapping, high-speed CDN, and client portal management tools.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
