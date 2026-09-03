import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getAgentAvailability, useAgentAvailability } from '../../utils/agentAvailability';
import { AgentAvailabilityMode } from '../../types';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Phone, 
  Mail, 
  Building2, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertTriangle,
  KeyRound,
  Lock,
  Zap,
  Clock,
  Globe,
  Radio,
  MessageCircle,
  CalendarCheck,
  HardDrive
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' },
  { id: 0, label: 'Sun', full: 'Sunday' },
];

const TIMEZONE_OPTIONS = [
  { id: 'local', label: 'Local Browser / Visitor Time' },
  { id: 'America/New_York', label: 'Eastern Time (ET / New York)' },
  { id: 'America/Chicago', label: 'Central Time (CT / Chicago)' },
  { id: 'America/Denver', label: 'Mountain Time (MT / Denver)' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (PT / Los Angeles)' },
  { id: 'Europe/London', label: 'Greenwich Mean Time (GMT / London)' },
  { id: 'Europe/Paris', label: 'Central European Time (CET / Paris)' },
  { id: 'Asia/Dubai', label: 'Gulf Standard Time (GST / Dubai)' },
  { id: 'Asia/Kolkata', label: 'India Standard Time (IST / New Delhi)' },
  { id: 'Asia/Singapore', label: 'Singapore Standard Time (SGT)' },
  { id: 'Asia/Tokyo', label: 'Japan Standard Time (JST / Tokyo)' },
  { id: 'Australia/Sydney', label: 'Australian Eastern Time (AEST / Sydney)' },
  { id: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

export const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee', defaultStarter: 2999, defaultPro: 4999, defaultBiz: 8999 },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar', defaultStarter: 299, defaultPro: 499, defaultBiz: 899 },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro', defaultStarter: 279, defaultPro: 469, defaultBiz: 849 },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound', defaultStarter: 239, defaultPro: 399, defaultBiz: 729 },
  { code: 'AED', symbol: 'AED ', label: 'AED (د.إ) - UAE Dirham', defaultStarter: 1099, defaultPro: 1849, defaultBiz: 3299 },
  { code: 'CAD', symbol: 'CA$', label: 'CAD ($) - Canadian Dollar', defaultStarter: 399, defaultPro: 679, defaultBiz: 1199 },
  { code: 'AUD', symbol: 'A$', label: 'AUD ($) - Australian Dollar', defaultStarter: 449, defaultPro: 749, defaultBiz: 1349 },
  { code: 'SGD', symbol: 'S$', label: 'SGD ($) - Singapore Dollar', defaultStarter: 399, defaultPro: 679, defaultBiz: 1199 },
];

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, resetAllData, addToast, session } = useApp();

  const [adminEmail, setAdminEmail] = useState(settings.adminEmail || 'hello.webrunzo@gmail.com');
  const [brandName, setBrandName] = useState(settings.brandName || 'Webrunzo');
  const [brandTagline, setBrandTagline] = useState(settings.brandTagline || 'High-Standard Turnkey Web Solutions for Modern Businesses');
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'support@webrunzo.com');
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || '+1 (555) 389-2910');
  const [whatsAppNumber, setWhatsAppNumber] = useState(settings.whatsAppNumber || '+15552345678');
  const [whatsAppDefaultMessage, setWhatsAppDefaultMessage] = useState(settings.whatsAppDefaultMessage || 'Hi WebRunzo! I would like to get started with a professional website.');
  
  // Currency State
  const [currency, setCurrency] = useState(settings.currency || 'INR');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '₹');

  const [starterPrice, setStarterPrice] = useState(settings.defaultStarterPrice || 2999);
  const [proPrice, setProPrice] = useState(settings.defaultProPrice || 4999);
  const [businessPrice, setBusinessPrice] = useState(settings.defaultBusinessPrice || 8999);

  // Backup & Disaster Recovery Settings
  const [backupRetentionDays, setBackupRetentionDays] = useState(settings.backupRetentionDays || 30);
  const [backupStorageProvider, setBackupStorageProvider] = useState(
    settings.backupStorageProvider || 'AWS S3 Mumbai ap-south-1 (AES-256)'
  );
  const [autoBackupsEnabled, setAutoBackupsEnabled] = useState(settings.autoBackupsEnabled !== false);
  const [preDeployBackupsEnabled, setPreDeployBackupsEnabled] = useState(settings.preDeployBackupsEnabled !== false);

  // Agent Availability & Business Hours State
  const [agentAvailabilityMode, setAgentAvailabilityMode] = useState<AgentAvailabilityMode>(
    settings.agentAvailabilityMode || 'auto'
  );
  const [businessHoursStart, setBusinessHoursStart] = useState(settings.businessHoursStart || '08:00');
  const [businessHoursEnd, setBusinessHoursEnd] = useState(settings.businessHoursEnd || '19:00');
  const [businessDays, setBusinessDays] = useState<number[]>(settings.businessDays || [1, 2, 3, 4, 5, 6]);
  const [businessTimeZone, setBusinessTimeZone] = useState(settings.businessTimeZone || 'local');
  const [onlineStatusMessage, setOnlineStatusMessage] = useState(
    settings.onlineStatusMessage || 'Active Live Advisory • Instant WhatsApp Reply'
  );
  const [awayStatusMessage, setAwayStatusMessage] = useState(
    settings.awayStatusMessage || 'Staff on Brief Break • Replies in ~15m'
  );
  const [offlineStatusMessage, setOfflineStatusMessage] = useState(
    settings.offlineStatusMessage || 'Outside Operating Hours • Next reply at 8:00 AM'
  );

  // Calculate live preview of availability with temporary form state
  const livePreviewAvailability = getAgentAvailability({
    ...settings,
    agentAvailabilityMode,
    businessHoursStart,
    businessHoursEnd,
    businessDays,
    businessTimeZone,
    onlineStatusMessage,
    awayStatusMessage,
    offlineStatusMessage,
  });

  const toggleDay = (dayId: number) => {
    if (businessDays.includes(dayId)) {
      if (businessDays.length === 1) {
        addToast('warning', 'Schedule Requirement', 'You must select at least one active operating day.');
        return;
      }
      setBusinessDays(businessDays.filter((d) => d !== dayId));
    } else {
      setBusinessDays([...businessDays, dayId]);
    }
  };

  const handleCurrencyChange = (newCode: string) => {
    const matched = CURRENCY_OPTIONS.find((c) => c.code === newCode);
    if (matched) {
      setCurrency(matched.code);
      setCurrencySymbol(matched.symbol);
      setStarterPrice(matched.defaultStarter);
      setProPrice(matched.defaultPro);
      setBusinessPrice(matched.defaultBiz);
      addToast('info', 'Currency Updated', `Switched platform default currency to ${matched.label}`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      adminEmail,
      brandName,
      brandTagline,
      supportEmail,
      supportPhone,
      whatsAppNumber,
      whatsAppDefaultMessage,
      currency,
      currencySymbol,
      defaultStarterPrice: Number(starterPrice),
      defaultProPrice: Number(proPrice),
      defaultBusinessPrice: Number(businessPrice),
      backupRetentionDays: Number(backupRetentionDays),
      backupStorageProvider,
      autoBackupsEnabled,
      preDeployBackupsEnabled,
      agentAvailabilityMode,
      businessHoursStart,
      businessHoursEnd,
      businessDays,
      businessTimeZone,
      onlineStatusMessage,
      awayStatusMessage,
      offlineStatusMessage,
    });
    addToast('success', 'Settings Saved', 'Platform configuration, currency formatting, and business hours updated.');
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to clean factory state? All demo edits will be refreshed.')) {
      resetAllData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Platform Configuration & Security
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Owner credentials, SLA response parameters, WhatsApp concierge business hours, package defaults, and system controls.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 0: Owner Credentials & Authentication */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Owner Authentication & Supabase Session</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              Supabase Auth Active
            </span>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed">
            Authentication is securely managed by Supabase Auth and Row Level Security. Passwords are encrypted on server-side PostgreSQL and never stored in frontend code.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Owner Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Active Auth Identity</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                <div className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-slate-300">
                  {session.email || 'Authenticated Supabase Admin'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: WhatsApp Concierge & Agent Availability Management (DYNAMIC) */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-emerald-500/30 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Concierge & Dynamic Agent Availability</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure live business hours, operating timezones, custom status copy, and availability overrides.
              </p>
            </div>

            {/* Current Real-time Preview Pill */}
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Calculated Status:</span>
              <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${livePreviewAvailability.badgeBg} ${livePreviewAvailability.badgeText} ${livePreviewAvailability.badgeBorder}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${livePreviewAvailability.dotColor} ${livePreviewAvailability.dotPulse ? 'animate-pulse' : ''}`}></span>
                {livePreviewAvailability.status}
              </span>
            </div>
          </div>

          {/* Mode Override Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Availability Mode & Schedule Engine</label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setAgentAvailabilityMode('auto')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                  agentAvailabilityMode === 'auto'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Auto Schedule
                  </span>
                  {agentAvailabilityMode === 'auto' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] text-slate-400">Determined automatically by business hours</span>
              </button>

              <button
                type="button"
                onClick={() => setAgentAvailabilityMode('online')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                  agentAvailabilityMode === 'online'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Force Online
                  </span>
                  {agentAvailabilityMode === 'online' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] text-slate-400">Display 'Online' 24/7 regardless of hours</span>
              </button>

              <button
                type="button"
                onClick={() => setAgentAvailabilityMode('away')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                  agentAvailabilityMode === 'away'
                    ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-950/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Force Away
                  </span>
                  {agentAvailabilityMode === 'away' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="text-[10px] text-slate-400">Show 'Away' for team meetings or lunch break</span>
              </button>

              <button
                type="button"
                onClick={() => setAgentAvailabilityMode('offline')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                  agentAvailabilityMode === 'offline'
                    ? 'bg-slate-800/80 border-slate-600 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    Force Offline
                  </span>
                  {agentAvailabilityMode === 'offline' && <Check className="w-3.5 h-3.5 text-slate-400" />}
                </div>
                <span className="text-[10px] text-slate-400">Show 'Offline' for holidays or maintenance</span>
              </button>
            </div>
          </div>

          {/* Business Hours & Timezone Configuration */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>Business Operating Hours & Days</span>
            </h4>

            {/* Operating Days Toggle */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-2">Operating Business Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = businessDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 text-white" /> : null}
                      <span>{day.full}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hours Range & Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Opening Time (24h)</label>
                <input
                  type="time"
                  value={businessHoursStart}
                  onChange={(e) => setBusinessHoursStart(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Closing Time (24h)</label>
                <input
                  type="time"
                  value={businessHoursEnd}
                  onChange={(e) => setBusinessHoursEnd(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Business Timezone</label>
                <select
                  value={businessTimeZone}
                  onChange={(e) => setBusinessTimeZone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.id} value={tz.id}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* WhatsApp Phone Coordinates & Default Message */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">WhatsApp International Number (E.164)</label>
              <input
                type="text"
                value={whatsAppNumber}
                onChange={(e) => setWhatsAppNumber(e.target.value)}
                placeholder="+15552345678"
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Default Pre-filled Chat Message</label>
              <input
                type="text"
                value={whatsAppDefaultMessage}
                onChange={(e) => setWhatsAppDefaultMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Custom Status Messages */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Status Subtitle Messages</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  When Online
                </label>
                <input
                  type="text"
                  value={onlineStatusMessage}
                  onChange={(e) => setOnlineStatusMessage(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-amber-400 font-semibold mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  When Away
                </label>
                <input
                  type="text"
                  value={awayStatusMessage}
                  onChange={(e) => setAwayStatusMessage(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  When Offline
                </label>
                <input
                  type="text"
                  value={offlineStatusMessage}
                  onChange={(e) => setOfflineStatusMessage(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Live Dynamic Preview
              </div>
              <div className="text-white font-medium flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${livePreviewAvailability.badgeBg} ${livePreviewAvailability.badgeText} ${livePreviewAvailability.badgeBorder}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${livePreviewAvailability.dotColor} ${livePreviewAvailability.dotPulse ? 'animate-pulse' : ''}`}></span>
                  {livePreviewAvailability.status}
                </span>
                <span className="text-slate-300">• {livePreviewAvailability.statusMessage}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>Active Schedule: {livePreviewAvailability.hoursSummary}</span>
                <span>• Reason: {livePreviewAvailability.reason}</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              Clock: {livePreviewAvailability.currentTimeFormatted}
            </div>
          </div>
        </div>

        {/* Section 2: Brand & Contact Coordinates */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Brand Identity & Contact Coordinates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Brand Tagline</label>
              <input
                type="text"
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Support Phone Hotline</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Platform Currency & Base Pricing Defaults */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Platform Currency & Package Base Pricing</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Active: {currency} ({currencySymbol})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Global Platform Currency</label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Select your preferred operating currency for pricing displays, invoices, and quotes.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Currency Symbol Override</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="₹ or $ or €"
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Custom prefix symbol rendered next to financial amounts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Starter Package ({currencySymbol}/yr)</label>
              <input
                type="number"
                value={starterPrice}
                onChange={(e) => setStarterPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Professional Package ({currencySymbol}/yr)</label>
              <input
                type="number"
                value={proPrice}
                onChange={(e) => setProPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Business Scale Package ({currencySymbol}/yr)</label>
              <input
                type="number"
                value={businessPrice}
                onChange={(e) => setBusinessPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Website Backup & Disaster Recovery Policies */}
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Automated Website Backups & Offsite Vault Policy</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Snapshot Retention Period</label>
              <select
                value={backupRetentionDays}
                onChange={(e) => setBackupRetentionDays(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={14}>14 Days (Standard Rolling)</option>
                <option value={30}>30 Days (Recommended Default)</option>
                <option value={60}>60 Days (Extended)</option>
                <option value={90}>90 Days (Enterprise Vault)</option>
                <option value={365}>365 Days (Full Year Compliance)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Offsite S3 Cloud Vault Storage</label>
              <select
                value={backupStorageProvider}
                onChange={(e) => setBackupStorageProvider(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="AWS S3 Mumbai ap-south-1 (AES-256)">AWS S3 Mumbai ap-south-1 (AES-256 GCM)</option>
                <option value="AWS S3 Frankfurt eu-central-1 (AES-256)">AWS S3 Frankfurt eu-central-1 (AES-256 GCM)</option>
                <option value="Google Cloud Storage asia-south1 (AES-256)">Google Cloud Storage asia-south1 (Mumbai)</option>
                <option value="Azure Blob Storage India Central (AES-256)">Azure Blob Storage India Central</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoBackupsEnabled}
                onChange={(e) => setAutoBackupsEnabled(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <div>
                <div className="font-bold text-white">Automated Daily Nightly Sync</div>
                <div className="text-[10px] text-slate-400">Scheduled snapshot capture at 02:00 UTC for all live client sites</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={preDeployBackupsEnabled}
                onChange={(e) => setPreDeployBackupsEnabled(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <div>
                <div className="font-bold text-white">Pre-Deploy Safety Points</div>
                <div className="text-[10px] text-slate-400">Automatically creates rollback checkpoint before live edits</div>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition"
          >
            <Save className="w-4 h-4" />
            <span>Apply Global Platform Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
