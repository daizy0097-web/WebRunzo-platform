import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { 
  Receipt, 
  Download, 
  CheckCircle2, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ClientPayments: React.FC = () => {
  const { activeCustomer, payments, plans, settings, showToast } = useApp();

  if (!activeCustomer) return null;

  const clientPayments = payments.filter((p) => p.customerId === activeCustomer.id);
  const currentPlan = plans.find((p) => p.id === activeCustomer.planId);

  const handleDownloadInvoice = (reference: string) => {
    showToast(`Generating official PDF receipt for ${reference}...`, 'info');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Invoices & Billing History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review previous billing receipts, payment statuses, and tax breakdown documentation.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Current Retainer Status</div>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Active & Paid</span>
          </div>
          <div className="text-[11px] text-slate-400">No overdue balance</div>
        </div>

        <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Next Scheduled Invoice</div>
          <div className="text-lg font-bold text-white font-mono">{activeCustomer.planExpiryDate}</div>
          <div className="text-[11px] text-slate-400">{formatINR(currentPlan?.annualPrice || 24999, settings?.currencySymbol)} (Annual)</div>
        </div>

        <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Saved Payment Method</div>
          <div className="text-lg font-bold text-white flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>•••• 4242</span>
          </div>
          <div className="text-[11px] text-emerald-400">UPI / Card on File</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-950/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-400" />
            <span>Transaction Ledger</span>
          </h3>
          <span className="text-xs text-slate-400">{clientPayments.length} Settled Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4 sm:px-6">Invoice / Description</th>
                <th className="p-4">Billing Period</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4 text-right sm:pr-6">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {clientPayments.map((pmt) => (
                <tr key={pmt.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-4 sm:px-6 font-medium">
                    <div className="font-bold text-white">{pmt.planName} Annual Setup & Hosting</div>
                    <div className="text-[10px] font-mono text-slate-400">{pmt.reference}</div>
                  </td>
                  <td className="p-4 text-slate-300 font-mono">{pmt.date}</td>
                  <td className="p-4 font-mono font-extrabold text-white text-sm">{formatINR(pmt.amount, settings?.currencySymbol)}</td>
                  <td className="p-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{pmt.status}</span>
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{pmt.method}</td>
                  <td className="p-4 text-right sm:pr-6">
                    <button
                      onClick={() => handleDownloadInvoice(pmt.reference)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>PDF Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
