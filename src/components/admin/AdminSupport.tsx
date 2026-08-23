import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QueryStatus, LeadTrackingStatus, SupportTicket, QueryType } from '../../types';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  MessageSquare, 
  AlertTriangle, 
  User, 
  Building2, 
  PhoneCall, 
  Paperclip, 
  Calendar, 
  Globe, 
  Mail, 
  CreditCard, 
  Layers, 
  DollarSign, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  Tag,
  AlertCircle
} from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const { tickets, plans, customers, updateTicketStatus, updateTicketLeadTracking, replyToTicket, addToast } = useApp();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Free Query' | 'Premium Assistance'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | QueryStatus>('All');
  const [leadTrackingFilter, setLeadTrackingFilter] = useState<'All' | LeadTrackingStatus>('All');
  const [adminNoteInput, setAdminNoteInput] = useState('');

  const filteredTickets = tickets.filter((t) => {
    const isPremium = t.queryType === 'Premium Assistance' || t.clientTier === 'premium';
    const computedQueryType = t.queryType || (isPremium ? 'Premium Assistance' : 'Free Query');

    const matchesType = typeFilter === 'All' || computedQueryType === typeFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesLead = leadTrackingFilter === 'All' || (t.leadTrackingStatus || 'Assistance Request') === leadTrackingFilter;

    const matchesSearch = 
      (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.requestType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.message || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesLead && matchesSearch;
  });

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0];

  const activeTicketCustomer = customers.find((c) => c.id === activeTicket?.customerId || c.email === activeTicket?.email);
  const activeTicketPlan = plans.find((p) => p.id === activeTicket?.planId || p.id === activeTicketCustomer?.planId);

  const isCurrentPremium = activeTicket?.queryType === 'Premium Assistance' || activeTicket?.clientTier === 'premium';

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    replyToTicket(
      activeTicket.id,
      replyText.trim(),
      'Admin',
      'Alex Chen (VIP Lead Webmaster)'
    );

    setReplyText('');
    addToast('success', 'Reply Sent', `Response dispatched to ${activeTicket.clientName}.`);
  };

  const handleStatusChange = (status: QueryStatus) => {
    if (!activeTicket) return;
    updateTicketStatus(activeTicket.id, status);
  };

  const handleLeadTrackingChange = (status: LeadTrackingStatus) => {
    if (!activeTicket) return;
    updateTicketLeadTracking(activeTicket.id, status, adminNoteInput || activeTicket.adminNotes);
  };

  const handleSaveAdminNotes = () => {
    if (!activeTicket) return;
    updateTicketLeadTracking(activeTicket.id, activeTicket.leadTrackingStatus || 'Assistance Request', adminNoteInput);
    addToast('success', 'Internal Notes Saved', 'Scope notes stored securely.');
  };

  const getStatusBadge = (status: QueryStatus) => {
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

  const getLeadBadge = (status?: LeadTrackingStatus) => {
    switch (status) {
      case 'Custom Work Required':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Additional Payment Required':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Converted to Lead':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Assistance Request':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const totalPremiumQueries = tickets.filter((t) => t.queryType === 'Premium Assistance' || t.clientTier === 'premium').length;
  const totalFreeQueries = tickets.filter((t) => t.queryType !== 'Premium Assistance' && t.clientTier !== 'premium').length;
  const activeQueriesCount = tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length;
  const scopeFlaggedCount = tickets.filter((t) => t.leadTrackingStatus === 'Custom Work Required' || t.leadTrackingStatus === 'Additional Payment Required').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Stats Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Assistance & Query Hub
            </span>
            <span className="text-xs text-slate-400">Multi-Tier Client Queue</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Queries & Assistance Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage Free Customer Queries, triage VIP Premium Assistance requests, and track lead conversion scopes.
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <div className="text-[10px] text-slate-400 font-semibold">Active Queue</div>
            <div className="text-base font-extrabold text-amber-400 font-mono">{activeQueriesCount}</div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs">
            <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Premium VIP
            </div>
            <div className="text-base font-extrabold text-amber-300 font-mono">{totalPremiumQueries}</div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
            <div className="text-[10px] text-indigo-300 font-semibold">Free Queries</div>
            <div className="text-base font-extrabold text-indigo-300 font-mono">{totalFreeQueries}</div>
          </div>

          {scopeFlaggedCount > 0 && (
            <div className="px-3.5 py-2 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs">
              <div className="text-[10px] text-rose-300 font-semibold">Custom Work Scope</div>
              <div className="text-base font-extrabold text-rose-400 font-mono">{scopeFlaggedCount}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        {/* Left Column: Filterable Query List */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 p-4 space-y-3 flex flex-col">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by client, business, subject, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tier Tabs (All, Free Queries, Premium Assistance) */}
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            {(['All', 'Free Query', 'Premium Assistance'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setTypeFilter(tier)}
                className={`flex-1 py-1 rounded-lg font-bold transition cursor-pointer text-center ${
                  typeFilter === tier 
                    ? tier === 'Premium Assistance'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier === 'Free Query' ? 'Free Queries' : tier === 'Premium Assistance' ? '⭐ Premium Assistance' : 'All Queries'}
              </button>
            ))}
          </div>

          {/* Status Sub-Filters */}
          <div className="flex flex-wrap gap-1 text-[10px]">
            {(['All', 'New', 'In Review', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Query List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[620px]">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                <p>No queries matching criteria.</p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isPrem = t.queryType === 'Premium Assistance' || t.clientTier === 'premium';
                const isSelected = activeTicket?.id === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTicketId(t.id);
                      setAdminNoteInput(t.adminNotes || '');
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition cursor-pointer space-y-2.5 relative ${
                      isSelected
                        ? isPrem
                          ? 'bg-slate-850 border-amber-500/80 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-800 border-indigo-500/80 shadow-lg shadow-indigo-500/10'
                        : isPrem
                        ? 'bg-slate-950/90 border-amber-500/30 hover:bg-slate-900'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900'
                    }`}
                  >
                    {/* Header line */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isPrem ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[9px] border border-amber-500/40 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> PREMIUM ASSISTANCE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold text-[9px] border border-slate-700">
                            FREE QUERY
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 truncate font-semibold">
                          {t.businessName}
                        </span>
                      </div>

                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </div>

                    {/* Subject */}
                    <div className="text-xs font-bold text-white line-clamp-1">
                      {t.subject}
                    </div>

                    {/* Request Type & Meta */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-2">
                        {t.requestType && (
                          <span className="text-indigo-300 font-medium bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {t.requestType}
                          </span>
                        )}
                        {t.attachmentName && (
                          <span className="flex items-center gap-0.5 text-amber-400 font-mono">
                            <Paperclip className="w-2.5 h-2.5" /> File
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-[10px] text-slate-500">{t.createdAt}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Query Inspection & Response Thread */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-6">
          {activeTicket ? (
            <>
              {/* Top Banner based on Tier */}
              <div className="space-y-4">
                
                {/* Visual Tier Header */}
                <div className={`p-4 rounded-2xl border ${
                  isCurrentPremium
                    ? 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-500/40'
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border tracking-wider ${
                          isCurrentPremium
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {isCurrentPremium ? '⭐ PREMIUM ASSISTANCE' : 'FREE CUSTOMER QUERY'}
                        </span>

                        {isCurrentPremium && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 font-semibold border border-amber-500/30">
                            Plan: {activeTicket.planName || activeTicketPlan?.name || 'Business VIP'}
                          </span>
                        )}

                        <span className="text-xs text-slate-400 font-mono">
                          ID: #{activeTicket.id}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-extrabold text-white pt-1">
                        {activeTicket.subject}
                      </h2>
                    </div>

                    {/* Quick Status Pill */}
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getStatusBadge(activeTicket.status)}`}>
                      {activeTicket.status}
                    </span>
                  </div>

                  {/* Customer Meta Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Client Name</div>
                      <div className="font-bold text-white truncate">{activeTicket.clientName}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Email</div>
                      <div className="font-mono text-slate-300 text-[11px] truncate">{activeTicket.email || activeTicketCustomer?.email || 'N/A'}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Website / Project</div>
                      <div className="text-slate-300 truncate">{activeTicket.businessName}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Submitted</div>
                      <div className="font-mono text-slate-400 text-[11px]">{activeTicket.createdAt}</div>
                    </div>
                  </div>
                </div>

                {/* Status Selector & Lead Tracking Bar */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 text-xs">
                  
                  {/* Status Dropdown/Toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Update Query Status:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {(['New', 'In Review', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed'] as QueryStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(st)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                            activeTicket.status === st
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lead Conversion Tracking for Premium Requests */}
                  {isCurrentPremium && (
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-bold text-amber-300 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-400" />
                          <span>Lead Conversion & Scope Classification:</span>
                        </div>

                        <select
                          value={activeTicket.leadTrackingStatus || 'Assistance Request'}
                          onChange={(e) => handleLeadTrackingChange(e.target.value as LeadTrackingStatus)}
                          className="bg-slate-900 border border-amber-500/40 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400"
                        >
                          <option value="Assistance Request">Assistance Request (Included in Plan)</option>
                          <option value="Custom Work Required">Custom Work Required (Out-of-Scope)</option>
                          <option value="Additional Payment Required">Additional Payment Required (Add-on Quote)</option>
                          <option value="Converted to Lead">Converted to Lead (Enterprise Pipeline)</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      {/* Scope Advisory Notice if marked as Custom Work or Additional Payment */}
                      {(activeTicket.leadTrackingStatus === 'Custom Work Required' || activeTicket.leadTrackingStatus === 'Additional Payment Required') && (
                        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-amber-300">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Scope Advisory Notice</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-amber-200/90">
                            This request requires bespoke work outside the customer's included plan. Review the scope with the client and provide a custom quote/invoice instead of automatically promising free custom bespoke engineering.
                          </p>
                        </div>
                      )}

                      {/* Admin Internal Scope Notes */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add internal scope notes, estimated billable hours, or quote info..."
                          value={adminNoteInput}
                          onChange={(e) => setAdminNoteInput(e.target.value)}
                          className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={handleSaveAdminNotes}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Request Content & Attachments */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px]">
                    <span className="text-white">Customer Request Details:</span>
                    {activeTicket.preferredCompletionDate && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Preferred Date: {activeTicket.preferredCompletionDate}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {activeTicket.message}
                  </p>

                  {/* Attachment display */}
                  {activeTicket.attachmentName && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 font-medium">
                        <Paperclip className="w-4 h-4" />
                        <span>{activeTicket.attachmentName}</span>
                        {activeTicket.attachmentSize && (
                          <span className="text-slate-500 font-mono text-[10px]">({activeTicket.attachmentSize})</span>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        Attachment Verified
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* Message Thread History */}
              <div className="flex-1 overflow-y-auto space-y-3 py-2 max-h-[300px]">
                {activeTicket.replies && activeTicket.replies.length > 0 ? (
                  activeTicket.replies.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        m.sender === 'Admin'
                          ? 'bg-emerald-950/40 border border-emerald-500/30 ml-6 text-emerald-100'
                          : 'bg-slate-950 border border-slate-800 mr-6 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`font-bold flex items-center gap-1 ${m.sender === 'Admin' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                          {m.sender === 'Admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                          {m.sender === 'Admin' ? `${m.senderName || 'WebRunzo Admin'} (You)` : `${activeTicket.clientName} (Client)`}
                        </span>
                        <span className="text-slate-500 font-mono">{m.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{m.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-500">
                    No replies sent yet. Use the response box below to message the client.
                  </div>
                )}
              </div>

              {/* Admin Reply Input */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="Type your response to the client (will appear in their customer portal)..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Sending response will notify customer and update status to In Progress.
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Response</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="m-auto text-center text-xs text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
              <div>Select a query or assistance request from the list to review.</div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
