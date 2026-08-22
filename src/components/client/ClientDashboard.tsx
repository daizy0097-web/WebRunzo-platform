import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { 
  Globe, 
  CreditCard, 
  Receipt, 
  LifeBuoy, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Activity, 
  FileText, 
  ArrowRight,
  Zap,
  ShoppingBag
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { 
    currentClientCustomer, 
    isPremiumClient,
    session,
    plans, 
    templates, 
    payments, 
    orders,
    tickets,
    setClientTab, 
    openPreviewModal 
  } = useApp();

  const customer = currentClientCustomer;
  const isVip = isPremiumClient || customer?.clientTier === 'premium' || session.role === 'premium_client';

  const plan = plans.find((p) => p.id === customer?.planId) || plans[1];
  const tpl = templates.find((t) => t.id === customer?.templateId) || templates[0];
  const clientPayments = payments.filter((p) => p.customerId === customer?.id || p.customerEmail === customer?.email);
  const clientOrders = orders.filter((o) => o.customerId === customer?.id || o.email === customer?.email);
  const activeOrder = clientOrders[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${
        isVip 
          ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30'
          : 'bg-slate-900/90 border-slate-800'
      } flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl`}>
        
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isVip ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }`}>
              {isVip ? 'VIP Premium Portal' : 'Standard Client Portal'}
            </span>
            <span className="text-xs text-slate-400">Account ID: {customer?.id || 'CLI-789'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {customer?.name || 'Client'}
          </h1>
          
          <p className="text-xs text-slate-300 leading-relaxed">
            Your turnkey web operations are managed by Webrunzo. Monitor live website uptime, turnkey build milestones, annual renewals, and request content edits directly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => openPreviewModal(tpl, customer || undefined)}
            className={`px-5 py-3 rounded-2xl text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              isVip ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Website Simulator</span>
          </button>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Website Status */}
        <div 
          onClick={() => setClientTab('website')}
          className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Website Status</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{customer?.websiteStatus || 'Live'}</span>
          </div>
          <div className="text-[11px] text-indigo-400 font-mono truncate">
            {customer?.customDomain ? `https://${customer.customDomain}` : customer?.websiteUrl}
          </div>
        </div>

        {/* 2. Active Order / Build Phase */}
        <div 
          onClick={() => setClientTab('orders')}
          className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Project Fulfillment</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {activeOrder ? activeOrder.status : 'Delivered'}
          </div>
          <div className="text-[11px] text-slate-400">
            {activeOrder ? `Due: ${activeOrder.deliveryDueDate}` : 'All phases completed'}
          </div>
        </div>

        {/* 3. Subscription Status */}
        <div 
          onClick={() => setClientTab('plan')}
          className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Subscription Plan</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white">{plan.name}</div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Renews: {customer?.planExpiryDate || '2027-01-01'}
          </div>
        </div>

        {/* 4. Support Concierge */}
        <div 
          onClick={() => setClientTab('support')}
          className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Support SLA</span>
            <LifeBuoy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white">
            {isVip ? '2-Hour VIP SLA' : '24/7 Standard'}
          </div>
          <div className="text-[11px] text-slate-400">
            {isVip ? 'Priority engineering queue' : 'Guaranteed webmaster support'}
          </div>
        </div>

      </div>

      {/* Main Grid: Website Simulator Preview & Order Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Website Live Frame Preview */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Live Website Deployment</span>
            </h2>
            <button
              onClick={() => openPreviewModal(tpl, customer || undefined)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Full Screen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800/80">
              <div>
                <div className="font-bold text-white">{customer?.businessName}</div>
                <div className="text-slate-400 text-[11px]">{customer?.tagline}</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                SSL Active
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Speed Score</div>
                <div className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
                  {customer?.speedScore || 98}/100
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">DNS Health</div>
                <div className="text-sm font-extrabold text-indigo-400 font-mono mt-0.5">
                  Propagated
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">CDN Edge</div>
                <div className="text-sm font-extrabold text-blue-400 font-mono mt-0.5">
                  Active
                </div>
              </div>
            </div>

            <button
              onClick={() => setClientTab('website')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Manage Website Content & Custom Domain</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Turnkey Build Milestones / Orders */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              <span>Turnkey Milestone Pipeline</span>
            </h2>
            <button
              onClick={() => setClientTab('orders')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeOrder ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Order {activeOrder.orderNumber}</span>
                <span className="text-slate-400 font-mono">Target: {activeOrder.deliveryDueDate}</span>
              </div>

              <div className="space-y-2">
                {activeOrder.milestones?.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${
                      m.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700'
                    }`}>
                      {m.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`font-semibold ${m.completed ? 'text-white' : 'text-slate-400'}`}>
                        {m.title}
                      </span>
                    </div>
                    {m.date && <span className="font-mono text-[10px] text-emerald-400">{m.date}</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="font-bold text-white">Turnkey Setup Completed</div>
              <div>Your website is 100% live and operating on our high-performance infrastructure.</div>
            </div>
          )}
        </div>

      </div>

      {/* Recent Invoices & Billing Strip */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Recent Payment Invoices & Receipts</span>
          </h2>
          <button
            onClick={() => setClientTab('payments')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            View All Billing History
          </button>
        </div>

        <div className="space-y-2">
          {clientPayments.slice(0, 3).map((pmt) => (
            <div
              key={pmt.id}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-white">{pmt.planName} Annual Subscription</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Invoice #{pmt.invoiceNumber} • Paid on {pmt.date}</div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-emerald-400">{formatINR(pmt.amount)}</span>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Paid (Receipt Generated)</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
