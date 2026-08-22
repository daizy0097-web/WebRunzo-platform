import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, ClientTier } from '../../types';
import { formatINR } from '../../utils/formatters';
import { 
  CreditCard, 
  Search, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  DollarSign 
} from 'lucide-react';

export const AdminSubscriptions: React.FC = () => {
  const { 
    customers, 
    plans, 
    settings,
    updateCustomer, 
    toggleCustomerTier, 
    setSelectedCustomerIdForAdmin, 
    setAdminTab 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const now = new Date();

  const filteredSubscriptions = customers.filter((c) => {
    const matchesSearch = 
      c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTier = filterTier === 'all' || c.clientTier === filterTier;
    
    let matchesStatus = true;
    if (filterStatus === 'expiring') {
      if (!c.planExpiryDate) matchesStatus = false;
      else {
        const diffDays = (new Date(c.planExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
        matchesStatus = diffDays >= 0 && diffDays <= 30;
      }
    } else if (filterStatus === 'expired') {
      if (!c.planExpiryDate) matchesStatus = false;
      else {
        const diffDays = (new Date(c.planExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
        matchesStatus = diffDays < 0;
      }
    } else if (filterStatus === 'active') {
      if (!c.planExpiryDate) matchesStatus = true;
      else {
        const diffDays = (new Date(c.planExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24);
        matchesStatus = diffDays > 30;
      }
    }

    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-400" />
            Subscription & Client Tier Lifecycle
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage recurring annual memberships, VIP tier upgrades, expiration grace periods, and auto-renewals.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-400">Total MRR/ARR Volume</div>
              <div className="text-sm font-extrabold text-emerald-400 font-mono">
                {formatINR(customers.reduce((sum, c) => {
                  const p = plans.find((plan) => plan.id === c.planId);
                  return sum + (p?.annualPrice || 24999);
                }, 0), settings?.currencySymbol)}/yr
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search subscriber, company, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Tier Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterTier('all')}
              className={`px-2.5 py-1 rounded-lg font-medium ${filterTier === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setFilterTier('normal')}
              className={`px-2.5 py-1 rounded-lg font-medium ${filterTier === 'normal' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              Normal
            </button>
            <button
              onClick={() => setFilterTier('premium')}
              className={`px-2.5 py-1 rounded-lg font-medium ${filterTier === 'premium' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
            >
              VIP Premium
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg font-medium ${filterStatus === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-2.5 py-1 rounded-lg font-medium ${filterStatus === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('expiring')}
              className={`px-2.5 py-1 rounded-lg font-medium ${filterStatus === 'expiring' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
            >
              Expiring &lt;30d
            </button>
            <button
              onClick={() => setFilterStatus('expired')}
              className={`px-2.5 py-1 rounded-lg font-medium ${filterStatus === 'expired' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
            >
              Expired
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4 pl-6">Client / Business</th>
                <th className="p-4">Assigned Tier</th>
                <th className="p-4">Plan & Rate</th>
                <th className="p-4">Renewal Date</th>
                <th className="p-4">Auto-Renew</th>
                <th className="p-4 text-right pr-6">Tier Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredSubscriptions.map((c) => {
                const plan = plans.find((p) => p.id === c.planId) || plans[1];
                const isExpiring = c.planExpiryDate && 
                  ((new Date(c.planExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)) <= 30 &&
                  ((new Date(c.planExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)) >= 0;

                const isExpired = c.planExpiryDate && 
                  ((new Date(c.planExpiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)) < 0;

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-white text-sm">{c.businessName}</div>
                      <div className="text-[11px] text-slate-400">{c.name} • {c.email}</div>
                    </td>

                    <td className="p-4">
                      {c.clientTier === 'premium' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          VIP Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          Normal Tier
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{plan.name}</div>
                      <div className="font-mono text-emerald-400 text-[11px]">{formatINR(plan.annualPrice, settings?.currencySymbol)}/year</div>
                    </td>

                    <td className="p-4">
                      <div className="font-mono text-slate-200">{c.planExpiryDate || '2027-01-01'}</div>
                      {isExpiring && (
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" /> Expiring soon
                        </span>
                      )}
                      {isExpired && (
                        <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-2.5 h-2.5" /> Expired
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => updateCustomer(c.id, { autoRenew: !c.autoRenew })}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                          c.autoRenew !== false
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {c.autoRenew !== false ? 'Enabled' : 'Off'}
                      </button>
                    </td>

                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => toggleCustomerTier(c.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition border cursor-pointer ${
                          c.clientTier === 'premium'
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-sm'
                        }`}
                      >
                        {c.clientTier === 'premium' ? 'Downgrade to Normal' : 'Upgrade to VIP Premium'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
