import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { QueryStatus, LeadTrackingStatus, SupportTicket } from '../../types';
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
  Paperclip, 
  Calendar, 
  Mail, 
  ShieldCheck, 
  ExternalLink,
  Tag,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Check,
  Link as LinkIcon
} from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const { 
    tickets, 
    plans, 
    customers, 
    updateTicketStatus, 
    updateTicketPriority,
    updateTicketLeadTracking, 
    updateTicketAdminNotes,
    linkTicketCustomer,
    replyToTicket, 
    setSelectedCustomerIdForAdmin,
    setAdminTab,
    refreshData,
    isLoadingData,
    session,
    addToast 
  } = useApp();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [replyAttachmentName, setReplyAttachmentName] = useState('');
  const [responderName, setResponderName] = useState(session?.name ? `${session.name} (WebRunzo Staff)` : 'Alex Chen (VIP Lead Webmaster)');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Free Query' | 'Premium Assistance'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | QueryStatus | 'Active'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'VIP Urgent (2h SLA)' | 'High' | 'Normal'>('All');
  const [leadTrackingFilter, setLeadTrackingFilter] = useState<'All' | LeadTrackingStatus>('All');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Keep responderName updated when admin session loads
  useEffect(() => {
    if (session?.name && responderName === 'Alex Chen (VIP Lead Webmaster)') {
      setResponderName(`${session.name} (WebRunzo Staff)`);
    }
  }, [session?.name]);

  const filteredTickets = tickets.filter((t) => {
    const isPremium = t.queryType === 'Premium Assistance' || t.clientTier === 'premium';
    const computedQueryType = t.queryType || (isPremium ? 'Premium Assistance' : 'Free Query');

    const matchesType = typeFilter === 'All' || computedQueryType === typeFilter;
    const matchesStatus = 
      statusFilter === 'All' 
        ? true 
        : statusFilter === 'Active'
        ? t.status !== 'Resolved' && t.status !== 'Closed'
        : t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || (t.priority || 'Normal') === priorityFilter;
    const matchesLead = leadTrackingFilter === 'All' || (t.leadTrackingStatus || 'Assistance Request') === leadTrackingFilter;

    const matchesSearch = 
      (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.requestType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.priority || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.message || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesPriority && matchesLead && matchesSearch;
  });

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0];

  // Auto-sync notes whenever active ticket changes
  useEffect(() => {
    if (activeTicket) {
      setAdminNoteInput(activeTicket.adminNotes || '');
    }
  }, [activeTicket?.id]);

  // Robust customer matching by ID or email
  const activeTicketCustomer = customers.find(
    (c) => c.id === activeTicket?.customerId || (activeTicket?.email && c.email?.toLowerCase() === activeTicket.email.toLowerCase())
  );
  const activeTicketPlan = plans.find((p) => p.id === activeTicket?.planId || p.id === activeTicketCustomer?.planId);

  const isCurrentPremium = activeTicket?.queryType === 'Premium Assistance' || activeTicket?.clientTier === 'premium';

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      replyToTicket(
        activeTicket.id,
        replyText.trim(),
        'Admin',
        responderName.trim() || 'Alex Chen (VIP Lead Webmaster)',
        replyAttachmentName.trim() || undefined
      );

      setReplyText('');
      setReplyAttachmentName('');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleStatusChange = (status: QueryStatus) => {
    if (!activeTicket) return;
    updateTicketStatus(activeTicket.id, status);
  };

  const handlePriorityChange = (priority: string) => {
    if (!activeTicket) return;
    updateTicketPriority(activeTicket.id, priority);
  };

  const handleLeadTrackingChange = (status: LeadTrackingStatus) => {
    if (!activeTicket) return;
    updateTicketLeadTracking(activeTicket.id, status, adminNoteInput || activeTicket.adminNotes);
  };

  const handleSaveAdminNotes = () => {
    if (!activeTicket) return;
    updateTicketAdminNotes(activeTicket.id, adminNoteInput);
  };

  const handleLinkCustomer = () => {
    if (!activeTicket || !activeTicketCustomer) return;
    linkTicketCustomer(activeTicket.id, activeTicketCustomer.id);
  };

  const handleViewCustomerProfile = (customerId: string) => {
    setSelectedCustomerIdForAdmin(customerId);
    setAdminTab('customer-profile');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData('admin');
      addToast('info', 'Queue Refreshed', 'Support tickets and message threads synchronized.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setStatusFilter('All');
    setPriorityFilter('All');
    setLeadTrackingFilter('All');
  };

  const isFilterActive = 
    searchQuery !== '' || 
    typeFilter !== 'All' || 
    statusFilter !== 'All' || 
    priorityFilter !== 'All' || 
    leadTrackingFilter !== 'All';

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

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'VIP Urgent (2h SLA)':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-black';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
      case 'Normal':
      default:
        return 'bg-slate-800/80 text-slate-400 border-slate-700';
    }
  };

  const totalPremiumQueries = tickets.filter((t) => t.queryType === 'Premium Assistance' || t.clientTier === 'premium').length;
  const totalFreeQueries = tickets.filter((t) => t.queryType !== 'Premium Assistance' && t.clientTier !== 'premium').length;
  const activeQueriesCount = tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length;
  const scopeFlaggedCount = tickets.filter((t) => t.leadTrackingStatus === 'Custom Work Required' || t.leadTrackingStatus === 'Additional Payment Required').length;
  const urgentCount = tickets.filter((t) => t.priority === 'VIP Urgent (2h SLA)').length;

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
            Manage Free Customer Queries, triage VIP Premium Assistance requests, resolve SLAs, and track lead conversion scopes.
          </p>
        </div>

        {/* Metric Badges with Interactive Click-to-Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Queue Toggle */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Active' ? 'All' : 'Active')}
            className={`px-3.5 py-2 rounded-2xl border text-xs text-left transition cursor-pointer ${
              statusFilter === 'Active'
                ? 'bg-amber-950/60 border-amber-500/60 ring-2 ring-amber-500/30'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
            title="Filter by Active Queries"
          >
            <div className="text-[10px] text-slate-400 font-semibold">Active Queue</div>
            <div className="text-base font-extrabold text-amber-400 font-mono">{activeQueriesCount}</div>
          </button>

          {/* Premium VIP Toggle */}
          <button
            type="button"
            onClick={() => setTypeFilter(typeFilter === 'Premium Assistance' ? 'All' : 'Premium Assistance')}
            className={`px-3.5 py-2 rounded-2xl border text-xs text-left transition cursor-pointer ${
              typeFilter === 'Premium Assistance'
                ? 'bg-amber-950/80 border-amber-500/70 ring-2 ring-amber-500/30'
                : 'bg-amber-950/40 border-amber-500/30 hover:border-amber-500/50'
            }`}
            title="Filter by VIP Premium Assistance"
          >
            <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Premium VIP
            </div>
            <div className="text-base font-extrabold text-amber-300 font-mono">{totalPremiumQueries}</div>
          </button>

          {/* Free Queries Toggle */}
          <button
            type="button"
            onClick={() => setTypeFilter(typeFilter === 'Free Query' ? 'All' : 'Free Query')}
            className={`px-3.5 py-2 rounded-2xl border text-xs text-left transition cursor-pointer ${
              typeFilter === 'Free Query'
                ? 'bg-indigo-950/80 border-indigo-500/70 ring-2 ring-indigo-500/30'
                : 'bg-indigo-950/40 border-indigo-500/30 hover:border-indigo-500/50'
            }`}
            title="Filter by Free Queries"
          >
            <div className="text-[10px] text-indigo-300 font-semibold">Free Queries</div>
            <div className="text-base font-extrabold text-indigo-300 font-mono">{totalFreeQueries}</div>
          </button>

          {/* Custom Work Scope Flag */}
          {scopeFlaggedCount > 0 && (
            <button
              type="button"
              onClick={() => setLeadTrackingFilter(leadTrackingFilter === 'Custom Work Required' ? 'All' : 'Custom Work Required')}
              className={`px-3.5 py-2 rounded-2xl border text-xs text-left transition cursor-pointer ${
                leadTrackingFilter === 'Custom Work Required'
                  ? 'bg-rose-950/80 border-rose-500/70 ring-2 ring-rose-500/30'
                  : 'bg-rose-950/40 border-rose-500/30 hover:border-rose-500/50'
              }`}
              title="Filter by Custom Work Scope"
            >
              <div className="text-[10px] text-rose-300 font-semibold flex items-center gap-1">
                <Tag className="w-3 h-3 text-rose-400" /> Custom Scope
              </div>
              <div className="text-base font-extrabold text-rose-400 font-mono">{scopeFlaggedCount}</div>
            </button>
          )}

          {/* Urgent SLA Flag */}
          {urgentCount > 0 && (
            <button
              type="button"
              onClick={() => setPriorityFilter(priorityFilter === 'VIP Urgent (2h SLA)' ? 'All' : 'VIP Urgent (2h SLA)')}
              className={`px-3.5 py-2 rounded-2xl border text-xs text-left transition cursor-pointer ${
                priorityFilter === 'VIP Urgent (2h SLA)'
                  ? 'bg-red-950/80 border-red-500/70 ring-2 ring-red-500/30'
                  : 'bg-red-950/40 border-red-500/30 hover:border-red-500/50'
              }`}
              title="Filter by Urgent SLA"
            >
              <div className="text-[10px] text-red-300 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-400" /> Urgent SLA
              </div>
              <div className="text-base font-extrabold text-red-400 font-mono">{urgentCount}</div>
            </button>
          )}

          {/* Refresh Queue Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer disabled:opacity-50"
            title="Refresh Support Queue"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
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
              placeholder="Search by client, ticket ID, subject, or SLA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white text-xs cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
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
          <div className="flex flex-wrap items-center gap-1 text-[10px]">
            {(['All', 'Active', 'New', 'In Review', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed'] as const).map((st) => (
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

          {/* Priority Sub-Filters & Lead Scope Filters */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-slate-500 font-semibold shrink-0">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] rounded-lg px-2 py-0.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Priorities</option>
                <option value="VIP Urgent (2h SLA)">🔥 Urgent (2h SLA)</option>
                <option value="High">⚠️ High Priority</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
              <span className="text-slate-500 font-semibold shrink-0">Lead Scope:</span>
              <select
                value={leadTrackingFilter}
                onChange={(e) => setLeadTrackingFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] rounded-lg px-2 py-0.5 focus:outline-none focus:border-indigo-500 max-w-[120px] truncate"
              >
                <option value="All">All Scopes</option>
                <option value="Assistance Request">Assistance Request</option>
                <option value="Custom Work Required">Custom Work Required</option>
                <option value="Additional Payment Required">Add-on Quote</option>
                <option value="Converted to Lead">Converted to Lead</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Active Filter Reset Indicator */}
          {isFilterActive && (
            <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
              <span className="text-slate-400">
                Showing {filteredTickets.length} of {tickets.length} tickets
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}

          {/* Query List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[580px]">
            {isLoadingData && tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin text-indigo-400" />
                <p>Loading support queue...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-3">
                <p>No queries matching criteria.</p>
                {isFilterActive && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isPrem = t.queryType === 'Premium Assistance' || t.clientTier === 'premium';
                const isSelected = activeTicket?.id === t.id;
                const isUrgent = t.priority === 'VIP Urgent (2h SLA)';

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
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[9px] border border-amber-500/40 flex items-center gap-1 shrink-0">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> PREMIUM
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold text-[9px] border border-slate-700 shrink-0">
                            FREE QUERY
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 truncate font-semibold">
                          {t.businessName || t.clientName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isUrgent && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            2H SLA
                          </span>
                        )}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(t.status)}`}>
                          {t.status}
                        </span>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="text-xs font-bold text-white line-clamp-1">
                      {t.subject}
                    </div>

                    {/* Request Type & Meta */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {t.requestType && (
                          <span className="text-indigo-300 font-medium bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {t.requestType}
                          </span>
                        )}
                        {t.priority && t.priority !== 'Normal' && (
                          <span className={`px-1.5 py-0.5 rounded border text-[9px] ${getPriorityBadge(t.priority)}`}>
                            {t.priority}
                          </span>
                        )}
                        {t.attachmentName && (
                          <span className="flex items-center gap-0.5 text-amber-400 font-mono">
                            <Paperclip className="w-2.5 h-2.5" /> File
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-[10px] text-slate-500 shrink-0">{t.createdAt}</span>
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

                        {/* Priority Badge */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border ${getPriorityBadge(activeTicket.priority)}`}>
                          {activeTicket.priority || 'Normal Priority'}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-extrabold text-white pt-1">
                        {activeTicket.subject}
                      </h2>
                    </div>

                    {/* Quick Status Pill & Resolve/Reopen Action */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getStatusBadge(activeTicket.status)}`}>
                        {activeTicket.status}
                      </span>
                      {activeTicket.status === 'Resolved' || activeTicket.status === 'Closed' ? (
                        <button
                          type="button"
                          onClick={() => handleStatusChange('In Progress')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-[11px] font-bold rounded-lg border border-slate-700 transition cursor-pointer"
                        >
                          Reopen Ticket
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStatusChange('Resolved')}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-500/40 transition cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Meta Row with Direct Customer Profile Navigation */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-800 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <span>Client Name</span>
                        {activeTicketCustomer && (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            Linked
                          </span>
                        )}
                      </div>
                      {activeTicketCustomer ? (
                        <button
                          type="button"
                          onClick={() => handleViewCustomerProfile(activeTicketCustomer.id)}
                          className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer truncate text-left mt-0.5"
                          title={`View ${activeTicketCustomer.name}'s customer profile`}
                        >
                          <span className="truncate">{activeTicket.clientName}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </button>
                      ) : (
                        <div className="font-bold text-white truncate mt-0.5">{activeTicket.clientName}</div>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Email</div>
                      {activeTicket.email || activeTicketCustomer?.email ? (
                        <a
                          href={`mailto:${activeTicket.email || activeTicketCustomer?.email}`}
                          className="font-mono text-slate-300 text-[11px] truncate hover:text-indigo-300 block mt-0.5"
                          title="Click to email customer"
                        >
                          {activeTicket.email || activeTicketCustomer?.email}
                        </a>
                      ) : (
                        <div className="font-mono text-slate-500 text-[11px] mt-0.5">N/A</div>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Website / Project</div>
                      <div className="text-slate-300 truncate mt-0.5">{activeTicket.businessName || 'General Inquiry'}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">Submitted</div>
                      <div className="font-mono text-slate-400 text-[11px] mt-0.5">{activeTicket.createdAt}</div>
                    </div>
                  </div>

                  {/* Customer Link Suggestion if unlinked but email matched */}
                  {activeTicketCustomer && activeTicket.customerId !== activeTicketCustomer.id && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] bg-slate-900/60 p-2 rounded-xl">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Matched account: <strong>{activeTicketCustomer.name}</strong> ({activeTicketCustomer.email})</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleLinkCustomer}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition cursor-pointer"
                      >
                        Link Ticket
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Selector & Priority / SLA Controls */}
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

                  {/* Priority & SLA Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Priority & SLA Target:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { label: 'Normal', value: 'Normal' },
                        { label: '⚠️ High', value: 'High' },
                        { label: '🔥 VIP Urgent (2h SLA)', value: 'VIP Urgent (2h SLA)' }
                      ].map((pr) => (
                        <button
                          key={pr.value}
                          onClick={() => handlePriorityChange(pr.value)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                            (activeTicket.priority || 'Normal') === pr.value
                              ? pr.value === 'VIP Urgent (2h SLA)'
                                ? 'bg-rose-600 text-white shadow'
                                : pr.value === 'High'
                                ? 'bg-amber-600 text-white shadow'
                                : 'bg-slate-700 text-white'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {pr.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lead Conversion Tracking */}
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Lead Conversion & Scope Classification:</span>
                      </div>

                      <select
                        value={activeTicket.leadTrackingStatus || 'Assistance Request'}
                        onChange={(e) => handleLeadTrackingChange(e.target.value as LeadTrackingStatus)}
                        className="bg-slate-900 border border-amber-500/40 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
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
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition shrink-0"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

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
              <div className="flex-1 overflow-y-auto space-y-3 py-2 max-h-[280px]">
                {activeTicket.replies && activeTicket.replies.length > 0 ? (
                  activeTicket.replies.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
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
                      {m.attachmentName && (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono pt-1 border-t border-slate-800/60">
                          <Paperclip className="w-3 h-3" />
                          <span>Attachment: {m.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No replies sent yet. Use the response box below to message the client.
                  </div>
                )}
              </div>

              {/* Admin Reply Input */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 space-y-3">
                {/* Agent responder selector & Attachment input */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 flex-1 min-w-[200px]">
                    <span className="text-[11px] font-semibold shrink-0">Responding As:</span>
                    <input
                      type="text"
                      value={responderName}
                      onChange={(e) => setResponderName(e.target.value)}
                      placeholder="Admin Name / Role"
                      className="w-full px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 flex-1 min-w-[200px]">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={replyAttachmentName}
                      onChange={(e) => setReplyAttachmentName(e.target.value)}
                      placeholder="Attachment / Spec Ref (optional)"
                      className="w-full px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder="Type your response to the client (will appear in their customer portal and dispatch an alert)..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={isSubmittingReply}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed disabled:opacity-50"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Dispatches message to customer portal and updates status to In Progress.
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingReply || !replyText.trim()}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSubmittingReply ? 'animate-pulse' : ''}`} />
                    <span>{isSubmittingReply ? 'Sending...' : 'Send Response'}</span>
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
