import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Mail, Sparkles, ArrowRight, ArrowLeft, Building2, ShieldCheck } from 'lucide-react';

export const ClientLogin: React.FC = () => {
  const { loginAsClient, customers, setCurrentExperience } = useApp();
  const [email, setEmail] = useState('robert@zenithdental.com');
  const [password, setPassword] = useState('••••••••••••');

  const normalClients = customers.filter((c) => c.clientTier !== 'premium');
  const premiumClients = customers.filter((c) => c.clientTier === 'premium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      loginAsClient(matched.id);
    } else {
      loginAsClient(customers[0]?.id || '');
    }
  };

  const handleSelectDemo = (customerId: string) => {
    loginAsClient(customerId);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-slate-100 font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to Public Link */}
      <button
        onClick={() => setCurrentExperience('public')}
        className="absolute top-6 left-6 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Public Website</span>
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-indigo-600/30">
            W
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Client Portal Access
          </h2>
          <p className="text-xs text-slate-400">
            Access your website controls, live preview, invoices, and support.
          </p>
        </div>

        {/* Pre-launch Testing Fast Selector */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Pre-Launch One-Click Test Accounts:
          </div>

          {/* Normal Client Test */}
          {normalClients[0] && (
            <button
              type="button"
              onClick={() => handleSelectDemo(normalClients[0].id)}
              className="w-full p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{normalClients[0].businessName}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    Normal Client
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{normalClients[0].name} • Standard Portal</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </button>
          )}

          {/* Premium VIP Client Test */}
          {premiumClients[0] && (
            <button
              type="button"
              onClick={() => handleSelectDemo(premiumClients[0].id)}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 hover:bg-amber-950/60 border border-amber-500/40 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{premiumClients[0].businessName}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    VIP Premium
                  </span>
                </div>
                <div className="text-[11px] text-amber-300/70 mt-0.5">{premiumClients[0].name} • VIP Analytics &amp; 2h SLA</div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-white" />
            </button>
          )}
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Client Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Client Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
