import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, CustomerStatus } from '../../types';
import { formatINR } from '../../utils/formatters';
import { 
  Search, 
  Plus, 
  Filter, 
  ExternalLink, 
  Eye, 
  ChevronRight, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  SlidersHorizontal,
  X,
  Sparkles,
  Building2,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { 
    customers, 
    plans, 
    templates, 
    settings,
    setSelectedCustomerIdForAdmin, 
    setAdminTab,
    addCustomer,
    deleteCustomer,
    updateCustomerStatus,
    openPreviewModal
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'All'>('All');
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'business'>('date');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // New Customer Form State
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState(plans[1]?.id || 'plan-pro');
  const [templateId, setTemplateId] = useState(templates[0]?.id || 'tpl-biz-1');
  const [accountStatus, setAccountStatus] = useState<CustomerStatus>('Active');
  const [notes, setNotes] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesStatus = statusFilter === 'All' || c.accountStatus === statusFilter;
        const matchesPlan = planFilter === 'All' || c.planId === planFilter;
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesPlan && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'business') return a.businessName.localeCompare(b.businessName);
        if (sortBy === 'date') return new Date(b.planStartDate).getTime() - new Date(a.planStartDate).getTime();
        return 0;
      });
  }, [customers, statusFilter, planFilter, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !businessName || !email) return;

    const newCust = addCustomer({
      name,
      businessName,
      email,
      phone,
      planId,
      templateId,
      accountStatus,
      paymentStatus: 'Paid',
      websiteStatus: 'Live',
      notes,
    });

    setShowAddModal(false);
    // Reset form
    setName('');
    setBusinessName('');
    setEmail('');
    setPhone('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Customer Directory & Websites
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage client subscriptions, active domains, template assignments, and credentials.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Customer</span>
        </button>
      </div>

      {/* Filters & Search Control Card */}
      <div className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by client, company, email, or domain..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Sort & Plan Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs">
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="All">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="date">Newest First</option>
              <option value="name">Client Name (A-Z)</option>
              <option value="business">Company Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800 pt-3 overflow-x-auto text-xs">
          {(['All', 'Active', 'Pending', 'Expired'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st} ({st === 'All' ? customers.length : customers.filter((c) => c.accountStatus === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4 sm:px-6">Customer & Business</th>
                <th className="p-4">Assigned Plan</th>
                <th className="p-4">Template</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Website Status</th>
                <th className="p-4">Plan Expiry</th>
                <th className="p-4 text-right sm:pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No customers found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => {
                  const plan = plans.find((p) => p.id === cust.planId);
                  const template = templates.find((t) => t.id === cust.templateId);

                  return (
                    <tr key={cust.id} className="hover:bg-slate-800/50 transition">
                      
                      {/* Name & Business */}
                      <td className="p-4 sm:px-6 font-medium">
                        <div className="font-bold text-white text-sm">{cust.businessName}</div>
                        <div className="text-[11px] text-slate-400">{cust.name} • {cust.email}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{cust.phone}</div>
                      </td>

                      {/* Plan */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{plan?.name || 'Standard'}</div>
                        <div className="text-[10px] text-emerald-400">${plan?.annualPrice}/yr</div>
                      </td>

                      {/* Template */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={template?.previewImage}
                            alt=""
                            className="w-7 h-7 rounded object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-medium text-slate-300 truncate max-w-[120px]">{template?.name}</div>
                            <div className="text-[10px] text-slate-400">{template?.category}</div>
                          </div>
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="p-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                          cust.accountStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          cust.accountStatus === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {cust.accountStatus === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                          {cust.accountStatus === 'Pending' && <Clock className="w-3 h-3" />}
                          {cust.accountStatus === 'Expired' && <AlertCircle className="w-3 h-3" />}
                          <span>{cust.accountStatus}</span>
                        </span>
                      </td>

                      {/* Website Status */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            cust.websiteStatus === 'Live' ? 'bg-emerald-400 animate-pulse' :
                            cust.websiteStatus === 'In Progress' ? 'bg-amber-400' :
                            'bg-slate-400'
                          }`} />
                          <span className="font-semibold text-slate-300">{cust.websiteStatus}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate max-w-[130px] mt-0.5">
                          {cust.websiteUrl}
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="p-4 font-mono text-[11px] text-slate-300">
                        {cust.planExpiryDate}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPreviewModal(template, cust)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Live Preview Website"
                          >
                            <Eye className="w-4 h-4 text-indigo-400" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCustomerIdForAdmin(cust.id);
                              setAdminTab('customer-profile');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                          >
                            <span>Profile</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-slate-900 px-6 py-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page {currentPage} of {totalPages} ({filteredCustomers.length} total)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Provision New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 text-white space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Provision New Customer Account</h3>
                  <p className="text-xs text-slate-400">Create client profile, assign template, and configure credentials.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Zenith Dental Care"
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Client Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Robert Zenith"
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="robert@zenithdental.com"
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pricing Package</label>
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({formatINR(p.annualPrice, settings?.currencySymbol)}/yr)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Template</label>
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

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Admin Internal Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions, design tweaks, custom domain details..."
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  Save & Provision Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
