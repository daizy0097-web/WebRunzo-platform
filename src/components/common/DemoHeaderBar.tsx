import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Globe, 
  ShieldCheck, 
  UserCheck, 
  RotateCcw, 
  Sparkles,
  Eye,
  LogOut,
  Database
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const DemoHeaderBar: React.FC = () => {
  const {
    currentExperience,
    setCurrentExperience,
    setAdminTab,
    setClientTab,
    session,
    logout,
    customers,
    resetAllData,
    openPreviewModal,
    templates,
  } = useApp();

  const isAuthenticated = session.role !== 'guest';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand / Supabase Auth Status */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase text-[10px]">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>WebRunzo Platform</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono">
            <Database className="w-3 h-3 text-emerald-400" />
            <span className={isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}>
              {isSupabaseConfigured ? 'Supabase RLS Active' : 'Supabase Inactive'}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden md:inline text-[11px]">
            Session: <strong className="text-white capitalize font-mono">{session.role.replace('_', ' ')}</strong>
            {session.email && <span className="text-slate-400 ml-1">({session.email})</span>}
          </span>
        </div>

        {/* Center: Experience Navigation (Enforces Supabase Auth on Protected Views) */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          
          {/* 1. Public Website */}
          <button
            id="demo-nav-public"
            onClick={() => {
              setCurrentExperience('public');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              currentExperience === 'public'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>1. Public Site</span>
          </button>

          {/* 2. Admin Owner Portal */}
          <button
            id="demo-nav-admin"
            onClick={() => {
              setCurrentExperience('admin');
              setAdminTab('dashboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              currentExperience === 'admin'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Owner Admin</span>
            {session.role === 'admin' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            )}
          </button>

          {/* 3. Client Portal */}
          <button
            id="demo-nav-client"
            onClick={() => {
              setCurrentExperience('client');
              setClientTab('dashboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              currentExperience === 'client'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>3. Client Portal</span>
            {(session.role === 'normal_client' || session.role === 'premium_client') && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" />
            )}
          </button>

        </div>

        {/* Right: Authenticated User Actions & Tools */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 rounded-xl border border-rose-800/60 transition cursor-pointer text-xs font-semibold"
              title="Sign out of active Supabase session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : null}

          <button
            onClick={() => openPreviewModal(templates[0], customers[0])}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition cursor-pointer text-xs font-semibold"
            title="Open Live Website Simulator"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Site Simulator</span>
          </button>

          <button
            id="btn-reset-demo"
            onClick={() => {
              if (window.confirm('Reset all platform test data back to clean factory state?')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700 transition cursor-pointer text-xs"
            title="Reset platform data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
