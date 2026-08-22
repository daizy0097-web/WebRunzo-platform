import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LifeBuoy, 
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
  PhoneCall
} from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const { tickets, updateTicketStatus, addTicketMessage, addToast } = useApp();
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesSearch = 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    addTicketMessage(activeTicket.id, {
      sender: 'staff',
      text: replyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setReplyText('');
    addToast('success', 'Reply Sent', `Response dispatched to ${activeTicket.clientName}.`);
  };

  const handleStatusChange = (status: 'Open' | 'In Progress' | 'Resolved') => {
    if (!activeTicket) return;
    updateTicketStatus(activeTicket.id, status);
    addToast('info', 'Status Updated', `Ticket #${activeTicket.id} marked as ${status}.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Client Support & Webmaster Concierge Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Resolve revision tickets, content change requests, and triage VIP priority SLA tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
            {tickets.filter((t) => t.status === 'Open').length} Open Tickets
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
            {tickets.filter((t) => t.priority === 'Urgent').length} VIP SLA
          </span>
        </div>
      </div>

      {/* Main Grid: Ticket List + Conversation Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        
        {/* Left: Ticket List */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 p-4 space-y-3 flex flex-col">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tickets, clients, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    statusFilter === st ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No tickets matching criteria.
              </div>
            ) : (
              filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer space-y-2 ${
                    activeTicket?.id === t.id
                      ? 'bg-slate-800 border-indigo-500/80 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {t.clientTier === 'premium' && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> VIP
                        </span>
                      )}
                      <span className="font-bold text-white text-xs truncate">{t.businessName}</span>
                    </div>

                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                      t.status === 'Open' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      t.status === 'In Progress' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-200 font-medium truncate">
                    {t.subject}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{t.clientName}</span>
                    <span className="font-mono">{t.messages[t.messages.length - 1]?.timestamp}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Ticket Thread */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-4">
          {activeTicket ? (
            <>
              {/* Ticket Meta Header */}
              <div className="pb-4 border-b border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-white">{activeTicket.subject}</h2>
                      {activeTicket.clientTier === 'premium' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          VIP 2-Hour SLA
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Client: <span className="text-white font-semibold">{activeTicket.clientName}</span> ({activeTicket.businessName}) • {activeTicket.email}
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStatusChange('Open')}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        activeTicket.status === 'Open' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleStatusChange('In Progress')}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        activeTicket.status === 'In Progress' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange('Resolved')}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        activeTicket.status === 'Resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto space-y-3 py-2 max-h-[350px]">
                {activeTicket.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                      m.sender === 'staff'
                        ? 'bg-emerald-950/40 border border-emerald-500/30 ml-8 text-emerald-100'
                        : 'bg-slate-950 border border-slate-800 mr-8 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`font-bold ${m.sender === 'staff' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {m.sender === 'staff' ? 'Webrunzo Webmaster (You)' : `${activeTicket.clientName} (Client)`}
                      </span>
                      <span className="text-slate-500 font-mono">{m.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 space-y-2">
                <textarea
                  rows={3}
                  required
                  placeholder="Type your response to the client..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Response will notify client in their portal.</span>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="m-auto text-center text-xs text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
              <div>Select a ticket to inspect conversation history and respond.</div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
