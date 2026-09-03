import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell, 
  ShoppingBag, 
  Inbox, 
  LifeBuoy, 
  Activity, 
  Check, 
  CheckCheck, 
  X, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  CreditCard, 
  Users, 
  Globe, 
  HardDrive,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp, AdminTab } from '../../context/AppContext';
import { Order, Enquiry, SupportTicket, ActivityLog } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminNotificationCenter: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    orders, 
    enquiries, 
    tickets, 
    activityLogs, 
    setAdminTab, 
    setSelectedCustomerIdForAdmin,
    customers
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'enquiries' | 'tickets' | 'logs'>('all');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter pending items
  const newOrders = orders.filter((o) => o.status === 'New' && !dismissedAlerts.has(`ord-${o.id}`));
  const newEnquiries = enquiries.filter((e) => e.status === 'New' && !dismissedAlerts.has(`enq-${e.id}`));
  const openTickets = tickets.filter(
    (t) => t.status !== 'Resolved' && t.status !== 'Closed' && !dismissedAlerts.has(`tkt-${t.id}`)
  );
  const recentLogs = activityLogs.slice(0, 15);

  const totalUnreadCount = newOrders.length + newEnquiries.length + openTickets.length;

  const handleDismissAll = () => {
    const newDismissed = new Set(dismissedAlerts);
    newOrders.forEach((o) => newDismissed.add(`ord-${o.id}`));
    newEnquiries.forEach((e) => newDismissed.add(`enq-${e.id}`));
    openTickets.forEach((t) => newDismissed.add(`tkt-${t.id}`));
    setDismissedAlerts(newDismissed);
  };

  const handleNavigate = (tab: AdminTab, customerId?: string) => {
    if (customerId) {
      setSelectedCustomerIdForAdmin(customerId);
    }
    setAdminTab(tab);
    onClose();
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />;
      case 'enquiry':
        return <Inbox className="w-3.5 h-3.5 text-amber-400" />;
      case 'payment':
        return <CreditCard className="w-3.5 h-3.5 text-purple-400" />;
      case 'customer':
        return <Users className="w-3.5 h-3.5 text-sky-400" />;
      case 'backup':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'storage':
        return <HardDrive className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 sm:hidden"
        onClick={onClose}
      />

      {/* Popover Dropdown Card */}
      <div
        ref={popoverRef}
        className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-12 w-[calc(100vw-24px)] sm:w-[440px] max-h-[85vh] bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">Admin Operations Center</h3>
                {totalUnreadCount > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {totalUnreadCount} Action{totalUnreadCount > 1 ? 's' : ''} Needed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Aggregated alerts for orders, sales leads & support tickets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {totalUnreadCount > 0 && (
              <button
                id="btn-admin-dismiss-all"
                type="button"
                onClick={handleDismissAll}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-md hover:bg-emerald-950/40 flex items-center gap-1 transition cursor-pointer"
                title="Mark all alerts as viewed"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark viewed</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-3 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto bg-slate-950/30 text-[11px]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>All Alerts</span>
            {totalUnreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] px-1 rounded-full font-black">
                {totalUnreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Orders ({newOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'enquiries'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Inbox className="w-3 h-3" />
            <span>Leads ({newEnquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'tickets'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <LifeBuoy className="w-3 h-3" />
            <span>Support ({openTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Audit Logs</span>
          </button>
        </div>

        {/* Alerts Content Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[420px]">
          {/* TAB: ORDERS */}
          {(activeTab === 'orders' || (activeTab === 'all' && newOrders.length > 0)) && (
            <div>
              {activeTab === 'all' && (
                <div className="px-4 py-2 bg-slate-950/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <ShoppingBag className="w-3 h-3" /> New Customer Orders ({newOrders.length})
                  </span>
                  <button 
                    onClick={() => handleNavigate('orders')} 
                    className="hover:text-white flex items-center gap-0.5 text-slate-500"
                  >
                    <span>View all orders</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              {newOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No new pending orders to review.
                </div>
              ) : (
                newOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => handleNavigate('orders', ord.customerId)}
                    className="p-3.5 hover:bg-slate-800/50 transition cursor-pointer flex gap-3 group relative bg-emerald-950/10"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 mt-0.5">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-white truncate">
                          {ord.businessName} • {ord.clientName}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-extrabold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          ${ord.amount}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        New website order <span className="font-mono text-indigo-300">{ord.orderNumber}</span> received with delivery target {ord.deliveryDueDate}.
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTimestamp(ord.date)}
                        </span>
                        <span className="text-emerald-400 font-semibold group-hover:underline flex items-center gap-0.5">
                          <span>Open Order Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: ENQUIRIES */}
          {(activeTab === 'enquiries' || (activeTab === 'all' && newEnquiries.length > 0)) && (
            <div>
              {activeTab === 'all' && (
                <div className="px-4 py-2 bg-slate-950/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Inbox className="w-3 h-3" /> New Inbound Leads ({newEnquiries.length})
                  </span>
                  <button 
                    onClick={() => handleNavigate('enquiries')} 
                    className="hover:text-white flex items-center gap-0.5 text-slate-500"
                  >
                    <span>View all leads</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              {newEnquiries.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No new sales leads in queue.
                </div>
              ) : (
                newEnquiries.map((enq) => (
                  <div
                    key={enq.id}
                    onClick={() => handleNavigate('enquiries')}
                    className="p-3.5 hover:bg-slate-800/50 transition cursor-pointer flex gap-3 group relative bg-amber-950/10"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-white truncate">
                          {enq.name} ({enq.business})
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                          New Lead
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        &quot;{enq.message || 'Interested in WebRunzo managed plan.'}&quot;
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTimestamp(enq.date)}
                        </span>
                        <span className="text-amber-400 font-semibold group-hover:underline flex items-center gap-0.5">
                          <span>Respond / Convert</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: TICKETS */}
          {(activeTab === 'tickets' || (activeTab === 'all' && openTickets.length > 0)) && (
            <div>
              {activeTab === 'all' && (
                <div className="px-4 py-2 bg-slate-950/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <LifeBuoy className="w-3 h-3" /> Active Support Queries ({openTickets.length})
                  </span>
                  <button 
                    onClick={() => handleNavigate('support')} 
                    className="hover:text-white flex items-center gap-0.5 text-slate-500"
                  >
                    <span>View all queries</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              {openTickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  All support queries resolved.
                </div>
              ) : (
                openTickets.map((tkt) => (
                  <div
                    key={tkt.id}
                    onClick={() => handleNavigate('support', tkt.customerId)}
                    className="p-3.5 hover:bg-slate-800/50 transition cursor-pointer flex gap-3 group relative bg-sky-950/10"
                  >
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30 mt-0.5">
                      <LifeBuoy className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-white truncate">
                          {tkt.subject}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          tkt.priority === 'Urgent' 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : tkt.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {tkt.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">
                        From <strong className="text-slate-200">{tkt.customerName}</strong> ({tkt.businessName}) • {tkt.messages.length} message{tkt.messages.length > 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTimestamp(tkt.updatedAt || tkt.createdAt)}
                        </span>
                        <span className="text-sky-400 font-semibold group-hover:underline flex items-center gap-0.5">
                          <span>Open Ticket Chat</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: AUDIT LOGS */}
          {(activeTab === 'logs' || (activeTab === 'all' && totalUnreadCount === 0)) && (
            <div>
              {activeTab === 'all' && (
                <div className="p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-white">All Operational Queues Clear!</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    No unread orders, pending leads, or open tickets. Recent platform activity is shown below:
                  </p>
                </div>
              )}

              <div className="px-4 py-2 bg-slate-950/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Recent Platform Activity Logs
              </div>

              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => {
                    if (log.type === 'backup') handleNavigate('backups');
                    else if (log.type === 'order') handleNavigate('orders', log.customerId);
                    else if (log.type === 'payment') handleNavigate('payments');
                    else if (log.type === 'customer') handleNavigate('customers', log.customerId);
                    else if (log.type === 'enquiry') handleNavigate('enquiries');
                  }}
                  className="p-3 hover:bg-slate-800/40 transition cursor-pointer flex gap-3 text-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/80 mt-0.5">
                    {getActivityIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-200 text-[11px] truncate">
                        {log.title}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {log.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Quick Hub */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigate('customers')}
              className="hover:text-white transition cursor-pointer"
            >
              Clients
            </button>
            <span>•</span>
            <button
              onClick={() => handleNavigate('backups')}
              className="hover:text-white transition cursor-pointer"
            >
              Backups
            </button>
            <span>•</span>
            <button
              onClick={() => handleNavigate('settings')}
              className="hover:text-white transition cursor-pointer"
            >
              Settings
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            WebRunzo Enterprise Cloud
          </div>
        </div>
      </div>
    </>
  );
};
