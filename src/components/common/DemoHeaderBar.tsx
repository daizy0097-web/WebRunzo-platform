import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Globe, 
  ShieldCheck, 
  UserCheck, 
  RotateCcw, 
  ChevronDown, 
  Sparkles,
  ExternalLink,
  Users,
  Eye,
  Crown
} from 'lucide-react';

export const DemoHeaderBar: React.FC = () => {
  const {
    currentExperience,
    setCurrentExperience,
    setAdminTab,
    setClientTab,
    session,
    loginAsAdmin,
    loginAsClient,
    logout,
    customers,
    resetAllData,
    openPreviewModal,
    templates,
  } = useApp();

  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const normalClients = customers.filter((c) => c.clientTier !== 'premium');
  const premiumClients = customers.filter((c) => c.clientTier === 'premium');

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand / Demo Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase text-[10px]">
            <Sparkles className="w-3 h-3 animate-pulse text-emerald-400" />
            <span>Webrunzo Platform Testing Suite</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden md:inline text-[11px]">
            Active: <strong className="text-white capitalize font-mono">{session.role.replace('_', ' ')}</strong>
          </span>
        </div>

        {/* Center: Experience Switcher Buttons (4 distinct roles) */}
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
              if (session.role !== 'admin') {
                loginAsAdmin('hello.webrunzo@gmail.com', 'Dev.1303');
              } else {
                setCurrentExperience('admin');
                setAdminTab('dashboard');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              currentExperience === 'admin'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Owner Admin</span>
          </button>

          {/* 3. Normal Client Portal */}
          <button
            id="demo-nav-normal-client"
            onClick={() => {
              const normal = normalClients[0] || customers[0];
              loginAsClient(normal?.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              currentExperience === 'client' && session.role === 'normal_client'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>3. Normal Client</span>
          </button>

          {/* 4. VIP Premium Client Portal */}
          <div className="relative flex items-center">
            <button
              id="demo-nav-premium-client"
              onClick={() => {
                const premium = premiumClients[0] || customers[1] || customers[0];
                loginAsClient(premium?.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg font-medium transition-all cursor-pointer ${
                currentExperience === 'client' && session.role === 'premium_client'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-950/40'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>4. VIP Premium Client</span>
            </button>

            {/* Client Account Switcher Dropdown Toggle */}
            <button
              onClick={() => setShowClientDropdown(!showClientDropdown)}
              className={`px-2 py-1.5 rounded-r-lg border-l border-slate-800 transition-all cursor-pointer ${
                currentExperience === 'client' && session.role === 'premium_client'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
              title="Select specific client account"
            >
              <ChevronDown className="w-3 h-3" />
            </button>

            {showClientDropdown && (
              <div 
                className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in"
                onMouseLeave={() => setShowClientDropdown(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Switch Client Test Account:
                </div>
                <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                  {customers.map((cust) => (
                    <button
                      key={cust.id}
                      onClick={() => {
                        loginAsClient(cust.id);
                        setShowClientDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-800 transition cursor-pointer ${
                        session.customerId === cust.id ? 'bg-slate-800 font-bold text-white' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate text-white font-medium">{cust.businessName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{cust.name}</div>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                        cust.clientTier === 'premium'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {cust.clientTier === 'premium' ? 'VIP' : 'Normal'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right: Simulator & Reset Button */}
        <div className="flex items-center gap-2">
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
            <span className="hidden sm:inline">Reset Testing Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
