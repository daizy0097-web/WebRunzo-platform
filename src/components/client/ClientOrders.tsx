import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText, 
  Sparkles, 
  ExternalLink,
  LifeBuoy
} from 'lucide-react';

export const ClientOrders: React.FC = () => {
  const { currentClientCustomer, orders, plans, templates, setClientTab, openPreviewModal } = useApp();

  const customer = currentClientCustomer;
  const clientOrders = orders.filter((o) => o.customerId === customer?.id || o.email === customer?.email);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            My Orders & Project Fulfillment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of your turnkey website build, revision cycles, and live deployment milestones.
          </p>
        </div>

        <button
          onClick={() => setClientTab('support')}
          className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <LifeBuoy className="w-4 h-4 text-indigo-400" />
          <span>Request Order Revision</span>
        </button>
      </div>

      {clientOrders.length === 0 ? (
        <div className="bg-slate-950 p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No Active Development Orders</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your website has been deployed. Any future design expansions or add-ons will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {clientOrders.map((ord) => {
            const plan = plans.find((p) => p.id === ord.planId);
            const tpl = templates.find((t) => t.id === ord.templateId);
            const completedCount = ord.milestones?.filter((m) => m.completed).length || 0;
            const totalCount = ord.milestones?.length || 4;
            const pct = Math.round((completedCount / totalCount) * 100);

            return (
              <div
                key={ord.id}
                className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-xl"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700">
                      {ord.orderNumber}
                    </span>
                    <div>
                      <h2 className="text-base font-extrabold text-white">{ord.businessName}</h2>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>Placed on: {ord.date}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-semibold">Target Launch: {ord.deliveryDueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                      ord.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      ord.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      {ord.status}
                    </span>
                    <span className="font-mono font-extrabold text-sm text-emerald-400">
                      {formatINR(ord.amount)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Fulfillment Pipeline ({completedCount} of {totalCount} Completed)</span>
                    <span className="font-mono font-bold text-emerald-400">{pct}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Flow */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ord.milestones?.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-xs space-y-1.5 transition ${
                        m.completed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500">STEP 0{idx + 1}</span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700'
                        }`}>
                          {m.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <div className={`font-bold text-sm ${m.completed ? 'text-white' : 'text-slate-400'}`}>
                        {m.title}
                      </div>
                      {m.date && <div className="text-[10px] text-emerald-400 font-mono">{m.date}</div>}
                    </div>
                  ))}
                </div>

                {/* Scope & Requirements */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Scope & Deliverables</div>
                  <p className="text-slate-300 leading-relaxed">
                    {ord.requirements || 'Standard Turnkey Package Setup: Mobile responsive responsive website, secure SSL certification, DNS domain mapping, high-speed CDN, and client portal management tools.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
