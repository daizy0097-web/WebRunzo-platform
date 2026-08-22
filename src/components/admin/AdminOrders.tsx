import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { formatINR } from '../../utils/formatters';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  User, 
  ExternalLink,
  Edit,
  Plus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Layers,
  FileText
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { 
    orders, 
    updateOrderStatus, 
    updateOrder, 
    addOrder, 
    customers, 
    plans, 
    templates, 
    settings,
    openPreviewModal,
    setSelectedCustomerIdForAdmin,
    setAdminTab
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // New Order Form State
  const [newOrderCustomer, setNewOrderCustomer] = useState(customers[0]?.id || '');
  const [newOrderPlan, setNewOrderPlan] = useState(plans[1]?.id || 'plan-pro');
  const [newOrderTemplate, setNewOrderTemplate] = useState(templates[0]?.id || 'tpl-biz-1');
  const [newOrderAmount, setNewOrderAmount] = useState(24999);
  const [newOrderNotes, setNewOrderNotes] = useState('Standard Turnkey Website Build');

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = 
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Pending':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'In Progress':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Cancelled':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newOrderCustomer);
    if (!cust) return;

    addOrder({
      customerId: cust.id,
      clientName: cust.name,
      businessName: cust.businessName,
      email: cust.email,
      phone: cust.phone,
      planId: newOrderPlan,
      templateId: newOrderTemplate,
      amount: Number(newOrderAmount),
      status: 'New',
      paymentStatus: 'Paid',
      requirements: newOrderNotes,
      clientTier: cust.clientTier,
    });

    setShowNewOrderModal(false);
  };

  const toggleMilestone = (orderId: string, milestoneIndex: number) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target || !target.milestones) return;

    const newMilestones = [...target.milestones];
    newMilestones[milestoneIndex] = {
      ...newMilestones[milestoneIndex],
      completed: !newMilestones[milestoneIndex].completed,
      date: !newMilestones[milestoneIndex].completed ? new Date().toISOString().split('T')[0] : undefined,
    };

    updateOrder(orderId, { milestones: newMilestones });
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, milestones: newMilestones });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            Order & Fulfillment Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track client onboarding milestones, turnkey development phases, and launch dates.
          </p>
        </div>

        <button
          onClick={() => setShowNewOrderModal(true)}
          className="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search order #, client, business..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['all', 'New', 'In Progress', 'Review', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Orders List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-slate-900/60 p-12 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
              No orders found matching the filter criteria.
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              const completedMilestones = ord.milestones?.filter((m) => m.completed).length || 0;
              const totalMilestones = ord.milestones?.length || 4;
              const progressPct = Math.round((completedMilestones / totalMilestones) * 100);

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-5 rounded-2xl border transition cursor-pointer bg-slate-900/90 ${
                    isSelected
                      ? 'border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {ord.orderNumber}
                      </span>
                      {ord.clientTier === 'premium' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          VIP Premium
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadge(ord.status)}`}>
                        {ord.status}
                      </span>
                      <span className="font-mono font-bold text-sm text-emerald-400">
                        {formatINR(ord.amount, settings?.currencySymbol)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{ord.businessName}</h3>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{ord.clientName}</span>
                        <span>•</span>
                        <span>Placed: {ord.date}</span>
                        <span>•</span>
                        <span className="text-slate-300">Due: {ord.deliveryDueDate}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>

                  {/* Milestone Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400">
                      <span>Fulfillment Progress ({completedMilestones}/{totalMilestones} steps)</span>
                      <span className="font-mono font-bold text-slate-200">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Order Detail Panel (1 Col) */}
        {selectedOrder ? (
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-6 self-start sticky top-20">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-mono">ORDER DETAILS</span>
                <h2 className="text-base font-extrabold text-white">{selectedOrder.orderNumber}</h2>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadge(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
            </div>

            {/* Client & Business Snapshot */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client Snapshot</div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white text-sm">{selectedOrder.businessName}</div>
                <div className="text-slate-300">{selectedOrder.clientName}</div>
                <div className="text-slate-400">{selectedOrder.email}</div>
                <div className="text-slate-400">{selectedOrder.phone}</div>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCustomerIdForAdmin(selectedOrder.customerId);
                      setAdminTab('customer-profile');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <span>View Full Client Account</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Status Change Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Update Order Status</label>
              <select
                value={selectedOrder.status}
                onChange={(e) => {
                  const newSt = e.target.value as OrderStatus;
                  updateOrderStatus(selectedOrder.id, newSt);
                  setSelectedOrder({ ...selectedOrder, status: newSt });
                }}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review & QA</option>
                <option value="Completed">Completed & Live</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Milestones Checkoffs */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Milestone Steps</span>
                <span className="text-[10px] text-slate-500">Click check to toggle</span>
              </div>
              <div className="space-y-2">
                {selectedOrder.milestones?.map((m, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleMilestone(selectedOrder.id, idx)}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition text-xs ${
                      m.completed
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600'
                    }`}>
                      {m.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${m.completed ? 'text-white' : 'text-slate-400'}`}>
                        {m.title}
                      </div>
                      {m.date && <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{m.date}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements & Notes */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Order Requirements</span>
              <p className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs leading-relaxed">
                {selectedOrder.requirements || 'Standard Turnkey Website Setup'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
            Select an order on the left to inspect fulfillment steps.
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-white">Create New Website Order</h3>
            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Customer</label>
                <select
                  value={newOrderCustomer}
                  onChange={(e) => setNewOrderCustomer(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.name}) - Tier: {c.clientTier}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Plan</label>
                  <select
                    value={newOrderPlan}
                    onChange={(e) => setNewOrderPlan(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatINR(p.annualPrice)}/yr)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assigned Template</label>
                  <select
                    value={newOrderTemplate}
                    onChange={(e) => setNewOrderTemplate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Order Amount (₹ INR)</label>
                <input
                  type="number"
                  value={newOrderAmount}
                  onChange={(e) => setNewOrderAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Build Requirements / Client Scope</label>
                <textarea
                  value={newOrderNotes}
                  onChange={(e) => setNewOrderNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
