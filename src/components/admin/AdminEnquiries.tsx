import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Enquiry, EnquiryStatus } from '../../types';
import { 
  Inbox, 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  UserPlus, 
  ArrowRight,
  Clock,
  CheckCheck
} from 'lucide-react';

export const AdminEnquiries: React.FC = () => {
  const { 
    enquiries, 
    updateEnquiryStatus, 
    convertEnquiryToCustomer, 
    templates, 
    plans,
    setSelectedCustomerIdForAdmin,
    setAdminTab
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'All'>('All');

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleConvert = (enquiryId: string) => {
    const newCustomer = convertEnquiryToCustomer(enquiryId);
    if (newCustomer) {
      setSelectedCustomerIdForAdmin(newCustomer.id);
      setAdminTab('customer-profile');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Lead Inquiries & Intake Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submissions captured from the public WebRunzo website and WhatsApp widget.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {enquiries.filter((e) => e.status === 'New').length} New Submissions
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search enquiries by lead, company, email, or requirements..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            {(['All', 'New', 'Contacted', 'Converted', 'Closed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st} ({st === 'All' ? enquiries.length : enquiries.filter((e) => e.status === st).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enquiries Card Grid */}
      <div className="space-y-4">
        {filteredEnquiries.length === 0 ? (
          <div className="bg-slate-900/80 p-12 rounded-3xl border border-slate-800 text-center text-slate-500 text-xs">
            No inquiries match the selected criteria.
          </div>
        ) : (
          filteredEnquiries.map((enq) => {
            const template = templates.find((t) => t.id === enq.templateId);
            const plan = plans.find((p) => p.id === enq.planId);

            return (
              <div
                key={enq.id}
                className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">
                      {enq.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{enq.business}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          enq.status === 'New' ? 'bg-rose-500/20 text-rose-400 animate-pulse' :
                          enq.status === 'Contacted' ? 'bg-amber-500/20 text-amber-400' :
                          enq.status === 'Converted' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {enq.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">Lead Contact: <strong className="text-slate-300">{enq.name}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{enq.date}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="text-slate-500 font-semibold uppercase text-[10px]">Contact Coordinates</div>
                    <div className="text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{enq.email}</span>
                    </div>
                    <div className="text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{enq.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-500 font-semibold uppercase text-[10px]">Requested Selection</div>
                    <div className="text-slate-300">
                      Template: <strong className="text-white">{template?.name || 'Custom / Not specified'}</strong>
                    </div>
                    <div className="text-slate-300">
                      Plan: <strong className="text-white">{plan?.name || 'Standard Pro'}</strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-500 font-semibold uppercase text-[10px]">Intake Status & Action</div>
                    <div className="flex items-center gap-2">
                      <select
                        value={enq.status}
                        onChange={(e) => updateEnquiryStatus(enq.id, e.target.value as EnquiryStatus)}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs focus:outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>

                      {enq.status !== 'Converted' && (
                        <button
                          onClick={() => handleConvert(enq.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Convert to Client Account</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[10px] uppercase">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Project Description / Message</span>
                  </div>
                  <p className="leading-relaxed">{enq.message}</p>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
