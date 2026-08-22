import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { 
  X, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  CreditCard,
  Building2,
  Mail,
  Phone,
  User,
  ShieldAlert
} from 'lucide-react';

export const EnquiryModal: React.FC = () => {
  const { 
    enquiryModal, 
    closeEnquiryModal, 
    templates, 
    plans, 
    submitEnquiry, 
    setCurrentExperience,
    setAdminTab,
    loginAsAdmin
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    enquiryModal.preselectedTemplateId || templates[0].id
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    enquiryModal.preselectedPlanId || plans[1].id
  );

  // Form Fields
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (enquiryModal.preselectedTemplateId) {
      setSelectedTemplateId(enquiryModal.preselectedTemplateId);
    }
    if (enquiryModal.preselectedPlanId) {
      setSelectedPlanId(enquiryModal.preselectedPlanId);
    }
  }, [enquiryModal]);

  if (!enquiryModal.isOpen) return null;

  const chosenTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const chosenPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !business || !email) return;

    submitEnquiry({
      name,
      business,
      email,
      phone: phone || '+1 (555) 000-0000',
      selectedTemplateId,
      selectedPlanId,
      message: message || `Client interested in launching ${business} using ${chosenTemplate.name} under ${chosenPlan.name}.`,
    });

    setIsSubmitted(true);
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 text-white w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Modal Header */}
        <div className="bg-slate-950 p-5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Start Your WebRunzo Project</h3>
              <p className="text-xs text-slate-400">Turnkey design, high-speed hosting & launch in 3–5 business days</p>
            </div>
          </div>
          <button
            onClick={closeEnquiryModal}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        {!isSubmitted && (
          <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-xs font-semibold text-slate-400 shrink-0">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-400 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1</span>
              <span>Template</span>
            </div>
            <span className="text-slate-600">→</span>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-400 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
              <span>Package</span>
            </div>
            <span className="text-slate-600">→</span>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-indigo-400 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3</span>
              <span>Your Details</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Select Template */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white">Select Your Website Template</h4>
                <p className="text-xs text-slate-400">Pick the starter architecture that matches your business vision.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      selectedTemplateId === tpl.id
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                    }`}
                  >
                    <img
                      src={tpl.previewImage}
                      alt={tpl.name}
                      className="w-16 h-14 rounded-lg object-cover border border-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{tpl.category}</span>
                        {selectedTemplateId === tpl.id && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        )}
                      </div>
                      <div className="font-bold text-xs text-white truncate mt-0.5">{tpl.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{tpl.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Selected: <strong className="text-white">{chosenTemplate.name}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow cursor-pointer"
                >
                  <span>Next: Choose Package</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Package */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white">Select Your WebRunzo Plan</h4>
                <p className="text-xs text-slate-400">All plans include custom build, managed cloud hosting, domain & updates.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((pln) => (
                  <div
                    key={pln.id}
                    onClick={() => setSelectedPlanId(pln.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      selectedPlanId === pln.id
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                    }`}
                  >
                    <div>
                      {pln.popularBadge && (
                        <span className="inline-block bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                          Most Popular
                        </span>
                      )}
                      <h5 className="font-bold text-sm text-white">{pln.name}</h5>
                      <div className="mt-2 mb-2">
                        <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">{formatINR(pln.annualPrice)}</span>
                        <span className="text-[10px] text-slate-400 block">Turnkey Website Package</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">{pln.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <div>✓ {pln.features[0] || `${pln.maxPages} Custom Pages`}</div>
                      <div>✓ {pln.features[1] || `${pln.turnaroundDays}-day delivery`}</div>
                      <div>✓ {pln.revisions}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 cursor-pointer"
                >
                  ← Back to Templates
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow cursor-pointer"
                >
                  <span>Next: Contact Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Contact Details & Submit */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white">Your Business & Contact Information</h4>
                <p className="text-xs text-slate-400">We'll review your template choice and prepare your deployment.</p>
              </div>

              {/* Order Summary Strip */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
                <div>
                  <span className="text-slate-400">Template:</span> <strong className="text-white">{chosenTemplate.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Package:</span> <strong className="text-indigo-400">{chosenPlan.name} ({formatINR(chosenPlan.annualPrice)})</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Your Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Sterling"
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Business / Brand Name *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={business}
                      onChange={(e) => setBusiness(e.target.value)}
                      placeholder="Sterling Consulting Group"
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@sterlinggroup.com"
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone / WhatsApp Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 789-0123"
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Special Requirements / Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about any specific pages, integrations (Stripe, Calendly), or custom features you need..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 cursor-pointer"
                >
                  ← Back to Plans
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Project Request</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success / Demo Confirmation */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-white">Enquiry Received Successfully!</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                  Thank you, <strong>{name}</strong>! Your project request for <strong>{business}</strong> has been logged in WebRunzo.
                </p>
              </div>

              {/* Demo Explainer Box */}
              <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-4 text-xs text-left text-indigo-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-white">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Demonstration Live Flow:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-200">
                  Your new enquiry is now instantly visible in the <strong>Admin Panel → Enquiries</strong> view.
                  As an Admin, you can click <strong>"Convert to Customer"</strong> to automatically provision this client account and assign login credentials!
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    closeEnquiryModal();
                    loginAsAdmin();
                    setAdminTab('enquiries');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow cursor-pointer"
                >
                  Open Admin Enquiries Inbox →
                </button>
                <button
                  onClick={closeEnquiryModal}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition border border-slate-700 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
