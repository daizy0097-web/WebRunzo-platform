import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAgentAvailability } from '../../utils/agentAvailability';
import { PremiumRequestType, QueryStatus } from '../../types';
import { 
  PhoneCall, 
  Send, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare,
  HelpCircle,
  FileQuestion,
  User,
  Paperclip,
  Calendar,
  Globe,
  Mail,
  Building2,
  X,
  FileText,
  AlertCircle,
  ChevronDown,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const ClientSupport: React.FC = () => {
  const { currentClientCustomer, isPremiumClient, settings, plans, tickets, addTicket, replyToTicket, addToast } = useApp();
  const availability = useAgentAvailability(settings);

  const customer = currentClientCustomer;
  const activePlan = plans.find((p) => p.id === customer?.planId);
  const isVip = isPremiumClient || customer?.clientTier === 'premium' || activePlan?.tier === 'premium';

  // State for Free Query Form
  const [freeCustomerName, setFreeCustomerName] = useState(customer?.name || '');
  const [freeEmail, setFreeEmail] = useState(customer?.email || '');
  const [freeProjectName, setFreeProjectName] = useState(customer?.businessName || '');
  const [freeSubject, setFreeSubject] = useState('');
  const [freeCategory, setFreeCategory] = useState<'Content & Text' | 'Design & Styling' | 'Domain & DNS' | 'Billing & Plan' | 'Bug / Technical' | 'Other'>('Content & Text');
  const [freeMessage, setFreeMessage] = useState('');

  // State for Premium Assistance Form
  const [premCustomerName, setPremCustomerName] = useState(customer?.name || '');
  const [premEmail, setPremEmail] = useState(customer?.email || '');
  const [premProjectName, setPremProjectName] = useState(customer?.businessName || '');
  const [premRequestType, setPremRequestType] = useState<PremiumRequestType>('Setup Help');
  const [premDescription, setPremDescription] = useState('');
  const [premAttachment, setPremAttachment] = useState<{ name: string; size: string } | null>(null);
  const [premPreferredDate, setPremPreferredDate] = useState('');

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submittedType, setSubmittedType] = useState<'free' | 'premium' | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [ticketFilter, setTicketFilter] = useState<'All' | 'Active' | 'Resolved'>('All');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if customer changes
  React.useEffect(() => {
    if (customer) {
      setFreeCustomerName(customer.name);
      setFreeEmail(customer.email);
      setFreeProjectName(customer.businessName);
      setPremCustomerName(customer.name);
      setPremEmail(customer.email);
      setPremProjectName(customer.businessName);
    }
  }, [customer]);

  const myTickets = tickets.filter((t) => t.customerId === customer?.id || (customer?.email && t.email === customer.email));

  const filteredMyTickets = myTickets.filter((t) => {
    if (ticketFilter === 'Active') return t.status !== 'Resolved' && t.status !== 'Closed';
    if (ticketFilter === 'Resolved') return t.status === 'Resolved' || t.status === 'Closed';
    return true;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const sizeFormatted = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      setPremAttachment({
        name: file.name,
        size: sizeFormatted,
      });
      addToast('info', 'File Attached', `${file.name} (${sizeFormatted}) ready for upload.`);
    }
  };

  const handleFreeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeSubject.trim() || !freeMessage.trim() || !customer) return;

    addTicket({
      customerId: customer.id,
      clientName: freeCustomerName || customer.name,
      email: freeEmail || customer.email,
      businessName: freeProjectName || customer.businessName,
      websiteUrl: customer.websiteUrl,
      clientTier: 'normal',
      planId: customer.planId,
      planName: activePlan?.name || 'Standard Plan',
      queryType: 'Free Query',
      requestType: freeCategory,
      subject: freeSubject.trim(),
      category: freeCategory,
      priority: 'Normal',
      status: 'New',
      leadTrackingStatus: 'Assistance Request',
      message: freeMessage.trim(),
    });

    setSubmittedType('free');
    setFreeSubject('');
    setFreeMessage('');
    setIsFormOpen(false);
  };

  const handlePremiumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!premDescription.trim() || !customer) return;

    const subjectTitle = `${premRequestType}: ${premDescription.slice(0, 50)}${premDescription.length > 50 ? '...' : ''}`;

    addTicket({
      customerId: customer.id,
      clientName: premCustomerName || customer.name,
      email: premEmail || customer.email,
      businessName: premProjectName || customer.businessName,
      websiteUrl: customer.websiteUrl,
      clientTier: 'premium',
      planId: customer.planId,
      planName: activePlan?.name || 'Business VIP',
      queryType: 'Premium Assistance',
      requestType: premRequestType,
      subject: subjectTitle,
      category: 'VIP Priority Request',
      priority: 'VIP Urgent (2h SLA)',
      status: 'New',
      leadTrackingStatus: 'Assistance Request',
      message: premDescription.trim(),
      attachmentName: premAttachment?.name,
      attachmentSize: premAttachment?.size,
      preferredCompletionDate: premPreferredDate || undefined,
    });

    setSubmittedType('premium');
    setPremDescription('');
    setPremAttachment(null);
    setPremPreferredDate('');
    setIsFormOpen(false);
  };

  const handleSendClientReply = (ticketId: string) => {
    if (!replyMessage.trim() || !customer) return;
    replyToTicket(
      ticketId,
      replyMessage.trim(),
      'Client',
      customer.name
    );
    setReplyMessage('');
    setActiveReplyId(null);
  };

  const getStatusBadgeClass = (status: QueryStatus) => {
    switch (status) {
      case 'New':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'In Review':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'In Progress':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Waiting for Customer':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Closed':
        return 'bg-slate-700/40 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello WebRunzo Support, I am ${customer?.name} from ${customer?.businessName} (${customer?.websiteUrl}). I need help with my website.`
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Tier Identification & Main Assistance Showcase */}
      {isVip ? (
        // PREMIUM CUSTOMER VIEW
        <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-xl space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-3 py-1 rounded-full font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  ACTIVE PREMIUM ASSISTANCE
                </span>
                <span className="text-xs text-amber-200/80 font-medium">
                  Active Plan: <span className="font-bold text-white">{activePlan?.name || 'Business VIP Plan'}</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  Dedicated Concierge Active
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Active Website Assistance & Concierge Desk
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                “Need active assistance? Tell us what you need and our team will directly help you with setup, customization, or other included requests.”
              </p>

              <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Dedicated Engineer Setup
                </span>
                <span className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Customization & Layout Changes
                </span>
                <span className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Priority Technical Assistance
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-3">
              <button
                id="btn-request-premium-assistance"
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{isFormOpen ? 'Close Request Form' : 'Request Premium Assistance'}</span>
              </button>

              <div className={`px-3.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${availability.badgeBg} ${availability.badgeText} ${availability.badgeBorder}`}>
                <span className={`w-2 h-2 rounded-full ${availability.dotColor} ${availability.dotPulse ? 'animate-pulse' : ''}`}></span>
                <span>Webmaster Staff: {availability.status}</span>
              </div>
            </div>
          </div>

          {/* Submission Success Notice */}
          {submittedType === 'premium' && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-start gap-3 text-emerald-100 text-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-white text-sm">Your assistance request has been received.</div>
                <p className="text-emerald-200/90 leading-relaxed">
                  Our team will review it and get back to you. Your dedicated engineer has been alerted.
                </p>
              </div>
            </div>
          )}

          {/* PREMIUM REQUEST FORM */}
          {isFormOpen && (
            <div className="pt-4 border-t border-amber-500/20 animate-in fade-in slide-in-from-top-2 duration-200">
              <form onSubmit={handlePremiumSubmit} className="bg-slate-950/90 p-6 rounded-2xl border border-slate-800 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-white">Premium Assistance Request Form</h3>
                  </div>
                  <span className="text-[11px] text-amber-400 font-mono">VIP Direct Queue</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Customer Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Customer Name
                    </label>
                    <input
                      type="text"
                      required
                      value={premCustomerName}
                      onChange={(e) => setPremCustomerName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={premEmail}
                      onChange={(e) => setPremEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Website / Project Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" /> Website / Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={premProjectName}
                      onChange={(e) => setPremProjectName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Request Type Selection */}
                <div className="space-y-2 text-xs">
                  <label className="font-bold text-slate-300 block">
                    Request Type <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {(['Setup Help', 'Customization', 'Website Issue', 'Content Change', 'Technical Help', 'Other'] as PremiumRequestType[]).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setPremRequestType(type)}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                          premRequestType === type
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Description */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300 block">
                    Detailed Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you need help with in detail (e.g., setting up DNS/domain, adding bespoke services cards, modifying styling or graphics, troubleshooting form submissions)..."
                    value={premDescription}
                    onChange={(e) => setPremDescription(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 leading-relaxed resize-y"
                  />
                </div>

                {/* Attachment & Preferred Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Optional Attachment */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" /> Optional Attachment
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">PDF, PNG, JPG, ZIP, DOCX</span>
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.zip,.docx,.txt"
                    />

                    {premAttachment ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-white">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate text-xs font-semibold">{premAttachment.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({premAttachment.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPremAttachment(null)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-amber-500/60 text-slate-400 hover:text-white flex items-center justify-center gap-2 transition cursor-pointer text-xs font-medium"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                        <span>Choose file or drag & drop</span>
                      </button>
                    )}
                  </div>

                  {/* Preferred Completion Date */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Preferred Completion Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={premPreferredDate}
                      onChange={(e) => setPremPreferredDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
                  <span className="text-[11px] text-slate-400">
                    Includes dedicated assistance with setup, customization, and troubleshooting according to your plan.
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-950" />
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        // FREE / STANDARD CUSTOMER VIEW
        <div className="bg-slate-950/90 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-3 py-1 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  STANDARD CLIENT SUPPORT
                </span>
                <span className="text-xs text-slate-400">
                  Active Plan: <span className="font-semibold text-white">{activePlan?.name || 'Starter Plan'}</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Customer Support & Helpdesk
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                “Have a problem or question? Submit your query and our team will review it.”
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-3">
              <button
                id="btn-submit-a-query"
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{isFormOpen ? 'Close Query Form' : 'Submit a Query'}</span>
              </button>

              <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${availability.badgeBg} ${availability.badgeText} ${availability.badgeBorder}`}>
                <span className={`w-2 h-2 rounded-full ${availability.dotColor} ${availability.dotPulse ? 'animate-pulse' : ''}`}></span>
                <span>Helpdesk: {availability.status}</span>
              </div>
            </div>
          </div>

          {/* Free Submission Success Notice */}
          {submittedType === 'free' && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-start gap-3 text-emerald-100 text-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-white text-sm">Your query has been received.</div>
                <p className="text-emerald-200/90 leading-relaxed">
                  Our team will review it and get back to you.
                </p>
              </div>
            </div>
          )}

          {/* FREE QUERY FORM */}
          {isFormOpen && (
            <div className="pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <form onSubmit={handleFreeSubmit} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <span>Submit a Support Query</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Response queue: Standard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={freeCustomerName}
                      onChange={(e) => setFreeCustomerName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      value={freeEmail}
                      onChange={(e) => setFreeEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Website / Project Name</label>
                    <input
                      type="text"
                      required
                      value={freeProjectName}
                      onChange={(e) => setFreeProjectName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Subject / Query Topic</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Question about contact form email or domain renewal"
                      value={freeSubject}
                      onChange={(e) => setFreeSubject(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Category</label>
                    <select
                      value={freeCategory}
                      onChange={(e) => setFreeCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="Content & Text">Content & Text</option>
                      <option value="Design & Styling">Design & Styling</option>
                      <option value="Domain & DNS">Domain & DNS</option>
                      <option value="Billing & Plan">Billing & Plan</option>
                      <option value="Bug / Technical">Bug / Technical</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-slate-300">Detailed Message / Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your question or issue in detail..."
                    value={freeMessage}
                    onChange={(e) => setFreeMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Query</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Direct Channels & Query History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Contact Channels */}
        <div className="lg:col-span-4 space-y-6">
          {/* Instant WhatsApp Support */}
          <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 p-6 rounded-3xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Direct WhatsApp</h3>
                  <div className="text-[11px] text-emerald-400 font-semibold">{isVip ? 'VIP Concierge Chat' : 'Webmaster Support'}</div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${availability.badgeBg} ${availability.badgeText} ${availability.badgeBorder}`}>
                {availability.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connect directly with our staff on WhatsApp for quick questions, photos, or voice notes.
            </p>

            <a
              href={`https://wa.me/${settings.whatsAppNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Open WhatsApp Chat</span>
            </a>
          </div>

          {/* Assigned Engineer Details */}
          <div className="bg-slate-950/90 p-6 rounded-3xl border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Assigned Operations Specialist
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                WO
              </div>
              <div>
                <div className="font-bold text-white text-sm">Alex Chen</div>
                <div className="text-slate-400 text-[11px]">Lead Operations Architect</div>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span>Support Desk:</span>
                <span className="font-mono text-white">{settings.supportEmail}</span>
              </div>
              <div className="flex justify-between">
                <span>Assistance Plan:</span>
                <span className={isVip ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                  {activePlan?.name || 'Standard'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Submitted Requests & History with Thread */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-950/90 p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span>My Submitted Requests & History ({myTickets.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track status updates, team progress, and conversation thread responses.
                </p>
              </div>

              {/* History Filter */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {(['All', 'Active', 'Resolved'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTicketFilter(filter)}
                    className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer text-[11px] ${
                      ticketFilter === filter ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {filteredMyTickets.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <FileQuestion className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="text-sm font-semibold text-slate-300">No requests in this view</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isVip 
                    ? 'Need active assistance with your website or setup? Click "Request Premium Assistance" above.' 
                    : 'Have a question or problem? Click "Submit a Query" above to reach our team.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMyTickets.map((t) => {
                  const isPremTicket = t.queryType === 'Premium Assistance' || t.clientTier === 'premium';
                  const isBeingActivelyHandled = (t.status === 'In Progress' || t.status === 'In Review');

                  return (
                    <div
                      key={t.id}
                      className={`p-5 rounded-2xl border transition space-y-3 text-xs ${
                        isPremTicket
                          ? 'bg-slate-900/90 border-amber-500/30'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      {/* Ticket Header & Status */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                              isPremTicket 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {t.queryType || (isPremTicket ? 'PREMIUM ASSISTANCE' : 'FREE QUERY')}
                            </span>

                            {t.requestType && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700 font-semibold">
                                {t.requestType}
                              </span>
                            )}

                            <span className="text-[10px] text-slate-500 font-mono">
                              {t.createdAt}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-white text-sm pt-0.5">
                            {t.subject}
                          </h4>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${getStatusBadgeClass(t.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span>{t.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Active Handling Banner for Premium Users */}
                      {isPremTicket && isBeingActivelyHandled && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                          <span>
                            <strong>Active Handling:</strong> Our engineering team is actively working on your request according to your plan SLA.
                          </span>
                        </div>
                      )}

                      {/* Request Body */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-200 space-y-2 leading-relaxed">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                          <span>Original Request:</span>
                          {t.preferredCompletionDate && (
                            <span className="text-amber-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Preferred Date: {t.preferredCompletionDate}
                            </span>
                          )}
                        </div>
                        <p>{t.message}</p>

                        {t.attachmentName && (
                          <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-[11px] text-amber-400">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>Attachment: {t.attachmentName}</span>
                            {t.attachmentSize && <span className="text-slate-500 font-mono">({t.attachmentSize})</span>}
                          </div>
                        )}
                      </div>

                      {/* Replies Conversation Thread */}
                      {t.replies && t.replies.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Conversation & Updates ({t.replies.length})
                          </div>
                          {t.replies.map((reply, idx) => (
                            <div
                              key={reply.id || idx}
                              className={`p-3 rounded-xl space-y-1 ${
                                reply.sender === 'Admin'
                                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-100'
                                  : 'bg-slate-950 border border-slate-800 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span className={`font-bold flex items-center gap-1.5 ${
                                  reply.sender === 'Admin' ? 'text-emerald-400' : 'text-indigo-400'
                                }`}>
                                  {reply.sender === 'Admin' ? (
                                    <>
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      {reply.senderName || 'WebRunzo Support Team'}
                                    </>
                                  ) : (
                                    <>
                                      <User className="w-3.5 h-3.5" />
                                      You ({reply.senderName || 'Client'})
                                    </>
                                  )}
                                </span>
                                <span className="text-slate-500 font-mono">{reply.timestamp}</span>
                              </div>
                              <p className="leading-relaxed text-xs">{reply.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Form Toggle / Box */}
                      {activeReplyId === t.id ? (
                        <div className="pt-3 border-t border-slate-800 space-y-2 animate-in fade-in">
                          <textarea
                            rows={2}
                            placeholder="Type a follow-up message or response to WebRunzo team..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReplyId(null);
                                setReplyMessage('');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendClientReply(t.id)}
                              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send Follow-up</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            {t.status === 'Resolved' ? 'This request is marked resolved.' : 'Need to add more details?'}
                          </span>
                          {t.status !== 'Closed' && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReplyId(t.id);
                                setReplyMessage('');
                              }}
                              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Add Follow-up Message</span>
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
