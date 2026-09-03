import { supabase, isSupabaseConfigured } from './supabase';
import {
  Customer,
  Order,
  Payment,
  SupportTicket,
  ClientNotification,
  Enquiry,
  WebsiteBackupSnapshot,
  ActivityLog,
  AdminSettings,
  Template,
  Plan,
  Role,
  CustomerStorage,
  CustomerFile,
  StorageHistoryEntry,
  ClientWebsiteContent,
  FileCategory,
  PaymentStatus,
  OrderStatus,
  EnquiryStatus,
  LeadTrackingStatus,
  QueryStatus,
  BackupType,
} from '../types';

// Helper to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Map Plan from DB
export function mapPlanFromDb(row: any): Plan {
  return {
    id: row.id,
    name: row.name,
    monthlyPrice: Number(row.monthly_price) || 0,
    annualPrice: Number(row.annual_price) || 0,
    description: row.description || '',
    popularBadge: Boolean(row.popular_badge),
    features: Array.isArray(row.features) ? row.features : [],
    maxPages: row.max_pages || 5,
    storage: row.storage || '5 GB',
    supportLevel: row.support_level || 'Email Support',
    revisions: row.revisions || '2 rounds',
    domainIncluded: row.domain_included !== false,
    turnaroundDays: row.turnaround_days || 3,
    tier: row.tier || 'normal',
  };
}

// Map Template from DB
export function mapTemplateFromDb(row: any): Template {
  return {
    id: row.id,
    name: row.name,
    category: row.category || 'Business',
    previewImage: row.preview_image || '',
    description: row.description || '',
    longDescription: row.long_description || '',
    features: Array.isArray(row.features) ? row.features : [],
    price: Number(row.price) || 0,
    popular: Boolean(row.popular),
    isNew: Boolean(row.is_new),
    featured: Boolean(row.featured),
    status: row.status || 'Published',
    tags: Array.isArray(row.tags) ? row.tags : [],
    demoSlug: row.demo_slug || row.id,
    isMasterTemplate: Boolean(row.is_master_template),
    ownershipStatus: row.ownership_status || 'WebRunzo',
    licenseStatus: row.license_status || 'Proprietary',
    copyrightNotice: row.copyright_notice || '',
    colorScheme: row.color_scheme || { primary: '#1e293b', secondary: '#0f172a', accent: '#3b82f6' },
    sampleSections: row.sample_sections || {
      heroHeading: `Welcome to ${row.name}`,
      heroSubtitle: row.description || '',
      services: ['Service 1', 'Service 2', 'Service 3'],
      tagline: 'Precision digital engineering',
    },
    importMetadata: row.import_metadata || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : undefined,
  };
}

// Map Customer from DB
export function mapCustomerFromDb(
  row: any,
  storageRow?: any,
  filesRows?: any[],
  historyRows?: any[]
): Customer {
  const basePlanLimitGB = storageRow ? Number(storageRow.base_plan_limit_gb) || 5 : 5;
  const extraGrantedGB = storageRow ? Number(storageRow.extra_granted_gb) || 0 : 0;
  const totalUsableLimitGB = basePlanLimitGB + extraGrantedGB;
  const usedBytes = storageRow ? Number(storageRow.used_bytes) || 0 : 0;
  const usedGB = parseFloat((usedBytes / (1024 * 1024 * 1024)).toFixed(2));
  const remainingGB = parseFloat(Math.max(0, totalUsableLimitGB - usedGB).toFixed(2));
  const usagePercentage = totalUsableLimitGB > 0 ? Math.min(100, Math.round((usedGB / totalUsableLimitGB) * 100)) : 0;

  const files: CustomerFile[] = (filesRows || []).map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category as FileCategory,
    sizeBytes: Number(f.size_bytes) || 0,
    sizeFormatted: f.size_formatted || formatBytes(Number(f.size_bytes) || 0),
    mimeType: f.mime_type || 'application/octet-stream',
    uploadedAt: f.uploaded_at ? new Date(f.uploaded_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    url: f.url || undefined,
  }));

  const history: StorageHistoryEntry[] = (historyRows || []).map((h) => ({
    id: h.id,
    date: h.created_at ? new Date(h.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    adminName: h.admin_name || 'Admin',
    action: h.action || 'grant_extra',
    previousLimitGB: Number(h.previous_limit_gb) || basePlanLimitGB,
    newLimitGB: Number(h.new_limit_gb) || totalUsableLimitGB,
    changeAmountGB: Number(h.change_amount_gb) || extraGrantedGB,
    reason: h.reason || '',
    expiryDate: h.expiry_date || undefined,
    isPermanent: h.is_permanent !== false,
  }));

  const storage: CustomerStorage = {
    maxPhysicalCapacityGB: storageRow ? Number(storageRow.max_physical_capacity_gb) || 15 : 15,
    basePlanLimitGB,
    extraGrantedGB,
    totalUsableLimitGB,
    usedBytes,
    usedGB,
    remainingGB,
    usagePercentage,
    breakdown: storageRow?.breakdown || {
      imagesBytes: 0,
      videosBytes: 0,
      documentsBytes: 0,
      websiteFilesBytes: 0,
      databaseBytes: 0,
    },
    files,
    history,
    addons: [],
  };

  return {
    id: row.id,
    name: row.name,
    businessName: row.business_name,
    email: row.email,
    phone: row.phone || '',
    clientTier: row.client_tier || 'normal',
    planId: row.plan_id || 'plan-pro',
    templateId: row.template_id || 'tpl-biz-1',
    paymentStatus: row.payment_status || 'Paid',
    planStartDate: row.plan_start_date || new Date().toISOString().split('T')[0],
    planExpiryDate: row.plan_expiry_date || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    websiteUrl: row.website_url || `https://${(row.business_name || 'site').toLowerCase().replace(/[^a-z0-9]/g, '')}.webrunzo.app`,
    customDomain: row.custom_domain || undefined,
    dnsStatus: row.dns_status || 'Active',
    sslStatus: row.ssl_status || 'Active',
    websiteStatus: row.website_status || 'Live',
    maintenanceNotice: row.maintenance_notice || undefined,
    accountStatus: row.account_status || 'Active',
    notes: row.notes || '',
    internalNotes: row.internal_notes || '',
    seoScore: Number(row.seo_score) || 95,
    speedScore: Number(row.speed_score) || 98,
    uptimePercent: Number(row.uptime_percent) || 99.98,
    autoRenew: row.auto_renew !== false,
    slaLevel: row.sla_level || 'Standard 24h',
    headerScripts: row.header_scripts || undefined,
    footerScripts: row.footer_scripts || undefined,
    subscriptionState: row.subscription_state || 'ACTIVE',
    gracePeriodEndDate: row.grace_period_end_date || undefined,
    customContent: row.custom_content || {
      businessName: row.business_name,
      tagline: 'Precision digital engineering',
      heroHeadline: `Welcome to ${row.business_name}`,
      heroSubhead: 'Empowering your brand with high-standard digital presence.',
      primaryColor: '#3b82f6',
      logoText: (row.business_name || 'BUSINESS').toUpperCase(),
      contactEmail: row.email,
      contactPhone: row.phone || '+1 (555) 000-0000',
      address: '100 Business Center Ave, Suite 100',
      aboutText: `${row.business_name} provides industry-leading solutions with uncompromising quality.`,
      servicesList: [
        { title: 'Core Offering', desc: 'Bespoke high standard service tailored to your requirements.' },
        { title: 'Consulting', desc: 'Expert strategy and execution.' },
      ],
      socialLinks: { instagram: 'https://instagram.com' },
    },
    deployment: row.deployment || {
      platform: 'Vercel',
      dnsProvider: 'Cloudflare',
      dbProvider: 'Supabase',
      storageProvider: 'Supabase Storage / Cloudflare R2',
      deploymentId: `dpl_${row.id}`,
      deploymentStatus: 'Ready',
      lastDeployedAt: 'Just now',
      edgeLocation: 'iad1 (US-East Edge)',
      sslAutoRenew: true,
      cnameTarget: 'cname.webrunzo.app',
      aRecordTarget: '76.76.21.21',
    },
    activityHistory: Array.isArray(row.activity_history) ? row.activity_history : [],
    storage,
  };
}

// Map Order from DB
export function mapOrderFromDb(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    planId: row.plan_id || 'plan-pro',
    templateId: row.template_id || 'tpl-biz-1',
    clientName: row.client_name,
    businessName: row.business_name,
    email: row.email,
    phone: row.phone || '',
    amount: Number(row.amount) || 0,
    status: (row.status as OrderStatus) || 'New',
    paymentStatus: (row.payment_status as PaymentStatus) || 'Paid',
    date: row.date ? new Date(row.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    deliveryDueDate: row.delivery_due_date || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    requirements: row.requirements || '',
    internalNotes: row.internal_notes || '',
    clientTier: row.client_tier || 'normal',
    milestones: Array.isArray(row.milestones) ? row.milestones : [],
  };
}

// Map Payment from DB
export function mapPaymentFromDb(row: any): Payment {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    invoiceNumber: row.invoice_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    businessName: row.business_name,
    amount: Number(row.amount) || 0,
    planName: row.plan_name || 'Standard Plan',
    date: row.date ? new Date(row.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: (row.status as PaymentStatus) || 'Paid',
    method: row.method || 'Credit Card / Electronic',
  };
}

// Map Support Ticket from DB with replies
export function mapTicketFromDb(row: any, repliesRows?: any[]): SupportTicket {
  const replies = (repliesRows || []).map((r) => ({
    id: r.id,
    sender: r.sender as 'Client' | 'Admin',
    senderName: r.sender_name,
    message: r.message,
    timestamp: r.created_at ? new Date(r.created_at).toISOString().replace('T', ' ').substring(0, 16) : new Date().toISOString().replace('T', ' ').substring(0, 16),
    attachmentName: r.attachment_name || undefined,
  }));

  return {
    id: row.id,
    customerId: row.customer_id,
    clientName: row.client_name,
    email: row.email || undefined,
    businessName: row.business_name || '',
    websiteUrl: row.website_url || undefined,
    clientTier: row.client_tier || 'normal',
    planId: row.plan_id || undefined,
    planName: row.plan_name || undefined,
    queryType: row.query_type || 'Free Query',
    requestType: row.request_type || undefined,
    subject: row.subject,
    category: row.category || undefined,
    priority: row.priority || 'Normal',
    status: (row.status as QueryStatus) || 'New',
    leadTrackingStatus: (row.lead_tracking_status as LeadTrackingStatus) || undefined,
    message: row.message,
    attachmentName: row.attachment_name || undefined,
    attachmentSize: row.attachment_size || undefined,
    preferredCompletionDate: row.preferred_completion_date || undefined,
    adminNotes: row.admin_notes || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString().replace('T', ' ').substring(0, 16) : new Date().toISOString().replace('T', ' ').substring(0, 16),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    replies,
  };
}

// Map Notification from DB
export function mapNotificationFromDb(row: any): ClientNotification {
  return {
    id: row.id,
    customerId: row.customer_id,
    title: row.title,
    message: row.message,
    date: row.date ? new Date(row.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    read: Boolean(row.read),
    type: row.type || 'info',
  };
}

// Map Enquiry from DB
export function mapEnquiryFromDb(row: any): Enquiry {
  return {
    id: row.id,
    name: row.name,
    business: row.business,
    phone: row.phone || '',
    email: row.email,
    selectedTemplateId: row.selected_template_id || '',
    selectedPlanId: row.selected_plan_id || '',
    message: row.message || '',
    date: row.date ? new Date(row.date).toISOString().replace('T', ' ').substring(0, 16) : new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: (row.status as EnquiryStatus) || 'New',
    adminNotes: row.admin_notes || undefined,
  };
}

// Map Backup from DB
export function mapBackupFromDb(row: any): WebsiteBackupSnapshot {
  return {
    id: row.id,
    customerId: row.customer_id,
    clientName: row.client_name,
    businessName: row.business_name,
    websiteUrl: row.website_url || '',
    customDomain: row.custom_domain || undefined,
    timestamp: row.timestamp || new Date().toISOString(),
    sizeFormatted: row.size_formatted || '120 MB',
    sizeBytes: Number(row.size_bytes) || 125829120,
    storageLocation: row.storage_location || 'AWS S3 Mumbai ap-south-1 (AES-256)',
    status: row.status || 'Success',
    type: (row.type as BackupType) || 'Manual Admin Snapshot',
    versionTag: row.version_tag || 'v1.0.0-snapshot',
    checksum: row.checksum || 'sha256:verified',
    componentsIncluded: row.components_included || {
      databaseState: true,
      codeAssets: true,
      mediaUploads: true,
      sslDnsConfig: true,
    },
    snapshotData: row.snapshot_data || {
      customContentSnapshot: {} as any,
      templateIdSnapshot: 'tpl-biz-1',
    },
    notes: row.notes || undefined,
    retentionDays: row.retention_days || 30,
    expiresAt: row.expires_at || undefined,
    isStagingPreviewReady: Boolean(row.is_staging_preview_ready),
    stagingPreviewUrl: row.staging_preview_url || undefined,
  };
}

// Map Activity Log from DB
export function mapActivityLogFromDb(row: any): ActivityLog {
  return {
    id: row.id,
    timestamp: row.timestamp ? new Date(row.timestamp).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19),
    type: row.type || 'system',
    title: row.title,
    description: row.description,
    user: row.user || 'System',
    customerId: row.customer_id || undefined,
  };
}

// Map Admin Settings from DB
export function mapAdminSettingsFromDb(row: any): Partial<AdminSettings> {
  const json = row.settings_json || {};
  return {
    businessName: row.business_name || 'WebRunzo',
    brandName: row.brand_name || 'WebRunzo Technologies',
    supportEmail: row.support_email || 'support@webrunzo.com',
    supportPhone: row.support_phone || '+1 (800) 555-0199',
    whatsAppNumber: row.whatsapp_number || '+18005550199',
    whatsAppDefaultMessage: row.whatsapp_default_message || '',
    currency: row.currency || 'USD',
    currencySymbol: row.currency_symbol || '$',
    notifyNewEnquiries: row.notify_new_enquiries !== false,
    notifyExpiringPlans: row.notify_expiring_plans !== false,
    autoWelcomeEmail: row.auto_welcome_email !== false,
    brandTagline: row.brand_tagline || 'Done-For-You Turnkey Website Infrastructure',
    agentAvailabilityMode: row.agent_availability_mode || 'auto',
    ...json,
  };
}

// ==============================================================================
// FETCH ALL DATA (Scoped by Role & User Session)
// ==============================================================================
export async function fetchApplicationData(
  role: Role,
  customerId?: string
): Promise<{
  plans: Plan[];
  templates: Template[];
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
  tickets: SupportTicket[];
  notifications: ClientNotification[];
  enquiries: Enquiry[];
  backups: WebsiteBackupSnapshot[];
  activityLogs: ActivityLog[];
  settings?: Partial<AdminSettings>;
}> {
  if (!isSupabaseConfigured) {
    return {
      plans: [],
      templates: [],
      customers: [],
      orders: [],
      payments: [],
      tickets: [],
      notifications: [],
      enquiries: [],
      backups: [],
      activityLogs: [],
    };
  }

  // 1. Fetch Plans & Templates (Public / All)
  const [plansRes, templatesRes, settingsRes] = await Promise.all([
    supabase.from('plans').select('*').order('monthly_price', { ascending: true }),
    supabase.from('templates').select('*').order('name', { ascending: true }),
    supabase.from('admin_settings').select('*').limit(1).maybeSingle(),
  ]);

  const plans = (plansRes.data || []).map(mapPlanFromDb);
  const templates = (templatesRes.data || []).map(mapTemplateFromDb);
  const settings = settingsRes.data ? mapAdminSettingsFromDb(settingsRes.data) : undefined;

  // If Guest, only public data is accessible
  if (role === 'guest') {
    return {
      plans,
      templates,
      customers: [],
      orders: [],
      payments: [],
      tickets: [],
      notifications: [],
      enquiries: [],
      backups: [],
      activityLogs: [],
      settings,
    };
  }

  // If Admin, fetch all business tables
  if (role === 'admin') {
    const [
      custRes,
      storageRes,
      filesRes,
      historyRes,
      ordersRes,
      paymentsRes,
      ticketsRes,
      repliesRes,
      notifRes,
      enqRes,
      backupsRes,
      logsRes,
    ] = await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('customer_storage').select('*'),
      supabase.from('customer_files').select('*').order('uploaded_at', { ascending: false }),
      supabase.from('storage_history').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('date', { ascending: false }),
      supabase.from('payments').select('*').order('date', { ascending: false }),
      supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('ticket_replies').select('*').order('created_at', { ascending: true }),
      supabase.from('client_notifications').select('*').order('date', { ascending: false }),
      supabase.from('enquiries').select('*').order('date', { ascending: false }),
      supabase.from('website_backups').select('*').order('timestamp', { ascending: false }),
      supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(100),
    ]);

    const storageMap = new Map((storageRes.data || []).map((s: any) => [s.customer_id, s]));
    const filesMap = new Map<string, any[]>();
    (filesRes.data || []).forEach((f: any) => {
      const list = filesMap.get(f.customer_id) || [];
      list.push(f);
      filesMap.set(f.customer_id, list);
    });

    const historyMap = new Map<string, any[]>();
    (historyRes.data || []).forEach((h: any) => {
      const list = historyMap.get(h.customer_id) || [];
      list.push(h);
      historyMap.set(h.customer_id, list);
    });

    const customers = (custRes.data || []).map((c: any) =>
      mapCustomerFromDb(c, storageMap.get(c.id), filesMap.get(c.id), historyMap.get(c.id))
    );

    const repliesMap = new Map<string, any[]>();
    (repliesRes.data || []).forEach((r: any) => {
      const list = repliesMap.get(r.ticket_id) || [];
      list.push(r);
      repliesMap.set(r.ticket_id, list);
    });

    const tickets = (ticketsRes.data || []).map((t: any) =>
      mapTicketFromDb(t, repliesMap.get(t.id))
    );

    return {
      plans,
      templates,
      customers,
      orders: (ordersRes.data || []).map(mapOrderFromDb),
      payments: (paymentsRes.data || []).map(mapPaymentFromDb),
      tickets,
      notifications: (notifRes.data || []).map(mapNotificationFromDb),
      enquiries: (enqRes.data || []).map(mapEnquiryFromDb),
      backups: (backupsRes.data || []).map(mapBackupFromDb),
      activityLogs: (logsRes.data || []).map(mapActivityLogFromDb),
      settings,
    };
  }

  // If Client (normal_client or premium_client): RLS ensures only client's records are returned!
  const [
    custRes,
    storageRes,
    filesRes,
    historyRes,
    ordersRes,
    paymentsRes,
    ticketsRes,
    repliesRes,
    notifRes,
    backupsRes,
    logsRes,
  ] = await Promise.all([
    supabase.from('customers').select('*'),
    supabase.from('customer_storage').select('*'),
    supabase.from('customer_files').select('*').order('uploaded_at', { ascending: false }),
    supabase.from('storage_history').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('*').order('date', { ascending: false }),
    supabase.from('payments').select('*').order('date', { ascending: false }),
    supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
    supabase.from('ticket_replies').select('*').order('created_at', { ascending: true }),
    supabase.from('client_notifications').select('*').order('date', { ascending: false }),
    supabase.from('website_backups').select('*').order('timestamp', { ascending: false }),
    supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(50),
  ]);

  const storageMap = new Map((storageRes.data || []).map((s: any) => [s.customer_id, s]));
  const filesMap = new Map<string, any[]>();
  (filesRes.data || []).forEach((f: any) => {
    const list = filesMap.get(f.customer_id) || [];
    list.push(f);
    filesMap.set(f.customer_id, list);
  });

  const historyMap = new Map<string, any[]>();
  (historyRes.data || []).forEach((h: any) => {
    const list = historyMap.get(h.customer_id) || [];
    list.push(h);
    historyMap.set(h.customer_id, list);
  });

  const customers = (custRes.data || []).map((c: any) =>
    mapCustomerFromDb(c, storageMap.get(c.id), filesMap.get(c.id), historyMap.get(c.id))
  );

  const repliesMap = new Map<string, any[]>();
  (repliesRes.data || []).forEach((r: any) => {
    const list = repliesMap.get(r.ticket_id) || [];
    list.push(r);
    repliesMap.set(r.ticket_id, list);
  });

  const tickets = (ticketsRes.data || []).map((t: any) =>
    mapTicketFromDb(t, repliesMap.get(t.id))
  );

  return {
    plans,
    templates,
    customers,
    orders: (ordersRes.data || []).map(mapOrderFromDb),
    payments: (paymentsRes.data || []).map(mapPaymentFromDb),
    tickets,
    notifications: (notifRes.data || []).map(mapNotificationFromDb),
    enquiries: [],
    backups: (backupsRes.data || []).map(mapBackupFromDb),
    activityLogs: (logsRes.data || []).map(mapActivityLogFromDb),
    settings,
  };
}

// ==============================================================================
// CRUD WRITE OPERATIONS (Directly Writing to Supabase Tables)
// ==============================================================================

// CUSTOMER CRUD
export async function dbAddCustomer(customer: Customer): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error: custErr } = await supabase.from('customers').insert({
      id: customer.id,
      name: customer.name,
      business_name: customer.businessName,
      email: customer.email,
      phone: customer.phone,
      client_tier: customer.clientTier,
      plan_id: customer.planId,
      template_id: customer.templateId,
      payment_status: customer.paymentStatus,
      plan_start_date: customer.planStartDate,
      plan_expiry_date: customer.planExpiryDate,
      website_url: customer.websiteUrl,
      custom_domain: customer.customDomain || null,
      dns_status: customer.dnsStatus || 'Active',
      ssl_status: customer.sslStatus || 'Active',
      website_status: customer.websiteStatus || 'Live',
      maintenance_notice: customer.maintenanceNotice || null,
      account_status: customer.accountStatus || 'Active',
      notes: customer.notes || null,
      internal_notes: customer.internalNotes || null,
      seo_score: customer.seoScore || 95,
      speed_score: customer.speedScore || 98,
      uptime_percent: customer.uptimePercent || 99.98,
      auto_renew: customer.autoRenew !== false,
      sla_level: customer.slaLevel || 'Standard 24h',
      header_scripts: customer.headerScripts || null,
      footer_scripts: customer.footerScripts || null,
      subscription_state: customer.subscriptionState || 'ACTIVE',
      grace_period_end_date: customer.gracePeriodEndDate || null,
      custom_content: customer.customContent || {},
      deployment: customer.deployment || {},
      activity_history: customer.activityHistory || [],
    });

    if (custErr) {
      console.error('dbAddCustomer error:', custErr);
      return { error: custErr.message };
    }

    // Initialize customer_storage row
    await supabase.from('customer_storage').insert({
      customer_id: customer.id,
      max_physical_capacity_gb: customer.storage?.maxPhysicalCapacityGB || 15,
      base_plan_limit_gb: customer.storage?.basePlanLimitGB || 5,
      extra_granted_gb: customer.storage?.extraGrantedGB || 0,
      used_bytes: customer.storage?.usedBytes || 0,
      breakdown: customer.storage?.breakdown || {
        imagesBytes: 0,
        videosBytes: 0,
        documentsBytes: 0,
        websiteFilesBytes: 0,
        databaseBytes: 0,
      },
    });

    return {};
  } catch (err: any) {
    return { error: err.message || 'Error inserting customer' };
  }
}

export async function dbUpdateCustomer(
  customerId: string,
  updates: Partial<Customer>
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.businessName !== undefined) payload.business_name = updates.businessName;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.clientTier !== undefined) payload.client_tier = updates.clientTier;
    if (updates.planId !== undefined) payload.plan_id = updates.planId;
    if (updates.templateId !== undefined) payload.template_id = updates.templateId;
    if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
    if (updates.planStartDate !== undefined) payload.plan_start_date = updates.planStartDate;
    if (updates.planExpiryDate !== undefined) payload.plan_expiry_date = updates.planExpiryDate;
    if (updates.websiteUrl !== undefined) payload.website_url = updates.websiteUrl;
    if (updates.customDomain !== undefined) payload.custom_domain = updates.customDomain;
    if (updates.dnsStatus !== undefined) payload.dns_status = updates.dnsStatus;
    if (updates.sslStatus !== undefined) payload.ssl_status = updates.sslStatus;
    if (updates.websiteStatus !== undefined) payload.website_status = updates.websiteStatus;
    if (updates.maintenanceNotice !== undefined) payload.maintenance_notice = updates.maintenanceNotice;
    if (updates.accountStatus !== undefined) payload.account_status = updates.accountStatus;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.internalNotes !== undefined) payload.internal_notes = updates.internalNotes;
    if (updates.seoScore !== undefined) payload.seo_score = updates.seoScore;
    if (updates.speedScore !== undefined) payload.speed_score = updates.speedScore;
    if (updates.uptimePercent !== undefined) payload.uptime_percent = updates.uptimePercent;
    if (updates.autoRenew !== undefined) payload.auto_renew = updates.autoRenew;
    if (updates.slaLevel !== undefined) payload.sla_level = updates.slaLevel;
    if (updates.headerScripts !== undefined) payload.header_scripts = updates.headerScripts;
    if (updates.footerScripts !== undefined) payload.footer_scripts = updates.footerScripts;
    if (updates.subscriptionState !== undefined) payload.subscription_state = updates.subscriptionState;
    if (updates.gracePeriodEndDate !== undefined) payload.grace_period_end_date = updates.gracePeriodEndDate;
    if (updates.customContent !== undefined) payload.custom_content = updates.customContent;
    if (updates.deployment !== undefined) payload.deployment = updates.deployment;
    if (updates.activityHistory !== undefined) payload.activity_history = updates.activityHistory;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('customers').update(payload).eq('id', customerId);
    if (error) {
      console.error('dbUpdateCustomer error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbDeleteCustomer(customerId: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('customers').delete().eq('id', customerId);
    if (error) {
      console.error('dbDeleteCustomer error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbUpdateClientContent(
  customerId: string,
  contentUpdates: Partial<ClientWebsiteContent>,
  currentCustomContent: ClientWebsiteContent,
  newBusinessName?: string
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const updatedContent = { ...currentCustomContent, ...contentUpdates };
    const payload: Record<string, any> = {
      custom_content: updatedContent,
      updated_at: new Date().toISOString(),
    };
    if (newBusinessName) {
      payload.business_name = newBusinessName;
    }
    const { error } = await supabase.from('customers').update(payload).eq('id', customerId);
    if (error) {
      console.error('dbUpdateClientContent error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// STORAGE & FILES CRUD
export async function dbUpdateCustomerStorage(
  customerId: string,
  storage: CustomerStorage,
  historyEntry?: StorageHistoryEntry
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error: storageErr } = await supabase
      .from('customer_storage')
      .upsert({
        customer_id: customerId,
        max_physical_capacity_gb: storage.maxPhysicalCapacityGB,
        base_plan_limit_gb: storage.basePlanLimitGB,
        extra_granted_gb: storage.extraGrantedGB,
        used_bytes: storage.usedBytes,
        breakdown: storage.breakdown,
        updated_at: new Date().toISOString(),
      });

    if (storageErr) {
      console.error('dbUpdateCustomerStorage error:', storageErr);
      return { error: storageErr.message };
    }

    if (historyEntry) {
      await supabase.from('storage_history').insert({
        id: historyEntry.id,
        customer_id: customerId,
        admin_name: historyEntry.adminName,
        action: historyEntry.action,
        previous_limit_gb: historyEntry.previousLimitGB,
        new_limit_gb: historyEntry.newLimitGB,
        change_amount_gb: historyEntry.changeAmountGB,
        reason: historyEntry.reason,
        expiry_date: historyEntry.expiryDate || null,
        is_permanent: historyEntry.isPermanent,
      });
    }

    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbInsertCustomerFile(
  customerId: string,
  file: CustomerFile,
  updatedStorage: CustomerStorage
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error: fileErr } = await supabase.from('customer_files').insert({
      id: file.id,
      customer_id: customerId,
      name: file.name,
      category: file.category,
      size_bytes: file.sizeBytes,
      size_formatted: file.sizeFormatted,
      mime_type: file.mimeType,
      url: file.url || null,
      uploaded_at: new Date().toISOString(),
    });

    if (fileErr) {
      console.error('dbInsertCustomerFile error:', fileErr);
      return { error: fileErr.message };
    }

    await dbUpdateCustomerStorage(customerId, updatedStorage);
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbDeleteCustomerFile(
  customerId: string,
  fileId: string,
  updatedStorage: CustomerStorage
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('customer_files').delete().eq('id', fileId);
    if (error) {
      console.error('dbDeleteCustomerFile error:', error);
      return { error: error.message };
    }
    await dbUpdateCustomerStorage(customerId, updatedStorage);
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// TEMPLATE CRUD
export async function dbAddTemplate(template: Template): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('templates').insert({
      id: template.id,
      name: template.name,
      category: template.category,
      preview_image: template.previewImage,
      description: template.description,
      long_description: template.longDescription,
      features: template.features,
      price: template.price,
      popular: template.popular || false,
      is_new: template.isNew || false,
      featured: template.featured || false,
      status: template.status || 'Published',
      tags: template.tags || [],
      demo_slug: template.demoSlug,
      is_master_template: template.isMasterTemplate || false,
      ownership_status: template.ownershipStatus || 'WebRunzo',
      license_status: template.licenseStatus || 'Proprietary',
      copyright_notice: template.copyrightNotice || '',
      color_scheme: template.colorScheme,
      sample_sections: template.sampleSections,
      import_metadata: template.importMetadata || null,
    });
    if (error) {
      console.error('dbAddTemplate error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbUpdateTemplate(
  id: string,
  updates: Partial<Template>
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.previewImage !== undefined) payload.preview_image = updates.previewImage;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.longDescription !== undefined) payload.long_description = updates.longDescription;
    if (updates.features !== undefined) payload.features = updates.features;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.popular !== undefined) payload.popular = updates.popular;
    if (updates.isNew !== undefined) payload.is_new = updates.isNew;
    if (updates.featured !== undefined) payload.featured = updates.featured;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.demoSlug !== undefined) payload.demo_slug = updates.demoSlug;
    if (updates.isMasterTemplate !== undefined) payload.is_master_template = updates.isMasterTemplate;
    if (updates.ownershipStatus !== undefined) payload.ownership_status = updates.ownershipStatus;
    if (updates.licenseStatus !== undefined) payload.license_status = updates.licenseStatus;
    if (updates.copyrightNotice !== undefined) payload.copyright_notice = updates.copyrightNotice;
    if (updates.colorScheme !== undefined) payload.color_scheme = updates.colorScheme;
    if (updates.sampleSections !== undefined) payload.sample_sections = updates.sampleSections;
    if (updates.importMetadata !== undefined) payload.import_metadata = updates.importMetadata;

    const { error } = await supabase.from('templates').update(payload).eq('id', id);
    if (error) {
      console.error('dbUpdateTemplate error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbDeleteTemplate(id: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) {
      console.error('dbDeleteTemplate error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// PLAN CRUD
export async function dbUpdatePlan(id: string, updates: Partial<Plan>): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.monthlyPrice !== undefined) payload.monthly_price = updates.monthlyPrice;
    if (updates.annualPrice !== undefined) payload.annual_price = updates.annualPrice;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.popularBadge !== undefined) payload.popular_badge = updates.popularBadge;
    if (updates.features !== undefined) payload.features = updates.features;
    if (updates.maxPages !== undefined) payload.max_pages = updates.maxPages;
    if (updates.storage !== undefined) payload.storage = updates.storage;
    if (updates.supportLevel !== undefined) payload.support_level = updates.supportLevel;
    if (updates.revisions !== undefined) payload.revisions = updates.revisions;
    if (updates.domainIncluded !== undefined) payload.domain_included = updates.domainIncluded;
    if (updates.turnaroundDays !== undefined) payload.turnaround_days = updates.turnaroundDays;
    if (updates.tier !== undefined) payload.tier = updates.tier;

    const { error } = await supabase.from('plans').update(payload).eq('id', id);
    if (error) {
      console.error('dbUpdatePlan error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// ORDER CRUD
export async function dbAddOrder(order: Order): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('orders').insert({
      id: order.id,
      order_number: order.orderNumber,
      customer_id: order.customerId,
      plan_id: order.planId,
      template_id: order.templateId,
      client_name: order.clientName,
      business_name: order.businessName,
      email: order.email,
      phone: order.phone,
      amount: order.amount,
      status: order.status,
      payment_status: order.paymentStatus,
      date: order.date,
      delivery_due_date: order.deliveryDueDate,
      requirements: order.requirements,
      internal_notes: order.internalNotes || null,
      client_tier: order.clientTier,
      milestones: order.milestones || [],
    });
    if (error) {
      console.error('dbAddOrder error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbUpdateOrder(
  id: string,
  updates: Partial<Order>
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.deliveryDueDate !== undefined) payload.delivery_due_date = updates.deliveryDueDate;
    if (updates.requirements !== undefined) payload.requirements = updates.requirements;
    if (updates.internalNotes !== undefined) payload.internal_notes = updates.internalNotes;
    if (updates.milestones !== undefined) payload.milestones = updates.milestones;

    const { error } = await supabase.from('orders').update(payload).eq('id', id);
    if (error) {
      console.error('dbUpdateOrder error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbDeleteOrder(id: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.error('dbDeleteOrder error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// SUPPORT TICKET CRUD
export async function dbAddTicket(ticket: SupportTicket): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('support_tickets').insert({
      id: ticket.id,
      customer_id: ticket.customerId,
      client_name: ticket.clientName,
      email: ticket.email || null,
      business_name: ticket.businessName,
      website_url: ticket.websiteUrl || null,
      client_tier: ticket.clientTier || 'normal',
      plan_id: ticket.planId || null,
      plan_name: ticket.planName || null,
      query_type: ticket.queryType || 'Free Query',
      request_type: ticket.requestType || null,
      subject: ticket.subject,
      category: ticket.category || null,
      priority: ticket.priority || 'Normal',
      status: ticket.status || 'New',
      lead_tracking_status: ticket.leadTrackingStatus || null,
      message: ticket.message,
      attachment_name: ticket.attachmentName || null,
      attachment_size: ticket.attachmentSize || null,
      preferred_completion_date: ticket.preferredCompletionDate || null,
      admin_notes: ticket.adminNotes || null,
    });

    if (error) {
      console.error('dbAddTicket error:', error);
      return { error: error.message };
    }

    // Insert automatic notification
    if (ticket.customerId) {
      await supabase.from('client_notifications').insert({
        id: `notif-${Date.now()}`,
        customer_id: ticket.customerId,
        title: ticket.queryType === 'Premium Assistance' ? 'Assistance Request Received' : 'Support Query Received',
        message: 'Your query has been logged. Our engineering specialist will review it promptly.',
        date: new Date().toISOString(),
        read: false,
        type: 'info',
      });
    }

    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbUpdateTicket(
  id: string,
  updates: Partial<SupportTicket>,
  customerId?: string
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.leadTrackingStatus !== undefined) payload.lead_tracking_status = updates.leadTrackingStatus;
    if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;

    const { error } = await supabase.from('support_tickets').update(payload).eq('id', id);
    if (error) {
      console.error('dbUpdateTicket error:', error);
      return { error: error.message };
    }

    if (updates.status && customerId) {
      await supabase.from('client_notifications').insert({
        id: `notif-${Date.now()}`,
        customer_id: customerId,
        title: `Status Update: ${updates.subject || 'Ticket'}`,
        message: `Your request status has been updated to "${updates.status}".`,
        date: new Date().toISOString(),
        read: false,
        type: updates.status === 'Resolved' || updates.status === 'Closed' ? 'success' : 'info',
      });
    }

    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbAddTicketReply(
  ticketId: string,
  reply: {
    id: string;
    sender: 'Client' | 'Admin';
    senderName: string;
    message: string;
    attachmentName?: string;
  },
  customerId?: string,
  ticketSubject?: string
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error: replyErr } = await supabase.from('ticket_replies').insert({
      id: reply.id,
      ticket_id: ticketId,
      sender: reply.sender,
      sender_name: reply.senderName,
      message: reply.message,
      attachment_name: reply.attachmentName || null,
    });

    if (replyErr) {
      console.error('dbAddTicketReply error:', replyErr);
      return { error: replyErr.message };
    }

    // Update ticket updated_at
    const nextStatus = reply.sender === 'Admin' ? 'In Progress' : 'In Review';
    await supabase
      .from('support_tickets')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    // Notify client if Admin replied
    if (reply.sender === 'Admin' && customerId) {
      await supabase.from('client_notifications').insert({
        id: `notif-${Date.now()}`,
        customer_id: customerId,
        title: `New Reply on: ${ticketSubject || 'Support Query'}`,
        message: `${reply.senderName}: "${reply.message.length > 70 ? reply.message.slice(0, 70) + '...' : reply.message}"`,
        date: new Date().toISOString(),
        read: false,
        type: 'info',
      });
    }

    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// NOTIFICATION CRUD
export async function dbMarkNotificationRead(id: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('client_notifications').update({ read: true }).eq('id', id);
    if (error) {
      console.error('dbMarkNotificationRead error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbMarkAllNotificationsRead(customerId: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase
      .from('client_notifications')
      .update({ read: true })
      .eq('customer_id', customerId)
      .eq('read', false);
    if (error) {
      console.error('dbMarkAllNotificationsRead error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// PAYMENT CRUD
export async function dbAddPayment(payment: Payment): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('payments').insert({
      id: payment.id,
      transaction_id: payment.transactionId,
      invoice_number: payment.invoiceNumber,
      customer_id: payment.customerId,
      customer_name: payment.customerName,
      business_name: payment.businessName,
      amount: payment.amount,
      plan_name: payment.planName,
      date: payment.date,
      status: payment.status,
      method: payment.method,
    });
    if (error) {
      console.error('dbAddPayment error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbUpdatePaymentStatus(
  id: string,
  status: PaymentStatus
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('payments').update({ status }).eq('id', id);
    if (error) {
      console.error('dbUpdatePaymentStatus error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// ENQUIRY CRUD
export async function dbSubmitEnquiry(enquiry: Enquiry): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('enquiries').insert({
      id: enquiry.id,
      name: enquiry.name,
      business: enquiry.business,
      phone: enquiry.phone || null,
      email: enquiry.email,
      selected_template_id: enquiry.selectedTemplateId || null,
      selected_plan_id: enquiry.selectedPlanId || null,
      message: enquiry.message || null,
      status: enquiry.status || 'New',
      admin_notes: enquiry.adminNotes || null,
    });
    if (error) {
      console.error('dbSubmitEnquiry error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbUpdateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
  adminNotes?: string
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const payload: Record<string, any> = { status };
    if (adminNotes !== undefined) payload.admin_notes = adminNotes;
    const { error } = await supabase.from('enquiries').update(payload).eq('id', id);
    if (error) {
      console.error('dbUpdateEnquiryStatus error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// WEBSITE BACKUPS CRUD
export async function dbAddBackup(backup: WebsiteBackupSnapshot): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('website_backups').insert({
      id: backup.id,
      customer_id: backup.customerId,
      client_name: backup.clientName,
      business_name: backup.businessName,
      website_url: backup.websiteUrl,
      custom_domain: backup.customDomain || null,
      timestamp: backup.timestamp,
      size_formatted: backup.sizeFormatted,
      size_bytes: backup.sizeBytes,
      storage_location: backup.storageLocation,
      status: backup.status,
      type: backup.type,
      version_tag: backup.versionTag,
      checksum: backup.checksum,
      components_included: backup.componentsIncluded,
      snapshot_data: backup.snapshotData,
      notes: backup.notes || null,
      retention_days: backup.retentionDays,
      expires_at: backup.expiresAt || null,
      is_staging_preview_ready: backup.isStagingPreviewReady,
      staging_preview_url: backup.stagingPreviewUrl || null,
    });
    if (error) {
      console.error('dbAddBackup error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function dbDeleteBackup(id: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('website_backups').delete().eq('id', id);
    if (error) {
      console.error('dbDeleteBackup error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// ACTIVITY LOG CRUD
export async function dbLogActivity(log: ActivityLog): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const { error } = await supabase.from('activity_logs').insert({
      id: log.id,
      timestamp: new Date().toISOString(),
      type: log.type,
      title: log.title,
      description: log.description,
      user: log.user,
      customer_id: log.customerId || null,
    });
    if (error) {
      console.error('dbLogActivity error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

// ADMIN SETTINGS CRUD
export async function dbUpdateSettings(updates: Partial<AdminSettings>): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return {};
  try {
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.businessName !== undefined) payload.business_name = updates.businessName;
    if (updates.brandName !== undefined) payload.brand_name = updates.brandName;
    if (updates.supportEmail !== undefined) payload.support_email = updates.supportEmail;
    if (updates.supportPhone !== undefined) payload.support_phone = updates.supportPhone;
    if (updates.whatsAppNumber !== undefined) payload.whatsapp_number = updates.whatsAppNumber;
    if (updates.whatsAppDefaultMessage !== undefined) payload.whatsapp_default_message = updates.whatsAppDefaultMessage;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.currencySymbol !== undefined) payload.currency_symbol = updates.currencySymbol;
    if (updates.notifyNewEnquiries !== undefined) payload.notify_new_enquiries = updates.notifyNewEnquiries;
    if (updates.notifyExpiringPlans !== undefined) payload.notify_expiring_plans = updates.notifyExpiringPlans;
    if (updates.autoWelcomeEmail !== undefined) payload.auto_welcome_email = updates.autoWelcomeEmail;
    if (updates.brandTagline !== undefined) payload.brand_tagline = updates.brandTagline;
    if (updates.agentAvailabilityMode !== undefined) payload.agent_availability_mode = updates.agentAvailabilityMode;
    payload.settings_json = updates;

    const { error } = await supabase
      .from('admin_settings')
      .upsert({ id: 'default', ...payload });

    if (error) {
      console.error('dbUpdateSettings error:', error);
      return { error: error.message };
    }
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}
