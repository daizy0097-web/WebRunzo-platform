import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Payment, PaymentStatus } from '../../types';
import { formatINR } from '../../utils/formatters';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Filter, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Download,
  ArrowUpRight
} from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const { payments, customers, plans, settings, addPayment } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Payment Form
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [amount, setAmount] = useState(24999);
  const [status, setStatus] = useState<PaymentStatus>('Paid');
  const [method, setMethod] = useState('Stripe (Card)');
  const [reference, setReference] = useState(`ch_test_${Math.random().toString(36).substring(2, 9)}`);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesSearch =
        p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.planName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [payments, statusFilter, searchQuery]);

  const totalCollected = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    addPayment({
      customerId: cust.id,
      customerName: `${cust.businessName} (${cust.name})`,
      amount: Number(amount),
      planName: plans.find((p) => p.id === cust.planId)?.name || 'Custom Plan',
      date: new Date().toISOString().split('T')[0],
      status,
      method,
      reference,
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Billing & Transaction Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track customer invoicing, recurring retainers, wire transfers, and gateway statuses.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Transaction</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Collected (Paid)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{formatINR(totalCollected, settings?.currencySymbol)}</div>
          <div className="text-[10px] text-slate-400">Lifetime settled transactions</div>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Outstanding / Pending Invoices</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">{formatINR(pendingAmount, settings?.currencySymbol)}</div>
          <div className="text-[10px] text-slate-400">Awaiting client payment settlement</div>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Merchant Gateways</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">UPI / Razorpay / Cards</div>
          <div className="text-[10px] text-emerald-400">Live & 100% operational</div>
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
              placeholder="Search by customer, plan, or reference ID..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['All', 'Paid', 'Pending', 'Failed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4 sm:px-6">Customer / Entity</th>
                <th className="p-4">Package / Plan</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Transaction Ref</th>
                <th className="p-4 sm:pr-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.map((pmt) => (
                <tr key={pmt.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 sm:px-6 font-bold text-white">
                    {pmt.customerName}
                  </td>
                  <td className="p-4 text-slate-300 font-medium">{pmt.planName}</td>
                  <td className="p-4 font-mono font-extrabold text-white text-sm">
                    {formatINR(pmt.amount, settings?.currencySymbol)}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                      pmt.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                      pmt.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {pmt.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{pmt.method}</td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">{pmt.reference}</td>
                  <td className="p-4 sm:pr-6 text-slate-400 font-mono">{pmt.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Record Payment Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.businessName} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount ({settings?.currencySymbol || '₹'} {settings?.currency || 'INR'})</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                >
                  <option value="UPI / Net Banking">UPI / Net Banking</option>
                  <option value="Razorpay (Credit / Debit Card)">Razorpay (Credit / Debit Card)</option>
                  <option value="Bank NEFT / RTGS">Bank NEFT / RTGS</option>
                  <option value="Manual / Cheque">Manual / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Transaction / Reference ID</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
