import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerStatus, WebsiteStatus, PaymentStatus, ClientTier } from '../../types';
import { formatINR } from '../../utils/formatters';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  CreditCard, 
  Layout, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  Save, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  LogIn,
  FileText,
  Activity,
  Layers,
  Crown,
  ShoppingBag,
  LifeBuoy,
  Power,
  ShieldAlert,
  Wrench,
  Lock,
  RefreshCw,
  ClipboardList,
  Palette,
  Check,
  Copy,
  RotateCcw,
  Send,
  KeyRound,
  Shield
} from 'lucide-react';

export const AdminCustomerProfile: React.FC = () => {
  const { 
    selectedCustomerIdForAdmin, 
    customers, 
    plans, 
    templates, 
    orders,
    tickets,
    settings,
    updateCustomer, 
    toggleWebsiteStatus,
    setAdminTab, 
    openPreviewModal,
    addToast,
    sendClientPasswordSetupLink
  } = useApp();

  const customer = customers.find((c) => c.id === selectedCustomerIdForAdmin);

  if (!customer) {
    return (
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center space-y-4 text-white">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold">Customer Not Found</h3>
        <p className="text-xs text-slate-400">Please select a customer from the customer directory.</p>
        <button
          onClick={() => setAdminTab('customers')}
          className="px-4 py-2 bg-emerald-600 rounded-xl text-xs font-bold"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const assignedPlan = plans.find((p) => p.id === customer.planId);
  const assignedTemplate = templates.find((t) => t.id === customer.templateId);
  const clientOrders = orders.filter((o) => o.customerId === customer.id || o.email === customer.email);
  const clientTickets = tickets.filter((t) => t.customerId === customer.id || t.email === customer.email);

  // Form states
  const [businessName, setBusinessName] = useState(customer.businessName);
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone);
  const [clientTier, setClientTier] = useState<ClientTier>(customer.clientTier || 'normal');
  const [planId, setPlanId] = useState(customer.planId);
  const [templateId, setTemplateId] = useState(customer.templateId);
  const [accountStatus, setAccountStatus] = useState<CustomerStatus>(customer.accountStatus);
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus>(customer.websiteStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(customer.paymentStatus);
  const [planStartDate, setPlanStartDate] = useState(customer.planStartDate);
  const [planExpiryDate, setPlanExpiryDate] = useState(customer.planExpiryDate);
  const [websiteUrl, setWebsiteUrl] = useState(customer.websiteUrl);
  const [customDomain, setCustomDomain] = useState(customer.customDomain || '');
  const [dnsStatus, setDnsStatus] = useState<'Active' | 'Pending DNS Setup' | 'Failed'>((customer.dnsStatus as any) || 'Active');
  const [sslStatus, setSslStatus] = useState<'Active' | 'Generating' | 'Pending Verification'>((customer.sslStatus as any) || 'Active');
  const [maintenanceNotice, setMaintenanceNotice] = useState(
    customer.maintenanceNotice ||
    `${customer.businessName} is temporarily undergoing scheduled maintenance and system optimization. Normal live service will resume shortly.`
  );
  const [speedScore, setSpeedScore] = useState(customer.speedScore || 98);
  const [notes, setNotes] = useState(customer.notes || '');

  // Website customized content states
  const [siteHeadline, setSiteHeadline] = useState(customer.customContent?.headline || '');
  const [siteTagline, setSiteTagline] = useState(customer.customContent?.tagline || '');
  const [siteContactEmail, setSiteContactEmail] = useState(customer.customContent?.contactEmail || '');
  const [siteContactPhone, setSiteContactPhone] = useState(customer.customContent?.contactPhone || '');
  const [siteAddress, setSiteAddress] = useState(customer.customContent?.address || '');

  // Website Onboarding / Intake states
  const rawOnboarding = customer.customContent?.onboarding;
  const [onboardingStatus, setOnboardingStatus] = useState<string>(rawOnboarding?.status || 'Not Started');
  const [adminOnboardingNotes, setAdminOnboardingNotes] = useState<string>(rawOnboarding?.adminNotes || '');

  // Client Authentication & Password Link States
  const [isAuthLinkLoading, setIsAuthLinkLoading] = useState(false);
  const [activeGeneratedLink, setActiveGeneratedLink] = useState<string | null>(null);
  const [hasCopiedAuthLink, setHasCopiedAuthLink] = useState(false);
  const [showForceResetConfirm, setShowForceResetConfirm] = useState(false);

  const handleSendAuthLink = async (actionType: 'setup' | 'reset') => {
    setIsAuthLinkLoading(true);
    setActiveGeneratedLink(null);
    try {
      const res = await sendClientPasswordSetupLink(customer.id, actionType);
      if (res.success && res.actionLink) {
        setActiveGeneratedLink(res.actionLink);
      }
    } finally {
      setIsAuthLinkLoading(false);
      setShowForceResetConfirm(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeGeneratedLink) return;
    navigator.clipboard.writeText(activeGeneratedLink);
    setHasCopiedAuthLink(true);
    addToast('success', 'Link Copied', 'Password setup link copied to clipboard.');
    setTimeout(() => setHasCopiedAuthLink(false), 3000);
  };

  const handleToggleWebsiteControl = () => {
    toggleWebsiteStatus(
      customer.id,
      customer.websiteStatus === 'Suspended' ? undefined : maintenanceNotice.trim()
    );
    setWebsiteStatus(customer.websiteStatus === 'Suspended' ? 'Live' : 'Suspended');
  };

  const handleSaveAll = () => {
    const currentOnboarding = customer.customContent?.onboarding;
    const updatedOnboarding = currentOnboarding
      ? {
          ...currentOnboarding,
          status: onboardingStatus as any,
          adminNotes: adminOnboardingNotes,
          updatedAt: new Date().toISOString(),
        }
      : onboardingStatus !== 'Not Started'
      ? {
          status: onboardingStatus as any,
          adminNotes: adminOnboardingNotes,
          updatedAt: new Date().toISOString(),
        }
      : undefined;

    updateCustomer(customer.id, {
      businessName,
      name,
      email,
      phone,
      clientTier,
      planId,
      templateId,
      accountStatus,
      websiteStatus,
      paymentStatus,
      planStartDate,
      planExpiryDate,
      websiteUrl,
      customDomain: customDomain.trim() || undefined,
      dnsStatus: customDomain.trim() ? dnsStatus : undefined,
      sslStatus: customDomain.trim() ? sslStatus : undefined,
      maintenanceNotice: maintenanceNotice.trim() || undefined,
      speedScore: Number(speedScore),
      notes,
      customContent: {
        ...(customer.customContent || {}),
        headline: siteHeadline,
        tagline: siteTagline,
        contactEmail: siteContactEmail,
        contactPhone: siteContactPhone,
        address: siteAddress,
        ...(updatedOnboarding ? { onboarding: updatedOnboarding } : {}),
      },
    });
    addToast('success', 'Profile & Website Settings Saved', `Changes for ${businessName} saved successfully.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAdminTab('customers')}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">{customer.businessName}</h1>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                customer.clientTier === 'premium' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1' 
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {customer.clientTier === 'premium' ? 'VIP Premium Client' : 'Normal Client'}
              </span>
            </div>
            <div className="text-xs text-slate-400">Client ID: <span className="font-mono text-slate-300">{customer.id}</span></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => openPreviewModal(assignedTemplate, customer)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Interactive Simulator</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Updates</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Plan Management & Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Account & Plan Management Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Core Client Information & Tier */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Customer Identity & Portal Role Tier</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Company / Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Primary Contact Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address (Login)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-bold mb-1">Client Portal Access Tier</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setClientTier('normal')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      clientTier === 'normal'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs">Normal Client Portal</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Standard dashboard, orders, website status, 24/7 SLA</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClientTier('premium')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      clientTier === 'premium'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>VIP Premium Portal</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Health audit, SEO manager, custom script injection, 2-Hour SLA</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Client Authentication & Access Security */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Client Authentication & Access Security</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Password Setup:</span>
                {customer.authStatus?.passwordSetupStatus === 'Completed' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending</span>
                  </span>
                )}
              </div>
            </div>

            {/* Zero-Knowledge Security Notice */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Client Self-Owned Credential Policy</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The client sets and owns their own private password. Plaintext passwords are never visible, retrievable, or stored for administrators. Access is established and refreshed strictly via encrypted, one-time authentication links.
              </p>
              {customer.authStatus?.lastLinkSentAt && (
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>Last Link Generated: {new Date(customer.authStatus.lastLinkSentAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Link Generation Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                id="btn-send-password-setup-link"
                disabled={isAuthLinkLoading}
                onClick={() => handleSendAuthLink('setup')}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAuthLinkLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>
                  {customer.authStatus?.passwordSetupStatus === 'Completed'
                    ? 'Resend Password Setup Link'
                    : 'Send Password Setup Link'}
                </span>
              </button>

              <button
                type="button"
                id="btn-force-password-reset"
                disabled={isAuthLinkLoading}
                onClick={() => setShowForceResetConfirm(true)}
                className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 active:bg-rose-950 text-rose-300 font-bold text-xs rounded-xl border border-rose-800/60 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Force Password Reset</span>
              </button>
            </div>

            {/* Generated Link Display Box */}
            {activeGeneratedLink && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Secure One-Time Link Generated</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {hasCopiedAuthLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                  {activeGeneratedLink}
                </div>
                <p className="text-[10px] text-slate-400">
                  Share this secure single-use link with the client. It directs to the WebRunzo Client Portal where they can set their password and sign in immediately.
                </p>
              </div>
            )}
          </div>

          {/* Card 2: Plan & Subscription Management */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Subscription & Billing Control</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Assigned Plan Package</label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} - {formatINR(p.annualPrice, settings?.currencySymbol)}/yr</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Payment Billing Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Paid">Paid (Current)</option>
                  <option value="Pending">Pending Invoice</option>
                  <option value="Failed">Payment Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Plan Start Date</label>
                <input
                  type="date"
                  value={planStartDate}
                  onChange={(e) => setPlanStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Plan Expiry Date</label>
                <input
                  type="date"
                  value={planExpiryDate}
                  onChange={(e) => setPlanExpiryDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Account Master Status</label>
                <select
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value as CustomerStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Active">Active (Full Access)</option>
                  <option value="Pending">Pending Verification</option>
                  <option value="Expired">Expired (Locked)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Website Deployment State</label>
                <select
                  value={websiteStatus}
                  onChange={(e) => setWebsiteStatus(e.target.value as WebsiteStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Live">Live (Online)</option>
                  <option value="In Progress">In Progress (Engineering)</option>
                  <option value="Draft">Draft Mode</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Internal Admin Notes */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Internal Admin Notes & Change Log</span>
            </h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record domain auth keys, custom CSS requirements, client calls..."
              className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

        </div>

        {/* Right Column: Website Management & Live Preview */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Website Management & Infrastructure Panel */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Website & Infrastructure Control</span>
              </h3>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                websiteStatus === 'Live' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                websiteStatus === 'Suspended' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold' :
                'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {websiteStatus === 'Suspended' ? 'Shut Down (Offline)' : websiteStatus}
              </span>
            </div>

            {/* Manual Website Status Toggle Box */}
            <div className={`p-4 rounded-2xl border space-y-3 transition ${
              websiteStatus === 'Suspended'
                ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Live Status Control
                  </div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${websiteStatus === 'Suspended' ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
                    <span>{websiteStatus === 'Suspended' ? 'Site is Shut Down (503 Offline)' : 'Site is Live Online'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleWebsiteControl}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    websiteStatus === 'Suspended'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{websiteStatus === 'Suspended' ? 'Activate (Go Live)' : 'Shut Down Site'}</span>
                </button>
              </div>

              {websiteStatus === 'Suspended' && (
                <div className="pt-2 border-t border-rose-500/20 text-[11px] text-rose-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Public access suspended: Visitors see maintenance screen.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Customizable Maintenance Notice */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1 text-xs">
                Offline Maintenance Notice (Visible when site is shut down)
              </label>
              <textarea
                rows={2}
                value={maintenanceNotice}
                onChange={(e) => setMaintenanceNotice(e.target.value)}
                placeholder="Message displayed to visitors when the site is suspended..."
                className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {/* Custom Domain Management */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Custom Domain & CNAME Binding</span>
                </span>
                {customDomain && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                    {dnsStatus}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Custom Domain / CNAME (e.g. clientdomain.com)
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g. zenithdental.com or www.zenithdental.com"
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-900 font-mono text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[11px]">DNS Resolution Status</label>
                  <select
                    value={dnsStatus}
                    onChange={(e: any) => setDnsStatus(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none"
                  >
                    <option value="Active">Active (Propagated)</option>
                    <option value="Pending DNS Setup">Pending DNS Setup</option>
                    <option value="Failed">Failed / Incorrect CNAME</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[11px]">SSL Certificate</label>
                  <select
                    value={sslStatus}
                    onChange={(e: any) => setSslStatus(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none"
                  >
                    <option value="Active">Active (Auto-Renew)</option>
                    <option value="Generating">Generating Certificate</option>
                    <option value="Pending Verification">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400 space-y-1 font-mono">
                <div className="text-slate-300 font-sans font-semibold">DNS CNAME Record:</div>
                <div className="text-emerald-400">CNAME @ → webrunzo.app-routing.com</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Platform Subdomain / Staging URL</label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Assigned Template</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Template Card Preview Box */}
            {assignedTemplate && (
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-3 space-y-3">
                <div className="relative h-32 rounded-xl overflow-hidden">
                  <img
                    src={assignedTemplate.previewImage}
                    alt={assignedTemplate.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      onClick={() => openPreviewModal(assignedTemplate, customer)}
                      className="bg-white/90 hover:bg-white text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Launch Interactive Frame</span>
                    </button>
                  </div>
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">{assignedTemplate.name}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{assignedTemplate.category} Architecture</div>
                </div>
              </div>
            )}

            {/* Live Content Customization Overrides */}
            <div className="pt-3 border-t border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-slate-200">Customer Content Overrides</div>
              
              <div>
                <label className="block text-slate-400 mb-1">Custom Headline</label>
                <input
                  type="text"
                  value={siteHeadline}
                  onChange={(e) => setSiteHeadline(e.target.value)}
                  placeholder={assignedTemplate?.name}
                  className="w-full p-2 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Custom Tagline / Subtitle</label>
                <input
                  type="text"
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                  placeholder={assignedTemplate?.description}
                  className="w-full p-2 rounded-lg border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Full-Width Section: Website Onboarding & Intake Specifications */}
      <div className="bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-2xl shrink-0 ${
              onboardingStatus === 'Submitted'
                ? 'bg-emerald-500/20 text-emerald-400'
                : onboardingStatus === 'In Progress'
                ? 'bg-sky-500/20 text-sky-400'
                : 'bg-slate-800 text-slate-400'
            }`}>
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  Website Intake & Onboarding Specifications
                </h2>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                  onboardingStatus === 'Submitted'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : onboardingStatus === 'In Progress'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {onboardingStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review submitted business profile, branding assets, architecture choices, and custom feature requests.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Status Override:</span>
            {(['Not Started', 'In Progress', 'Submitted'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setOnboardingStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  onboardingStatus === st
                    ? st === 'Submitted'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/30'
                      : st === 'In Progress'
                      ? 'bg-sky-600 text-white border-sky-500 shadow-sm shadow-sky-600/30'
                      : 'bg-slate-700 text-white border-slate-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 text-slate-400">
          <div>
            <span className="font-semibold text-slate-500 block text-[10px] uppercase">Started At:</span>
            <span className="text-slate-300 font-medium">
              {rawOnboarding?.startedAt ? new Date(rawOnboarding.startedAt).toLocaleString() : 'Not recorded'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 block text-[10px] uppercase">Submitted At:</span>
            <span className="text-emerald-400 font-medium">
              {rawOnboarding?.submittedAt ? new Date(rawOnboarding.submittedAt).toLocaleString() : 'Not submitted yet'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 block text-[10px] uppercase">Last Updated:</span>
            <span className="text-slate-300 font-medium">
              {rawOnboarding?.updatedAt ? new Date(rawOnboarding.updatedAt).toLocaleString() : 'No updates'}
            </span>
          </div>
        </div>

        {/* Specifications Details Grid */}
        {rawOnboarding ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* 1. Business Profile & Contact Details */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>1. Business Details</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 text-[11px] block">Business / Company Name</span>
                  <span className="text-white font-semibold text-sm">
                    {rawOnboarding.businessDetails?.businessName || customer.businessName || '—'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Industry Category</span>
                    <span className="text-slate-300 font-medium">
                      {rawOnboarding.businessDetails?.industryCategory || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Preferred Domain</span>
                    <span className="text-slate-300 font-mono text-[11px]">
                      {rawOnboarding.businessDetails?.customDomain || customer.customDomain || '—'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Business Description</span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 mt-1">
                    {rawOnboarding.businessDetails?.businessDescription || 'No description provided.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Contact Email</span>
                    <span className="text-slate-300">{rawOnboarding.businessDetails?.contactEmail || customer.email || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Contact Phone</span>
                    <span className="text-slate-300">{rawOnboarding.businessDetails?.contactPhone || customer.phone || '—'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Physical Address / Service Area</span>
                  <span className="text-slate-300">{rawOnboarding.businessDetails?.address || '—'}</span>
                </div>
              </div>
            </div>

            {/* 2. Visual Style & Branding */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
                <Palette className="w-4 h-4 text-indigo-400" />
                <span>2. Brand & Visual Identity</span>
              </div>
              <div className="space-y-3">
                {/* Logo */}
                <div>
                  <span className="text-slate-500 text-[11px] block mb-1">Brand Logo Asset</span>
                  {rawOnboarding.branding?.logoUrl ? (
                    <div className="flex items-center gap-3 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                      <img
                        src={rawOnboarding.branding.logoUrl}
                        alt="Logo Preview"
                        className="w-12 h-12 object-contain rounded-lg bg-slate-950 border border-slate-800 p-1"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[11px] text-slate-300 font-mono truncate block">
                          {rawOnboarding.branding.logoUrl}
                        </span>
                        <a
                          href={rawOnboarding.branding.logoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> Open full asset
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                      {rawOnboarding.branding?.logoText
                        ? `Wordmark / Text Logo requested: "${rawOnboarding.branding.logoText}"`
                        : 'No logo uploaded (WebRunzo to generate clean typography wordmark).'}
                    </div>
                  )}
                </div>

                {/* Color Palette */}
                <div>
                  <span className="text-slate-500 text-[11px] block mb-1.5">Brand Color Palette</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                      <div
                        className="w-6 h-6 rounded-lg border border-white/20 shadow-sm shrink-0"
                        style={{ backgroundColor: rawOnboarding.branding?.primaryColor || '#4f46e5' }}
                      />
                      <div>
                        <span className="text-[10px] text-slate-500 block">Primary Accent</span>
                        <span className="font-mono text-slate-200 font-semibold">
                          {rawOnboarding.branding?.primaryColor || '#4f46e5'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                      <div
                        className="w-6 h-6 rounded-lg border border-white/20 shadow-sm shrink-0"
                        style={{ backgroundColor: rawOnboarding.branding?.secondaryColor || '#0ea5e9' }}
                      />
                      <div>
                        <span className="text-[10px] text-slate-500 block">Secondary Accent</span>
                        <span className="font-mono text-slate-200 font-semibold">
                          {rawOnboarding.branding?.secondaryColor || '#0ea5e9'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferred Styles */}
                <div>
                  <span className="text-slate-500 text-[11px] block mb-1">Aesthetic & Visual Style</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rawOnboarding.branding?.preferredStyles && rawOnboarding.branding.preferredStyles.length > 0 ? (
                      rawOnboarding.branding.preferredStyles.map((style) => (
                        <span
                          key={style}
                          className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-lg"
                        >
                          {style}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">No specific aesthetic selected.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Website Specifications & Sections */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
                <Layout className="w-4 h-4 text-sky-400" />
                <span>3. Content & Page Layout Specifications</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-500 text-[11px] block mb-1">Required Page Sections</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rawOnboarding.specifications?.requiredSections && rawOnboarding.specifications.requiredSections.length > 0 ? (
                      rawOnboarding.specifications.requiredSections.map((sec) => (
                        <span
                          key={sec}
                          className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-400" /> {sec}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">Standard turnkey sections (Hero, About, Services, Contact).</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Hero Headline Request</span>
                    <span className="text-slate-200 font-semibold">{rawOnboarding.specifications?.heroHeadline || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Hero Tagline / Subtitle</span>
                    <span className="text-slate-300">{rawOnboarding.specifications?.heroTagline || '—'}</span>
                  </div>
                </div>

                {/* About story */}
                {rawOnboarding.specifications?.aboutStory && (
                  <div>
                    <span className="text-slate-500 text-[11px] block">About Us / Founder Story</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 mt-1">
                      {rawOnboarding.specifications.aboutStory}
                    </p>
                  </div>
                )}

                {/* Services */}
                {rawOnboarding.specifications?.services && rawOnboarding.specifications.services.length > 0 && (
                  <div>
                    <span className="text-slate-500 text-[11px] block mb-1">Provided Services / Key Offerings</span>
                    <div className="space-y-1.5">
                      {rawOnboarding.specifications.services.map((srv, idx) => (
                        <div key={idx} className="bg-slate-900/70 p-2 rounded-xl border border-slate-800 text-[11px]">
                          <span className="font-bold text-white">{srv.name}</span>
                          {srv.description && <p className="text-slate-400 mt-0.5">{srv.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social media */}
                {rawOnboarding.specifications?.socialLinks && Object.values(rawOnboarding.specifications.socialLinks).some(Boolean) && (
                  <div>
                    <span className="text-slate-500 text-[11px] block mb-1">Social Channels</span>
                    <div className="grid grid-cols-2 gap-2">
                      {rawOnboarding.specifications.socialLinks.instagram && (
                        <span className="text-slate-300 font-mono text-[10px] bg-slate-900/70 px-2 py-1 rounded border border-slate-800 truncate">
                          IG: {rawOnboarding.specifications.socialLinks.instagram}
                        </span>
                      )}
                      {rawOnboarding.specifications.socialLinks.facebook && (
                        <span className="text-slate-300 font-mono text-[10px] bg-slate-900/70 px-2 py-1 rounded border border-slate-800 truncate">
                          FB: {rawOnboarding.specifications.socialLinks.facebook}
                        </span>
                      )}
                      {rawOnboarding.specifications.socialLinks.linkedin && (
                        <span className="text-slate-300 font-mono text-[10px] bg-slate-900/70 px-2 py-1 rounded border border-slate-800 truncate">
                          LI: {rawOnboarding.specifications.socialLinks.linkedin}
                        </span>
                      )}
                      {rawOnboarding.specifications.socialLinks.whatsapp && (
                        <span className="text-slate-300 font-mono text-[10px] bg-slate-900/70 px-2 py-1 rounded border border-slate-800 truncate">
                          WA: {rawOnboarding.specifications.socialLinks.whatsapp}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Project Scope, Special Features & Notes */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>4. Special Features & Client Notes</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-500 text-[11px] block mb-1">Special Features Requested</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rawOnboarding.requirements?.specialFeatures && rawOnboarding.requirements.specialFeatures.length > 0 ? (
                      rawOnboarding.requirements.specialFeatures.map((feat) => (
                        <span
                          key={feat}
                          className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-lg"
                        >
                          {feat}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">None specified.</span>
                    )}
                  </div>
                </div>

                {rawOnboarding.requirements?.specialFeaturesNotes && (
                  <div>
                    <span className="text-slate-500 text-[11px] block">Feature Implementation Notes</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 mt-1">
                      {rawOnboarding.requirements.specialFeaturesNotes}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 text-[11px] block">Client Inspiration & General Notes</span>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 mt-1">
                    {rawOnboarding.requirements?.notes || rawOnboarding.notes || 'No extra notes provided.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center space-y-3">
            <ClipboardList className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="font-bold text-white text-sm">No Intake Requirements Submitted Yet</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              This client has not yet filled out their onboarding questionnaire in their portal. You can prompt them or update the status manually once discussed.
            </p>
          </div>
        )}

        {/* Admin Internal Onboarding Notes Box */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <label className="block text-slate-300 font-bold text-xs">
            WebRunzo Engineering & Webmaster Notes on this Intake
          </label>
          <textarea
            rows={3}
            value={adminOnboardingNotes}
            onChange={(e) => setAdminOnboardingNotes(e.target.value)}
            placeholder="Internal notes regarding template customization, branding asset review, or milestone progress for this client..."
            className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none font-sans"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveAll}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Intake & Profile Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Force Password Reset Confirmation Modal */}
      {showForceResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Force Password Reset</h3>
                <p className="text-xs text-slate-400">Ownership Transfer & Account Re-keying</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                You are about to force a password reset for <strong className="text-white">{customer.name}</strong> ({customer.email}).
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Existing client sessions will be invalidated.</li>
                <li>Password Setup Status will revert to <strong className="text-amber-400">Pending</strong>.</li>
                <li>A fresh one-time setup link will be generated for the new owner.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForceResetConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAuthLinkLoading}
                onClick={() => handleSendAuthLink('reset')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isAuthLinkLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Confirm & Force Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
