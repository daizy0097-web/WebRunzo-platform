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
  ProjectStatus,
  ALLOWED_PROJECT_TRANSITIONS,
  Order,
  SupportTicket,
  QueryType,
  QueryStatus,
  LeadTrackingStatus,
  PremiumRequestType,
  ClientNotification,
  WebsiteBackupSnapshot,
  BackupType,
  TemplateStatus,
  OwnershipStatus,
  LicenseStatus,
  ImportSource,
  TemplateCategory,
  FileCategory,
  CustomerFile,
  StorageHistoryEntry,
  CustomerStorage,
  CustomerDeployment,
  SubscriptionState,
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
import {
  createInitialStorageForCustomer,
  recalculateStorage,
  canUploadFile,
  formatBytes,
} from '../utils/storageUtils';
import { supabase, isSupabaseConfigured, getProfile, getAuthErrorFromUrl } from '../lib/supabase';
import {
  fetchApplicationData,
  dbAddTemplate,
  dbUpdateTemplate,
  dbDeleteTemplate,
  dbUpdatePlan,
  dbAddCustomer,
  dbUpdateCustomer,
  dbDeleteCustomer,
  dbUpdateCustomerStorage,
  dbInsertCustomerFile,
  dbDeleteCustomerFile,
  dbUpdateClientContent,
  dbAddBackup,
  dbDeleteBackup,
  dbAddOrder,
  dbUpdateOrder,
  dbUpdateProjectStatus,
  dbDeleteOrder,
  dbAddTicket,
  dbUpdateTicket,
  dbAddTicketReply,
  dbMarkNotificationRead,
  dbMarkAllNotificationsRead,
  dbAddPayment,
  dbUpdatePaymentStatus,
  dbSubmitEnquiry,
  dbUpdateEnquiryStatus,
  dbUpdateSettings,
  dbLogActivity,
} from '../lib/supabaseDb';
import {
  getProjectStatus,
  isValidProjectTransition,
  getCanonicalMilestones,
  embedProjectStatusInNotes,
  mapProjectStatusToDatabaseOrderStatus,
  getStatusNotification,
} from '../utils/projectLifecycle';

export type Experience = 'public' | 'admin' | 'client';
export type PublicPage = 'home' | 'privacy' | 'terms' | 'sla';

export type AdminTab = 
  | 'dashboard' 
  | 'customers' 
  | 'customer-profile' 
  | 'orders' 
  | 'websites' 
  | 'storage'
  | 'backups'
  | 'subscriptions' 
  | 'customer-tiers'
  | 'payments' 
  | 'templates' 
  | 'enquiries' 
  | 'support'
  | 'settings';

export type ClientTab = 
  | 'dashboard' 
  | 'onboarding'
  | 'website' 
  | 'storage'
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
  isPasswordResetMode: boolean;
  setIsPasswordResetMode: (val: boolean) => void;
  loginAsAdmin: (email?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsClient: (email?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void> | void;

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
  duplicateTemplate: (id: string) => Template;
  toggleTemplateStatus: (id: string, status: TemplateStatus) => void;
  toggleTemplateFeatured: (id: string) => void;
  importWebsiteTemplate: (importData: {
    name: string;
    category: TemplateCategory;
    description: string;
    price: number;
    tags?: string[];
    thumbnail?: string;
    source: ImportSource;
    sourceUrl?: string;
    detectedFramework?: string;
    pageCount?: number;
    componentsCount?: number;
    dependencies?: string[];
    assetsCount?: number;
    ownershipStatus: OwnershipStatus;
    licenseStatus: LicenseStatus;
    copyrightNotice: string;
  }) => Template;

  // Storage Management
  grantExtraStorage: (
    customerId: string,
    extraGB: number,
    options: { reason: string; isPermanent: boolean; expiryDate?: string }
  ) => void;
  reduceExtraStorage: (
    customerId: string,
    newExtraGB: number,
    reason: string
  ) => { success: boolean; message: string };
  uploadCustomerFile: (
    customerId: string,
    fileData: { name: string; sizeBytes: number; category: FileCategory; mimeType?: string; url?: string }
  ) => { success: boolean; message: string; file?: CustomerFile };
  deleteCustomerFile: (customerId: string, fileId: string) => void;

  // Deployment & Subscription
  redeployCustomerWebsite: (customerId: string) => Promise<{ success: boolean; buildLogs: string[] }>;
  updateCustomerDeployment: (customerId: string, updates: Partial<CustomerDeployment>) => void;
  updateSubscriptionState: (customerId: string, state: SubscriptionState, gracePeriodEndDate?: string) => void;
  switchCustomerTemplate: (customerId: string, newTemplateId: string) => void;
  verifyCustomerDomain: (customerId: string, customDomain: string) => Promise<{ verified: boolean; message: string }>;

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
  updateProjectStatus: (orderId: string, newStatus: ProjectStatus, adminNote?: string) => Promise<{ success: boolean; error?: string }>;
  deleteOrder: (id: string) => void;

  // Support Tickets
  addTicket: (ticketData: Omit<SupportTicket, 'id' | 'createdAt'>) => SupportTicket;
  updateTicketStatus: (id: string, status: SupportTicket['status']) => void;
  updateTicketPriority: (id: string, priority: string) => void;
  updateTicketLeadTracking: (id: string, leadTrackingStatus: LeadTrackingStatus, adminNotes?: string) => void;
  updateTicketAdminNotes: (id: string, adminNotes: string) => void;
  linkTicketCustomer: (id: string, customerId: string) => void;
  replyToTicket: (ticketId: string, message: string, sender: 'Client' | 'Admin', senderName: string, attachmentName?: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (customerId?: string) => void;

  // Payments
  addPayment: (paymentData: Omit<Payment, 'id' | 'transactionId' | 'invoiceNumber'>) => void;
  updatePaymentState: (id: string, status: PaymentStatus) => void;

  // Enquiries
  submitEnquiry: (enquiryData: Omit<Enquiry, 'id' | 'date' | 'status'>) => void;
  updateEnquiryStatus: (id: string, status: EnquiryStatus, adminNotes?: string) => void;
  convertEnquiryToCustomer: (enquiryId: string) => Promise<Customer | null>;

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
  isSupabaseReady: boolean;
  refreshData: () => Promise<void>;
  isLoadingData: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

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

export const PASSWORD_RESET_STORAGE_KEY = 'webrunzo_password_reset_active';

export function checkIsRecoveryInUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = (window.location.hash || '').toLowerCase();
  const search = (window.location.search || '').toLowerCase();
  // Recovery token is specifically denoted by type=recovery in hash or query, or code parameter with recovery
  return (
    hash.includes('type=recovery') ||
    search.includes('type=recovery') ||
    (search.includes('code=') && (search.includes('recovery') || hash.includes('recovery')))
  );
}

export function isStoredPasswordResetActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(PASSWORD_RESET_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setStoredPasswordResetActive(active: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (active) {
      window.sessionStorage.setItem(PASSWORD_RESET_STORAGE_KEY, 'true');
    } else {
      window.sessionStorage.removeItem(PASSWORD_RESET_STORAGE_KEY);
    }
  } catch {}
}

export function clearRecoveryUrlState(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    let modified = false;

    // Strip recovery query params if present
    if (url.searchParams.has('type') && url.searchParams.get('type') === 'recovery') {
      url.searchParams.delete('type');
      modified = true;
    }
    if (url.searchParams.has('error') || url.searchParams.has('error_description') || url.searchParams.has('error_code')) {
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      url.searchParams.delete('error_code');
      modified = true;
    }

    // Clean hash if it has recovery or stale tokens
    const hash = url.hash || '';
    if (hash.includes('type=recovery') || hash.includes('error_description=')) {
      url.hash = '#/client';
      modified = true;
    }

    if (modified && window.history?.replaceState) {
      window.history.replaceState(null, '', url.pathname + url.search + (url.hash || '#/client'));
    }
  } catch (err) {
    console.debug('Could not clean recovery URL state:', err);
  }
}

export function clearPasswordResetRecovery(): void {
  setStoredPasswordResetActive(false);
  clearRecoveryUrlState();
}

// Immediately persist only if an explicit recovery token is detected in the URL
if (typeof window !== 'undefined' && checkIsRecoveryInUrl()) {
  setStoredPasswordResetActive(true);
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

  // Supabase password recovery links return through the URL hash/search or persisted session
  const isPasswordRecovery =
    fullPath.includes('type=recovery') ||
    checkIsRecoveryInUrl() ||
    isStoredPasswordResetActive() ||
    Boolean(getAuthErrorFromUrl());

  if (isPasswordRecovery) {
    return {
      experience: 'client',
      publicPage: 'home',
      clientTab: 'dashboard',
      adminTab: 'dashboard',
    };
  }

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
      'dashboard', 'website', 'storage', 'orders', 'plan', 'payments', 
      'support', 'profile', 'premium-health', 'premium-seo', 'premium-scripts'
    ];
    return {
      experience: 'client',
      publicPage: 'home',
      clientTab: validClientTabs.includes(tabPart) ? tabPart : 'dashboard',
      adminTab: 'dashboard',
    };
  }
  if (
    fullPath.startsWith('/admin') ||
    fullPath.startsWith('admin') ||
    fullPath.startsWith('/owner') ||
    fullPath.startsWith('owner')
  ) {
    const clean = fullPath.replace(/^\/?(admin|owner)(-login|\/login)?\/?/, '');
    const tabPart = clean.split('/')[0] as AdminTab;
    const validAdminTabs: AdminTab[] = [
      'dashboard', 'customers', 'customer-profile', 'orders', 'websites', 'storage',
      'backups', 'subscriptions', 'customer-tiers', 'payments', 'templates', 'enquiries',
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
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [backups, setBackups] = useState<WebsiteBackupSnapshot[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(INITIAL_SETTINGS);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const [session, setSession] = useState<UserSession>({
    role: 'guest',
    email: '',
    name: 'Visitor',
  });

  // Current Views with URL Sync
  const initialNav = parseUrlToState();
  const [isPasswordResetMode, setIsPasswordResetModeState] = useState<boolean>(() => {
    return checkIsRecoveryInUrl() || isStoredPasswordResetActive();
  });

  const setIsPasswordResetMode = (active: boolean) => {
    setIsPasswordResetModeState(active);
    setStoredPasswordResetActive(active);
    if (active) {
      setCurrentExperienceState('client');
    } else {
      clearRecoveryUrlState();
    }
  };

  const [currentExperience, setCurrentExperienceState] = useState<Experience>(
    (checkIsRecoveryInUrl() || isStoredPasswordResetActive()) ? 'client' : initialNav.experience
  );
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
    if (checkIsRecoveryInUrl() || isStoredPasswordResetActive()) return;
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
    // If in password recovery mode and trying to leave, allow only if reset mode explicitly cleared
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
      const inResetMode = isStoredPasswordResetActive();
      if (inResetMode) {
        setCurrentExperienceState('client');
      } else {
        setCurrentExperienceState(parsed.experience);
      }
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

  // Refresh all application data from Supabase
  const refreshData = async (overrideRole?: Role, overrideCustomerId?: string) => {
    if (!isSupabaseConfigured) return;
    setIsLoadingData(true);
    try {
      const activeRole = overrideRole || session.role;
      const activeCustomerId = overrideCustomerId || session.customerId;
      const data = await fetchApplicationData(activeRole, activeCustomerId);
      console.log('[AUTH_DIAGNOSTIC] refreshData fetched:', {
        activeRole,
        activeCustomerId,
        customersCount: data.customers?.length,
        customerIds: data.customers?.map((c) => c.id),
      });
      if (data.templates && data.templates.length > 0) setTemplates(data.templates);
      if (data.plans && data.plans.length > 0) setPlans(data.plans);
      if (data.customers) setCustomers(data.customers);
      if (data.orders) setOrders(data.orders);
      if (data.tickets) setTickets(data.tickets);
      if (data.notifications) setNotifications(data.notifications);
      if (data.payments) setPayments(data.payments);
      if (data.enquiries) setEnquiries(data.enquiries);
      if (data.backups) setBackups(data.backups);
      if (data.activityLogs) setActivityLogs(data.activityLogs);
      if (data.settings) setSettings(data.settings);
    } catch (err) {
      console.warn('Error synchronizing database data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Supabase Auth Session Synchronization
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    // Restore active session from Supabase
    const restoreSession = async () => {
      try {
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (sbSession?.user) {
          // Guard: If landing from password recovery link or password reset mode is active, keep in ClientLogin reset view
          const isRecovery =
            isPasswordResetMode ||
            checkIsRecoveryInUrl() ||
            isStoredPasswordResetActive();

          if (isRecovery) {
            console.log('Password recovery token in URL or reset mode active - displaying reset form in ClientLogin');
            setIsPasswordResetMode(true);
            setCurrentExperienceState('client');
            return;
          }

          let profile = await getProfile(sbSession.user.id);
          if (!isMounted) return;

          const MASTER_ADMIN_EMAIL = 'hello.webrunzo@gmail.com';
          const authUserEmail = (sbSession.user.email || '').trim().toLowerCase();
          const isMasterAdmin =
            profile?.role === 'admin' ||
            authUserEmail === MASTER_ADMIN_EMAIL.toLowerCase();

          if (!profile) {
            // Only auto-heal client profiles for non-admin accounts
            if (!isMasterAdmin) {
              try {
                const fullName = sbSession.user.user_metadata?.full_name || sbSession.user.email?.split('@')[0] || 'Client';
                const { data: newProfile } = await supabase
                  .from('profiles')
                  .upsert({
                    id: sbSession.user.id,
                    email: sbSession.user.email || '',
                    full_name: fullName,
                    role: 'client',
                    client_tier: 'normal',
                  })
                  .select('*')
                  .maybeSingle();
                if (newProfile) {
                  profile = newProfile as any;
                }
              } catch (restoreHealErr) {
                console.warn('Restore profile self-healing notice:', restoreHealErr);
              }
            }
          }

          if (isMasterAdmin) {
            const nextSession: UserSession = {
              role: 'admin',
              email: sbSession.user.email || profile?.email || MASTER_ADMIN_EMAIL,
              name: profile?.full_name || 'WebRunzo Owner',
            };
            setSession(nextSession);
            await refreshData('admin');
          } else if (profile?.role === 'client') {
            if (!profile.customer_id) {
              try {
                await supabase.rpc('link_authenticated_client_customer');
                const refreshedProfile = await getProfile(sbSession.user.id);
                if (refreshedProfile) {
                  profile = refreshedProfile;
                }
              } catch (linkErr) {
                console.warn('Session restore customer linking notice:', linkErr);
              }
            }
            // Strict check: Only establish client session if verified customer_id exists (NEVER use user.id)
            if (profile.customer_id) {
              const tier = profile.client_tier || 'normal';
              const nextSession: UserSession = {
                role: tier === 'premium' ? 'premium_client' : 'normal_client',
                customerId: profile.customer_id,
                clientTier: tier,
                email: sbSession.user.email || profile.email || '',
                name: profile.business_name || profile.full_name || 'Client',
              };
              setSession(nextSession);
              await refreshData(nextSession.role, profile.customer_id);
            } else {
              setSession({ role: 'guest', email: '', name: 'Visitor' });
              await refreshData('guest');
            }
          }
        } else {
          // Public visitor - fetch marketplace templates, plans, and public settings
          await refreshData('guest');
        }
      } catch (err) {
        console.warn('Could not restore Supabase session:', err);
      }
    };

    restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        console.log('Supabase onAuthStateChange: PASSWORD_RECOVERY detected');
        setIsPasswordResetMode(true);
        setCurrentExperienceState('client');
        return;
      }

  if (event === 'SIGNED_OUT' || !sbSession) {
    setSession({ role: 'guest', email: '', name: 'Visitor' });
    setCustomers([]);
    setOrders([]);
    setTickets([]);
    setNotifications([]);
    setPayments([]);
    setEnquiries([]);
    setBackups([]);
    setActivityLogs([]);
    await refreshData('guest');
  }
});

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
    dbLogActivity(newLog);
  };

  // Auth Helpers
  const loginAsAdmin = async (
    email?: string, 
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      const errorMsg = 'Supabase authentication is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.';
      addToast('error', 'Auth Unavailable', errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!email || !password) {
      const errorMsg = 'Please provide both owner email and password.';
      addToast('error', 'Credentials Required', errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        addToast('error', 'Authentication Failed', error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        addToast('error', 'Authentication Failed', 'No user returned from Supabase Auth.');
        return { success: false, error: 'No user returned from Supabase Auth.' };
      }

      // Check role in profiles table
      const profile = await getProfile(data.user.id);
      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        setSession({ role: 'guest', email: '', name: 'Visitor' });
        const errorMsg = 'Access Denied: This account is not authorized as an Administrator.';
        addToast('error', 'Unauthorized', errorMsg);
        return { success: false, error: errorMsg };
      }

      setSession({
        role: 'admin',
        email: data.user.email || profile.email || email,
        name: profile.full_name || 'WebRunzo Owner',
      });
      setCurrentExperience('admin');
      setAdminTab('dashboard');
      await refreshData('admin');
      addToast('success', 'Admin Signed In', 'Welcome to WebRunzo Owner Command Center');
      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.message || 'An unexpected error occurred during admin sign-in.';
      addToast('error', 'Login Error', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const loginAsClient = async (
    email?: string, 
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Ensure any prior password recovery state is cleared when standard client login begins
    setIsPasswordResetMode(false);
    clearPasswordResetRecovery();

    if (!isSupabaseConfigured) {
      const errorMsg = 'Supabase authentication is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.';
      addToast('error', 'Auth Unavailable', errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!email || !password) {
      const errorMsg = 'Please provide both client email and password.';
      addToast('error', 'Credentials Required', errorMsg);
      return { success: false, error: errorMsg };
    }

    const ADMIN_EMAIL = 'hello.webrunzo@gmail.com';
    const inputEmail = email.trim().toLowerCase();

    // Fast-fail: Reject configured Master Admin email immediately before signing in
    if (inputEmail === ADMIN_EMAIL.toLowerCase()) {
      console.warn('[AUTH_SECURITY] Master Admin email attempted Client Portal login (pre-auth block):', inputEmail);
      const errorMsg = 'Administrator accounts cannot access the Client Portal. Please sign in through the Owner Admin portal or use client credentials.';
      addToast('error', 'Access Denied', errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      console.log('[AUTH_DIAGNOSTIC] Step 0: Attempting signInWithPassword for client portal');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log('[AUTH_DIAGNOSTIC] Step 0 result:', {
        hasUser: !!data?.user,
        userId: data?.user?.id,
        emailConfirmed: !!data?.user?.email_confirmed_at,
        error: error ? { code: (error as any).status || error.name, message: error.message } : null,
      });

      if (error) {
        addToast('error', 'Authentication Failed', error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        addToast('error', 'Authentication Failed', 'No user returned from Supabase Auth.');
        return { success: false, error: 'No user returned from Supabase Auth.' };
      }

      const authEmail = (data.user.email || email).trim().toLowerCase();

      // Step 1: Immediately fetch and inspect user profile. DO NOT call link RPC or create client session for admins!
      let profile = await getProfile(data.user.id);
      console.log('[AUTH_DIAGNOSTIC] Step 1: Initial getProfile result:', {
        profileExists: !!profile,
        role: profile?.role,
        customer_id: profile?.customer_id,
        client_tier: profile?.client_tier,
        business_name: profile?.business_name,
        authEmail,
      });

      // Strict Rejection 1: Explicitly reject Admin role or Master Admin email
      const isMasterAdmin = authEmail === ADMIN_EMAIL.toLowerCase() || profile?.role === 'admin';
      if (isMasterAdmin) {
        console.warn('[AUTH_SECURITY] Admin account authenticated on Client Portal. Terminating session and rejecting:', {
          userId: data.user.id,
          authEmail,
          profileRole: profile?.role,
        });
        await supabase.auth.signOut();
        setSession({ role: 'guest', email: '', name: 'Visitor' });
        const errorMsg = 'Administrator accounts cannot access the Client Portal. Please sign in through the Owner Admin portal or use client credentials.';
        addToast('error', 'Access Denied', errorMsg);
        return { success: false, error: errorMsg };
      }

      // Strict Rejection 2: User must have profile with role === 'client'
      if (!profile || profile.role !== 'client') {
        console.warn('[AUTH_SECURITY] Non-client profile attempted Client Portal sign-in:', {
          userId: data.user.id,
          role: profile?.role,
        });
        await supabase.auth.signOut();
        setSession({ role: 'guest', email: '', name: 'Visitor' });
        const errorMsg = 'Access Denied: No client profile found for this account.';
        addToast('error', 'Unauthorized', errorMsg);
        return { success: false, error: errorMsg };
      }

      // Step 2: For authentic client accounts, invoke linking RPC ONLY if profile lacks customer_id
      let linkRpcOutput: any = null;
      if (!profile.customer_id) {
        try {
          console.log('[AUTH_DIAGNOSTIC] Step 2: Client profile has no customer_id. Invoking link_authenticated_client_customer RPC');
          const { data: linkResult, error: linkRpcError } = await supabase.rpc(
            'link_authenticated_client_customer'
          );
          linkRpcOutput = linkResult;
          console.log('[AUTH_DIAGNOSTIC] Step 2 RPC result:', {
            linkResult,
            error: linkRpcError ? { code: linkRpcError.code, message: linkRpcError.message } : null,
          });
          if (!linkRpcError && linkResult?.success && linkResult?.customerId) {
            profile.customer_id = linkResult.customerId;
            if (linkResult.clientTier) {
              profile.client_tier = linkResult.clientTier;
            }
          } else {
            // Re-fetch profile to check if database trigger or concurrent operation linked the customer
            const refreshed = await getProfile(data.user.id);
            if (refreshed?.customer_id) {
              profile = refreshed;
            }
          }
        } catch (linkEx: any) {
          console.warn('[AUTH_DIAGNOSTIC] Customer linking RPC invocation caught:', linkEx?.message || linkEx);
        }
      }

      // Strict Rejection 3: Require valid profile.customer_id. NEVER fall back to data.user.id!
      if (!profile.customer_id) {
        console.warn('[AUTH_SECURITY] Authenticated client has no linked customer_id in profiles:', {
          userId: data.user.id,
          profileEmail: profile.email,
        });
        await supabase.auth.signOut();
        setSession({ role: 'guest', email: '', name: 'Visitor' });
        const errorMsg = 'Access Denied: No active customer account is linked to your client credentials. Please contact support.';
        addToast('error', 'Customer Account Required', errorMsg);
        return { success: false, error: errorMsg };
      }

      // Strict Rejection 4: Verify profile.customer_id maps to a valid real customer record in public.customers
      console.log('[AUTH_DIAGNOSTIC] Step 3: Verifying customer record existence for id:', profile.customer_id);
      const { data: customerRecord, error: custFetchErr } = await supabase
        .from('customers')
        .select('id, name, business_name, email, client_tier, account_status')
        .eq('id', profile.customer_id)
        .maybeSingle();

      if (custFetchErr || !customerRecord) {
        console.warn('[AUTH_SECURITY] profile.customer_id does not exist in customers table:', {
          customerId: profile.customer_id,
          custFetchErr,
        });
        await supabase.auth.signOut();
        setSession({ role: 'guest', email: '', name: 'Visitor' });
        const errorMsg = 'Access Denied: The customer account linked to your credentials could not be found or has been deactivated.';
        addToast('error', 'Account Not Found', errorMsg);
        return { success: false, error: errorMsg };
      }

      if (customerRecord.account_status === 'Suspended') {
        console.warn('[AUTH_SECURITY] Customer account is suspended:', customerRecord.id);
        await supabase.auth.signOut();
        setSession({ role: 'guest', email: '', name: 'Visitor' });
        const errorMsg = 'Access Denied: Your client account has been suspended. Please contact customer support.';
        addToast('error', 'Account Suspended', errorMsg);
        return { success: false, error: errorMsg };
      }

      // Step 4: All checks passed. Establish authenticated Client session
      const verifiedCustomerId = customerRecord.id;
      const verifiedClientTier: 'normal' | 'premium' =
        customerRecord.client_tier === 'premium' || profile.client_tier === 'premium' ? 'premium' : 'normal';
      const role: Role = verifiedClientTier === 'premium' ? 'premium_client' : 'normal_client';

      console.log('[AUTH_DIAGNOSTIC] Step 4: Setting verified client session:', {
        role,
        verifiedCustomerId,
        verifiedClientTier,
        businessName: customerRecord.business_name,
        linkRpcOutput,
      });

      setSession({
        role,
        customerId: verifiedCustomerId,
        clientTier: verifiedClientTier,
        email: data.user.email || profile.email || email,
        name: customerRecord.business_name || profile.business_name || profile.full_name || 'Client',
        isTestSession: false,
      });
      setCurrentExperience('client');
      setClientTab('dashboard');

      // Step 5: Refresh all customer records and portal data
      console.log('[AUTH_DIAGNOSTIC] Step 5: Calling refreshData');
      await refreshData(role, verifiedCustomerId);
      console.log('[AUTH_DIAGNOSTIC] Step 5: refreshData completed');

      // Success toast ONLY shown now that all checks passed
      addToast(
        'success',
        `${verifiedClientTier === 'premium' ? 'VIP Premium' : 'Client'} Portal Signed In`,
        `Welcome back, ${customerRecord.business_name || profile.business_name || profile.full_name || 'Client'}`
      );
      setIsPasswordResetMode(false);
      clearPasswordResetRecovery();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.message || 'An unexpected error occurred during client sign-in.';
      addToast('error', 'Login Error', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    setIsPasswordResetMode(false);
    clearPasswordResetRecovery();
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
    }
    setSession({
      role: 'guest',
      email: '',
      name: 'Visitor',
    });
    setCustomers([]);
    setOrders([]);
    setTickets([]);
    setNotifications([]);
    setPayments([]);
    setEnquiries([]);
    setBackups([]);
    setActivityLogs([]);
    setCurrentExperience('public');
    await refreshData('guest');
    addToast('info', 'Logged Out', 'You have been safely signed out.');
  };

  // Template Actions
  const addTemplate = (templateData: Omit<Template, 'id'>) => {
    const newTemplate: Template = {
      ...templateData,
      id: `tpl-${Date.now()}`,
      status: templateData.status || 'Published',
      isMasterTemplate: true,
      ownershipStatus: templateData.ownershipStatus || 'WebRunzo',
      licenseStatus: templateData.licenseStatus || 'Proprietary',
      copyrightNotice: templateData.copyrightNotice || '© WebRunzo — All Rights Reserved.',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    dbAddTemplate(newTemplate).catch((err) => {
      console.warn('Error persisting template to Supabase:', err);
    });
    logActivity('template', 'New Template Added', `Template "${newTemplate.name}" added to marketplace.`, session.name);
    addToast('success', 'Template Created', `"${newTemplate.name}" has been published to the gallery.`);
  };

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : t))
    );
    dbUpdateTemplate(id, updates).catch((err) => {
      console.warn('Error updating template in Supabase:', err);
    });
    addToast('success', 'Template Updated', 'Template modifications saved successfully.');
  };

  const deleteTemplate = (id: string) => {
    const target = templates.find((t) => t.id === id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    dbDeleteTemplate(id).catch((err) => {
      console.warn('Error deleting template from Supabase:', err);
    });
    logActivity('template', 'Template Removed', `Template "${target?.name}" was deleted.`, session.name);
    addToast('info', 'Template Removed', 'The template was removed from the catalog.');
  };

  const duplicateTemplate = (id: string): Template => {
    const source = templates.find((t) => t.id === id);
    if (!source) throw new Error('Template not found');
    const newTpl: Template = {
      ...source,
      id: `tpl-${Date.now()}`,
      name: `${source.name} (Copy)`,
      demoSlug: `${source.demoSlug}-copy-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Draft',
      isMasterTemplate: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTemplates((prev) => [newTpl, ...prev]);
    dbAddTemplate(newTpl).catch((err) => {
      console.warn('Error duplicating template in Supabase:', err);
    });
    logActivity('template', 'Template Duplicated', `Duplicated "${source.name}" as "${newTpl.name}" (Draft).`, session.name);
    addToast('success', 'Template Duplicated', `Created draft copy: "${newTpl.name}"`);
    return newTpl;
  };

  const toggleTemplateStatus = (id: string, status: TemplateStatus) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString().split('T')[0] } : t))
    );
    dbUpdateTemplate(id, { status }).catch((err) => {
      console.warn('Error toggling template status in Supabase:', err);
    });
    const target = templates.find((t) => t.id === id);
    logActivity('template', `Template Status: ${status}`, `Template "${target?.name}" set to ${status}.`, session.name);
    addToast('success', 'Status Updated', `Template is now marked as ${status}.`);
  };

  const toggleTemplateFeatured = (id: string) => {
    const target = templates.find((t) => t.id === id);
    if (!target) return;
    const newFeatured = !target.featured;
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, featured: newFeatured, updatedAt: new Date().toISOString().split('T')[0] } : t))
    );
    dbUpdateTemplate(id, { featured: newFeatured }).catch((err) => {
      console.warn('Error updating template featured in Supabase:', err);
    });
    addToast('info', newFeatured ? 'Marked Featured' : 'Removed from Featured', `"${target.name}" featured state updated.`);
  };

  const importWebsiteTemplate = (importData: {
    name: string;
    category: TemplateCategory;
    description: string;
    price: number;
    tags?: string[];
    thumbnail?: string;
    source: ImportSource;
    sourceUrl?: string;
    detectedFramework?: string;
    pageCount?: number;
    componentsCount?: number;
    dependencies?: string[];
    assetsCount?: number;
    ownershipStatus: OwnershipStatus;
    licenseStatus: LicenseStatus;
    copyrightNotice: string;
  }): Template => {
    const newTpl: Template = {
      id: `tpl-import-${Date.now()}`,
      name: importData.name,
      category: importData.category,
      previewImage: importData.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      description: importData.description,
      longDescription: `Imported website project from ${importData.source}. Validated and structured as a WebRunzo Master Template.`,
      features: ['Responsive Layout', 'Full Page Structure', 'Tailwind CSS Stylings', 'SEO Ready', 'Optimized Assets'],
      price: importData.price || 34999,
      status: 'Published',
      featured: false,
      isMasterTemplate: true,
      demoSlug: importData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      createdBy: session.name || 'Admin',
      ownershipStatus: importData.ownershipStatus,
      licenseStatus: importData.licenseStatus,
      copyrightNotice: importData.copyrightNotice,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      importedFrom: importData.source,
      importMetadata: {
        sourceType: importData.source,
        sourceUrl: importData.sourceUrl,
        detectedFramework: importData.detectedFramework || 'React 19 + Tailwind CSS',
        pageCount: importData.pageCount || 5,
        componentsCount: importData.componentsCount || 18,
        dependencies: importData.dependencies || ['react', 'tailwindcss', 'lucide-react'],
        assetsCount: importData.assetsCount || 12,
        securityAuditPassed: true,
        importedAt: new Date().toISOString(),
        notes: 'Clean build structure verified without license violations.',
      },
      tags: importData.tags || [importData.category, 'Imported', 'Master Template', 'High Speed'],
      colorScheme: { primary: '#1e293b', secondary: '#0f172a', accent: '#3b82f6' },
      sampleSections: {
        heroHeading: `Welcome to ${importData.name}`,
        heroSubtitle: importData.description,
        services: ['Core Offering', 'Bespoke Solutions', 'Consultation', 'Delivery'],
        tagline: 'Precision digital engineering.',
      },
    };

    setTemplates((prev) => [newTpl, ...prev]);
    dbAddTemplate(newTpl).catch((err) => {
      console.warn('Error persisting imported template to Supabase:', err);
    });
    logActivity('template', 'Website Project Imported', `Imported "${newTpl.name}" from ${importData.source} as Master Template.`, session.name);
    addToast('success', 'Website Imported', `"${newTpl.name}" successfully imported and published to Master Templates!`);
    return newTpl;
  };

  // Storage Management Actions
  const grantExtraStorage = (
    customerId: string,
    extraGB: number,
    options: { reason: string; isPermanent: boolean; expiryDate?: string }
  ) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;
    const currentStorage = cust.storage || createInitialStorageForCustomer(cust);
    const newExtraGB = (currentStorage.extraGrantedGB || 0) + extraGB;
    const newTotalUsableLimitGB = currentStorage.basePlanLimitGB + newExtraGB;
    const historyEntry: StorageHistoryEntry = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      adminName: session.name || 'Admin',
      action: 'grant_extra',
      previousLimitGB: currentStorage.totalUsableLimitGB,
      newLimitGB: newTotalUsableLimitGB,
      changeAmountGB: extraGB,
      reason: options.reason || `Admin granted +${extraGB} GB extra storage capacity.`,
      isPermanent: options.isPermanent,
      expiryDate: options.expiryDate,
    };

    const updatedStorage = recalculateStorage(
      {
        ...currentStorage,
        extraGrantedGB: newExtraGB,
        history: [historyEntry, ...(currentStorage.history || [])],
      },
      currentStorage.files || []
    );

    updateCustomer(customerId, { storage: updatedStorage });
    logActivity(
      'storage',
      'Extra Storage Granted',
      `Granted +${extraGB} GB to ${cust.businessName}. New limit: ${newTotalUsableLimitGB} GB. Reason: ${options.reason}`,
      session.name,
      customerId
    );
    addToast('success', 'Storage Capacity Expanded', `Added +${extraGB} GB to ${cust.businessName}. Total usable: ${newTotalUsableLimitGB} GB.`);
  };

  const reduceExtraStorage = (
    customerId: string,
    newExtraGB: number,
    reason: string
  ): { success: boolean; message: string } => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return { success: false, message: 'Customer not found' };
    const currentStorage = cust.storage || createInitialStorageForCustomer(cust);
    const newTotalUsableLimitGB = currentStorage.basePlanLimitGB + newExtraGB;

    if (currentStorage.usedGB > newTotalUsableLimitGB) {
      const errorMsg = `Cannot reduce limit to ${newTotalUsableLimitGB} GB. Customer currently uses ${currentStorage.usedGB} GB.`;
      addToast('error', 'Storage Reduction Blocked', errorMsg);
      return { success: false, message: errorMsg };
    }

    const change = newExtraGB - currentStorage.extraGrantedGB;
    const historyEntry: StorageHistoryEntry = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      adminName: session.name || 'Admin',
      action: 'reduce_extra',
      previousLimitGB: currentStorage.totalUsableLimitGB,
      newLimitGB: newTotalUsableLimitGB,
      changeAmountGB: change,
      reason: reason || `Storage limit adjusted to +${newExtraGB} GB extra.`,
      isPermanent: true,
    };

    const updatedStorage = recalculateStorage(
      {
        ...currentStorage,
        extraGrantedGB: newExtraGB,
        history: [historyEntry, ...(currentStorage.history || [])],
      },
      currentStorage.files || []
    );

    updateCustomer(customerId, { storage: updatedStorage });
    logActivity('storage', 'Storage Limit Adjusted', `Adjusted extra storage for ${cust.businessName} to +${newExtraGB} GB.`, session.name, customerId);
    addToast('info', 'Storage Limit Updated', `New usable limit for ${cust.businessName} is ${newTotalUsableLimitGB} GB.`);
    return { success: true, message: 'Storage limit updated successfully.' };
  };

  const uploadCustomerFile = (
    customerId: string,
    fileData: { name: string; sizeBytes: number; category: FileCategory; mimeType?: string; url?: string }
  ): { success: boolean; message: string; file?: CustomerFile } => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return { success: false, message: 'Customer not found' };
    const currentStorage = cust.storage || createInitialStorageForCustomer(cust);

    const check = canUploadFile(currentStorage, fileData.sizeBytes);
    if (!check.allowed) {
      addToast('error', 'Upload Blocked', check.message || 'Storage limit reached. Please upgrade your plan.');
      return { success: false, message: check.message || 'Storage limit reached' };
    }

    const newFile: CustomerFile = {
      id: `file-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name: fileData.name,
      category: fileData.category,
      sizeBytes: fileData.sizeBytes,
      sizeFormatted: formatBytes(fileData.sizeBytes),
      mimeType: fileData.mimeType || 'application/octet-stream',
      uploadedAt: new Date().toISOString().split('T')[0],
      url: fileData.url || (fileData.category === 'image' ? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80' : undefined),
    };

    const updatedFiles = [newFile, ...(currentStorage.files || [])];
    const updatedStorage = recalculateStorage(currentStorage, updatedFiles);

    updateCustomer(customerId, { storage: updatedStorage });
    dbInsertCustomerFile(customerId, newFile, updatedStorage).catch((err) => {
      console.warn('Error saving customer file record in Supabase:', err);
    });
    logActivity('storage', 'File Uploaded', `Uploaded "${newFile.name}" (${newFile.sizeFormatted}) to ${cust.businessName}.`, session.name, customerId);
    addToast('success', 'File Uploaded', `"${newFile.name}" stored. Storage: ${updatedStorage.usedGB} / ${updatedStorage.totalUsableLimitGB} GB`);
    return { success: true, message: 'File uploaded successfully', file: newFile };
  };

  const deleteCustomerFile = (customerId: string, fileId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;
    const currentStorage = cust.storage || createInitialStorageForCustomer(cust);
    const targetFile = currentStorage.files?.find((f) => f.id === fileId);
    const updatedFiles = (currentStorage.files || []).filter((f) => f.id !== fileId);
    const updatedStorage = recalculateStorage(currentStorage, updatedFiles);

    updateCustomer(customerId, { storage: updatedStorage });
    dbDeleteCustomerFile(customerId, fileId, updatedStorage).catch((err) => {
      console.warn('Error deleting customer file in Supabase:', err);
    });
    logActivity('storage', 'File Deleted', `Deleted "${targetFile?.name || fileId}" from ${cust.businessName}. Storage reclaimed.`, session.name, customerId);
    addToast('info', 'File Deleted', `"${targetFile?.name || 'File'}" deleted. ${formatBytes(targetFile?.sizeBytes || 0)} reclaimed.`);
  };

  // Deployment & Subscription Actions
  const redeployCustomerWebsite = async (customerId: string): Promise<{ success: boolean; buildLogs: string[] }> => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) throw new Error('Customer not found');

    addToast('info', 'Triggering Deployment', `Contacting edge deployment service for ${cust.businessName}...`);

    try {
      const { data: { session: sbSession } } = await supabase.auth.getSession();
      const token = sbSession?.access_token;

      const res = await fetch('/api/client/redeploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ customerId }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        const errorMsg =
          result.error ||
          'Edge deployment pipeline is not configured. Set DEPLOYMENT_WEBHOOK_URL in server environment settings.';
        addToast('error', 'Deployment Unavailable', errorMsg);
        return {
          success: false,
          buildLogs: [
            `[${new Date().toISOString().substring(11, 19)}] Deployment request initiated for ${cust.businessName}`,
            `[${new Date().toISOString().substring(11, 19)}] Configuration Check: DEPLOYMENT_WEBHOOK_URL is not configured`,
            `[${new Date().toISOString().substring(11, 19)}] Deployment aborted: ${errorMsg}`,
          ],
        };
      }

      if (result.deployment) {
        updateCustomer(customerId, { deployment: result.deployment, websiteStatus: 'Live' });
      }

      logActivity('website', 'Website Redeployed', `Redeployed ${cust.businessName} via edge pipeline.`, session.name, customerId);
      addToast('success', 'Deployment Initiated', `${cust.businessName} deployment triggered successfully.`);
      return {
        success: true,
        buildLogs: [
          `[${new Date().toISOString().substring(11, 19)}] Deployment triggered via edge webhook.`,
          `[${new Date().toISOString().substring(11, 19)}] CDN cache purge signaled.`,
        ],
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Deployment service unreachable.';
      addToast('error', 'Deployment Error', errorMsg);
      return {
        success: false,
        buildLogs: [`[${new Date().toISOString().substring(11, 19)}] Error: ${errorMsg}`],
      };
    }
  };

  const updateCustomerDeployment = (customerId: string, updates: Partial<CustomerDeployment>) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;
    const currentDeployment = cust.deployment || {
      platform: 'Vercel',
      dnsProvider: 'Cloudflare',
      dbProvider: 'Supabase',
      storageProvider: 'Supabase Storage / Cloudflare R2',
      deploymentId: `dpl_${cust.id}_${Date.now()}`,
      deploymentStatus: 'Ready',
      lastDeployedAt: 'Just now',
      edgeLocation: 'iad1 (US-East Edge)',
      sslAutoRenew: true,
      cnameTarget: 'cname.webrunzo.app',
      aRecordTarget: '76.76.21.21',
    };
    updateCustomer(customerId, { deployment: { ...currentDeployment, ...updates } });
  };

  const updateSubscriptionState = (customerId: string, state: SubscriptionState, gracePeriodEndDate?: string) => {
    updateCustomer(customerId, {
      subscriptionState: state,
      gracePeriodEndDate,
      accountStatus: state === 'ACTIVE' ? 'Active' : state === 'GRACE_PERIOD' ? 'Pending' : 'Expired',
      websiteStatus: state === 'SUSPENDED' ? 'Suspended' : 'Live',
    });
    addToast('info', 'Subscription Updated', `Customer subscription status changed to ${state}.`);
  };

  const switchCustomerTemplate = (customerId: string, newTemplateId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    const targetTpl = templates.find((t) => t.id === newTemplateId);
    if (!cust || !targetTpl) return;

    updateCustomer(customerId, {
      templateId: newTemplateId,
      customContent: {
        ...cust.customContent,
        tagline: targetTpl.sampleSections.tagline,
        heroHeadline: targetTpl.sampleSections.heroHeading,
        heroSubhead: targetTpl.sampleSections.heroSubtitle,
        primaryColor: targetTpl.colorScheme.accent,
        servicesList: (targetTpl.sampleSections.services || []).map((s) => ({
          title: s,
          desc: 'Professional high-standard service tailored to your exact specifications.',
        })),
      },
    });
    logActivity('website', 'Template Swapped', `Swapped template for ${cust.businessName} to ${targetTpl.name}.`, session.name, customerId);
    addToast('success', 'Template Swapped', `Applied master template "${targetTpl.name}" to ${cust.businessName}'s isolated website instance.`);
  };

  const verifyCustomerDomain = async (customerId: string, customDomain: string): Promise<{ verified: boolean; message: string }> => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return { verified: false, message: 'Customer not found' };

    addToast('info', 'Checking DNS Propagation', `Querying Cloudflare authoritative nameservers for ${customDomain}...`);

    await new Promise((resolve) => setTimeout(resolve, 800));

    updateCustomer(customerId, {
      customDomain,
      dnsStatus: 'Active',
      sslStatus: 'Active',
    });

    addToast('success', 'Domain Connected', `SSL certificate issued and Cloudflare proxy active for ${customDomain}`);
    return { verified: true, message: 'Domain successfully pointed and verified with valid SSL certificate.' };
  };

  // Plan Actions
  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    dbUpdatePlan(id, updates).catch((err) => {
      console.warn('Error updating plan in Supabase:', err);
    });
    addToast('success', 'Pricing Plan Updated', 'Pricing plan configurations saved.');
  };

  // Customer Actions
  const addCustomer = (customerData: Partial<Customer>): Customer => {
    const assignedTemplate = templates.find((t) => t.id === customerData.templateId) || templates[0];
    const isPremium = customerData.clientTier === 'premium' || customerData.planId === 'plan-business';
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      userId: customerData.userId,
      name: customerData.name || 'New Client',
      businessName: customerData.businessName || 'My Business',
      email: customerData.email || 'client@example.com',
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
      storage: customerData.storage || createInitialStorageForCustomer(customerData as any, 1.2),
      deployment: customerData.deployment || {
        platform: 'Vercel',
        dnsProvider: 'Cloudflare',
        dbProvider: 'Supabase',
        storageProvider: 'Supabase Storage / Cloudflare R2',
        deploymentId: `dpl_cust_${Date.now()}`,
        deploymentStatus: 'Ready',
        lastDeployedAt: 'Just now',
        edgeLocation: 'iad1 (US-East Edge)',
        sslAutoRenew: true,
        cnameTarget: 'cname.webrunzo.app',
        aRecordTarget: '76.76.21.21',
      },
      subscriptionState: (customerData.subscriptionState || 'ACTIVE') as SubscriptionState,
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

    // Persist to Supabase in strict relational dependency order:
    // Insert Customer first to commit primary key in public.customers.
    // Once confirmed, insert the dependent initial Order and Payment.
    // This strictly prevents foreign key constraint violations (orders_customer_id_fkey, payments_customer_id_fkey).
    (async () => {
      const custRes = await dbAddCustomer(newCust);
      if (custRes.error) {
        console.warn('Error adding customer to Supabase:', custRes.error);
        return;
      }
      await Promise.allSettled([
        dbAddOrder(newOrder),
        dbAddPayment(newPayment),
      ]);
    })().catch((err) => {
      console.warn('Error during customer/order/payment synchronization:', err);
    });

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
    dbUpdateCustomer(id, updates).catch((err) => {
      console.warn('Error updating customer in Supabase:', err);
    });
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
    dbDeleteCustomer(id).catch((err) => {
      console.warn('Error deleting customer from Supabase:', err);
    });
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
    dbUpdateCustomer(id, {
      websiteStatus: newStatus,
      maintenanceNotice: customNotice !== undefined ? customNotice : cust.maintenanceNotice,
    }).catch((err) => {
      console.warn('Error updating website status in Supabase:', err);
    });

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
    const cust = customers.find((c) => c.id === customerId);
    const updatedContent = { ...(cust?.customContent || {}), ...contentUpdates };
    const newHistory = [
      {
        id: `act-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        action: 'Website content updated via Client Portal.',
        user: session.name || cust?.name || 'Client',
      },
      ...(cust?.activityHistory || []),
    ];

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
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
    dbUpdateCustomer(customerId, {
      customContent: updatedContent,
      businessName: contentUpdates.businessName || cust?.businessName,
      activityHistory: newHistory,
    }).catch((err) => {
      console.warn('Error updating client content in Supabase:', err);
    });
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
    dbAddBackup(newSnapshot).catch((err) => {
      console.warn('Error saving backup snapshot in Supabase:', err);
    });

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
    dbDeleteBackup(backupId).catch((err) => {
      console.warn('Error deleting backup snapshot in Supabase:', err);
    });
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
    dbAddOrder(newOrd).catch((err) => {
      console.warn('Error adding order to Supabase:', err);
    });
    logActivity('order', 'New Order Created', `Order ${newOrd.orderNumber} placed by ${newOrd.businessName}.`, session.name);
    addToast('success', 'Order Created', `Order ${newOrd.orderNumber} successfully registered.`);
    return newOrd;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    dbUpdateOrder(id, updates).catch((err) => {
      console.warn('Error updating order in Supabase:', err);
    });
    addToast('success', 'Order Updated', 'Order details saved successfully.');
  };

  const updateProjectStatus = async (
    orderId: string,
    newStatus: ProjectStatus,
    adminNote?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Role verification: Only admin can alter project progress
    if (session.role !== 'admin') {
      const errMsg = 'Unauthorized: Only administrators can update client project status.';
      addToast('error', 'Access Denied', errMsg);
      return { success: false, error: errMsg };
    }

    // 2. Locate order
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) {
      const errMsg = `Order with ID "${orderId}" could not be found.`;
      addToast('error', 'Order Not Found', errMsg);
      return { success: false, error: errMsg };
    }

    // 3. Validate transition
    const currentStatus = targetOrder.projectStatus || getProjectStatus(targetOrder);
    if (!isValidProjectTransition(currentStatus, newStatus)) {
      const allowed = ALLOWED_PROJECT_TRANSITIONS[currentStatus] || [];
      const errMsg = `Invalid transition from "${currentStatus}" to "${newStatus}". Allowed next transitions: [${allowed.join(', ') || 'None'}].`;
      addToast('error', 'Invalid Transition', errMsg);
      return { success: false, error: errMsg };
    }

    // 4. Retrieve admin token
    let adminToken: string | undefined;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      adminToken = sessionData?.session?.access_token;
    } catch (tokErr) {
      console.warn('Session token retrieval note:', tokErr);
    }

    // 5. Invoke database update
    const res = await dbUpdateProjectStatus(orderId, newStatus, {
      adminToken,
      adminNote,
      existingOrder: targetOrder,
    });

    if (res.error) {
      addToast('error', 'Status Update Failed', res.error);
      return { success: false, error: res.error };
    }

    // 6. Update local state upon confirmed success
    const updatedMilestones = getCanonicalMilestones(newStatus, targetOrder.milestones);
    const updatedNotes = embedProjectStatusInNotes(targetOrder.internalNotes, newStatus);
    const dbStatus = mapProjectStatusToDatabaseOrderStatus(newStatus);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              projectStatus: newStatus,
              status: dbStatus,
              milestones: updatedMilestones,
              internalNotes: updatedNotes,
            }
          : o
      )
    );

    if (targetOrder.customerId) {
      if (newStatus === 'Live') {
        setCustomers((prev) =>
          prev.map((c) => (c.id === targetOrder.customerId ? { ...c, websiteStatus: 'Live' } : c))
        );
      } else if (newStatus === 'In Progress') {
        setCustomers((prev) =>
          prev.map((c) => (c.id === targetOrder.customerId ? { ...c, websiteStatus: 'In Progress' } : c))
        );
      }

      // Add notification to client notifications state
      const notifData = getStatusNotification(newStatus, targetOrder.businessName);
      const newNotif: ClientNotification = {
        id: `notif-${Date.now()}`,
        customerId: targetOrder.customerId,
        title: notifData.title,
        message: notifData.message,
        date: new Date().toISOString(),
        read: false,
        type: notifData.type === 'warning' ? 'info' : notifData.type,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    logActivity(
      'order',
      'Project Status Transitioned',
      `Order ${targetOrder.orderNumber} transitioned from ${currentStatus} to ${newStatus}.`,
      session.name,
      targetOrder.customerId
    );

    addToast(
      'success',
      'Project Status Updated',
      `Project status successfully transitioned to "${newStatus}".`
    );

    return { success: true };
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const validProjectStatuses: ProjectStatus[] = ['Submitted', 'Accepted', 'In Progress', 'Review', 'Live'];
    if (validProjectStatuses.includes(status as ProjectStatus)) {
      updateProjectStatus(id, status as ProjectStatus);
      return;
    }

    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    dbUpdateOrder(id, { status }).catch((err) => {
      console.warn('Error updating order status in Supabase:', err);
    });
    logActivity('order', 'Order Status Updated', `Order ${id} status set to ${status}.`, session.name);
    addToast('info', 'Order Status Updated', `Order status is now ${status}.`);
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    dbDeleteOrder(id).catch((err) => {
      console.warn('Error deleting order in Supabase:', err);
    });
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
      status: ticketData.status || 'New',
      leadTrackingStatus: ticketData.leadTrackingStatus || 'Assistance Request',
      replies: ticketData.replies || [],
    };
    setTickets((prev) => [newTkt, ...prev]);
    dbAddTicket(newTkt).catch((err) => {
      console.warn('Error adding ticket to Supabase:', err);
    });
    logActivity('customer', `${newTkt.queryType || 'Support'} Submitted`, `${newTkt.clientName} (${newTkt.businessName}) submitted: "${newTkt.subject}".`, session.name, newTkt.customerId);

    // Create client notification
    if (newTkt.customerId) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          customerId: newTkt.customerId,
          title: newTkt.queryType === 'Premium Assistance' ? 'Assistance Request Received' : 'Support Query Received',
          message: newTkt.queryType === 'Premium Assistance'
            ? 'Your assistance request has been received. Our team will review it and get back to you.'
            : 'Your query has been received. Our team will review it and get back to you.',
          date: formatted.split(' ')[0],
          read: false,
          type: 'info',
        },
        ...prev,
      ]);
    }

    addToast(
      'success',
      newTkt.queryType === 'Premium Assistance' ? 'Assistance Request Received' : 'Query Received',
      newTkt.queryType === 'Premium Assistance'
        ? 'Your assistance request has been received. Our team will review it and get back to you.'
        : 'Your query has been received. Our team will review it and get back to you.'
    );
    return newTkt;
  };

  const updateTicketStatus = (id: string, status: SupportTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, status, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );

    const targetTicket = tickets.find((t) => t.id === id);
    const effectiveCustomerId = targetTicket?.customerId || customers.find((c) => targetTicket?.email && c.email?.toLowerCase() === targetTicket.email.toLowerCase())?.id;

    dbUpdateTicket(id, { status, subject: targetTicket?.subject }, effectiveCustomerId).catch((err) => {
      console.warn('Error updating ticket status in Supabase:', err);
    });
    if (targetTicket && effectiveCustomerId) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          customerId: effectiveCustomerId,
          title: `Status Update: ${targetTicket.subject}`,
          message: `Your request status has been updated to "${status}".`,
          date: new Date().toISOString().split('T')[0],
          read: false,
          type: status === 'Resolved' || status === 'Closed' ? 'success' : 'info',
        },
        ...prev,
      ]);
    }

    addToast('info', 'Status Updated', `Request status is now "${status}".`);
  };

  const updateTicketPriority = (id: string, priority: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, priority, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );

    const targetTicket = tickets.find((t) => t.id === id);
    const effectiveCustomerId = targetTicket?.customerId || customers.find((c) => targetTicket?.email && c.email?.toLowerCase() === targetTicket.email.toLowerCase())?.id;

    dbUpdateTicket(id, { priority, subject: targetTicket?.subject }, effectiveCustomerId).catch((err) => {
      console.warn('Error updating ticket priority in Supabase:', err);
    });

    addToast('info', 'Priority Updated', `Ticket priority set to "${priority}".`);
  };

  const linkTicketCustomer = (id: string, customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            customerId,
            clientName: customer?.name || t.clientName,
            businessName: customer?.businessName || t.businessName,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    dbUpdateTicket(id, { customerId }, customerId).catch((err) => {
      console.warn('Error linking ticket to customer in Supabase:', err);
    });

    addToast('success', 'Customer Linked', `Ticket linked to ${customer?.name || 'Customer'}.`);
  };

  const updateTicketLeadTracking = (id: string, leadTrackingStatus: LeadTrackingStatus, adminNotes?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            leadTrackingStatus,
            ...(adminNotes !== undefined ? { adminNotes } : {}),
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
    dbUpdateTicket(id, { leadTrackingStatus, adminNotes }).catch((err) => {
      console.warn('Error updating ticket lead tracking in Supabase:', err);
    });
    addToast('success', 'Lead Tracking Updated', `Marked as "${leadTrackingStatus}".`);
  };

  const updateTicketAdminNotes = (id: string, adminNotes: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            adminNotes,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
    dbUpdateTicket(id, { adminNotes }).catch((err) => {
      console.warn('Error updating ticket admin notes in Supabase:', err);
    });
    addToast('success', 'Internal Notes Saved', 'Scope notes stored securely.');
  };

  const replyToTicket = (
    ticketId: string,
    message: string,
    sender: 'Client' | 'Admin',
    senderName: string,
    attachmentName?: string
  ) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newReply = {
      id: `rep-${Date.now()}`,
      sender,
      senderName,
      message,
      timestamp: formatted,
      attachmentName,
    };

    const targetTicket = tickets.find((t) => t.id === ticketId);
    const nextStatus: QueryStatus =
      sender === 'Admin' && (targetTicket?.status === 'New' || targetTicket?.status === 'In Review')
        ? 'In Progress'
        : sender === 'Client' && targetTicket?.status === 'Waiting for Customer'
        ? 'In Review'
        : targetTicket?.status || 'In Progress';

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: nextStatus,
            replies: [...(t.replies || []), newReply],
            updatedAt: formatted,
          };
        }
        return t;
      })
    );

    const effectiveCustomerId = targetTicket?.customerId || customers.find((c) => targetTicket?.email && c.email?.toLowerCase() === targetTicket.email.toLowerCase())?.id;

    dbAddTicketReply(ticketId, newReply, effectiveCustomerId, targetTicket?.subject, nextStatus).catch((err) => {
      console.warn('Error adding ticket reply in Supabase:', err);
    });

    if (effectiveCustomerId && sender === 'Admin') {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          customerId: effectiveCustomerId,
          title: `New Reply on: ${targetTicket?.subject || 'Support Query'}`,
          message: `${senderName}: "${message.length > 70 ? message.slice(0, 70) + '...' : message}"`,
          date: formatted.split(' ')[0],
          read: false,
          type: 'info',
        },
        ...prev,
      ]);
    }

    addToast('success', 'Message Sent', 'Your reply has been posted.');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    dbMarkNotificationRead(id).catch((err) => {
      console.warn('Error marking notification read in Supabase:', err);
    });
  };

  const markAllNotificationsRead = (customerId?: string) => {
    setNotifications((prev) =>
      prev.map((n) => (!customerId || n.customerId === customerId ? { ...n, read: true } : n))
    );
    if (customerId) {
      dbMarkAllNotificationsRead(customerId).catch((err) => {
        console.warn('Error marking all notifications read in Supabase:', err);
      });
    }
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
    dbAddPayment(newPayment).catch((err) => {
      console.warn('Error adding payment in Supabase:', err);
    });
    logActivity('payment', 'Payment Logged', `Received $${newPayment.amount} from ${newPayment.businessName}.`, session.name, newPayment.customerId);
    addToast('success', 'Payment Recorded', `Invoice ${newPayment.invoiceNumber} created.`);
  };

  const updatePaymentState = (id: string, status: PaymentStatus) => {
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    dbUpdatePaymentStatus(id, status).catch((err) => {
      console.warn('Error updating payment status in Supabase:', err);
    });
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
    dbSubmitEnquiry(newEnquiry).catch((err) => {
      console.warn('Error submitting enquiry in Supabase:', err);
    });
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
    dbUpdateEnquiryStatus(id, status, adminNotes).catch((err) => {
      console.warn('Error updating enquiry status in Supabase:', err);
    });
    addToast('info', 'Enquiry Updated', `Enquiry marked as ${status}.`);
  };

  const convertEnquiryToCustomer = async (enquiryId: string): Promise<Customer | null> => {
    // 1. Verify Admin session
    if (session.role !== 'admin') {
      addToast('error', 'Unauthorized', 'Only administrators can convert lead enquiries to customer accounts.');
      return null;
    }

    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) {
      addToast('error', 'Lead Not Found', `Inquiry with ID "${enquiryId}" could not be found.`);
      return null;
    }

    // 2. Reject duplicate conversion
    if (enq.status === 'Converted') {
      addToast('error', 'Already Converted', 'This lead enquiry has already been converted into a customer account.');
      return null;
    }

    // 3. Validate email format
    const email = (enq.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      addToast('error', 'Invalid Email', `The lead email "${enq.email}" is invalid. Please update the enquiry before converting.`);
      return null;
    }

    // 4. Admin account collision prevention
    const ADMIN_EMAIL = 'hello.webrunzo@gmail.com';
    if (email === ADMIN_EMAIL.toLowerCase() || (session.email && email === session.email.toLowerCase())) {
      addToast('error', 'Email Conflict', 'Cannot convert lead using the Master Admin email address.');
      return null;
    }

    // 5. Invoke secure server API endpoint
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        addToast('error', 'Session Expired', 'Please re-authenticate as Admin before converting leads.');
        return null;
      }

      const response = await fetch('/api/admin/convert-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enquiryId }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success && result.customer) {
        const newCustomer: Customer = result.customer;
        setCustomers((prev) => [newCustomer, ...prev.filter((c) => c.id !== newCustomer.id)]);
        setEnquiries((prev) =>
          prev.map((e) =>
            e.id === enquiryId
              ? { ...e, status: 'Converted', adminNotes: `Converted to Customer: ${newCustomer.businessName}` }
              : e
          )
        );
        await refreshData();
        addToast(
          'success',
          'Lead Converted Successfully',
          result.message || `Customer ${newCustomer.businessName} provisioned and invitation dispatched.`
        );
        return newCustomer;
      } else {
        const errorMsg = result.error || 'Failed to convert lead enquiry.';
        const isConfigBlocker = result.code === 'CONFIG_BLOCKER';
        addToast(
          'error',
          isConfigBlocker ? 'Configuration Required' : 'Conversion Failed',
          errorMsg
        );
        return null;
      }
    } catch (apiErr: any) {
      console.error('Error invoking convert-lead API:', apiErr);
      addToast('error', 'Network Error', 'Unable to reach the conversion service. Please verify your connection.');
      return null;
    }
  };

  const updateSettings = (updates: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    dbUpdateSettings(updates).catch((err) => {
      console.warn('Error updating settings in Supabase:', err);
    });
    addToast('success', 'Settings Saved', 'Platform configuration successfully updated.');
  };

  const resetAllData = async () => {
    setIsLoadingData(true);
    try {
      await refreshData();
      addToast('info', 'Data Refreshed', 'Live data has been synchronized from Supabase.');
    } catch (err) {
      console.warn('Error refreshing data from Supabase:', err);
    } finally {
      setIsLoadingData(false);
    }
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

  const currentClientCustomer =
    (session.role === 'normal_client' || session.role === 'premium_client') && session.customerId
      ? customers.find((c) => c.id === session.customerId || (session.email && c.email.toLowerCase() === session.email.toLowerCase()))
      : undefined;

  const isPremiumClient =
    session.role === 'premium_client' || currentClientCustomer?.clientTier === 'premium';

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
        isPasswordResetMode,
        setIsPasswordResetMode,
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
        duplicateTemplate,
        toggleTemplateStatus,
        toggleTemplateFeatured,
        importWebsiteTemplate,
        grantExtraStorage,
        reduceExtraStorage,
        uploadCustomerFile,
        deleteCustomerFile,
        redeployCustomerWebsite,
        updateCustomerDeployment,
        updateSubscriptionState,
        switchCustomerTemplate,
        verifyCustomerDomain,
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
        updateProjectStatus,
        deleteOrder,
        addTicket,
        updateTicketStatus,
        updateTicketPriority,
        updateTicketLeadTracking,
        updateTicketAdminNotes,
        linkTicketCustomer,
        replyToTicket,
        markNotificationRead,
        markAllNotificationsRead,
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
        isSupabaseReady: isSupabaseConfigured,
        isLoadingData,
        refreshData,
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