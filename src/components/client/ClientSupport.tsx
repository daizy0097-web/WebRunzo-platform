import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAgentAvailability } from '../../utils/agentAvailability';
import { 
  LifeBuoy, 
  PhoneCall, 
  Send, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare,
  HelpCircle,
  FileQuestion,
  User,
  Plus
} from 'lucide-react';

export const ClientSupport: React.FC = () => {
  const { currentClientCustomer, isPremiumClient, settings, tickets, addTicket, addToast } = useApp();
  const availability = useAgentAvailability(settings);

  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'VIP Urgent (2h SLA)'>('Normal');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const customer = currentClientCustomer;
  const isVip = isPremiumClient || customer?.clientTier === 'premium';

  const myTickets = tickets.filter((t) => t.customerId === customer?.id);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message || !customer) return;

    addTicket({
      customerId: customer.id,
      clientName: customer.name,
      businessName: customer.businessName,
      subject,
      category: isVip ? 'VIP Priority Request' : 'Content & Text',
      priority: isVip ? 'VIP Urgent (2h SLA)' : priority,
      status: 'Open',
      message: message,
      clientTier: customer.clientTier,
    });

    setSubmitted(true);
    addToast('success', 'Ticket Dispatched', isVip ? 'Your VIP 2-Hour SLA Ticket has been escalated.' : 'Support ticket submitted to Webrunzo engineering.');
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Webrunzo Support, I am ${customer?.name} from ${customer?.businessName} (${customer?.websiteUrl}). I need help with my website.`
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className={`p-6 rounded-3xl border ${
        isVip ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30' : 'bg-slate-950/80 border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                isVip ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {isVip ? 'VIP PRIORITY QUEUE' : 'STANDARD CLIENT QUEUE'}
              </span>
              <span className="text-xs text-slate-400">Response SLA: {isVip ? 'Under 2 Hours' : 'Under 24 Hours'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Dedicated Support & Webmaster Concierge
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Direct line to Webrunzo senior engineers for content modifications, banner changes, copy updates, and technical maintenance.
            </p>
          </div>

          <div className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 ${availability.badgeBg} ${availability.badgeText} ${availability.badgeBorder}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${availability.dotColor} ${availability.dotPulse ? 'animate-pulse' : ''}`}></span>
            <span>Agent Availability: {availability.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Direct Channels & Assigned Engineer */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* WhatsApp Direct */}
          <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 p-6 rounded-3xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Instant WhatsApp Concierge</h3>
                  <div className="text-[11px] text-emerald-400 font-semibold">{isVip ? 'VIP Direct Access' : 'Dedicated Webmaster Chat'}</div>
                </div>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${availability.badgeBg} ${availability.badgeText} ${availability.badgeBorder} flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${availability.dotColor} ${availability.dotPulse ? 'animate-pulse' : ''}`}></span>
                {availability.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connect directly with our engineering team on WhatsApp. Send photos, text copy, or voice notes for rapid updates.
            </p>

            <div className="text-[11px] text-slate-400 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Business Hours:
                </span>
                <span className="font-mono text-emerald-400">{availability.hoursSummary}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Status: {availability.statusMessage}
              </div>
            </div>

            <a
              href={`https://wa.me/${settings.whatsAppNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                availability.status === 'Online'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : availability.status === 'Away'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/40'
                  : 'bg-slate-800 hover:bg-slate-700 shadow-slate-950/40'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Open WhatsApp Chat ({availability.status})</span>
            </a>
          </div>

          {/* Assigned Specialist Card */}
          <div className="bg-slate-950/90 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Assigned Webmaster & Engineer
            </h4>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-base border border-indigo-500/30">
                WO
              </div>
              <div>
                <div className="font-bold text-sm text-white">Webrunzo Operations Lead</div>
                <div className="text-xs text-slate-400">Senior Web Architect</div>
                <div className={`text-[10px] flex items-center gap-1.5 mt-0.5 font-semibold ${availability.badgeText}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${availability.dotColor} ${availability.dotPulse ? 'animate-pulse' : ''}`}></span>
                  <span>{availability.status} • {availability.statusMessage}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Support Email:</span>
                <span className="font-mono text-white">{settings.supportEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Response:</span>
                <span className="text-emerald-400 font-semibold">{isVip ? '< 2 Hours (VIP SLA)' : '< 24 Hours'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Submit Support / Revision Ticket + History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-950/90 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <span>Submit a Website Update or Support Request</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Describe the changes you want (new phone number, new team photos, revised pricing, or troubleshooting).
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm text-white">Ticket Successfully Submitted</h4>
                <p className="text-xs text-emerald-200/80 max-w-sm mx-auto">
                  Your request has been logged and assigned. Our engineering team is deploying the requested changes.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setSubject('');
                    setMessage('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject / Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Update business hours on homepage"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {!isVip && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    >
                      <option value="Normal">Normal Request</option>
                      <option value="High">High (Urgent Content Change)</option>
                      <option value="Urgent">Critical Outage</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Details & Change Instructions</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Please specify which pages, text, or elements need updating..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    isVip 
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' 
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Request to Webrunzo</span>
                </button>
              </form>
            )}
          </div>

          {/* Ticket History */}
          {myTickets.length > 0 && (
            <div className="bg-slate-950/90 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>My Active Support Tickets ({myTickets.length})</span>
              </h4>

              <div className="space-y-3">
                {myTickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{t.subject}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        t.status === 'Open' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      {/* Initial Ticket Message */}
                      <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-slate-300">
                        <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                          <span className="text-indigo-400">You ({t.clientName})</span>
                          <span className="text-slate-500 font-mono">{t.createdAt}</span>
                        </div>
                        <p className="leading-relaxed">{t.message}</p>
                      </div>

                      {/* Thread Replies */}
                      {(t.replies || []).map((m, idx) => (
                        <div
                          key={m.id || idx}
                          className={`p-2.5 rounded-xl ${
                            m.sender === 'Client'
                              ? 'bg-indigo-950/30 border border-indigo-500/20 text-slate-300'
                              : 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                            <span className={m.sender === 'Client' ? 'text-indigo-400' : 'text-emerald-400'}>
                              {m.sender === 'Client' ? 'You' : m.senderName || 'WebRunzo Support'}
                            </span>
                            <span className="text-slate-500 font-mono">{m.timestamp}</span>
                          </div>
                          <p className="leading-relaxed">{m.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
