import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Order, 
  OrderStatus, 
  ProjectStatus, 
  PROJECT_LIFECYCLE_STEPS, 
  ALLOWED_PROJECT_TRANSITIONS 
} from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  getProjectStatus,
  getStatusBadgeStyle,
  getStatusProgressPercentage,
  getStatusPhaseDescription,
} from '../../utils/projectLifecycle';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Loader2, 
  RotateCcw, 
  Check, 
  ClipboardList,
  ExternalLink,
  Eye,
  Globe,
  X,
  Maximize2,
  Clock
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { 
    orders, 
    updateOrderStatus, 
    updateProjectStatus,
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
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // Transition and Note State
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');

  // New Order Form State
  const [newOrderCustomer, setNewOrderCustomer] = useState(customers[0]?.id || '');
  const [newOrderPlan, setNewOrderPlan] = useState(plans[1]?.id || 'plan-pro');
  const [newOrderTemplate, setNewOrderTemplate] = useState(templates[0]?.id || 'tpl-biz-1');
  const [newOrderAmount, setNewOrderAmount] = useState(24999);
  const [newOrderNotes, setNewOrderNotes] = useState('Standard Turnkey Website Build');

  const selectedOrder = (selectedOrderId ? orders.find((o) => o.id === selectedOrderId) : null) || orders[0] || null;

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDetailModalOpen) {
        setIsDetailModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailModalOpen]);

  const handleOpenOrderDetails = (ord: Order) => {
    setSelectedOrderId(ord.id);
    setIsDetailModalOpen(true);
    setUpdateError(null);
    setAdminNote('');
  };

  const filteredOrders = orders.filter((ord) => {
    const pStatus = ord.projectStatus || getProjectStatus(ord);
    const matchesSearch = 
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pStatus === statusFilter || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleProjectTransition = async (orderId: string, newStatus: ProjectStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    setIsUpdatingStatus(true);
    setUpdateError(null);
    const res = await updateProjectStatus(orderId, newStatus, adminNote.trim() || undefined);
    setIsUpdatingStatus(false);
    if (!res.success) {
      setUpdateError(res.error || `Failed to transition status to ${newStatus}`);
    } else {
      setAdminNote('');
      setUpdateError(null);
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
      projectStatus: 'Submitted',
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
  };

  // Reusable Order Details & Lifecycle Content
  const renderOrderDetailContent = (order: Order, isModalView: boolean = false) => {
    const currentProjectStatus: ProjectStatus = order.projectStatus || getProjectStatus(order);
    const allowedTransitions = ALLOWED_PROJECT_TRANSITIONS[currentProjectStatus] || [];
    const selectedPlan = plans.find((p) => p.id === order.planId);
    const selectedTemplate = templates.find((t) => t.id === order.templateId);
    const progressPct = getStatusProgressPercentage(currentProjectStatus);

    return (
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                {isModalView ? 'PROJECT LIFECYCLE & FULFILLMENT' : 'PROJECT STATUS'}
              </span>
              {order.clientTier === 'premium' && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  VIP
                </span>
              )}
            </div>
            <h2 className="text-lg font-extrabold text-white mt-0.5 flex items-center gap-2">
              <span>{order.orderNumber}</span>
              <span className="text-slate-500 text-sm font-normal">|</span>
              <span className="text-slate-300 text-sm font-semibold">{order.businessName}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadgeStyle(currentProjectStatus)}`}>
              {currentProjectStatus}
            </span>
            {isModalView ? (
              <button
                id="admin-order-details-modal-close-btn"
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-700"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="admin-orders-expand-modal-btn"
                type="button"
                onClick={() => setIsDetailModalOpen(true)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700"
                title="Expand to Full Modal"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {updateError && (
          <div id="admin-orders-error-banner" className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">{updateError}</div>
          </div>
        )}

        {/* Lifecycle Visual Stepper */}
        <div id="admin-orders-lifecycle-stepper" className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Canonical 5-Step Lifecycle</span>
            </span>
            <span className="text-emerald-400 font-mono">{progressPct}%</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {PROJECT_LIFECYCLE_STEPS.map((step) => {
              const stepIndex = PROJECT_LIFECYCLE_STEPS.indexOf(step);
              const currentIndex = PROJECT_LIFECYCLE_STEPS.indexOf(currentProjectStatus);
              const isDone = stepIndex < currentIndex || currentProjectStatus === 'Live';
              const isCurrent = step === currentProjectStatus;

              return (
                <div key={step} className="text-center group relative">
                  <div
                    className={`h-2.5 rounded-full mb-1 transition-all ${
                      isDone
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-amber-400 animate-pulse ring-1 ring-amber-400/50'
                        : 'bg-slate-800'
                    }`}
                  />
                  <span
                    className={`text-[9px] block truncate font-medium ${
                      isCurrent
                        ? 'text-white font-bold'
                        : isDone
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                    title={step}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            {getStatusPhaseDescription(currentProjectStatus)}
          </p>
        </div>

        {/* Transition Controls */}
        <div id="admin-orders-transition-controls" className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Advance Lifecycle</span>
            {isUpdatingStatus && (
              <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-mono">
                <Loader2 className="w-3 h-3 animate-spin" />
                Updating DB...
              </span>
            )}
          </div>

          {allowedTransitions.length > 0 ? (
            <div className="space-y-2.5">
              {/* Optional Admin Note */}
              <div>
                <label htmlFor="admin-orders-note-input" className="text-[10px] text-slate-400 font-medium block mb-1">
                  Status Note / Revision Reason (Optional)
                </label>
                <input
                  id="admin-orders-note-input"
                  type="text"
                  disabled={isUpdatingStatus}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    currentProjectStatus === 'Review' 
                      ? 'e.g. Needs revised logo placement or client requested header changes...' 
                      : 'e.g. Intake reviewed; starting staging development...'
                  }
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                />
              </div>

              {/* Transition Action Buttons */}
              <div className="space-y-1.5 pt-1">
                {allowedTransitions.map((nextStatus) => {
                  const isRevise = nextStatus === 'In Progress' && currentProjectStatus === 'Review';

                  return (
                    <button
                      key={nextStatus}
                      id={`admin-orders-transition-btn-${nextStatus.toLowerCase().replace(/\s+/g, '-')}`}
                      disabled={isUpdatingStatus}
                      onClick={() => handleProjectTransition(order.id, nextStatus)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer disabled:opacity-50 ${
                        isRevise
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          : nextStatus === 'Live'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isRevise ? (
                          <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                        ) : nextStatus === 'Live' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-200" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isRevise
                            ? 'Request Changes (→ In Progress)'
                            : nextStatus === 'Live'
                            ? 'Approve & Launch (→ Live)'
                            : nextStatus === 'Accepted'
                            ? 'Accept Project (→ Accepted)'
                            : nextStatus === 'In Progress'
                            ? 'Start Development (→ In Progress)'
                            : `Submit for Review (→ ${nextStatus})`}
                        </span>
                      </span>
                      <span className="text-[10px] font-mono opacity-80 uppercase">
                        {currentProjectStatus} → {nextStatus}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Project is Live on production CDN. All lifecycle phases complete.</span>
            </div>
          )}
        </div>

        {/* Template & Plan Details with Live Preview */}
        <div id="admin-orders-plan-template" className="space-y-2 text-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Assigned Plan & Template</span>
            {selectedPlan && (
              <span className="text-[10px] text-indigo-400 font-medium">{selectedPlan.name}</span>
            )}
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-bold text-white text-xs">
                    {selectedTemplate ? selectedTemplate.name : 'Custom Turnkey Build'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {selectedTemplate ? `Category: ${selectedTemplate.category}` : 'Tailored Bespoke Design'}
                  </div>
                </div>
              </div>
              {selectedTemplate && (
                <button
                  id="admin-orders-preview-template-btn"
                  type="button"
                  onClick={() => openPreviewModal(selectedTemplate)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview Staging</span>
                </button>
              )}
            </div>

            {currentProjectStatus === 'Live' && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <Globe className="w-3 h-3" />
                  Production Deployment Active
                </span>
                <span className="font-mono text-slate-400 text-[10px]">Edge CDN 100% SLA</span>
              </div>
            )}
          </div>
        </div>

        {/* Client & Business Snapshot */}
        <div id="admin-orders-client-snapshot" className="space-y-2 text-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client Snapshot</div>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white text-sm">{order.businessName}</div>
            <div className="text-slate-300">{order.clientName}</div>
            <div className="text-slate-400">{order.email}</div>
            <div className="text-slate-400">{order.phone}</div>
            <div className="pt-2 flex items-center gap-2">
              <button
                id="admin-orders-view-client-btn"
                onClick={() => {
                  setSelectedCustomerIdForAdmin(order.customerId);
                  setAdminTab('customer-profile');
                  if (isModalView) setIsDetailModalOpen(false);
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>View Full Client Account</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Milestones History */}
        <div id="admin-orders-milestones-history" className="space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Milestone History</span>
            <span className="text-[10px] text-slate-500">Auto-synced with lifecycle</span>
          </div>
          <div className="space-y-2">
            {order.milestones?.map((m, idx) => (
              <div
                key={idx}
                id={`admin-order-milestone-${idx}`}
                onClick={() => toggleMilestone(order.id, idx)}
                className={`p-2.5 rounded-xl border flex items-center gap-3 transition text-xs cursor-pointer select-none ${
                  m.completed
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-slate-200 hover:bg-emerald-950/60'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
                title="Click to toggle milestone completion status"
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition ${
                  m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 hover:border-slate-400'
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

        {/* Requirements & Internal Notes */}
        <div id="admin-orders-requirements-section" className="space-y-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Order Requirements</span>
          <p className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-xs leading-relaxed">
            {order.requirements || 'Standard Turnkey Website Setup'}
          </p>
          {order.customerId && (
            <button
              id="admin-orders-inspect-intake-btn"
              type="button"
              onClick={() => {
                setSelectedCustomerIdForAdmin(order.customerId);
                setAdminTab('customers');
                if (isModalView) setIsDetailModalOpen(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-800"
            >
              <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inspect Full Intake Requirements Form</span>
            </button>
          )}
          {order.internalNotes && (
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300 block mb-1">Internal Metadata & Log:</span>
              <span className="font-mono">{order.internalNotes}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {isModalView && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Placed: <span className="text-slate-200">{order.date}</span> • Due: <span className="text-emerald-400 font-medium">{order.deliveryDueDate}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsDetailModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer border border-slate-700"
            >
              Close Details
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="admin-orders-page" className="space-y-6">
      {/* Header */}
      <div id="admin-orders-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            Order & Client Progress Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage turnkey project lifecycles (Submitted → Accepted → In Progress → Review → Live) with enforced transitions.
          </p>
        </div>
        <button
          id="admin-orders-create-btn"
          onClick={() => setShowNewOrderModal(true)}
          className="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div id="admin-orders-filter-bar" className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="admin-orders-search-input"
            type="text"
            placeholder="Search order #, client, business..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Pills */}
        <div id="admin-orders-status-filters" className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['all', ...PROJECT_LIFECYCLE_STEPS].map((st) => (
            <button
              key={st}
              id={`admin-orders-filter-${st.toLowerCase().replace(/\s+/g, '-')}`}
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
        <div id="admin-orders-list" className="lg:col-span-2 space-y-3">
          {filteredOrders.length === 0 ? (
            <div id="admin-orders-empty" className="bg-slate-900/60 p-12 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
              No orders found matching the filter criteria.
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              const pStatus = ord.projectStatus || getProjectStatus(ord);
              const progressPct = getStatusProgressPercentage(pStatus);
              const badgeStyle = getStatusBadgeStyle(pStatus);

              return (
                <div
                  key={ord.id}
                  id={`admin-order-card-${ord.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenOrderDetails(ord)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenOrderDetails(ord);
                    }
                  }}
                  className={`p-5 rounded-2xl border transition cursor-pointer bg-slate-900/90 relative group ${
                    isSelected
                      ? 'border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50'
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
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badgeStyle}`}>
                        {pStatus}
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
                    <button
                      id={`admin-order-open-btn-${ord.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenOrderDetails(ord);
                      }}
                      className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      <span>Open Details</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>

                  {/* Milestone Progress Bar / Project Lifecycle Progress Area */}
                  <div
                    id={`admin-order-progress-area-${ord.id}`}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenOrderDetails(ord);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenOrderDetails(ord);
                      }
                    }}
                    className="mt-4 pt-3 border-t border-slate-800/80 cursor-pointer hover:bg-slate-800/50 p-2.5 -mx-2.5 rounded-xl transition"
                    title="Click to view and advance Project Lifecycle"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Project Lifecycle Progress ({pStatus})</span>
                      </span>
                      <span className="font-mono font-bold text-slate-200 group-hover:text-emerald-400">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          progressPct === 100 ? 'bg-emerald-500' : progressPct >= 75 ? 'bg-indigo-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Phase: {getStatusPhaseDescription(pStatus)}</span>
                      <span className="text-indigo-400 font-semibold flex items-center gap-1">
                        <span>Inspect & Advance</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Order Detail Panel (1 Col - Desktop) */}
        {selectedOrder ? (
          <div id="admin-orders-detail-panel" className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-6 self-start sticky top-20">
            {renderOrderDetailContent(selectedOrder, false)}
          </div>
        ) : (
          <div id="admin-orders-no-selection" className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
            <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No order selected</p>
            <p className="mt-1">Click any order card or Project Lifecycle Progress bar on the left to inspect order details and advance the lifecycle.</p>
          </div>
        )}
      </div>

      {/* Order Details & Project Lifecycle Modal Overlay */}
      {isDetailModalOpen && selectedOrder && (
        <div
          id="admin-order-details-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsDetailModalOpen(false);
            }
          }}
        >
          <div
            id="admin-order-details-modal"
            className="bg-slate-900 border border-slate-800 text-white w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
          >
            <div className="p-6 overflow-y-auto">
              {renderOrderDetailContent(selectedOrder, true)}
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showNewOrderModal && (
        <div id="admin-create-order-modal-backdrop" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="admin-create-order-modal" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-white">Create New Website Order</h3>
            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label htmlFor="admin-new-order-customer" className="block text-slate-300 font-medium mb-1">Select Customer</label>
                <select
                  id="admin-new-order-customer"
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
                  <label htmlFor="admin-new-order-plan" className="block text-slate-300 font-medium mb-1">Plan</label>
                  <select
                    id="admin-new-order-plan"
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
                  <label htmlFor="admin-new-order-template" className="block text-slate-300 font-medium mb-1">Assigned Template</label>
                  <select
                    id="admin-new-order-template"
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
                <label htmlFor="admin-new-order-amount" className="block text-slate-300 font-medium mb-1">Order Amount (₹ INR)</label>
                <input
                  id="admin-new-order-amount"
                  type="number"
                  value={newOrderAmount}
                  onChange={(e) => setNewOrderAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label htmlFor="admin-new-order-notes" className="block text-slate-300 font-medium mb-1">Build Requirements / Client Scope</label>
                <textarea
                  id="admin-new-order-notes"
                  value={newOrderNotes}
                  onChange={(e) => setNewOrderNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  id="admin-new-order-cancel-btn"
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="admin-new-order-submit-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
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
