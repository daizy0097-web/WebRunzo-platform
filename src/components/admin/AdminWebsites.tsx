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
  HardDrive
} from 'lucide-react';

export const AdminWebsites: React.FC = () => {
  const { 
    customers, 
    updateWebsiteStatus, 
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
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Expired':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleSaveDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDomainCustomer) return;
    updateCustomer(editingDomainCustomer.id, {
      customDomain: customDomainInput.trim() || undefined,
      dnsStatus: customDomainInput.trim() ? 'Active' : undefined,
      sslStatus: customDomainInput.trim() ? 'Active' : undefined,
    });
    setEditingDomainCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-400" />
            Active Website & Domain Infrastructure
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor DNS propagation, SSL certificates, uptime health, and custom domain routing.
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
          {['all', 'Live', 'In Progress', 'Maintenance', 'Suspended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {st === 'all' ? 'All Websites' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Websites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWebsites.map((cust) => {
          const tpl = templates.find((t) => t.id === cust.templateId) || templates[0];
          return (
            <div
              key={cust.id}
              className="bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-slate-700 transition p-5 space-y-4 flex flex-col justify-between"
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

                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getWebsiteStatusBadge(cust.websiteStatus)}`}>
                    {cust.websiteStatus}
                  </span>
                </div>

                {/* Subdomain & Custom domain */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Platform URL</div>
                    <div className="font-mono text-indigo-400 truncate font-medium">{cust.websiteUrl}</div>
                  </div>

                  {cust.customDomain ? (
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Custom Domain</div>
                      <div className="font-mono text-emerald-400 font-bold truncate flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>https://{cust.customDomain}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>No custom domain linked</span>
                      <button
                        onClick={() => {
                          setEditingDomainCustomer(cust);
                          setCustomDomainInput('');
                        }}
                        className="text-xs text-indigo-400 hover:underline cursor-pointer"
                      >
                        + Add domain
                      </button>
                    </div>
                  )}
                </div>

                {/* Health & Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">DNS Status</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                      {cust.dnsStatus || 'Active'}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">SSL Cert</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
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
              </div>

              {/* Status Switcher & Actions */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Status:</label>
                  <select
                    value={cust.websiteStatus}
                    onChange={(e) => updateWebsiteStatus(cust.id, e.target.value as WebsiteStatus)}
                    className="text-xs p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="Live">Live</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Suspended">Suspended</option>
                  </select>
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">Configure Custom Domain</h3>
            <p className="text-xs text-slate-400">
              Enter the apex domain or subdomain for <strong>{editingDomainCustomer.businessName}</strong>.
            </p>

            <form onSubmit={handleSaveDomain} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Domain Name (e.g. www.myclient.com)</label>
                <input
                  type="text"
                  placeholder="www.clientdomain.com"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-[11px] space-y-1">
                <div className="font-semibold text-slate-300">Required DNS CNAME Record:</div>
                <div className="font-mono text-emerald-400">CNAME @ → webrunzo.app-routing.com</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDomainCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save & Provision SSL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
