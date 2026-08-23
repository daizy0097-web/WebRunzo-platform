import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, WebsiteStatus } from '../../types';
import { 
  Globe, 
  Search, 
  ExternalLink, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Edit, 
  Server, 
  Zap, 
  Sparkles,
  Lock,
  ArrowRight,
  Settings,
  HardDrive,
  Power,
  ShieldAlert,
  Wrench,
  X,
  RefreshCw
} from 'lucide-react';

export const AdminWebsites: React.FC = () => {
  const { 
    customers, 
    updateWebsiteStatus, 
    toggleWebsiteStatus,
    updateCustomer, 
    openPreviewModal, 
    templates, 
    setSelectedCustomerIdForAdmin, 
    setAdminTab 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingDomainCustomer, setEditingDomainCustomer] = useState<Customer | null>(null);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [dnsStatusInput, setDnsStatusInput] = useState<'Active' | 'Pending DNS Setup' | 'Failed'>('Active');
  const [sslStatusInput, setSslStatusInput] = useState<'Active' | 'Generating' | 'Pending Verification'>('Active');

  // Website Shutdown Modal State
  const [shutdownModalCustomer, setShutdownModalCustomer] = useState<Customer | null>(null);
  const [shutdownNoticeInput, setShutdownNoticeInput] = useState('');

  const filteredWebsites = customers.filter((c) => {
    const matchesSearch = 
      c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customDomain && c.customDomain.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.websiteStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getWebsiteStatusBadge = (status: WebsiteStatus) => {
    switch (status) {
      case 'Live':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'In Progress':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Draft':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Suspended':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold';
      case 'Expired':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleOpenDomainModal = (cust: Customer) => {
    setEditingDomainCustomer(cust);
    setCustomDomainInput(cust.customDomain || '');
    setDnsStatusInput((cust.dnsStatus as any) || 'Active');
    setSslStatusInput((cust.sslStatus as any) || 'Active');
  };

  const handleSaveDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDomainCustomer) return;
    const cleanDomain = customDomainInput.trim();
    updateCustomer(editingDomainCustomer.id, {
      customDomain: cleanDomain || undefined,
      dnsStatus: cleanDomain ? dnsStatusInput : undefined,
      sslStatus: cleanDomain ? sslStatusInput : undefined,
    });
    setEditingDomainCustomer(null);
  };

  const handleToggleWebsite = (cust: Customer) => {
    if (cust.websiteStatus === 'Suspended') {
      // Direct Activate
      toggleWebsiteStatus(cust.id);
    } else {
      // Open Shutdown Modal
      setShutdownModalCustomer(cust);
      setShutdownNoticeInput(
        cust.maintenanceNotice ||
        `${cust.businessName}'s website is temporarily undergoing scheduled maintenance and system upgrades. Normal service will be restored shortly.`
      );
    }
  };

  const handleConfirmShutdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shutdownModalCustomer) return;
    toggleWebsiteStatus(shutdownModalCustomer.id, shutdownNoticeInput.trim() || undefined);
    setShutdownModalCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            Active Website & Custom Domain Infrastructure
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manual site shutdown control, custom domain binding, DNS status, and SSL certificate health.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Edge CDN: 100% Operational</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search business, subdomain, custom domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Live', 'In Progress', 'Suspended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {st === 'all' ? 'All Websites' : st === 'Suspended' ? 'Shut Down (Suspended)' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Websites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWebsites.map((cust) => {
          const tpl = templates.find((t) => t.id === cust.templateId) || templates[0];
          const isSuspended = cust.websiteStatus === 'Suspended';

          return (
            <div
              key={cust.id}
              className={`rounded-3xl border transition p-5 space-y-4 flex flex-col justify-between ${
                isSuspended
                  ? 'bg-slate-900/90 border-rose-500/40 ring-1 ring-rose-500/20'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      {cust.businessName}
                      {cust.clientTier === 'premium' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          VIP
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-slate-400">{cust.name}</span>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold inline-flex items-center gap-1 ${getWebsiteStatusBadge(cust.websiteStatus)}`}>
                    {isSuspended ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        <span>Shut Down</span>
                      </>
                    ) : cust.websiteStatus === 'Live' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Active / Live</span>
                      </>
                    ) : (
                      <span>{cust.websiteStatus}</span>
                    )}
                  </span>
                </div>

                {/* Subdomain & Custom domain */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Platform Subdomain</div>
                    <div className="font-mono text-indigo-400 truncate font-medium">{cust.websiteUrl}</div>
                  </div>

                  {cust.customDomain ? (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                          <span>Custom Domain</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">CNAME Bound</span>
                        </div>
                        <div className="font-mono text-emerald-400 font-bold truncate flex items-center gap-1">
                          <Lock className="w-3 h-3 shrink-0" />
                          <span>https://{cust.customDomain}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenDomainModal(cust)}
                        className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                        title="Configure Domain"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                      <span>No custom domain linked</span>
                      <button
                        onClick={() => handleOpenDomainModal(cust)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                      >
                        + Bind Custom Domain
                      </button>
                    </div>
                  )}
                </div>

                {/* Health & Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">DNS Status</div>
                    <div className={`text-xs font-bold font-mono mt-0.5 ${
                      cust.dnsStatus === 'Active' || !cust.dnsStatus ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {cust.dnsStatus || 'Active'}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">SSL Cert</div>
                    <div className={`text-xs font-bold font-mono mt-0.5 ${
                      cust.sslStatus === 'Active' || !cust.sslStatus ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {cust.sslStatus || 'Active'}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">Speed Score</div>
                    <div className="text-xs font-bold text-indigo-400 font-mono mt-0.5">
                      {cust.speedScore || 94}/100
                    </div>
                  </div>
                </div>

                {/* Status Notice if Suspended */}
                {isSuspended && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <span className="font-bold">Offline Notice Active: </span>
                      <span className="text-slate-300">{cust.maintenanceNotice || 'Standard maintenance notice'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Switcher & Actions */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                {/* Dedicated Manual Status Control Toggle */}
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Website Status Control</div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${isSuspended ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
                      <span>{isSuspended ? 'Shut Down (Offline)' : 'Online (Active Live)'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleWebsite(cust)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      isSuspended
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                    }`}
                    title={isSuspended ? 'Activate website and restore public access' : 'Shut down website and show maintenance screen'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isSuspended ? 'Activate Site' : 'Shut Down'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPreviewModal(tpl, cust)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Simulator</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCustomerIdForAdmin(cust.id);
                      setAdminTab('customer-profile');
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Edit Customer Info"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setAdminTab('backups');
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    title="View Backups & Disaster Recovery"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Domain Modal */}
      {editingDomainCustomer && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Custom Domain Management</h3>
              </div>
              <button
                onClick={() => setEditingDomainCustomer(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Bind apex custom domain or subdomain for <strong>{editingDomainCustomer.businessName}</strong>.
            </p>

            <form onSubmit={handleSaveDomain} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Custom Domain / CNAME (e.g. clientbusiness.com)
                </label>
                <input
                  type="text"
                  placeholder="www.clientdomain.com or clientdomain.com"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">DNS Resolution</label>
                  <select
                    value={dnsStatusInput}
                    onChange={(e: any) => setDnsStatusInput(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="Active">Active (Propagated)</option>
                    <option value="Pending DNS Setup">Pending DNS Setup</option>
                    <option value="Failed">Failed / Misconfigured</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SSL Certificate</label>
                  <select
                    value={sslStatusInput}
                    onChange={(e: any) => setSslStatusInput(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="Active">Active (Auto-Renew)</option>
                    <option value="Generating">Generating (Let&apos;s Encrypt)</option>
                    <option value="Pending Verification">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-[11px] space-y-1">
                <div className="font-semibold text-slate-300">Required DNS CNAME Target:</div>
                <div className="font-mono text-emerald-400">CNAME @ → webrunzo.app-routing.com</div>
                <div className="text-[10px] text-slate-500">Auto-provisions complimentary TLS 1.3 wildcard SSL certificate upon CNAME verification.</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDomainCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Save & Bind Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Website Shutdown & Maintenance Notice Modal */}
      {shutdownModalCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 text-white space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-rose-400">Shut Down Client Website</h3>
                  <p className="text-xs text-slate-400">{shutdownModalCustomer.businessName}</p>
                </div>
              </div>
              <button
                onClick={() => setShutdownModalCustomer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmShutdown} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1.5 text-rose-200">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Immediate Public Traffic Interruption</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  When shut down, this website ({shutdownModalCustomer.websiteUrl}) will immediately return an offline maintenance screen with your custom message below.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Custom Maintenance Notice (Visible to Visitors)
                </label>
                <textarea
                  rows={3}
                  required
                  value={shutdownNoticeInput}
                  onChange={(e) => setShutdownNoticeInput(e.target.value)}
                  placeholder="e.g. This website is temporarily undergoing scheduled maintenance. We will be back shortly."
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Visitors on desktop and mobile will see this notice alongside fallback contact phone and email.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShutdownModalCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Confirm & Shut Down Website</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
