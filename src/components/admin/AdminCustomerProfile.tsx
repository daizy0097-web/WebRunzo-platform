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
  LifeBuoy
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
    setAdminTab, 
    openPreviewModal,
    loginAsClient,
    addToast
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
  const [speedScore, setSpeedScore] = useState(customer.speedScore || 98);
  const [notes, setNotes] = useState(customer.notes || '');

  // Website customized content states
  const [siteHeadline, setSiteHeadline] = useState(customer.customContent?.headline || '');
  const [siteTagline, setSiteTagline] = useState(customer.customContent?.tagline || '');
  const [siteContactEmail, setSiteContactEmail] = useState(customer.customContent?.contactEmail || '');
  const [siteContactPhone, setSiteContactPhone] = useState(customer.customContent?.contactPhone || '');
  const [siteAddress, setSiteAddress] = useState(customer.customContent?.address || '');

  const handleSaveAll = () => {
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
      customDomain,
      speedScore: Number(speedScore),
      notes,
      customContent: {
        headline: siteHeadline,
        tagline: siteTagline,
        contactEmail: siteContactEmail,
        contactPhone: siteContactPhone,
        address: siteAddress,
      },
    });
    addToast('success', 'Profile Updated', `Changes for ${businessName} saved successfully.`);
  };

  const handleLoginAsThisClient = () => {
    loginAsClient(customer.id);
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
            onClick={handleLoginAsThisClient}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Login As This Client</span>
          </button>

          <button
            onClick={() => openPreviewModal(assignedTemplate, customer)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
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
          
          {/* Website Management Panel */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Website & DNS Management</span>
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                websiteStatus === 'Live' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {websiteStatus}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Staging / Preview URL</label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Custom Apex Domain</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g. www.clientdomain.com"
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

    </div>
  );
};
