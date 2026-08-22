import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { 
  Users, 
  UserCheck, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Globe, 
  AlertTriangle, 
  Activity, 
  ArrowUpRight, 
  Sparkles, 
  Plus, 
  Inbox, 
  Layout, 
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    customers, 
    orders,
    tickets,
    payments, 
    enquiries, 
    activityLogs, 
    templates, 
    backups,
    settings,
    setAdminTab, 
    setSelectedCustomerIdForAdmin,
    openPreviewModal 
  } = useApp();

  const now = new Date();

  // Metrics calculations requested:
  // 1. Total clients
  const totalClients = customers.length;
  
  // 2. New orders
  const newOrders = orders.filter((o) => o.status === 'New').length;
  
  // 3. Pending orders
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'Pending' || o.status === 'New').length;
  
  // 4. In-progress orders
  const inProgressOrders = orders.filter((o) => o.status === 'In Progress' || o.status === 'Review').length;
  
  // 5. Completed orders
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;
  
  // 6. Active websites
  const activeWebsites = customers.filter((c) => c.websiteStatus === 'Live').length;
  
  // 7. Expiring websites (<30 days)
  const expiringWebsites = customers.filter((c) => {
    if (!c.planExpiryDate) return false;
    const diffDays = (new Date(c.planExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 30;
  }).length;
  
  // 8. Expired websites
  const expiredWebsites = customers.filter((c) => {
    if (!c.planExpiryDate) return false;
    const diffDays = (new Date(c.planExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays < 0;
  }).length;
  
  // 9. Revenue
  const totalRevenue = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  // 10. Pending payments
  const pendingPaymentsCount = payments.filter((p) => p.status === 'Pending').length;
  const pendingPaymentsAmount = payments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  // VIP clients
  const vipClients = customers.filter((c) => c.clientTier === 'premium').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Owner Command Center
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time management for Webrunzo: websites, turnkey orders, client tiers, billing, and leads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAdminTab('backups')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Backups ({backups.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('orders')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('enquiries')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition cursor-pointer"
          >
            <Inbox className="w-4 h-4 text-emerald-400" />
            <span>Inquiries ({enquiries.filter((e) => e.status === 'New').length})</span>
          </button>
          
          <button
            onClick={() => {
              setSelectedCustomerIdForAdmin(null);
              setAdminTab('customers');
            }}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid (10 Explicit Metric Cards) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>Core Operational Metrics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {/* 1. Total Clients */}
          <div 
            onClick={() => setAdminTab('customers')}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-1.5 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">Total Clients</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">{totalClients}</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="text-amber-400 font-semibold">{vipClients} VIP</span> • {totalClients - vipClients} Normal
            </div>
          </div>

          {/* 2. New Orders */}
          <div 
            onClick={() => setAdminTab('orders')}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-1.5 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">New Orders</span>
              <ShoppingBag className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-blue-400 font-mono">{newOrders}</div>
            <div className="text-[10px] text-slate-400">Awaiting kick-off</div>
          </div>

          {/* 3. In-Progress Orders */}
          <div 
            onClick={() => setAdminTab('orders')}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-1.5 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">In Progress</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">{inProgressOrders}</div>
            <div className="text-[10px] text-slate-400">In design & review</div>
          </div>

          {/* 4. Completed Orders */}
          <div 
            onClick={() => setAdminTab('orders')}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-1.5 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">{completedOrders}</div>
            <div className="text-[10px] text-slate-400">Turnkey delivered</div>
          </div>

          {/* 5. Active Websites */}
          <div 
            onClick={() => setAdminTab('websites')}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-1.5 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">Active Sites</span>
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">{activeWebsites}</div>
            <div className="text-[10px] text-slate-400">100% online</div>
          </div>

          {/* 6. Expiring Websites */}
          <div 
            onClick={() => setAdminTab('subscriptions')}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-1.5 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">Expiring &lt;30d</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">{expiringWebsites}</div>
            <div className="text-[10px] text-slate-400">Upcoming renewals</div>
          </div>

          {/* 7. Expired Websites */}
          <div 
            onClick={() => setAdminTab('subscriptions')}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-1.5 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">Expired</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-400 font-mono">{expiredWebsites}</div>
            <div className="text-[10px] text-slate-400">Requires follow-up</div>
          </div>

          {/* 8. Total Revenue */}
          <div 
            onClick={() => setAdminTab('payments')}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-1.5 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">Collected Rev</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">{formatINR(totalRevenue, settings?.currencySymbol)}</div>
            <div className="text-[10px] text-slate-400">Verified receipts</div>
          </div>

          {/* 9. Pending Payments */}
          <div 
            onClick={() => setAdminTab('payments')}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-1.5 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">Pending Pay</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">{pendingPaymentsCount}</div>
            <div className="text-[10px] text-slate-400">{formatINR(pendingPaymentsAmount, settings?.currencySymbol)} outstanding</div>
          </div>

          {/* 10. Open Support Tickets */}
          <div 
            onClick={() => setAdminTab('enquiries')}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-1.5 cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">Tickets & Inq</span>
              <HelpCircle className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-purple-400 font-mono">{tickets.length + enquiries.length}</div>
            <div className="text-[10px] text-slate-400">Active client threads</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Orders & Real-time Live Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Turnkey Orders */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Website Orders</h2>
            </div>
            <button
              onClick={() => setAdminTab('orders')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({orders.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 4).map((ord) => (
              <div
                key={ord.id}
                onClick={() => setAdminTab('orders')}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-white px-1.5 py-0.5 rounded bg-slate-800">
                      {ord.orderNumber}
                    </span>
                    <span className="font-bold text-xs text-white">{ord.businessName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>{ord.clientName}</span>
                    <span>•</span>
                    <span className="text-slate-300">Due: {ord.deliveryDueDate}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    ord.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    ord.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {ord.status}
                  </span>
                  <div className="font-mono font-bold text-xs text-emerald-400 mt-1">
                    {formatINR(ord.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Client Sites Quick Roster */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Websites Directory</h2>
            </div>
            <button
              onClick={() => setAdminTab('websites')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Infrastructure</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {customers.slice(0, 4).map((c) => {
              const tpl = templates.find((t) => t.id === c.templateId) || templates[0];
              return (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">{c.businessName}</span>
                      {c.clientTier === 'premium' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-indigo-400 truncate mt-0.5">
                      {c.customDomain ? `https://${c.customDomain}` : c.websiteUrl}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openPreviewModal(tpl, c)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition cursor-pointer"
                    >
                      Simulate
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCustomerIdForAdmin(c.id);
                        setAdminTab('customer-profile');
                      }}
                      className="p-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Activity Log Feed */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">System Operations Audit Log</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">{activityLogs.length} events recorded</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {activityLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">{log.title}</div>
                  <div className="text-[11px] text-slate-400">{log.description}</div>
                </div>
              </div>
              <div className="text-right shrink-0 text-[10px] text-slate-500 font-mono">
                <div>{log.timestamp}</div>
                <div className="text-slate-400">{log.user}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
