import { Customer, CustomerFile, CustomerStorage, StorageHistoryEntry, FileCategory } from '../types';

export const MAX_PHYSICAL_CAPACITY_GB = 15;

export function formatGB(gb: number): string {
  return Number(gb).toFixed(1);
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function bytesToGB(bytes: number): number {
  return parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2));
}

export function gbToBytes(gb: number): number {
  return gb * 1024 * 1024 * 1024;
}

export function getBasePlanLimitGB(planId?: string): number {
  if (planId === 'plan-business' || planId === 'plan-highest') return 15;
  if (planId === 'plan-pro' || planId === 'plan-upgraded') return 10;
  return 5; // Starter default
}

export interface StorageUsageAlert {
  level: 'normal' | 'warning' | 'high' | 'critical' | 'blocked';
  label: string;
  badgeClass: string;
  barColor: string;
  message?: string;
}

export function getStorageUsageAlert(usagePercent: number): StorageUsageAlert {
  if (usagePercent >= 100) {
    return {
      level: 'blocked',
      label: 'Limit Exceeded (Uploads Blocked)',
      badgeClass: 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse',
      barColor: 'bg-rose-600',
      message: 'Storage limit reached. Please upgrade your WebRunzo plan to continue uploading.',
    };
  }
  if (usagePercent >= 95) {
    return {
      level: 'critical',
      label: 'Critical Usage (>95%)',
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      barColor: 'bg-rose-500',
      message: 'Approaching technical capacity. Free up space or purchase extra storage add-on.',
    };
  }
  if (usagePercent >= 85) {
    return {
      level: 'high',
      label: 'High Usage (85-95%)',
      badgeClass: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
      barColor: 'bg-orange-500',
      message: 'High storage volume detected. Consider archiving old media assets.',
    };
  }
  if (usagePercent >= 70) {
    return {
      level: 'warning',
      label: 'Moderate Warning (70-85%)',
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      barColor: 'bg-amber-500',
    };
  }
  return {
    level: 'normal',
    label: 'Healthy (<70%)',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    barColor: 'bg-emerald-500',
  };
}

export function canUploadFile(
  storage: CustomerStorage,
  newFileSizeBytes: number
): { allowed: boolean; message?: string; projectedUsedBytes: number; projectedPercent: number } {
  const totalLimitBytes = gbToBytes(storage.totalUsableLimitGB);
  const projectedUsedBytes = storage.usedBytes + newFileSizeBytes;
  const projectedPercent = parseFloat(((projectedUsedBytes / totalLimitBytes) * 100).toFixed(1));

  if (projectedUsedBytes > totalLimitBytes) {
    return {
      allowed: false,
      message: 'Storage limit reached. Please upgrade your WebRunzo plan to continue uploading.',
      projectedUsedBytes,
      projectedPercent,
    };
  }

  return {
    allowed: true,
    projectedUsedBytes,
    projectedPercent,
  };
}

export function recalculateStorage(
  storage: CustomerStorage,
  updatedFiles: CustomerFile[]
): CustomerStorage {
  let imagesBytes = 0;
  let videosBytes = 0;
  let documentsBytes = 0;
  let websiteFilesBytes = storage.breakdown.websiteFilesBytes || 45 * 1024 * 1024; // ~45 MB bundle
  let databaseBytes = storage.breakdown.databaseBytes || 12 * 1024 * 1024; // ~12 MB DB

  updatedFiles.forEach((file) => {
    if (file.category === 'image') imagesBytes += file.sizeBytes;
    else if (file.category === 'video') videosBytes += file.sizeBytes;
    else if (file.category === 'document') documentsBytes += file.sizeBytes;
    else if (file.category === 'code') websiteFilesBytes += file.sizeBytes;
    else if (file.category === 'database') databaseBytes += file.sizeBytes;
  });

  const totalUsedBytes = imagesBytes + videosBytes + documentsBytes + websiteFilesBytes + databaseBytes;
  const totalUsableLimitGB = storage.basePlanLimitGB + (storage.extraGrantedGB || 0);
  const totalLimitBytes = gbToBytes(totalUsableLimitGB);
  const usagePercentage = parseFloat(((totalUsedBytes / totalLimitBytes) * 100).toFixed(1));
  const usedGB = bytesToGB(totalUsedBytes);
  const remainingGB = parseFloat(Math.max(0, totalUsableLimitGB - usedGB).toFixed(2));

  return {
    ...storage,
    totalUsableLimitGB,
    usedBytes: totalUsedBytes,
    usedGB,
    remainingGB,
    usagePercentage,
    breakdown: {
      imagesBytes,
      videosBytes,
      documentsBytes,
      websiteFilesBytes,
      databaseBytes,
    },
    files: updatedFiles,
  };
}

export function createInitialStorageForCustomer(
  customer: Partial<Customer>,
  presetUsedGB?: number
): CustomerStorage {
  const basePlanLimitGB = getBasePlanLimitGB(customer.planId);
  const extraGrantedGB = 0;
  const totalUsableLimitGB = basePlanLimitGB + extraGrantedGB;

  // Generate realistic initial files
  const businessName = customer.businessName || 'Business Website';
  const prefix = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const now = new Date().toISOString().split('T')[0];

  const files: CustomerFile[] = [
    {
      id: `file-${prefix}-hero-bg`,
      name: `${prefix}-hero-4k-banner.webp`,
      category: 'image',
      sizeBytes: 3.4 * 1024 * 1024,
      sizeFormatted: '3.4 MB',
      mimeType: 'image/webp',
      uploadedAt: '2026-06-10',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: `file-${prefix}-brand-video`,
      name: `${prefix}-commercial-showcase.mp4`,
      category: 'video',
      sizeBytes: (presetUsedGB ? presetUsedGB * 0.45 : 1.2) * 1024 * 1024 * 1024,
      sizeFormatted: formatBytes((presetUsedGB ? presetUsedGB * 0.45 : 1.2) * 1024 * 1024 * 1024),
      mimeType: 'video/mp4',
      uploadedAt: '2026-06-15',
    },
    {
      id: `file-${prefix}-gallery-pack`,
      name: `${prefix}-gallery-highres-pack.zip`,
      category: 'image',
      sizeBytes: (presetUsedGB ? presetUsedGB * 0.3 : 0.8) * 1024 * 1024 * 1024,
      sizeFormatted: formatBytes((presetUsedGB ? presetUsedGB * 0.3 : 0.8) * 1024 * 1024 * 1024),
      mimeType: 'application/zip',
      uploadedAt: '2026-07-01',
    },
    {
      id: `file-${prefix}-brochure-pdf`,
      name: `${prefix}-company-profile-2026.pdf`,
      category: 'document',
      sizeBytes: 18.5 * 1024 * 1024,
      sizeFormatted: '18.5 MB',
      mimeType: 'application/pdf',
      uploadedAt: '2026-07-20',
    },
    {
      id: `file-${prefix}-product-catalog`,
      name: `${prefix}-services-pricing-sheet.pdf`,
      category: 'document',
      sizeBytes: 12.2 * 1024 * 1024,
      sizeFormatted: '12.2 MB',
      mimeType: 'application/pdf',
      uploadedAt: '2026-08-05',
    },
  ];

  let imagesBytes = 0;
  let videosBytes = 0;
  let documentsBytes = 0;
  const websiteFilesBytes = 58 * 1024 * 1024; // 58 MB Edge bundle
  const databaseBytes = 24 * 1024 * 1024; // 24 MB Postgres Supabase records

  files.forEach((f) => {
    if (f.category === 'image') imagesBytes += f.sizeBytes;
    if (f.category === 'video') videosBytes += f.sizeBytes;
    if (f.category === 'document') documentsBytes += f.sizeBytes;
  });

  const totalUsedBytes = imagesBytes + videosBytes + documentsBytes + websiteFilesBytes + databaseBytes;
  const usedGB = bytesToGB(totalUsedBytes);
  const remainingGB = parseFloat(Math.max(0, totalUsableLimitGB - usedGB).toFixed(2));
  const totalLimitBytes = gbToBytes(totalUsableLimitGB);
  const usagePercentage = parseFloat(((totalUsedBytes / totalLimitBytes) * 100).toFixed(1));

  const history: StorageHistoryEntry[] = [
    {
      id: `hist-init-${prefix}`,
      date: customer.planStartDate || '2026-01-15',
      adminName: 'System Provisioning',
      action: 'plan_upgrade',
      previousLimitGB: 0,
      newLimitGB: basePlanLimitGB,
      changeAmountGB: basePlanLimitGB,
      reason: `Initial virtual storage provisioning for ${customer.planId || 'Starter'} plan.`,
      isPermanent: true,
    },
  ];

  return {
    maxPhysicalCapacityGB: MAX_PHYSICAL_CAPACITY_GB,
    basePlanLimitGB,
    extraGrantedGB,
    totalUsableLimitGB,
    usedBytes: totalUsedBytes,
    usedGB,
    remainingGB,
    usagePercentage,
    breakdown: {
      imagesBytes,
      videosBytes,
      documentsBytes,
      websiteFilesBytes,
      databaseBytes,
    },
    files,
    history,
    addons: [],
  };
}
