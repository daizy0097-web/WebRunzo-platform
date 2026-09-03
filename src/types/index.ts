export type Role = 'admin' | 'normal_client' | 'premium_client' | 'client' | 'guest';

export type ClientTier = 'normal' | 'premium';

export type WebsiteStatus = 'Draft' | 'In Progress' | 'Live' | 'Suspended' | 'Expired';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';
export type CustomerStatus = 'Active' | 'Pending' | 'Expired';
export type EnquiryStatus = 'New' | 'Contacted' | 'Converted' | 'Closed';
export type OrderStatus = 'New' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export type TemplateCategory =
  | 'Business'
  | 'Restaurant'
  | 'Portfolio'
  | 'Gym'
  | 'Salon'
  | 'Real Estate'
  | 'E-commerce'
  | 'Personal Brand';

export type TemplateStatus = 'Published' | 'Draft' | 'Archived';
export type OwnershipStatus = 'WebRunzo' | 'Licensed' | 'Imported Custom';
export type LicenseStatus = 'Proprietary' | 'Commercial Use Granted' | 'MIT' | 'Custom Agreement';
export type ImportSource = 
  | 'Google AI Studio' 
  | 'Gemini' 
  | 'Lovable' 
  | 'Bolt' 
  | 'v0' 
  | 'Cursor' 
  | 'GitHub' 
  | 'ZIP' 
  | 'ZIP Upload' 
  | 'Native';

export interface TemplateImportMetadata {
  sourceType: ImportSource;
  sourceUrl?: string;
  detectedFramework: string;
  pageCount: number;
  componentsCount: number;
  dependencies: string[];
  assetsCount: number;
  securityAuditPassed: boolean;
  importedAt: string;
  notes?: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  previewImage: string;
  description: string;
  longDescription: string;
  features: string[];
  price: number;
  popular?: boolean;
  isNew?: boolean;
  featured?: boolean;
  status?: TemplateStatus;
  tags?: string[];
  demoSlug: string;
  isMasterTemplate?: boolean;
  createdBy?: string;
  ownershipStatus?: OwnershipStatus;
  licenseStatus?: LicenseStatus;
  copyrightNotice?: string;
  createdAt?: string;
  updatedAt?: string;
  importedFrom?: ImportSource;
  importMetadata?: TemplateImportMetadata;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  sampleSections: {
    heroHeading: string;
    heroSubtitle: string;
    services: string[];
    tagline: string;
  };
}

export type FileCategory = 'image' | 'video' | 'document' | 'code' | 'database';

export interface CustomerFile {
  id: string;
  name: string;
  category: FileCategory;
  sizeBytes: number;
  sizeFormatted: string;
  mimeType: string;
  uploadedAt: string;
  url?: string;
}

export interface StorageHistoryEntry {
  id: string;
  date: string;
  adminName: string;
  action: 'grant_extra' | 'reduce_extra' | 'remove_extra' | 'plan_upgrade' | 'manual_override';
  previousLimitGB: number;
  newLimitGB: number;
  changeAmountGB: number;
  reason: string;
  expiryDate?: string;
  isPermanent: boolean;
}

export interface StorageAddon {
  id: string;
  name: string;
  extraGB: number;
  billingType: 'one-time' | 'recurring';
  price: number;
  startDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface CustomerStorage {
  maxPhysicalCapacityGB: number; // 15 GB technical cap
  basePlanLimitGB: number; // 5 GB (Starter), 10 GB (Pro), 15 GB (Business)
  extraGrantedGB: number; // Admin added storage
  totalUsableLimitGB: number; // basePlanLimitGB + extraGrantedGB
  usedBytes: number;
  usedGB: number;
  remainingGB: number;
  usagePercentage: number;
  breakdown: {
    imagesBytes: number;
    videosBytes: number;
    documentsBytes: number;
    websiteFilesBytes: number;
    databaseBytes: number;
  };
  files: CustomerFile[];
  history: StorageHistoryEntry[];
  addons: StorageAddon[];
}

export interface CustomerDeployment {
  platform: 'Vercel';
  dnsProvider: 'Cloudflare';
  dbProvider: 'Supabase';
  storageProvider: 'Supabase Storage / Cloudflare R2';
  deploymentId: string;
  deploymentStatus: 'Ready' | 'Building' | 'Queued' | 'Error' | 'Suspended';
  lastDeployedAt: string;
  edgeLocation: string;
  sslAutoRenew: boolean;
  cnameTarget: string;
  aRecordTarget: string;
  buildLogs?: string[];
}

export type SubscriptionState = 'ACTIVE' | 'PAYMENT_FAILED' | 'GRACE_PERIOD' | 'SUSPENDED';

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  popularBadge?: boolean;
  features: string[];
  maxPages: number;
  storage: string;
  supportLevel: string;
  revisions: string;
  domainIncluded: boolean;
  turnaroundDays: number;
  tier: ClientTier;
}

export interface ClientWebsiteContent {
  businessName: string;
  tagline: string;
  heroHeadline: string;
  heroSubhead: string;
  primaryColor: string;
  logoText: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  aboutText: string;
  servicesList: { title: string; desc: string; icon?: string }[];
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    whatsapp?: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  password?: string;
  clientTier: ClientTier;
  isTestAccount?: boolean;
  planId: string;
  templateId: string;
  paymentStatus: PaymentStatus;
  planStartDate: string;
  planExpiryDate: string;
  websiteUrl: string;
  customDomain?: string;
  dnsStatus?: 'Active' | 'Pending DNS Setup' | 'Verifying' | 'Error';
  sslStatus?: 'Active' | 'Generating' | 'Expired';
  websiteStatus: WebsiteStatus;
  maintenanceNotice?: string;
  accountStatus: CustomerStatus;
  notes: string;
  internalNotes?: string;
  seoScore?: number;
  speedScore?: number;
  uptimePercent?: number;
  autoRenew?: boolean;
  slaLevel?: string;
  headerScripts?: string;
  footerScripts?: string;
  storage?: CustomerStorage;
  deployment?: CustomerDeployment;
  subscriptionState?: SubscriptionState;
  gracePeriodEndDate?: string;
  activityHistory: {
    id: string;
    date: string;
    action: string;
    user: string;
  }[];
  customContent: ClientWebsiteContent;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  clientName: string;
  businessName: string;
  email: string;
  phone: string;
  planId: string;
  templateId: string;
  amount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  date: string;
  deliveryDueDate: string;
  requirements: string;
  internalNotes?: string;
  clientTier: ClientTier;
  isTestOrder?: boolean;
  milestones?: {
    title: string;
    completed: boolean;
    date?: string;
  }[];
}

export type QueryType = 'Free Query' | 'Premium Assistance';

export type QueryStatus =
  | 'New'
  | 'In Review'
  | 'In Progress'
  | 'Waiting for Customer'
  | 'Resolved'
  | 'Closed';

export type LeadTrackingStatus =
  | 'Assistance Request'
  | 'Custom Work Required'
  | 'Additional Payment Required'
  | 'Converted to Lead'
  | 'Completed';

export type PremiumRequestType =
  | 'Setup Help'
  | 'Customization'
  | 'Website Issue'
  | 'Content Change'
  | 'Technical Help'
  | 'Other';

export interface SupportTicket {
  id: string;
  customerId: string;
  clientName: string;
  email?: string;
  businessName: string;
  websiteUrl?: string;
  clientTier: ClientTier;
  planId?: string;
  planName?: string;
  queryType: QueryType;
  requestType?: PremiumRequestType | string;
  subject: string;
  category?: 'Content & Text' | 'Design & Styling' | 'Domain & DNS' | 'Billing & Plan' | 'Bug / Technical' | 'VIP Priority Request' | string;
  priority?: 'Normal' | 'High' | 'VIP Urgent (2h SLA)' | string;
  status: QueryStatus;
  leadTrackingStatus?: LeadTrackingStatus;
  message: string;
  attachmentName?: string;
  attachmentSize?: string;
  preferredCompletionDate?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
  replies?: {
    id: string;
    sender: 'Client' | 'Admin';
    senderName: string;
    message: string;
    timestamp: string;
    attachmentName?: string;
  }[];
}

export interface ClientNotification {
  id: string;
  customerId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'urgent';
}

export interface Payment {
  id: string;
  transactionId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  businessName: string;
  amount: number;
  planName: string;
  date: string;
  status: PaymentStatus;
  method: string;
  isTestPayment?: boolean;
}

export interface Enquiry {
  id: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  selectedTemplateId: string;
  selectedPlanId: string;
  message: string;
  date: string;
  status: EnquiryStatus;
  adminNotes?: string;
  isTestEnquiry?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'customer' | 'payment' | 'enquiry' | 'template' | 'website' | 'order' | 'system' | 'backup' | 'storage' | 'deployment';
  title: string;
  description: string;
  user: string;
  customerId?: string;
}

export type BackupStatus = 'Success' | 'Failed' | 'In Progress' | 'Verifying';
export type BackupType = 'Automated Daily' | 'Automated Weekly' | 'Manual Admin Snapshot' | 'Pre-Deploy Checkpoint' | 'Emergency Hotfix Point';

export interface WebsiteBackupSnapshot {
  id: string;
  customerId: string;
  clientName: string;
  businessName: string;
  websiteUrl: string;
  customDomain?: string;
  timestamp: string;
  sizeFormatted: string;
  sizeBytes: number;
  storageLocation: string;
  status: BackupStatus;
  type: BackupType;
  versionTag: string;
  checksum: string;
  componentsIncluded: {
    databaseState: boolean;
    codeAssets: boolean;
    mediaUploads: boolean;
    sslDnsConfig: boolean;
  };
  snapshotData: {
    customContentSnapshot: ClientWebsiteContent;
    templateIdSnapshot: string;
    customDomain?: string;
    dnsStatus?: Customer['dnsStatus'];
    sslStatus?: Customer['sslStatus'];
  };
  notes?: string;
  retentionDays: number;
  expiresAt?: string;
  isStagingPreviewReady: boolean;
  stagingPreviewUrl?: string;
}

export type AgentAvailabilityStatus = 'Online' | 'Away' | 'Offline';
export type AgentAvailabilityMode = 'auto' | 'online' | 'away' | 'offline';

export interface AdminSettings {
  adminEmail: string;
  businessName: string;
  brandName?: string;
  supportEmail: string;
  supportPhone: string;
  whatsAppNumber: string;
  whatsAppDefaultMessage: string;
  currency: string;
  currencySymbol: string;
  notifyNewEnquiries: boolean;
  notifyExpiringPlans: boolean;
  autoWelcomeEmail: boolean;
  brandTagline: string;
  defaultStarterPrice?: number;
  defaultProPrice?: number;
  defaultBusinessPrice?: number;

  // WhatsApp & Agent Availability Settings
  agentAvailabilityMode?: AgentAvailabilityMode;
  businessHoursStart?: string; // e.g. "09:00"
  businessHoursEnd?: string;   // e.g. "18:00"
  businessDays?: number[];     // [1, 2, 3, 4, 5] (1 = Mon, 5 = Fri, 0 = Sun, 6 = Sat)
  businessTimeZone?: string;   // e.g. "America/New_York", "UTC", "local"
  onlineStatusMessage?: string;
  awayStatusMessage?: string;
  offlineStatusMessage?: string;

  // Automated Backup & Disaster Recovery Settings
  backupAutomatedDaily?: boolean;
  backupAutomatedWeekly?: boolean;
  backupDailyScheduleTime?: string; // e.g. "02:00 UTC"
  backupRetentionDays?: number; // e.g. 30, 60, 90
  backupStorageProvider?: string; // "AWS S3 Mumbai (AES-256 Encrypted)"
  backupAutoPurge?: boolean;
  backupEncryptionAlgorithm?: string; // "AES-256 GCM"
}

export interface UserSession {
  role: Role;
  customerId?: string; // If logged in as client
  clientTier?: ClientTier;
  email: string;
  name: string;
  isTestSession?: boolean;
}
