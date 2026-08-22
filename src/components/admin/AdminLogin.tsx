import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, Sparkles, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAsAdmin, setCurrentExperience, settings } = useApp();
  const [email, setEmail] = useState('hello.webrunzo@gmail.com');
  const [password, setPassword] = useState('Dev.1303');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginAsAdmin(email, password);
    if (!success) {
      setError('Invalid owner email or password. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-slate-100 font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

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
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-emerald-600/30">
            W
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Webrunzo Owner Portal
          </h2>
          <p className="text-xs text-slate-400">
            Private master administration access for Webrunzo operations.
          </p>
        </div>

        {/* Pre-launch Test Credentials Banner */}
        <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <KeyRound className="w-4 h-4" />
              <span>Testing Phase Credentials</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Pre-Launch Active
            </span>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
            <div className="text-slate-300">Email: <strong className="text-white">hello.webrunzo@gmail.com</strong></div>
            <div className="text-slate-300">Password: <strong className="text-emerald-400">Dev.1303</strong></div>
          </div>

          <button
            onClick={() => loginAsAdmin('hello.webrunzo@gmail.com', 'Dev.1303')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>1-Click Authenticate as Owner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Owner Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
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
                className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 shadow flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sign In to Admin Portal</span>
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500">
          Role-Based Access Control • Full Platform Authority
        </div>

      </div>
    </div>
  );
};
