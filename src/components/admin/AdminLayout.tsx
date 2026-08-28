import React, { useState } from 'react';
import { useApp, AdminTab } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag,
  Globe,
  HardDrive,
  CreditCard, 
  Layout, 
  Inbox, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  CalendarCheck,
  LifeBuoy
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<Props> = ({ children }) => {
  const { 
    adminTab, 
    setAdminTab, 
    setSelectedCustomerIdForAdmin, 
    session, 
    logout, 
    enquiries, 
    orders,
    tickets,
    setCurrentExperience,
    settings 
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;
  const newOrdersCount = orders.filter((o) => o.status === 'New').length;
  const openTicketsCount = tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length;

  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Client Directory', icon: Users },
    { id: 'orders', label: 'Order Management', icon: ShoppingBag, badge: newOrdersCount },
    { id: 'websites', label: 'Website Management', icon: Globe },
    { id: 'storage', label: 'Storage & Quotas', icon: HardDrive },
    { id: 'backups', label: 'Backups & Recovery', icon: ShieldCheck },
    { id: 'subscriptions', label: 'Subscription Lifecycle', icon: CalendarCheck },
    { id: 'payments', label: 'Billing & Invoices', icon: CreditCard },
    { id: 'templates', label: 'Template Catalog', icon: Layout },
    { id: 'enquiries', label: 'Sales Leads', icon: Inbox, badge: newEnquiriesCount },
    { id: 'support', label: 'Queries & Assistance', icon: LifeBuoy, badge: openTicketsCount },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAdminTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-emerald-600/20">
              W
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                Webrunzo <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-normal">OWNER</span>
              </div>
              <div className="text-[10px] text-slate-400">Admin Command Suite</div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="p-3 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Operations & Control
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminTab === item.id || (item.id === 'customers' && adminTab === 'customer-profile');
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'customers') {
                    setSelectedCustomerIdForAdmin(null);
                  }
                  setAdminTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User info & Quick Actions */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/60">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
              WO
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{session.name || 'Webrunzo Owner'}</div>
              <div className="text-[10px] text-slate-400 truncate">{session.email || 'hello.webrunzo@gmail.com'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentExperience('public')}
              className="flex-1 text-[11px] py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-center flex items-center justify-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-indigo-400" />
              <span>Public Site</span>
            </button>
            <button
              onClick={() => logout()}
              className="text-[11px] py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-rose-400 transition flex items-center justify-center gap-1 cursor-pointer"
              title="Log out of Admin"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => setAdminTab('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <span className="font-bold text-sm text-white">Webrunzo Admin</span>
          </div>

          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileSidebarOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 animate-in fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'customers') setSelectedCustomerIdForAdmin(null);
                    setAdminTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
};
