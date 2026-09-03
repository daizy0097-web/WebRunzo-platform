import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Mail, ArrowRight, ArrowLeft, Loader2, Database, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const ClientLogin: React.FC = () => {
  const { loginAsClient, setCurrentExperience } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to log in.'
      );
      return;
    }

    if (!email.trim() || !password) {
      setError('Please provide your client account email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAsClient(email.trim(), password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during client login.');
    } finally {
      setIsLoading(false);
    }
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

        {/* Supabase Security Status Badge */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Supabase Auth Protected</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${
            isSupabaseConfigured
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            {isSupabaseConfigured ? 'Connected (RLS Active)' : 'Setup Required (.env)'}
          </span>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-1">
              <div className="font-semibold">Supabase Environment Required</div>
              <div className="text-[11px] text-amber-200/80 leading-relaxed">
                Client authentication requires connected Supabase credentials in <code className="font-mono bg-amber-950/60 px-1 py-0.5 rounded">.env</code>.
                In accordance with security requirements, password verification is enforced and mock bypasses are disabled.
              </div>
            </div>
          </div>
        )}

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Client Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="client@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder:text-slate-600 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isSupabaseConfigured}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Client Account...</span>
              </>
            ) : (
              <>
                <span>Sign In to Client Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500">
          Encrypted Authentication • Tenant Isolated Data Access
        </div>

      </div>
    </div>
  );
};
