import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Template,
  Plan,
  Customer,
  Payment,
  Enquiry,
  ActivityLog,
  AdminSettings,
  Role,
  ClientTier,
  UserSession,
  ClientWebsiteContent,
  CustomerStatus,
  PaymentStatus,
  WebsiteStatus,
  EnquiryStatus,
  OrderStatus,
  Order,
  SupportTicket,
  ClientNotification,
  WebsiteBackupSnapshot,
  BackupType,
} from '../types';
import {
  INITIAL_TEMPLATES,
  INITIAL_PLANS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_TICKETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_ENQUIRIES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SETTINGS,
  INITIAL_BACKUPS,
} from '../data/mockData';

export type Experience = 'public' | 'admin' | 'client';
export type PublicPage = 'home' | 'privacy' | 'terms' | 'sla';

export type AdminTab = 
  | 'dashboard' 
  | 'customers' 
  | 'customer-profile' 
  | 'orders' 
  | 'websites' 
  | 'backups'
  | 'subscriptions' 
  | 'payments' 
  | 'templates' 
  | 'enquiries' 
  | 'support'
  | 'settings';

export type ClientTab = 
  | 'dashboard' 
  | 'website' 
  | 'orders' 
  | 'plan' 
  | 'payments' 
  | 'support' 
  | 'profile' 
  | 'premium-health' 
  | 'premium-seo' 
  | 'premium-scripts';

interface PreviewModalState {
  isOpen: boolean;
  template: Template | null;
  customer: Customer | null;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
}

interface EnquiryModalState {
  isOpen: boolean;
  preselectedTemplateId?: string;
  preselectedPlanId?: string;
}

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // Navigation & Auth
  currentExperience: Experience;
  setCurrentExperience: (exp: Experience) => void;
  publicPage: PublicPage;
  setPublicPage: (page: PublicPage) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  clientTab: ClientTab;
  setClientTab: (tab: ClientTab) => void;
  selectedCustomerIdForAdmin: string | null;
  setSelectedCustomerIdForAdmin: (id: string | null) => void;
  
  session: UserSession;
  loginAsAdmin: (email?: string, password?: string) => boolean;
  loginAsClient: (customerId?: string, email?: string, password?: string) => boolean;
  logout: () => void;

  // Data
  templates: Template[];
  plans: Plan[];
  customers: Customer[];
  orders: Order[];
  tickets: SupportTicket[];
  notifications: ClientNotification[];
  payments: Payment[];
  enquiries: Enquiry[];
  activityLogs: ActivityLog[];
  settings: AdminSettings;
  backups: WebsiteBackupSnapshot[];

  // Actions
  addTemplate: (template: Omit<Template, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;

  updatePlan: (id: string, updates: Partial<Plan>) => void;

  addCustomer: (customerData: Partial<Customer>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  updateCustomerStatus: (id: string, status: CustomerStatus) => void;
  updateWebsiteStatus: (id: string, status: WebsiteStatus) => void;
  toggleWebsiteStatus: (id: string, customNotice?: string) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  updateClientContent: (customerId: string, content: Partial<ClientWebsiteContent>) => void;
  toggleCustomerTier: (customerId: string) => void;

  // Backups & Disaster Recovery
  triggerInstantBackup: (
    customerId: string,
    options?: {
      type?: BackupType;
      versionTag?: string;
      notes?: string;
      components?: {
        databaseState?: boolean;
        codeAssets?: boolean;
        mediaUploads?: boolean;
        sslDnsConfig?: boolean;
      };
    }
  ) => Promise<WebsiteBackupSnapshot>;
  restoreBackupSnapshot: (backupId: string, options?: { createSafetyCheckpoint?: boolean }) => Promise<{ success: boolean; message: string }>;
  deleteBackupSnapshot: (backupId: string) => void;
  triggerFleetAutoBackup: () => Promise<number>;
  testStagingRestore: (backupId: string) => string;

  // Orders
  addOrder: (orderData: Partial<Order>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  // Support Tickets
  addTicket: (ticketData: Omit<SupportTicket, 'id' | 'createdAt'>) => SupportTicket;
  updateTicketStatus: (id: string, status: SupportTicket['status']) => void;
  replyToTicket: (ticketId: string, message: string, sender: 'Client' | 'Admin', senderName: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;

  // Payments
  addPayment: (paymentData: Omit<Payment, 'id' | 'transactionId' | 'invoiceNumber'>) => void;
  updatePaymentState: (id: string, status: PaymentStatus) => void;

  // Enquiries
  submitEnquiry: (enquiryData: Omit<Enquiry, 'id' | 'date' | 'status'>) => void;
  updateEnquiryStatus: (id: string, status: EnquiryStatus, adminNotes?: string) => void;
  convertEnquiryToCustomer: (enquiryId: string) => Customer | null;

  updateSettings: (updates: Partial<AdminSettings>) => void;
  resetAllData: () => void;

  // Modals & UI
  previewModal: PreviewModalState;
  openPreviewModal: (template?: Template | null, customer?: Customer | null) => void;
  closePreviewModal: () => void;
  setPreviewDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;

  enquiryModal: EnquiryModalState;
  openEnquiryModal: (templateId?: string, planId?: string) => void;
  closeEnquiryModal: () => void;

  isConciergeOpen: boolean;
  setIsConciergeOpen: (open: boolean) => void;
  openConciergeModal: () => void;
  closeConciergeModal: () => void;

  toasts: Toast[];
  addToast: (type: Toast['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Getters
  currentClientCustomer: Customer | undefined;
  isPremiumClient: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TEMPLATES: 'webrunzo_demo_templates_v3',
  PLANS: 'webrunzo_demo_plans_v5',
  CUSTOMERS: 'webrunzo_demo_customers_v3',
  ORDERS: 'webrunzo_demo_orders_v3',
  TICKETS: 'webrunzo_demo_tickets_v3',
  NOTIFICATIONS: 'webrunzo_demo_notifications_v3',
  PAYMENTS: 'webrunzo_demo_payments_v3',
  ENQUIRIES: 'webrunzo_demo_enquiries_v3',
  LOGS: 'webrunzo_demo_logs_v3',
  SETTINGS: 'webrunzo_demo_settings_v5',
  SESSION: 'webrunzo_demo_session_v3',
  BACKUPS: 'webrunzo_demo_backups_v3',
};

// Helper to compute URL from state
function getUrlForState(exp: Experience, pubPage: PublicPage, cTab: ClientTab, aTab: AdminTab): string {
  if (exp === 'public') {
    if (pubPage === 'privacy') return '#/privacy-policy';
    if (pubPage === 'terms') return '#/terms';
    if (pubPage === 'sla') return '#/sla';
    return '#/';
  }
  if (exp === 'client') {
    if (cTab === 'dashboard') return '#/client';
    return `#/client/${cTab}`;
  }
  if (exp === 'admin') {
    if (aTab === 'dashboard') return '#/admin';
    return `#/admin/${aTab}`;
  }
  return '#/';
}

// Helper to parse URL to state
function parseUrlToState(): {
  experience: Experience;
  publicPage: PublicPage;
  clientTab: ClientTab;
  adminTab: AdminTab;
} {
  const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname || '' : '';
  
  const fullPath = (hash.startsWith('#') ? hash.slice(1) : pathname).toLowerCase();
  
  if (fullPath.includes('privacy-policy') || fullPath.includes('privacy')) {
    return { experience: 'public', publicPage: 'privacy', clientTab: 'dashboard', adminTab: 'dashboard' };
  }
  if (fullPath.includes('terms')) {
    return { experience: 'public', publicPage: 'terms', clientTab: 'dashboard', adminTab: 'dashboard' };
  }
  if (fullPath.includes('sla')) {
    return { experience: 'public', publicPage: 'sla', clientTab: 'dashboard', adminTab: 'dashboard' };
  }
  if (fullPath.startsWith('/premium') || fullPath.startsWith('premium') || fullPath.startsWith('/vip') || fullPath.startsWith('vip')) {
    let tab: ClientTab = 'dashboard';
    if (fullPath.includes('health')) tab = 'premium-health';
    else if (fullPath.includes('seo')) tab = 'premium-seo';
    else if (fullPath.includes('script')) tab = 'premium-scripts';
    return {
      experience: 'client',
      publicPage: 'home',
      clientTab: tab,
      adminTab: 'dashboard',
    };
  }
  if (fullPath.startsWith('/client') || fullPath.startsWith('client')) {
    const clean = fullPath.replace(/^\/?client\/?/, '');
    const tabPart = clean.split('/')[0] as ClientTab;
    const validClientTabs: ClientTab[] = [
      'dashboard', 'website', 'orders', 'plan', 'payments', 
      'support', 'profile', 'premium-health', 'premium-seo', 'premium-scripts'
    ];
    return {
      experience: 'client',
      publicPage: 'home',
      clientTab: validClientTabs.includes(tabPart) ? tabPart : 'dashboard',
      adminTab: 'dashboard',
    };
  }
  if (fullPath.startsWith('/admin') || fullPath.startsWith('admin')) {
    const clean = fullPath.replace(/^\/?admin\/?/, '');
    const tabPart = clean.split('/')[0] as AdminTab;
    const validAdminTabs: AdminTab[] = [
      'dashboard', 'customers', 'customer-profile', 'orders', 'websites',
      'backups', 'subscriptions', 'payments', 'templates', 'enquiries',
      'support', 'settings'
    ];
    return {
      experience: 'admin',
      publicPage: 'home',
      clientTab: 'dashboard',
      adminTab: validAdminTabs.includes(tabPart) ? tabPart : 'dashboard',
    };
  }
  
  return { experience: 'public', publicPage: 'home', clientTab: 'dashboard', adminTab: 'dashboard' };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [plans, setPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [backups, setBackups] = useState<WebsiteBackupSnapshot[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BACKUPS);
    return saved ? JSON.parse(saved) : INITIAL_BACKUPS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [notifications, setNotifications] = useState<ClientNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    return saved ? JSON.parse(saved) : INITIAL_ENQUIRIES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [session, setSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    return saved ? JSON.parse(saved) : { role: 'guest', email: '', name: 'Visitor' };
  });

  // Current Views with URL Sync
  const initialNav = parseUrlToState();
  const [currentExperience, setCurrentExperienceState] = useState<Experience>(initialNav.experience);
  const [publicPage, setPublicPageState] = useState<PublicPage>(initialNav.publicPage);
  const [adminTab, setAdminTabState] = useState<AdminTab>(initialNav.adminTab);
  const [clientTab, setClientTabState] = useState<ClientTab>(initialNav.clientTab);
  const [selectedCustomerIdForAdmin, setSelectedCustomerIdForAdmin] = useState<string | null>(null);

  const isPopstateEventRef = useRef(false);

  const updateUrlHistory = (
    nextExp: Experience, 
    nextPubPage: PublicPage, 
    nextClientTab: ClientTab, 
    nextAdminTab: AdminTab
  ) => {
    if (isPopstateEventRef.current) return;
    const targetUrl = getUrlForState(nextExp, nextPubPage, nextClientTab, nextAdminTab);
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash || '#/';
      if (currentHash !== targetUrl) {
        window.history.pushState(
          { exp: nextExp, pubPage: nextPubPage, clientTab: nextClientTab, adminTab: nextAdminTab },
          '',
          targetUrl
        );
      }
    }
  };

  const setCurrentExperience = (exp: Experience) => {
    setCurrentExperienceState(exp);
    updateUrlHistory(exp, publicPage, clientTab, adminTab);
  };

  const setPublicPage = (page: PublicPage) => {
    setPublicPageState(page);
    setCurrentExperienceState('public');
    updateUrlHistory('public', page, clientTab, adminTab);
  };

  const setClientTab = (tab: ClientTab) => {
    setClientTabState(tab);
    setCurrentExperienceState('client');
    updateUrlHistory('client', publicPage, tab, adminTab);
  };

  const setAdminTab = (tab: AdminTab) => {
    setAdminTabState(tab);
    setCurrentExperienceState('admin');
    updateUrlHistory('admin', publicPage, clientTab, tab);
  };

  // Browser Back / Forward and Hash Navigation Listener
  useEffect(() => {
    const handlePopState = () => {
      isPopstateEventRef.current = true;
      const parsed = parseUrlToState();
      setCurrentExperienceState(parsed.experience);
      setPublicPageState(parsed.publicPage);
      setClientTabState(parsed.clientTab);
      setAdminTabState(parsed.adminTab);
      setTimeout(() => {
        isPopstateEventRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Modals & UI
  const [previewModal, setPreviewModal] = useState<PreviewModalState>({
    isOpen: false,
    template: null,
    customer: null,
    deviceMode: 'desktop',
  });

  const [enquiryModal, setEnquiryModal] = useState<EnquiryModalState>({
    isOpen: false,
  });

  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  const openConciergeModal = () => setIsConciergeOpen(true);
  const closeConciergeModal = () => setIsConciergeOpen(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
  }, [enquiries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(backups));
  }, [backups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }, [session]);

  const addToast = (type: Toast['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logActivity = (type: ActivityLog['type'], title: string, description: string, user: string, customerId?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type,
      title,
      description,
      user,
      customerId,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Auth Helpers
  const loginAsAdmin = (email?: string, password?: string) => {
    // If credentials passed, verify
    if (email !== undefined && password !== undefined) {
      const validEmail = settings.adminEmail || 'hello.webrunzo@gmail.com';
      const validPass = settings.adminPassword || 'Dev.1303';
      if (email.trim().toLowerCase() !== validEmail.trim().toLowerCase() || password !== validPass) {
        addToast('error', 'Authentication Failed', 'Invalid admin email or password.');
        return false;
      }
    }

    setSession({
      role: 'admin',
      email: settings.adminEmail || 'hello.webrunzo@gmail.com',
      name: 'Sarah Jenkins (WebRunzo Owner)',
    });
    setCurrentExperience('admin');
    setAdminTab('dashboard');
    addToast('success', 'Admin Signed In', 'Welcome back to WebRunzo Owner Command Center');
    return true;
  };

  const loginAsClient = (customerId?: string, email?: string, password?: string) => {
    let targetCustomer: Customer | undefined;

    if (customerId) {
      targetCustomer = customers.find((c) => c.id === customerId);
    } else if (email) {
      targetCustomer = customers.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
    } else {
      // Default to first test customer
      targetCustomer = customers.find((c) => c.isTestAccount && c.clientTier === 'normal') || customers[0];
    }

    if (!targetCustomer) {
      addToast('error', 'Login Failed', 'Customer account not found.');
      return false;
    }

    // Role differentiation
    const role: Role = targetCustomer.clientTier === 'premium' ? 'premium_client' : 'normal_client';

    setSession({
      role,
      customerId: targetCustomer.id,
      clientTier: targetCustomer.clientTier,
      email: targetCustomer.email,
      name: targetCustomer.name,
      isTestSession: targetCustomer.isTestAccount,
    });
    setCurrentExperience('client');
    setClientTab('dashboard');
    addToast(
      'success',
      `${targetCustomer.clientTier === 'premium' ? 'VIP Premium' : 'Client'} Portal Signed In`,
      `Welcome back, ${targetCustomer.businessName}`
    );
    return true;
  };

  const logout = () => {
    setSession({
      role: 'guest',
      email: '',
      name: 'Visitor',
    });
    setCurrentExperience('public');
    addToast('info', 'Logged Out', 'You have been safely signed out.');
  };

  // Template Actions
  const addTemplate = (templateData: Omit<Template, 'id'>) => {
    const newTemplate: Template = {
      ...templateData,
      id: `tpl-${Date.now()}`,
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    logActivity('template', 'New Template Added', `Template "${newTemplate.name}" added to marketplace.`, session.name);
    addToast('success', 'Template Created', `"${newTemplate.name}" has been published to the gallery.`);
  };

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    addToast('success', 'Template Updated', 'Template modifications saved successfully.');
  };

  const deleteTemplate = (id: string) => {
    const target = templates.find((t) => t.id === id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    logActivity('template', 'Template Removed', `Template "${target?.name}" was deleted.`, session.name);
    addToast('info', 'Template Removed', 'The template was removed from the catalog.');
  };

  // Plan Actions
  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    addToast('success', 'Pricing Plan Updated', 'Pricing plan configurations saved.');
  };

  // Customer Actions
  const addCustomer = (customerData: Partial<Customer>): Customer => {
    const assignedTemplate = templates.find((t) => t.id === customerData.templateId) || templates[0];
    const isPremium = customerData.clientTier === 'premium' || customerData.planId === 'plan-business';
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: customerData.name || 'New Client',
      businessName: customerData.businessName || 'My Business',
      email: customerData.email || 'client@example.com',
      password: customerData.password || 'client123',
      phone: customerData.phone || '+1 (555) 000-0000',
      clientTier: customerData.clientTier || (isPremium ? 'premium' : 'normal'),
      planId: customerData.planId || (isPremium ? 'plan-business' : 'plan-pro'),
      templateId: customerData.templateId || assignedTemplate.id,
      paymentStatus: customerData.paymentStatus || 'Paid',
      planStartDate: customerData.planStartDate || new Date().toISOString().split('T')[0],
      planExpiryDate: customerData.planExpiryDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      websiteUrl: `https://${(customerData.businessName || 'mybrand').toLowerCase().replace(/[^a-z0-9]/g, '')}.webrunzo.app`,
      customDomain: customerData.customDomain,
      dnsStatus: customerData.dnsStatus || 'Active',
      sslStatus: customerData.sslStatus || 'Active',
      websiteStatus: customerData.websiteStatus || 'Live',
      accountStatus: customerData.accountStatus || 'Active',
      notes: customerData.notes || 'Created via WebRunzo Admin.',
      internalNotes: customerData.internalNotes || 'Standard account created.',
      seoScore: isPremium ? 98 : 92,
      speedScore: isPremium ? 99 : 94,
      uptimePercent: isPremium ? 99.98 : 99.9,
      autoRenew: true,
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          action: 'Customer account provisioned in WebRunzo.',
          user: session.name || 'Admin',
        },
      ],
      customContent: customerData.customContent || {
        businessName: customerData.businessName || 'My Business',
        tagline: assignedTemplate.sampleSections.tagline,
        heroHeadline: assignedTemplate.sampleSections.heroHeading,
        heroSubhead: assignedTemplate.sampleSections.heroSubtitle,
        primaryColor: assignedTemplate.colorScheme.accent,
        logoText: (customerData.businessName || 'MY BUSINESS').toUpperCase(),
        contactEmail: customerData.email || 'hello@mybusiness.com',
        contactPhone: customerData.phone || '+1 (555) 000-0000',
        address: '100 Business Center Ave, Suite 100',
        aboutText: `${customerData.businessName || 'We'} provide high-quality services dedicated to customer satisfaction.`,
        servicesList: (assignedTemplate?.sampleSections?.services || []).map((s) => ({
          title: s,
          desc: 'Professional high-standard service tailored to your exact specifications.',
        })),
        socialLinks: {
          instagram: 'https://instagram.com',
          facebook: 'https://facebook.com',
        },
      },
    };

    setCustomers((prev) => [newCust, ...prev]);

    // Also add corresponding Order
    const targetPlan = plans.find((p) => p.id === newCust.planId) || plans[1];
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: newCust.id,
      clientName: newCust.name,
      businessName: newCust.businessName,
      email: newCust.email,
      phone: newCust.phone,
      planId: newCust.planId,
      templateId: newCust.templateId,
      amount: targetPlan.annualPrice,
      status: 'Completed',
      paymentStatus: newCust.paymentStatus,
      date: newCust.planStartDate,
      deliveryDueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      requirements: `Turnkey build for ${newCust.businessName} on ${assignedTemplate.name} template.`,
      internalNotes: `Account enrolled by Admin. Tier: ${newCust.clientTier}.`,
      clientTier: newCust.clientTier,
      milestones: [
        { title: 'Order Enrolled & Payment Verified', completed: true, date: newCust.planStartDate },
        { title: 'Template Setup & Initial Build', completed: true, date: newCust.planStartDate },
        { title: 'Live Deployment & Domain Connection', completed: true, date: newCust.planStartDate },
      ],
    };
    setOrders((prev) => [newOrder, ...prev]);

    // Also add initial payment record
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: newCust.id,
      customerName: newCust.name,
      businessName: newCust.businessName,
      amount: targetPlan.annualPrice,
      planName: `${targetPlan.name} (Annual)`,
      date: newCust.planStartDate,
      status: newCust.paymentStatus,
      method: 'Credit Card / Electronic Settlement',
    };
    setPayments((prev) => [newPayment, ...prev]);

    logActivity('customer', 'New Customer Added', `${newCust.name} (${newCust.businessName}) was created.`, session.name, newCust.id);
    addToast('success', 'Customer Added', `${newCust.businessName} has been enrolled.`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          return updated;
        }
        return c;
      })
    );
    addToast('success', 'Customer Updated', 'Changes have been saved successfully.');
  };

  const toggleCustomerTier = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;
    const newTier: ClientTier = cust.clientTier === 'premium' ? 'normal' : 'premium';
    updateCustomer(customerId, {
      clientTier: newTier,
      slaLevel: newTier === 'premium' ? '2-Hour VIP Priority SLA' : undefined,
      seoScore: newTier === 'premium' ? 98 : cust.seoScore || 92,
      speedScore: newTier === 'premium' ? 99 : cust.speedScore || 94,
    });
    addToast('success', 'Client Tier Updated', `${cust.businessName} is now set to ${newTier.toUpperCase()} tier.`);
  };

  const deleteCustomer = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    logActivity('customer', 'Customer Deleted', `Customer account for ${cust?.businessName} was removed.`, session.name);
    addToast('info', 'Customer Deleted', 'Customer account was removed.');
  };

  const updateCustomerStatus = (id: string, status: CustomerStatus) => {
    updateCustomer(id, { accountStatus: status });
    logActivity('customer', 'Account Status Changed', `Customer ${id} status set to ${status}.`, session.name, id);
    addToast('info', 'Status Updated', `Account marked as ${status}.`);
  };

  const updateWebsiteStatus = (id: string, status: WebsiteStatus) => {
    updateCustomer(id, { websiteStatus: status });
    logActivity('website', 'Website Status Changed', `Customer website status updated to ${status}.`, session.name, id);
    addToast('success', 'Website Status Updated', `Website status is now ${status}.`);
  };

  const toggleWebsiteStatus = (id: string, customNotice?: string) => {
    const cust = customers.find((c) => c.id === id);
    if (!cust) return;
    const isCurrentlySuspended = cust.websiteStatus === 'Suspended';
    const newStatus: WebsiteStatus = isCurrentlySuspended ? 'Live' : 'Suspended';

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            websiteStatus: newStatus,
            maintenanceNotice: customNotice !== undefined ? customNotice : c.maintenanceNotice,
          };
        }
        return c;
      })
    );

    if (newStatus === 'Suspended') {
      logActivity(
        'website',
        'Website Manually Suspended / Shutdown',
        `Admin shut down live access for ${cust.businessName}. Maintenance notice is now displayed on the public URL.`,
        session.name,
        id
      );
      addToast('warning', 'Website Shut Down', `${cust.businessName}'s website was taken offline. Maintenance notice is now active.`);
    } else {
      logActivity(
        'website',
        'Website Restored & Activated',
        `Admin restored live public access for ${cust.businessName}.`,
        session.name,
        id
      );
      addToast('success', 'Website Activated', `${cust.businessName}'s website is now live and fully accessible.`);
    }
  };

  const updatePaymentStatus = (id: string, status: PaymentStatus) => {
    updateCustomer(id, { paymentStatus: status });
    logActivity('payment', 'Payment Status Changed', `Payment status for customer ${id} updated to ${status}.`, session.name, id);
    addToast('success', 'Payment Status Updated', `Payment marked as ${status}.`);
  };

  const updateClientContent = (customerId: string, contentUpdates: Partial<ClientWebsiteContent>) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedContent = { ...c.customContent, ...contentUpdates };
          const newHistory = [
            {
              id: `act-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              action: 'Website content updated via Client Portal.',
              user: session.name || c.name,
            },
            ...c.activityHistory,
          ];
          return {
            ...c,
            businessName: contentUpdates.businessName || c.businessName,
            customContent: updatedContent,
            activityHistory: newHistory,
          };
        }
        return c;
      })
    );
    logActivity('website', 'Client Website Edited', `Content was updated for ${customerId}`, session.name, customerId);
    addToast('success', 'Website Content Saved', 'Your website has been updated and the live preview refreshed!');
  };

  // Backups & Disaster Recovery Actions
  const triggerInstantBackup = async (
    customerId: string,
    options?: {
      type?: BackupType;
      versionTag?: string;
      notes?: string;
      components?: {
        databaseState?: boolean;
        codeAssets?: boolean;
        mediaUploads?: boolean;
        sslDnsConfig?: boolean;
      };
    }
  ): Promise<WebsiteBackupSnapshot> => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }

    const now = new Date();
    const formattedUtc = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`;
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const checksum = `sha256:${randomHex}${Math.floor(100000 + Math.random() * 900000)}`;
    const randomMb = (cust.clientTier === 'premium' ? 150 + Math.random() * 80 : 85 + Math.random() * 60).toFixed(1);
    const sizeBytes = Math.round(parseFloat(randomMb) * 1024 * 1024);
    const versionNumber = options?.versionTag || `v${Math.floor(1 + Math.random() * 3)}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}-snapshot`;
    const backupId = `snap-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`;

    const newSnapshot: WebsiteBackupSnapshot = {
      id: backupId,
      customerId: cust.id,
      clientName: cust.name,
      businessName: cust.businessName,
      websiteUrl: cust.websiteUrl,
      customDomain: cust.customDomain,
      timestamp: formattedUtc,
      sizeFormatted: `${randomMb} MB`,
      sizeBytes,
      storageLocation: settings.backupStorageProvider || 'AWS S3 Mumbai ap-south-1 (AES-256)',
      status: 'Success',
      type: options?.type || 'Manual Admin Snapshot',
      versionTag: versionNumber,
      checksum,
      componentsIncluded: {
        databaseState: options?.components?.databaseState !== false,
        codeAssets: options?.components?.codeAssets !== false,
        mediaUploads: options?.components?.mediaUploads !== false,
        sslDnsConfig: options?.components?.sslDnsConfig !== false,
      },
      snapshotData: {
        customContentSnapshot: JSON.parse(JSON.stringify(cust.customContent)),
        templateIdSnapshot: cust.templateId,
        customDomain: cust.customDomain,
        dnsStatus: cust.dnsStatus,
        sslStatus: cust.sslStatus,
      },
      notes: options?.notes || `Manual on-demand snapshot captured by ${session.name || 'Owner Admin'}. Verified encryption & database state.`,
      retentionDays: settings.backupRetentionDays || 30,
      expiresAt: `${new Date(Date.now() + (settings.backupRetentionDays || 30) * 86400000).toISOString().split('T')[0]} 02:00:00 UTC`,
      isStagingPreviewReady: true,
      stagingPreviewUrl: `https://sandbox-preview.webrunzo.dev/restore-${backupId}`,
    };

    setBackups((prev) => [newSnapshot, ...prev]);

    // Add activity to customer
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const act = {
            id: `act-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            action: `Website Backup snapshot captured (${newSnapshot.versionTag} • ${newSnapshot.sizeFormatted})`,
            user: session.name || 'Admin',
          };
          return { ...c, activityHistory: [act, ...c.activityHistory] };
        }
        return c;
      })
    );

    logActivity(
      'backup',
      'Snapshot Captured',
      `Full-site backup (${newSnapshot.versionTag}, ${newSnapshot.sizeFormatted}) created for ${cust.businessName}.`,
      session.name || 'Admin',
      customerId
    );

    addToast('success', 'Backup Captured!', `Encrypted snapshot ${newSnapshot.versionTag} stored in offsite vault.`);
    return newSnapshot;
  };

  const restoreBackupSnapshot = async (
    backupId: string,
    options?: { createSafetyCheckpoint?: boolean }
  ): Promise<{ success: boolean; message: string }> => {
    const backup = backups.find((b) => b.id === backupId);
    if (!backup) {
      throw new Error(`Backup snapshot ${backupId} not found`);
    }

    const cust = customers.find((c) => c.id === backup.customerId);
    if (!cust) {
      throw new Error(`Target customer ${backup.customerId} no longer exists`);
    }

    // Optionally create a pre-restore safety checkpoint
    if (options?.createSafetyCheckpoint !== false) {
      const now = new Date();
      const safetySnapshot: WebsiteBackupSnapshot = {
        id: `snap-safety-${Date.now().toString(36)}`,
        customerId: cust.id,
        clientName: cust.name,
        businessName: cust.businessName,
        websiteUrl: cust.websiteUrl,
        customDomain: cust.customDomain,
        timestamp: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`,
        sizeFormatted: backup.sizeFormatted,
        sizeBytes: backup.sizeBytes,
        storageLocation: settings.backupStorageProvider || 'AWS S3 Mumbai ap-south-1 (AES-256)',
        status: 'Success',
        type: 'Emergency Hotfix Point',
        versionTag: `pre-rollback-${Date.now().toString().slice(-4)}`,
        checksum: `sha256:${Math.random().toString(36).substring(2, 12)}`,
        componentsIncluded: {
          databaseState: true,
          codeAssets: true,
          mediaUploads: true,
          sslDnsConfig: true,
        },
        snapshotData: {
          customContentSnapshot: JSON.parse(JSON.stringify(cust.customContent)),
          templateIdSnapshot: cust.templateId,
          customDomain: cust.customDomain,
          dnsStatus: cust.dnsStatus,
          sslStatus: cust.sslStatus,
        },
        notes: `Automatic safety checkpoint taken prior to disaster recovery restore of ${backup.versionTag}.`,
        retentionDays: 90,
        isStagingPreviewReady: true,
        stagingPreviewUrl: `https://sandbox-preview.webrunzo.dev/restore-safety`,
      };
      setBackups((prev) => [safetySnapshot, ...prev]);
    }

    // Perform rollback on customer object
    const restoredContent = JSON.parse(JSON.stringify(backup.snapshotData.customContentSnapshot));
    const restoredTemplate = backup.snapshotData.templateIdSnapshot;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === backup.customerId) {
          const act = {
            id: `act-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            action: `Disaster Recovery Rollback: Restored to snapshot ${backup.versionTag} (${backup.timestamp})`,
            user: session.name || 'Admin',
          };
          return {
            ...c,
            businessName: restoredContent.businessName || c.businessName,
            customContent: restoredContent,
            templateId: restoredTemplate,
            customDomain: backup.snapshotData.customDomain !== undefined ? backup.snapshotData.customDomain : c.customDomain,
            dnsStatus: backup.snapshotData.dnsStatus !== undefined ? backup.snapshotData.dnsStatus : c.dnsStatus,
            sslStatus: backup.snapshotData.sslStatus !== undefined ? backup.snapshotData.sslStatus : c.sslStatus,
            activityHistory: [act, ...c.activityHistory],
          };
        }
        return c;
      })
    );

    logActivity(
      'backup',
      'Disaster Recovery Rollback Executed',
      `Restored ${cust.businessName} live site back to snapshot ${backup.versionTag} (${backup.timestamp}).`,
      session.name || 'Admin',
      cust.id
    );

    addToast('success', '1-Click Recovery Successful!', `${cust.businessName} has been rolled back to ${backup.versionTag} and Edge CDN cache was flushed.`);
    return { success: true, message: `Successfully restored to version ${backup.versionTag}` };
  };

  const deleteBackupSnapshot = (backupId: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== backupId));
    addToast('info', 'Snapshot Pruned', 'Backup archive metadata removed from cloud ledger.');
  };

  const triggerFleetAutoBackup = async (): Promise<number> => {
    const activeCusts = customers.filter((c) => c.websiteStatus === 'Live' || c.websiteStatus === 'In Progress');
    let count = 0;
    for (const c of activeCusts) {
      await triggerInstantBackup(c.id, {
        type: 'Automated Daily',
        versionTag: `v${Math.floor(2 + Math.random() * 2)}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}-fleet`,
        notes: 'Automated fleet-wide nightly disaster recovery synchronization.',
      });
      count++;
    }
    addToast('success', 'Fleet Auto-Backup Completed', `Successfully backed up all ${count} active client websites.`);
    return count;
  };

  const testStagingRestore = (backupId: string): string => {
    const snap = backups.find((b) => b.id === backupId);
    if (!snap) return 'https://sandbox-preview.webrunzo.dev/not-found';
    return snap.stagingPreviewUrl || `https://sandbox-preview.webrunzo.dev/restore-${backupId}`;
  };

  // Order Actions
  const addOrder = (orderData: Partial<Order>): Order => {
    const newOrd: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: orderData.customerId || `cust-${Date.now()}`,
      clientName: orderData.clientName || 'New Client',
      businessName: orderData.businessName || 'My Business',
      email: orderData.email || 'client@example.com',
      phone: orderData.phone || '+1 (555) 000-0000',
      planId: orderData.planId || 'plan-pro',
      templateId: orderData.templateId || 'tpl-biz-1',
      amount: orderData.amount || 499,
      status: orderData.status || 'New',
      paymentStatus: orderData.paymentStatus || 'Pending',
      date: new Date().toISOString().split('T')[0],
      deliveryDueDate: orderData.deliveryDueDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      requirements: orderData.requirements || 'Standard website build request.',
      internalNotes: orderData.internalNotes || '',
      clientTier: orderData.clientTier || 'normal',
      milestones: [
        { title: 'Order Received', completed: true, date: new Date().toISOString().split('T')[0] },
        { title: 'Design Customization & Review', completed: false },
        { title: 'Quality Assurance & SEO Optimization', completed: false },
        { title: 'Live Production Launch', completed: false },
      ],
    };
    setOrders((prev) => [newOrd, ...prev]);
    logActivity('order', 'New Order Created', `Order ${newOrd.orderNumber} placed by ${newOrd.businessName}.`, session.name);
    addToast('success', 'Order Created', `Order ${newOrd.orderNumber} successfully registered.`);
    return newOrd;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    addToast('success', 'Order Updated', 'Order details saved successfully.');
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    logActivity('order', 'Order Status Updated', `Order ${id} status set to ${status}.`, session.name);
    addToast('info', 'Order Status Updated', `Order status is now ${status}.`);
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    addToast('info', 'Order Deleted', 'Order was removed from records.');
  };

  // Support Ticket Actions
  const addTicket = (ticketData: Omit<SupportTicket, 'id' | 'createdAt'>): SupportTicket => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newTkt: SupportTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      createdAt: formatted,
      status: 'Open',
    };
    setTickets((prev) => [newTkt, ...prev]);
    addToast('success', 'Support Ticket Submitted', `Ticket #${newTkt.id} created. Our team is on it.`);
    return newTkt;
  };

  const updateTicketStatus = (id: string, status: SupportTicket['status']) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    addToast('info', 'Ticket Status Changed', `Ticket status is now ${status}.`);
  };

  const replyToTicket = (ticketId: string, message: string, sender: 'Client' | 'Admin', senderName: string) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newReply = {
      id: `rep-${Date.now()}`,
      sender,
      senderName,
      message,
      timestamp: formatted,
    };
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            replies: [...(t.replies || []), newReply],
          };
        }
        return t;
      })
    );
    addToast('success', 'Message Sent', 'Your reply has been posted.');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // Payment Actions
  const addPayment = (paymentData: Omit<Payment, 'id' | 'transactionId' | 'invoiceNumber'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
    };
    setPayments((prev) => [newPayment, ...prev]);
    logActivity('payment', 'Payment Logged', `Received $${newPayment.amount} from ${newPayment.businessName}.`, session.name, newPayment.customerId);
    addToast('success', 'Payment Recorded', `Invoice ${newPayment.invoiceNumber} created.`);
  };

  const updatePaymentState = (id: string, status: PaymentStatus) => {
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    addToast('info', 'Payment Status Updated', `Payment status changed to ${status}.`);
  };

  // Enquiry Actions
  const submitEnquiry = (enquiryData: Omit<Enquiry, 'id' | 'date' | 'status'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: `enq-${Date.now()}`,
      date: formattedDate,
      status: 'New',
    };
    setEnquiries((prev) => [newEnquiry, ...prev]);
    logActivity('enquiry', 'New Website Enquiry', `${newEnquiry.name} submitted an enquiry for ${newEnquiry.business}.`, 'Visitor');
    addToast('success', 'Enquiry Submitted!', 'Thank you! Our WebRunzo specialist will contact you shortly.');
  };

  const updateEnquiryStatus = (id: string, status: EnquiryStatus, adminNotes?: string) => {
    setEnquiries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            status,
            ...(adminNotes !== undefined ? { adminNotes } : {}),
          };
        }
        return e;
      })
    );
    addToast('info', 'Enquiry Updated', `Enquiry marked as ${status}.`);
  };

  const convertEnquiryToCustomer = (enquiryId: string): Customer | null => {
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) return null;

    const newCustomer = addCustomer({
      name: enq.name,
      businessName: enq.business,
      email: enq.email,
      phone: enq.phone,
      templateId: enq.selectedTemplateId || templates[0].id,
      planId: enq.selectedPlanId || plans[1].id,
      paymentStatus: 'Paid',
      websiteStatus: 'In Progress',
      accountStatus: 'Active',
      notes: `Converted from Website Enquiry on ${enq.date}. Client message: "${enq.message}"`,
    });

    updateEnquiryStatus(enquiryId, 'Converted', `Converted to Customer: ${newCustomer.businessName} (ID: ${newCustomer.id})`);
    addToast('success', 'Enquiry Converted!', `${newCustomer.businessName} has been created and Client Portal access activated.`);
    return newCustomer;
  };

  const updateSettings = (updates: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    addToast('success', 'Settings Saved', 'Platform configuration successfully updated.');
  };

  const resetAllData = () => {
    localStorage.clear();
    setTemplates(INITIAL_TEMPLATES);
    setPlans(INITIAL_PLANS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setTickets(INITIAL_TICKETS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setPayments(INITIAL_PAYMENTS);
    setEnquiries(INITIAL_ENQUIRIES);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSettings(INITIAL_SETTINGS);
    setSession({ role: 'guest', email: '', name: 'Visitor' });
    setCurrentExperience('public');
    addToast('info', 'Demo Reset', 'All data has been reset to original factory demo state.');
  };

  // Modals
  const openPreviewModal = (template?: Template | null, customer?: Customer | null) => {
    setPreviewModal({
      isOpen: true,
      template: template || (customer ? templates.find((t) => t.id === customer.templateId) || templates[0] : templates[0]),
      customer: customer || null,
      deviceMode: 'desktop',
    });
  };

  const closePreviewModal = () => {
    setPreviewModal((prev) => ({ ...prev, isOpen: false }));
  };

  const setPreviewDeviceMode = (deviceMode: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewModal((prev) => ({ ...prev, deviceMode }));
  };

  const openEnquiryModal = (templateId?: string, planId?: string) => {
    setEnquiryModal({
      isOpen: true,
      preselectedTemplateId: templateId,
      preselectedPlanId: planId,
    });
  };

  const closeEnquiryModal = () => {
    setEnquiryModal({ isOpen: false });
  };

  const currentClientCustomer = session.customerId
    ? customers.find((c) => c.id === session.customerId) || customers[0]
    : (session.role === 'premium_client' || clientTab.startsWith('premium-')
        ? (customers.find((c) => c.clientTier === 'premium') || customers[0])
        : customers[0]);

  const isPremiumClient = session.role === 'premium_client' || (currentClientCustomer?.clientTier === 'premium') || clientTab.startsWith('premium-');

  return (
    <AppContext.Provider
      value={{
        currentExperience,
        setCurrentExperience,
        publicPage,
        setPublicPage,
        adminTab,
        setAdminTab,
        clientTab,
        setClientTab,
        selectedCustomerIdForAdmin,
        setSelectedCustomerIdForAdmin,
        session,
        loginAsAdmin,
        loginAsClient,
        logout,
        templates,
        plans,
        customers,
        orders,
        tickets,
        notifications,
        payments,
        enquiries,
        activityLogs,
        settings,
        backups,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        updatePlan,
        addCustomer,
        updateCustomer,
        toggleCustomerTier,
        deleteCustomer,
        updateCustomerStatus,
        updateWebsiteStatus,
        toggleWebsiteStatus,
        updatePaymentStatus,
        updateClientContent,
        triggerInstantBackup,
        restoreBackupSnapshot,
        deleteBackupSnapshot,
        triggerFleetAutoBackup,
        testStagingRestore,
        addOrder,
        updateOrder,
        updateOrderStatus,
        deleteOrder,
        addTicket,
        updateTicketStatus,
        replyToTicket,
        markNotificationRead,
        addPayment,
        updatePaymentState,
        submitEnquiry,
        updateEnquiryStatus,
        convertEnquiryToCustomer,
        updateSettings,
        resetAllData,
        previewModal,
        openPreviewModal,
        closePreviewModal,
        setPreviewDeviceMode,
        enquiryModal,
        openEnquiryModal,
        closeEnquiryModal,
        isConciergeOpen,
        setIsConciergeOpen,
        openConciergeModal,
        closeConciergeModal,
        toasts,
        addToast,
        removeToast,
        currentClientCustomer,
        isPremiumClient,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

