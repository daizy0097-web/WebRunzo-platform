import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Gauge, 
  Lock, 
  Server, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const ClientPremiumHealth: React.FC = () => {
  const { currentClientCustomer } = useApp();
  const customer = currentClientCustomer;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 p-6 rounded-3xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              VIP PREMIUM FEATURE
            </span>
            <span className="text-xs text-slate-400">Continuous 24/7 Monitoring</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Performance & Health Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Core Web Vitals, Google Lighthouse audit, SSL validity, and edge CDN response speed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Uptime: 99.99%</span>
          </div>
        </div>
      </div>

      {/* Core Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Google PageSpeed</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {customer?.speedScore || 98}<span className="text-base text-slate-500 font-normal">/100</span>
          </div>
          <div className="text-[11px] text-slate-400">Desktop & Mobile Optimized</div>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>First Contentful Paint</span>
            <Gauge className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            0.6<span className="text-base text-slate-500 font-normal">s</span>
          </div>
          <div className="text-[11px] text-emerald-400">Top 1% global speed percentile</div>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>SSL Certificate</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
            TLS 1.3 Active
          </div>
          <div className="text-[11px] text-slate-400">Auto-renews automatically</div>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Global Edge CDN</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-400 font-mono">
            28<span className="text-base text-slate-500 font-normal">ms</span>
          </div>
          <div className="text-[11px] text-slate-400">Average server response latency</div>
        </div>
      </div>

      {/* Core Web Vitals Deep Dive */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Core Web Vitals Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">LCP (Largest Contentful Paint)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">PASS</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">1.1s</div>
            <div className="text-[11px] text-slate-400">Target: &lt; 2.5s. Your site loads hero media instantly.</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">INP (Interaction to Next Paint)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">PASS</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">32ms</div>
            <div className="text-[11px] text-slate-400">Target: &lt; 200ms. Buttons and touches respond immediately.</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">CLS (Cumulative Layout Shift)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">PASS</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">0.00</div>
            <div className="text-[11px] text-slate-400">Target: &lt; 0.1. Zero jitter or unexpected page jumping.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
