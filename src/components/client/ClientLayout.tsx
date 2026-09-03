import React, { useState } from 'react';
import { useApp, ClientTab } from '../../context/AppContext';
import { useAgentAvailability } from '../../utils/agentAvailability';
import { 
  LayoutDashboard, 
  Globe, 
  HardDrive,
  ShoppingBag, 
  CreditCard, 
  Receipt, 
  User, 
  LifeBuoy, 
  LogOut, 
  ExternalLink, 
  Sparkles, 
  PhoneCall, 
  Menu, 
  X,
  ChevronRight,
  Activity,
  Search,
  Code,
  ShieldCheck,
  Zap,
  Clock,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { ClientNotificationCenter } from './ClientNotificationCenter';

interface Props {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<Props> = ({ children }) => {
  const { 
    clientTab, 
    setClientTab, 
    currentClientCustomer,
    isPremiumClient,
    session, 
    logout, 
    setCurrentExperience,
    setPublicPage,
    settings,
    openPreviewModal,
    openConciergeModal,
    templates,
    plans,
    orders,
    tickets,
    notifications
  } = useApp();

  const availability = useAgentAvailability(settings);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const customer = currentClientCustomer;
  const isVip = isPremiumClient || customer?.clientTier === 'premium' || session.role === 'premium_client' || clientTab.startsWith('premium-');
  const currentPlan = plans.find((p) => p.id === customer?.planId);
  const currentTemplate = templates.find((t) => t.id === customer?.templateId);

  const clientNotifs = notifications.filter((n) => n.customerId === customer?.id);
  const unreadNotifsCount = clientNotifs.filter((n) => !n.read).length;

  const myOrdersCount = orders.filter((o) => o.customerId === customer?.id && o.status !== 'Completed').length;
  const myOpenTickets = tickets.filter((t) => (t.customerId === customer?.id || t.email === customer?.email) && t.status !== 'Resolved' && t.status !== 'Closed').length;

  const storageNearOrFull = customer?.storage?.isLimitReached || customer?.storage?.isNearLimit;

  const handleNavClick = (id: ClientTab) => {
    setClientTab(id);
  };

  const baseNavItems: { id: ClientTab; label: string; icon: React.ElementType; badge?: number; alert?: boolean }[] = [
    { id: 'dashboard', label: 'My Portal Home', icon: LayoutDashboard },
    { id: 'website', label: 'Website & Content', icon: Globe },
    { id: 'storage', label: 'Cloud Storage & Files', icon: HardDrive, alert: storageNearOrFull },
    { id: 'orders', label: 'My Orders & Progress', icon: ShoppingBag, badge: myOrdersCount > 0 ? myOrdersCount : undefined },
    { id: 'plan', label: 'Plan & Membership', icon: CreditCard },
    { id: 'payments', label: 'Invoices & Billing', icon: Receipt },
    { id: 'support', label: 'Support & Concierge', icon: LifeBuoy, badge: myOpenTickets > 0 ? myOpenTickets : undefined },
    { id: 'profile', label: 'Business Profile', icon: User },
  ];

  const premiumNavItems: { id: ClientTab; label: string; icon: React.ElementType }[] = [
    { id: 'premium-health', label: 'Performance & Uptime', icon: Activity },
    { id: 'premium-seo', label: 'VIP SEO Suite', icon: Search },
    { id: 'premium-scripts', label: 'Tag & Script Manager', icon: Code },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setClientTab('dashboard')}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md ${
              isVip ? 'bg-amber-600 shadow-amber-600/30' : 'bg-indigo-600 shadow-indigo-600/30'
            }`}>
              W
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                Webrunzo 
                {isVip ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    VIP
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-normal">
                    CLIENT
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">Client Control Suite</div>
            </div>
          </div>
        </div>

        {/* Business Badge */}
        {customer && (
          <div className={`p-4 border-b border-slate-800/80 ${isVip ? 'bg-amber-950/20' : 'bg-slate-950/40'}`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs ${
                isVip ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                {customer.businessName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{customer.businessName}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{customer.websiteStatus} Website</span>
                </div>
              </div>
            </div>

            {isVip && (
              <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px]">
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  Priority SLA 2-Hour
                </span>
                <span className="text-slate-400 font-mono">VIP Active</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <div className="p-3 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Client Management
          </div>
          {baseNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = clientTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? isVip 
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25' 
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Storage alert" />
                  )}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-indigo-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Premium VIP Exclusive Navigation Section */}
          {isVip && (
            <div className="pt-3 mt-3 border-t border-slate-800 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>VIP Premium Tools</span>
              </div>
              {premiumNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = clientTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                        : 'text-amber-200/70 hover:text-amber-100 hover:bg-amber-950/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Support Hotline Widget */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/60">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{isVip ? 'VIP Concierge Line' : 'Dedicated Support'}</span>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${availability.badgeBg} ${availability.badgeText} ${availability.badgeBorder} flex items-center gap-1`}>
                <span className={`w-1.5 h-1.5 rounded-full ${availability.dotColor} ${availability.dotPulse ? 'animate-pulse' : ''}`}></span>
                {availability.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {isVip 
                ? 'Your priority queue guarantees 2-hour response turnaround.'
                : 'Need changes made to your website? Reach our webmasters on WhatsApp.'}
            </p>
            <div className="text-[10px] text-slate-500 font-mono">
              Hours: {availability.hoursSummary}
            </div>
            <button
              type="button"
              onClick={() => openConciergeModal('Client Support Request')}
              className={`w-full block text-center py-2 rounded-xl text-white text-[11px] font-bold transition shadow cursor-pointer ${
                availability.status === 'Online'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : availability.status === 'Away'
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              Chat on WhatsApp ({availability.status})
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setCurrentExperience('public')}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-indigo-400" />
              <span>Public Site</span>
            </button>
            <button
              onClick={() => logout()}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
            isVip ? 'bg-amber-600' : 'bg-indigo-600'
          }`}>
            W
          </div>
          <span className="font-extrabold text-sm text-white">
            {isVip ? 'Webrunzo VIP Portal' : 'Webrunzo Client Portal'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-client-notifications-mobile"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg transition cursor-pointer ${
              showNotifications ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-slate-900">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-300 p-2 rounded-lg hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 text-xs">
          {baseNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleNavClick(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg font-semibold ${
                clientTab === item.id ? (isVip ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white') : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
          {isVip && (
            <>
              <div className="px-3 pt-2 text-[10px] font-bold text-amber-400 uppercase">VIP Tools</div>
              {premiumNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavClick(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg font-semibold ${
                    clientTab === item.id ? 'bg-amber-600 text-white' : 'text-amber-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Topbar */}
        <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Client Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-semibold capitalize">{clientTab.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-client-notifications-desktop"
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                  showNotifications
                    ? 'bg-slate-800 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                }`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
                    {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                  </span>
                )}
              </button>

              <ClientNotificationCenter
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                customerId={customer?.id || ''}
              />
            </div>

            {customer && (
              <button
                onClick={() => openPreviewModal(currentTemplate, customer)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl text-white shadow-sm transition cursor-pointer ${
                  isVip ? 'bg-amber-600 hover:bg-amber-500' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Website Preview</span>
              </button>
            )}
          </div>
        </header>

        {/* Content View with Footer */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col justify-between">
          <div className="flex-1">
            {children}
          </div>

          {/* Client Portal Footer with Legal Links */}
          <footer className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>&copy; {new Date().getFullYear()} WebRunzo Managed Digital Solutions. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
              <button
                id="btn-client-footer-privacy"
                type="button"
                onClick={() => setPublicPage('privacy')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                id="btn-client-footer-terms"
                type="button"
                onClick={() => setPublicPage('terms')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                id="btn-client-footer-sla"
                type="button"
                onClick={() => setPublicPage('sla')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Service Level Agreement (SLA)
              </button>
            </div>
          </footer>
        </main>
      </div>

    </div>
  );
};
