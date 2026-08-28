import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HardDrive, 
  Layers, 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  X, 
  History, 
  ShieldCheck, 
  Lock, 
  ArrowUpRight,
  User,
  ExternalLink,
  Trash2,
  FileText,
  DollarSign,
  TrendingUp,
  Server
} from 'lucide-react';
import { Customer } from '../../types';
import { formatGB } from '../../utils/storageUtils';

export const AdminStorage: React.FC = () => {
  const { 
    customers, 
    plans, 
    grantExtraStorage, 
    reduceExtraStorage, 
    deleteCustomerFile,
    setSelectedCustomerIdForAdmin,
    setAdminTab,
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Near Limit' | 'Limit Reached' | 'Expanded'>('All');
  
  // Grant Modal States
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedCustForGrant, setSelectedCustForGrant] = useState<Customer | null>(null);
  const [grantAmountGB, setGrantAmountGB] = useState<number>(2);
  const [grantReason, setGrantReason] = useState<string>('Purchased 2GB storage booster pack');
  
  // Reduce Modal States
  const [showReduceModal, setShowReduceModal] = useState(false);
  const [reduceAmountGB, setReduceAmountGB] = useState<number>(1);
  const [reduceReason, setReduceReason] = useState<string>('Expired promotional add-on');

  // Customer Detail Drawer / Inspection
  const [inspectingCustomer, setInspectingCustomer] = useState<Customer | null>(null);

  // Platform Storage Calculations
  const totalAllocatedGB = customers.reduce((acc, c) => acc + (c.storage?.totalUsableLimitGB || 5), 0);
  const totalUsedGB = Number(customers.reduce((acc, c) => acc + (c.storage?.usedGB || 1.2), 0).toFixed(2));
  const overallPercent = totalAllocatedGB > 0 ? Math.round((totalUsedGB / totalAllocatedGB) * 100) : 0;
  
  const customersNearLimit = customers.filter((c) => c.storage?.isNearLimit && !c.storage?.isLimitReached);
  const customersAtLimit = customers.filter((c) => c.storage?.isLimitReached);
  const customersWithAddons = customers.filter((c) => (c.storage?.extraGrantedGB || 0) > 0);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = 
      c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'Near Limit') matchesFilter = !!c.storage?.isNearLimit && !c.storage?.isLimitReached;
    else if (filterStatus === 'Limit Reached') matchesFilter = !!c.storage?.isLimitReached;
    else if (filterStatus === 'Expanded') matchesFilter = (c.storage?.extraGrantedGB || 0) > 0;

    return matchesSearch && matchesFilter;
  });

  const handleOpenGrant = (cust: Customer) => {
    setSelectedCustForGrant(cust);
    const currentTotal = cust.storage?.totalUsableLimitGB || 5;
    const maxAvailableToGrant = Math.max(0, 15 - currentTotal);
    setGrantAmountGB(Math.min(2, maxAvailableToGrant || 1));
    setGrantReason('VIP Client capacity upgrade');
    setShowGrantModal(true);
  };

  const handleOpenReduce = (cust: Customer) => {
    setSelectedCustForGrant(cust);
    const extra = cust.storage?.extraGrantedGB || 0;
    setReduceAmountGB(Math.min(1, extra));
    setReduceReason('Storage add-on term completed');
    setShowReduceModal(true);
  };

  const handleSubmitGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustForGrant) return;

    grantExtraStorage(selectedCustForGrant.id, grantAmountGB, grantReason);
    setShowGrantModal(false);
    setSelectedCustForGrant(null);
  };

  const handleSubmitReduce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustForGrant) return;

    reduceExtraStorage(selectedCustForGrant.id, reduceAmountGB, reduceReason);
    setShowReduceModal(false);
    setSelectedCustForGrant(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 backdrop-blur shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> Storage Infrastructure
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs font-mono">15 GB Hard Limit / Tenant Container</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Customer Storage & Quota Allocation
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitor multi-tenant cloud storage usage, enforce plan capacities, and grant custom GB storage add-ons up to the isolated 15 GB technical ceiling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center gap-3 text-xs">
            <Server className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-slate-400 text-[10px]">Cloud Backing</div>
              <div className="font-bold text-white">Supabase Storage + R2 CDN</div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Storage Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Allocated */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Allocated Quota</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{totalAllocatedGB} GB</span>
            <span className="text-[10px] font-bold text-slate-400">across {customers.length} tenants</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Provisioned across Silver, Gold, Platinum
          </div>
        </div>

        {/* Global Consumption */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Global Active Usage</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{totalUsedGB} GB</span>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
              {overallPercent}% Utilized
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            {formatGB(Math.max(0, totalAllocatedGB - totalUsedGB))} GB remaining headroom
          </div>
        </div>

        {/* Storage Warnings & Full */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Threshold Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">
              {customersNearLimit.length + customersAtLimit.length}
            </span>
            <span className="text-[10px] text-slate-400">
              ({customersAtLimit.length} full, {customersNearLimit.length} near limit)
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            Requires monitoring or capacity expansion
          </div>
        </div>

        {/* Add-on Boosts Active */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Storage Add-ons Active</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-400 font-mono">
              {customersWithAddons.length}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Clients Expanded</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Custom administrative grants
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4">
        
        {/* Status Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            {(['All', 'Near Limit', 'Limit Reached', 'Expanded'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  filterStatus === st
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 shrink-0 font-mono">
            Showing <strong className="text-white">{filteredCustomers.length}</strong> of {customers.length} clients
          </div>
        </div>

        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by business name or email..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Customer Storage Allocation Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Client / Tenant</th>
                <th className="py-3.5 px-4">Base Plan</th>
                <th className="py-3.5 px-4">Allocated Limit</th>
                <th className="py-3.5 px-4">Current Usage</th>
                <th className="py-3.5 px-4">Health Status</th>
                <th className="py-3.5 px-4 text-right">Quota Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.map((cust) => {
                const storage = cust.storage || {
                  basePlanLimitGB: 5,
                  extraGrantedGB: 0,
                  totalUsableLimitGB: 5,
                  usedGB: 1.2,
                  percentUsed: 24,
                  isNearLimit: false,
                  isLimitReached: false,
                  files: [],
                  history: []
                };

                const plan = plans.find((p) => p.id === cust.planId);
                const canGrantMore = (storage.totalUsableLimitGB || 5) < 15;
                const hasExtra = (storage.extraGrantedGB || 0) > 0;

                return (
                  <tr key={cust.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Client Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400 border border-slate-700 shrink-0">
                          {cust.businessName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{cust.businessName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{cust.websiteUrl}</div>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {plan?.name || 'Silver'} ({storage.basePlanLimitGB} GB)
                      </span>
                    </td>

                    {/* Usable Limit */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white text-sm">{storage.totalUsableLimitGB} GB</span>
                        {hasExtra && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                            +{storage.extraGrantedGB} GB
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-500">Cap: 15 GB</div>
                    </td>

                    {/* Usage Progress */}
                    <td className="py-3.5 px-4 w-48">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-white">{storage.usedGB} GB</span>
                          <span className="text-slate-400">{storage.percentUsed}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all ${
                              storage.percentUsed >= 95
                                ? 'bg-rose-500'
                                : storage.percentUsed >= 80
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, storage.percentUsed)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {storage.isLimitReached ? (
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-rose-400" /> Full (100%)
                        </span>
                      ) : storage.isNearLimit ? (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-amber-400" /> Near Limit ({storage.percentUsed}%)
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Healthy
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        <button
                          onClick={() => handleOpenGrant(cust)}
                          disabled={!canGrantMore}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                          title="Grant Extra GB Capacity"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Grant GB</span>
                        </button>

                        {hasExtra && (
                          <button
                            onClick={() => handleOpenReduce(cust)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                            title="Reduce Extra Storage"
                          >
                            <Minus className="w-3 h-3" />
                            <span>Reduce</span>
                          </button>
                        )}

                        <button
                          onClick={() => setInspectingCustomer(cust)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Inspect Files & Grant History"
                        >
                          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant Extra Storage Modal */}
      {showGrantModal && selectedCustForGrant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Capacity Expansion</div>
                <h3 className="font-extrabold text-base text-white">Grant Extra Storage Capacity</h3>
              </div>
              <button onClick={() => setShowGrantModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGrant} className="space-y-4 text-xs">
              
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400">Target Client Instance</div>
                <div className="font-bold text-white text-sm">{selectedCustForGrant.businessName}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Current Limit: {selectedCustForGrant.storage?.totalUsableLimitGB || 5} GB (Used: {selectedCustForGrant.storage?.usedGB || 1.2} GB)
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Extra Capacity Amount to Grant (+GB) *
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[1, 2, 5, 10].map((gb) => {
                    const currentTotal = selectedCustForGrant.storage?.totalUsableLimitGB || 5;
                    const wouldExceed = currentTotal + gb > 15;
                    return (
                      <button
                        key={gb}
                        type="button"
                        disabled={wouldExceed}
                        onClick={() => setGrantAmountGB(gb)}
                        className={`py-2 rounded-xl font-mono font-bold text-xs transition ${
                          grantAmountGB === gb
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30'
                        }`}
                      >
                        +{gb} GB
                      </button>
                    );
                  })}
                </div>
                <input
                  type="number"
                  min="0.5"
                  max={15 - (selectedCustForGrant.storage?.totalUsableLimitGB || 5)}
                  step="0.5"
                  value={grantAmountGB}
                  onChange={(e) => setGrantAmountGB(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason / Billing Reference</label>
                <input
                  type="text"
                  required
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="e.g. VIP Booster Add-on / Paid Invoice #INV-2026-88"
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                />
              </div>

              {/* Technical Cap Calculation Notice */}
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center justify-between">
                <span>New Resulting Quota:</span>
                <span className="font-bold text-white font-mono text-xs">
                  {((selectedCustForGrant.storage?.totalUsableLimitGB || 5) + grantAmountGB).toFixed(1)} GB / 15 GB Cap
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  Confirm & Grant Storage
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Reduce Extra Storage Modal */}
      {showReduceModal && selectedCustForGrant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Quota Reduction</div>
                <h3 className="font-extrabold text-base text-white">Reduce Extra Storage Allocation</h3>
              </div>
              <button onClick={() => setShowReduceModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReduce} className="space-y-4 text-xs">
              
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400">Target Client Instance</div>
                <div className="font-bold text-white text-sm">{selectedCustForGrant.businessName}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Currently Granted Extra: +{selectedCustForGrant.storage?.extraGrantedGB || 0} GB
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount to Reduce (GB) *</label>
                <input
                  type="number"
                  min="0.5"
                  max={selectedCustForGrant.storage?.extraGrantedGB || 1}
                  step="0.5"
                  value={reduceAmountGB}
                  onChange={(e) => setReduceAmountGB(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason</label>
                <input
                  type="text"
                  required
                  value={reduceReason}
                  onChange={(e) => setReduceReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReduceModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-slate-950 shadow-lg transition cursor-pointer"
                >
                  Apply Quota Reduction
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Inspect Customer Storage Drawer / Modal */}
      {inspectingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl p-6 text-white space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Tenant Storage Inspector</div>
                <h3 className="font-extrabold text-base text-white">{inspectingCustomer.businessName}</h3>
              </div>
              <button onClick={() => setInspectingCustomer(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Total Limit</div>
                <div className="font-extrabold text-white text-base font-mono">
                  {inspectingCustomer.storage?.totalUsableLimitGB || 5} GB
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Used Capacity</div>
                <div className="font-extrabold text-emerald-400 text-base font-mono">
                  {inspectingCustomer.storage?.usedGB || 1.2} GB
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Stored Files</div>
                <div className="font-extrabold text-indigo-400 text-base font-mono">
                  {(inspectingCustomer.storage?.files || []).length} Items
                </div>
              </div>
            </div>

            {/* Files List */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-white">Indexed Cloud Assets</h4>
              <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-800 rounded-2xl p-2 bg-slate-950/60">
                {(inspectingCustomer.storage?.files || []).length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">No files uploaded.</div>
                ) : (
                  (inspectingCustomer.storage?.files || []).map((file) => (
                    <div key={file.id} className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{file.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{file.sizeFormatted} • {file.category} • {file.uploadedAt}</div>
                      </div>
                      <button
                        onClick={() => deleteCustomerFile(inspectingCustomer.id, file.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400"
                        title="Delete File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Allocation History */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-white">Quota Grant History</h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-800 rounded-2xl p-2 bg-slate-950/60">
                {(inspectingCustomer.storage?.history || []).length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-xs">No adjustments recorded yet.</div>
                ) : (
                  (inspectingCustomer.storage?.history || []).map((hist) => (
                    <div key={hist.id} className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-semibold text-white">
                          {hist.action === 'grant_extra' ? `+${hist.changeAmountGB} GB Grant` : `-${hist.changeAmountGB} GB Reduction`}
                        </div>
                        <div className="text-[10px] text-slate-400">{hist.reason}</div>
                      </div>
                      <div className="text-right font-mono text-[10px] text-slate-400">
                        {hist.date} by {hist.adminName}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectingCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
