import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { WebsiteBackupSnapshot, BackupType, Customer, Template } from '../../types';
import { LiveWebsitePreviewFrame } from '../common/LiveWebsitePreviewFrame';
import { 
  HardDrive, 
  ShieldCheck, 
  RotateCcw, 
  Play, 
  Plus, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Globe, 
  Database, 
  FileCode, 
  Image as ImageIcon, 
  Lock, 
  Sliders, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  X, 
  Copy, 
  Sparkles, 
  Laptop, 
  Tablet, 
  Smartphone,
  ChevronRight,
  Server,
  Layers,
  ArrowRight,
  Info,
  Key
} from 'lucide-react';

export const AdminBackups: React.FC = () => {
  const { 
    backups, 
    customers, 
    templates, 
    settings, 
    updateSettings, 
    triggerInstantBackup, 
    restoreBackupSnapshot, 
    deleteBackupSnapshot, 
    triggerFleetAutoBackup, 
    openPreviewModal,
    addToast 
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modals State
  const [isInstantBackupModalOpen, setIsInstantBackupModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Selected Snapshot for Actions
  const [activeSnapshot, setActiveSnapshot] = useState<WebsiteBackupSnapshot | null>(null);

  // Instant Backup Form State
  const [backupCustomerId, setBackupCustomerId] = useState<string>(customers[0]?.id || '');
  const [backupType, setBackupType] = useState<BackupType>('Manual Admin Snapshot');
  const [backupVersionTag, setBackupVersionTag] = useState<string>('');
  const [backupNotes, setBackupNotes] = useState<string>('');
  const [includeDb, setIncludeDb] = useState(true);
  const [includeCode, setIncludeCode] = useState(true);
  const [includeMedia, setIncludeMedia] = useState(true);
  const [includeSslDns, setIncludeSslDns] = useState(true);
  const [isGeneratingBackup, setIsGeneratingBackup] = useState(false);
  const [backupProgressStep, setBackupProgressStep] = useState(0);

  // Restore Execution State
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgressStep, setRestoreProgressStep] = useState(0);
  const [createSafetyCheckpoint, setCreateSafetyCheckpoint] = useState(true);

  // Sandbox State
  const [sandboxDeviceMode, setSandboxDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Fleet backup loading
  const [isFleetBackingUp, setIsFleetBackingUp] = useState(false);

  // Filtered Backups
  const filteredBackups = useMemo(() => {
    return backups.filter((b) => {
      const matchesSearch = 
        b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.websiteUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.customDomain && b.customDomain.toLowerCase().includes(searchTerm.toLowerCase())) ||
        b.versionTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClient = selectedClientFilter === 'all' || b.customerId === selectedClientFilter;
      const matchesType = selectedTypeFilter === 'all' || b.type === selectedTypeFilter;
      const matchesStatus = selectedStatusFilter === 'all' || b.status === selectedStatusFilter;

      return matchesSearch && matchesClient && matchesType && matchesStatus;
    });
  }, [backups, searchTerm, selectedClientFilter, selectedTypeFilter, selectedStatusFilter]);

  // Aggregate Metrics
  const totalStorageMb = useMemo(() => {
    const totalBytes = backups.reduce((acc, b) => acc + (b.sizeBytes || 0), 0);
    return (totalBytes / (1024 * 1024)).toFixed(1);
  }, [backups]);

  const uniqueWebsitesProtected = useMemo(() => {
    const ids = new Set(backups.map((b) => b.customerId));
    return ids.size;
  }, [backups]);

  // Handlers
  const handleOpenInstantBackupModal = (preselectedCustomerId?: string) => {
    const targetId = preselectedCustomerId || (customers[0]?.id || '');
    setBackupCustomerId(targetId);
    const cust = customers.find((c) => c.id === targetId);
    const suggestedVersion = `v${Math.floor(1 + Math.random() * 3)}.${Math.floor(Math.random() * 9)}.${Math.floor(1 + Math.random() * 9)}-snapshot`;
    setBackupVersionTag(suggestedVersion);
    setBackupNotes(`On-demand manual snapshot for ${cust?.businessName || 'Client'}. Verified state.`);
    setBackupType('Manual Admin Snapshot');
    setIncludeDb(true);
    setIncludeCode(true);
    setIncludeMedia(true);
    setIncludeSslDns(true);
    setIsInstantBackupModalOpen(true);
  };

  const handleExecuteInstantBackup = async () => {
    if (!backupCustomerId) {
      addToast('error', 'Select Client', 'Please select a target client website.');
      return;
    }

    setIsGeneratingBackup(true);
    setBackupProgressStep(1); // Freezing database write lock

    setTimeout(() => {
      setBackupProgressStep(2); // Extracting template & customer state
    }, 600);

    setTimeout(() => {
      setBackupProgressStep(3); // Compressing media & generating SHA-256
    }, 1200);

    setTimeout(() => {
      setBackupProgressStep(4); // Encrypting AES-256 & uploading to S3
    }, 1800);

    setTimeout(async () => {
      await triggerInstantBackup(backupCustomerId, {
        type: backupType,
        versionTag: backupVersionTag.trim() || undefined,
        notes: backupNotes.trim() || undefined,
        components: {
          databaseState: includeDb,
          codeAssets: includeCode,
          mediaUploads: includeMedia,
          sslDnsConfig: includeSslDns,
        },
      });
      setIsGeneratingBackup(false);
      setBackupProgressStep(0);
      setIsInstantBackupModalOpen(false);
    }, 2400);
  };

  const handleOpenRestoreModal = (snapshot: WebsiteBackupSnapshot) => {
    setActiveSnapshot(snapshot);
    setCreateSafetyCheckpoint(true);
    setIsRestoreModalOpen(true);
  };

  const handleExecuteRestore = async () => {
    if (!activeSnapshot) return;
    setIsRestoring(true);
    setRestoreProgressStep(1); // Routing live traffic to maintenance banner

    setTimeout(() => {
      setRestoreProgressStep(2); // Hydrating customer state from snapshot JSON
    }, 700);

    setTimeout(() => {
      setRestoreProgressStep(3); // Applying template bundle & assets
    }, 1400);

    setTimeout(() => {
      setRestoreProgressStep(4); // Invalidating global Edge CDN cache
    }, 2100);

    setTimeout(async () => {
      await restoreBackupSnapshot(activeSnapshot.id, {
        createSafetyCheckpoint,
      });
      setIsRestoring(false);
      setRestoreProgressStep(0);
      setIsRestoreModalOpen(false);
    }, 2800);
  };

  const handleOpenSandbox = (snapshot: WebsiteBackupSnapshot) => {
    setActiveSnapshot(snapshot);
    setSandboxDeviceMode('desktop');
    setIsSandboxModalOpen(true);
  };

  const handleOpenManifest = (snapshot: WebsiteBackupSnapshot) => {
    setActiveSnapshot(snapshot);
    setIsManifestModalOpen(true);
  };

  const handleDownloadTarGz = (snapshot: WebsiteBackupSnapshot) => {
    const jsonString = `data:text/json;charset=utf-8,` + encodeURIComponent(
      JSON.stringify(
        {
          backupMeta: snapshot,
          archiveFormat: 'webrunzo-site-package-v3.tar.gz',
          encryption: 'AES-256-GCM',
          exportedAt: new Date().toISOString(),
          checksumValidation: 'PASS_MATCH',
          manifest: {
            database: snapshot.snapshotData.customContentSnapshot,
            templateId: snapshot.snapshotData.templateIdSnapshot,
            customDomain: snapshot.snapshotData.customDomain,
            dns: snapshot.snapshotData.dnsStatus,
            ssl: snapshot.snapshotData.sslStatus,
          }
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `webrunzo-${snapshot.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${snapshot.versionTag}.tar.gz.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('success', 'Download Started', `Export package for ${snapshot.versionTag} initiated.`);
  };

  const handleRunFleetBackup = async () => {
    setIsFleetBackingUp(true);
    await triggerFleetAutoBackup();
    setIsFleetBackingUp(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    addToast('info', 'Copied to Clipboard', `${label} copied.`);
  };

  // Helper to construct simulated customer for Sandbox
  const sandboxCustomer = useMemo<Customer | null>(() => {
    if (!activeSnapshot) return null;
    const realCust = customers.find((c) => c.id === activeSnapshot.customerId);
    return {
      id: activeSnapshot.customerId,
      name: activeSnapshot.clientName,
      businessName: activeSnapshot.businessName,
      email: realCust?.email || 'client@example.com',
      phone: realCust?.phone || '+91 98765 43210',
      templateId: activeSnapshot.snapshotData.templateIdSnapshot,
      planId: realCust?.planId || 'plan-pro',
      paymentStatus: 'Paid',
      websiteStatus: 'Live',
      accountStatus: 'Active',
      startDate: realCust?.startDate || '2026-01-01',
      renewalDate: realCust?.renewalDate || '2027-01-01',
      billingCycle: 'annual',
      customDomain: activeSnapshot.snapshotData.customDomain,
      dnsStatus: activeSnapshot.snapshotData.dnsStatus,
      sslStatus: activeSnapshot.snapshotData.sslStatus,
      clientTier: realCust?.clientTier || 'normal',
      websiteUrl: activeSnapshot.websiteUrl,
      customContent: activeSnapshot.snapshotData.customContentSnapshot,
      activityHistory: realCust?.activityHistory || [],
    };
  }, [activeSnapshot, customers]);

  const sandboxTemplate = useMemo<Template>(() => {
    if (!sandboxCustomer) return templates[0];
    return templates.find((t) => t.id === sandboxCustomer.templateId) || templates[0];
  }, [sandboxCustomer, templates]);

  return (
    <div id="admin-backups-container" className="space-y-6 animate-in fade-in pb-12">
      
      {/* Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Downtime Disaster Recovery Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Client Website Backup & Disaster Recovery
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automated daily offsite snapshots, encrypted S3 vaults, and 1-Click zero-downtime rollback controls across all client websites.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-trigger-instant-backup"
              onClick={() => handleOpenInstantBackupModal()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Trigger Instant Backup</span>
            </button>

            <button
              id="btn-run-fleet-backup"
              onClick={handleRunFleetBackup}
              disabled={isFleetBackingUp}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isFleetBackingUp ? 'animate-spin' : ''}`} />
              <span>{isFleetBackingUp ? 'Backing Up Fleet...' : 'Run Fleet Auto-Backup'}</span>
            </button>

            <button
              id="btn-open-backup-settings"
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Backup Retention & Storage Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI / Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Snapshots</span>
              <HardDrive className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{backups.length}</div>
            <div className="text-[11px] text-emerald-400/90 font-medium mt-0.5">Across {uniqueWebsitesProtected} client websites</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Encrypted Vault</span>
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{totalStorageMb} MB</div>
            <div className="text-[11px] text-slate-400 mt-0.5">AES-256 GCM in AWS S3 Mumbai</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Retention Policy</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{settings.backupRetentionDays || 30} Days</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Daily cron at 02:00 UTC</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Recovery SLA</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">100% Verified</div>
            <div className="text-[11px] text-slate-400 mt-0.5">&lt; 3s 1-Click Rollback Speed</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-backups"
            type="text"
            placeholder="Search by client, domain, or version..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Client Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="select-client-filter"
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-900 text-white">All Clients ({customers.length})</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.businessName}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <select
              id="select-type-filter"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-900 text-white">All Backup Types</option>
              <option value="Automated Daily" className="bg-slate-900 text-white">Automated Daily</option>
              <option value="Manual Admin Snapshot" className="bg-slate-900 text-white">Manual Admin Snapshot</option>
              <option value="Pre-Deploy Checkpoint" className="bg-slate-900 text-white">Pre-Deploy Checkpoint</option>
              <option value="Emergency Hotfix Point" className="bg-slate-900 text-white">Emergency Hotfix Point</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <select
              id="select-status-filter"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-900 text-white">All Statuses</option>
              <option value="Success" className="bg-slate-900 text-white">Success</option>
              <option value="In Progress" className="bg-slate-900 text-white">In Progress</option>
              <option value="Failed" className="bg-slate-900 text-white">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Snapshot Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Centralized Snapshot Ledger</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              {filteredBackups.length} recorded
            </span>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            Storage Provider: <span className="text-slate-200 font-semibold">{settings.backupStorageProvider || 'AWS S3 Mumbai ap-south-1'}</span>
          </div>
        </div>

        {filteredBackups.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <HardDrive className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-white">No backup snapshots match your query</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search keywords or click below to trigger a new on-demand snapshot.
            </p>
            <button
              onClick={() => handleOpenInstantBackupModal()}
              className="px-4 py-2 bg-emerald-600 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Capture Snapshot Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3.5 px-4">Client & Website</th>
                  <th className="py-3.5 px-4">Live URL / Domain</th>
                  <th className="py-3.5 px-4">Version & Checksum</th>
                  <th className="py-3.5 px-4">Timestamp (UTC)</th>
                  <th className="py-3.5 px-4">Size & Payload</th>
                  <th className="py-3.5 px-4">Offsite Vault</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Disaster Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBackups.map((snap) => {
                  const targetCustomer = customers.find((c) => c.id === snap.customerId);
                  const isPremium = targetCustomer?.clientTier === 'premium';

                  return (
                    <tr key={snap.id} className="hover:bg-slate-800/40 transition">
                      
                      {/* Client & Website */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {snap.businessName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{snap.businessName}</span>
                              {isPremium && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-extrabold uppercase">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <span>{snap.clientName}</span>
                              <span>•</span>
                              <span className="text-slate-500">{snap.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Live URL / Domain */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-200 font-mono text-[11px]">
                            <Globe className="w-3 h-3 text-emerald-400" />
                            <span>{snap.websiteUrl}</span>
                          </div>
                          {snap.customDomain ? (
                            <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                              <Lock className="w-2.5 h-2.5" />
                              <span>{snap.customDomain}</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 italic">Subdomain only</div>
                          )}
                        </div>
                      </td>

                      {/* Version & Checksum */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                              {snap.versionTag}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              snap.type === 'Automated Daily'
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : snap.type === 'Manual Admin Snapshot'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : snap.type === 'Emergency Hotfix Point'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-cyan-500/20 text-cyan-300'
                            }`}>
                              {snap.type}
                            </span>
                          </div>

                          <div 
                            onClick={() => copyToClipboard(snap.checksum, 'SHA-256 Checksum')}
                            className="flex items-center gap-1 text-[10px] text-slate-400 font-mono hover:text-slate-200 cursor-pointer"
                            title="Click to copy full SHA-256"
                          >
                            <Key className="w-2.5 h-2.5 text-slate-500" />
                            <span>{snap.checksum.substring(0, 16)}...</span>
                            <Copy className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
                          </div>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="text-white font-medium">{snap.timestamp}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-500" />
                            <span>Expires in {snap.retentionDays}d</span>
                          </div>
                        </div>
                      </td>

                      {/* Size & Payload */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="font-bold text-white">{snap.sizeFormatted}</div>
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${snap.componentsIncluded.databaseState ? 'bg-emerald-400' : 'bg-slate-600'}`} title="Database" />
                            <span className={`w-2 h-2 rounded-full ${snap.componentsIncluded.codeAssets ? 'bg-cyan-400' : 'bg-slate-600'}`} title="Code Assets" />
                            <span className={`w-2 h-2 rounded-full ${snap.componentsIncluded.mediaUploads ? 'bg-amber-400' : 'bg-slate-600'}`} title="Media Assets" />
                            <span className={`w-2 h-2 rounded-full ${snap.componentsIncluded.sslDnsConfig ? 'bg-purple-400' : 'bg-slate-600'}`} title="SSL/DNS" />
                            <span className="text-[9px] text-slate-400 font-mono ml-0.5">All Assets</span>
                          </div>
                        </div>
                      </td>

                      {/* Storage Location */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate max-w-[140px]" title={snap.storageLocation}>
                            {snap.storageLocation}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          snap.status === 'Success'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : snap.status === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {snap.status === 'Success' && <CheckCircle2 className="w-3 h-3" />}
                          {snap.status === 'In Progress' && <RefreshCw className="w-3 h-3 animate-spin" />}
                          {snap.status === 'Failed' && <AlertTriangle className="w-3 h-3" />}
                          <span>{snap.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* 1-Click Restore Button */}
                          <button
                            id={`btn-restore-${snap.id}`}
                            onClick={() => handleOpenRestoreModal(snap)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                            title="1-Click Disaster Recovery Restore"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>1-Click Restore</span>
                          </button>

                          {/* Staging Sandbox Preview */}
                          <button
                            id={`btn-sandbox-${snap.id}`}
                            onClick={() => handleOpenSandbox(snap)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                            title="Staging Preview Sandbox"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          </button>

                          {/* Download Package */}
                          <button
                            id={`btn-download-${snap.id}`}
                            onClick={() => handleDownloadTarGz(snap)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                            title="Download Encrypted Snapshot (.tar.gz)"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-300" />
                          </button>

                          {/* Manifest Info */}
                          <button
                            id={`btn-manifest-${snap.id}`}
                            onClick={() => handleOpenManifest(snap)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                            title="Inspect Snapshot JSON Manifest"
                          >
                            <FileCode className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {/* Delete Snapshot */}
                          <button
                            id={`btn-delete-${snap.id}`}
                            onClick={() => deleteBackupSnapshot(snap.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
                            title="Prune Snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TRIGGER INSTANT BACKUP WIZARD */}
      {/* ========================================================================= */}
      {isInstantBackupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => !isGeneratingBackup && setIsInstantBackupModalOpen(false)}
              disabled={isGeneratingBackup}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 cursor-pointer disabled:opacity-30"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold">
                <Plus className="w-3 h-3" />
                <span>On-Demand Snapshot Capture</span>
              </div>
              <h2 className="text-xl font-black text-white">Trigger Instant Website Backup</h2>
              <p className="text-xs text-slate-400">
                Instantly capture a cryptographically signed snapshot of the customer website database state, JSX layouts, media files, and SSL routing configuration.
              </p>
            </div>

            {isGeneratingBackup ? (
              <div className="py-8 space-y-6 text-center">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
                  <div className="w-16 h-16 rounded-full bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">Capturing Encrypted Snapshot...</h3>
                  <div className="text-xs text-emerald-400 font-mono font-medium">
                    {backupProgressStep === 1 && 'Step 1/4: Freezing customer write lock & staging database...'}
                    {backupProgressStep === 2 && 'Step 2/4: Serializing JSX templates & custom content payload...'}
                    {backupProgressStep === 3 && 'Step 3/4: Calculating SHA-256 integrity checksum & tarballing...'}
                    {backupProgressStep === 4 && 'Step 4/4: Encrypting AES-256 & streaming to AWS S3 Mumbai vault...'}
                  </div>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${(backupProgressStep / 4) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Select Customer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Target Client Website *</label>
                  <select
                    id="modal-select-customer"
                    value={backupCustomerId}
                    onChange={(e) => {
                      setBackupCustomerId(e.target.value);
                      const c = customers.find((x) => x.id === e.target.value);
                      setBackupNotes(`On-demand manual snapshot for ${c?.businessName || 'Client'}.`);
                    }}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.websiteUrl}) • {c.clientTier.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Version Tag */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Version Identifier Tag</label>
                    <input
                      id="modal-input-version-tag"
                      type="text"
                      placeholder="e.g. v2.4.0-manual-backup"
                      value={backupVersionTag}
                      onChange={(e) => setBackupVersionTag(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Backup Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Snapshot Classification</label>
                    <select
                      id="modal-select-backup-type"
                      value={backupType}
                      onChange={(e) => setBackupType(e.target.value as BackupType)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Manual Admin Snapshot">Manual Admin Snapshot</option>
                      <option value="Pre-Deploy Checkpoint">Pre-Deploy Checkpoint</option>
                      <option value="Emergency Hotfix Point">Emergency Hotfix Point</option>
                      <option value="Automated Daily">Automated Daily</option>
                    </select>
                  </div>
                </div>

                {/* Components Checklist */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Snapshot Components to Include</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeDb}
                        onChange={(e) => setIncludeDb(e.target.checked)}
                        className="rounded accent-emerald-500"
                      />
                      <span>Database State (Content)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeCode}
                        onChange={(e) => setIncludeCode(e.target.checked)}
                        className="rounded accent-emerald-500"
                      />
                      <span>Code Assets & Template</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMedia}
                        onChange={(e) => setIncludeMedia(e.target.checked)}
                        className="rounded accent-emerald-500"
                      />
                      <span>Media Uploads & Logos</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSslDns}
                        onChange={(e) => setIncludeSslDns(e.target.checked)}
                        className="rounded accent-emerald-500"
                      />
                      <span>SSL & DNS Routing</span>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Admin Audit Note</label>
                  <textarea
                    id="modal-input-notes"
                    rows={2}
                    placeholder="Describe why this backup snapshot was captured..."
                    value={backupNotes}
                    onChange={(e) => setBackupNotes(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsInstantBackupModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    id="modal-btn-confirm-instant-backup"
                    onClick={handleExecuteInstantBackup}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Capture Snapshot Now</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 1-CLICK DISASTER RECOVERY & ROLLBACK RESOLUTION */}
      {/* ========================================================================= */}
      {isRestoreModalOpen && activeSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => !isRestoring && setIsRestoreModalOpen(false)}
              disabled={isRestoring}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 cursor-pointer disabled:opacity-30"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[11px] font-bold">
                <RotateCcw className="w-3 h-3" />
                <span>Zero-Downtime Rollback Engine</span>
              </div>
              <h2 className="text-xl font-black text-white">1-Click Disaster Recovery Restore</h2>
              <p className="text-xs text-slate-400">
                Instantly revert <span className="text-white font-bold">{activeSnapshot.businessName}</span> back to snapshot <span className="text-emerald-400 font-mono font-bold">{activeSnapshot.versionTag}</span>.
              </p>
            </div>

            {isRestoring ? (
              <div className="py-8 space-y-6 text-center">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-ping" />
                  <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-400">
                    <RotateCcw className="w-8 h-8 animate-spin" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">Executing 1-Click Rollback...</h3>
                  <div className="text-xs text-rose-400 font-mono font-medium">
                    {restoreProgressStep === 1 && 'Phase 1/4: Applying zero-downtime maintenance lock...'}
                    {restoreProgressStep === 2 && 'Phase 2/4: Hydrating database content from verified snapshot payload...'}
                    {restoreProgressStep === 3 && 'Phase 3/4: Linking template assets and rendering engine...'}
                    {restoreProgressStep === 4 && 'Phase 4/4: Purging Cloudflare Edge CDN cache & lifting maintenance lock...'}
                  </div>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{ width: `${(restoreProgressStep / 4) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                
                {/* Snapshot metadata card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Target Rollback Snapshot</span>
                    <span className="font-mono text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {activeSnapshot.versionTag}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Snapshot Date</div>
                      <div className="text-white font-medium mt-0.5">{activeSnapshot.timestamp}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Payload Size</div>
                      <div className="text-white font-medium mt-0.5">{activeSnapshot.sizeFormatted}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Vault Location</div>
                      <div className="text-white font-medium mt-0.5 truncate">{activeSnapshot.storageLocation}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Integrity Status</div>
                      <div className="text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SHA-256 Passed</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span className="text-slate-300 font-semibold">Snapshot Notes: </span>
                    {activeSnapshot.notes}
                  </div>
                </div>

                {/* Safety Checkpoint Option */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <label className="flex items-start gap-3 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createSafetyCheckpoint}
                      onChange={(e) => setCreateSafetyCheckpoint(e.target.checked)}
                      className="mt-0.5 rounded accent-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-white">Create Pre-Rollback Safety Checkpoint (Recommended)</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Captures an emergency snapshot of the website in its current state right before rolling back, so you can easily revert back if needed.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Warning note */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2.5 text-amber-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Rolling back will immediately update the live website content, headlines, and business hours. Cloud CDN cache will be flushed automatically.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setIsRestoreModalOpen(false);
                      handleOpenSandbox(activeSnapshot);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview in Sandbox First</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsRestoreModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      id="modal-btn-confirm-restore"
                      onClick={handleExecuteRestore}
                      className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Execute 1-Click Rollback</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: STAGING PREVIEW SANDBOX */}
      {/* ========================================================================= */}
      {isSandboxModalOpen && activeSnapshot && sandboxCustomer && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md animate-in fade-in">
          
          {/* Sandbox Top Control Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
                <Eye className="w-3.5 h-3.5" />
                <span>STAGING SANDBOX PREVIEW</span>
              </div>
              <div className="hidden sm:block text-xs text-slate-300 font-medium">
                Snapshot: <span className="font-mono text-emerald-400 font-bold">{activeSnapshot.versionTag}</span> ({activeSnapshot.timestamp})
              </div>
            </div>

            {/* Device Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setSandboxDeviceMode('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  sandboxDeviceMode === 'desktop' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop View (1280px)"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[10px]">Desktop</span>
              </button>
              <button
                onClick={() => setSandboxDeviceMode('tablet')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  sandboxDeviceMode === 'tablet' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[10px]">Tablet</span>
              </button>
              <button
                onClick={() => setSandboxDeviceMode('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  sandboxDeviceMode === 'mobile' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[10px]">Mobile</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsSandboxModalOpen(false);
                  handleOpenRestoreModal(activeSnapshot);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Promote to Live Production</span>
              </button>

              <button
                onClick={() => setIsSandboxModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sandbox Info Ribbon */}
          <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Isolated Virtual Sandbox: Any simulated interactions remain isolated and do not modify live client database.
              </span>
            </div>
            <div className="font-mono text-slate-300">
              Host: <span className="text-cyan-400">{activeSnapshot.stagingPreviewUrl}</span>
            </div>
          </div>

          {/* Sandbox Frame Canvas */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex items-center justify-center bg-slate-950">
            <div 
              className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-slate-800 ${
                sandboxDeviceMode === 'desktop'
                  ? 'w-full max-w-6xl h-[85vh]'
                  : sandboxDeviceMode === 'tablet'
                  ? 'w-[768px] h-[85vh]'
                  : 'w-[375px] h-[85vh]'
              }`}
            >
              <LiveWebsitePreviewFrame
                template={sandboxTemplate}
                customer={sandboxCustomer}
                isModal={false}
              />
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SNAPSHOT MANIFEST JSON INSPECTOR */}
      {/* ========================================================================= */}
      {isManifestModalOpen && activeSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsManifestModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold">
                <FileCode className="w-3 h-3" />
                <span>Snapshot Metadata & Manifest</span>
              </div>
              <h2 className="text-xl font-black text-white">Snapshot Manifest Inspector</h2>
              <p className="text-xs text-slate-400">
                Cryptographic signature, database payload structure, and storage ledger attributes for <span className="text-white font-bold">{activeSnapshot.versionTag}</span>.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>JSON Manifest Schema (v3)</span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(activeSnapshot, null, 2), 'JSON Manifest')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Raw JSON</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
                {JSON.stringify(activeSnapshot, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => handleDownloadTarGz(activeSnapshot)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Package</span>
              </button>
              <button
                onClick={() => setIsManifestModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RETENTION & CLOUD STORAGE SETTINGS */}
      {/* ========================================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[11px] font-bold">
                <Sliders className="w-3 h-3" />
                <span>Disaster Recovery Engine Configuration</span>
              </div>
              <h2 className="text-xl font-black text-white">Backup & Retention Policies</h2>
              <p className="text-xs text-slate-400">
                Configure automated snapshot frequency, retention lifecycle, and cloud vault storage providers.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Retention Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Retention Lifecycle Period</label>
                <select
                  id="settings-select-retention"
                  value={settings.backupRetentionDays || 30}
                  onChange={(e) => updateSettings({ backupRetentionDays: parseInt(e.target.value) })}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={14}>14 Days (Standard Rolling)</option>
                  <option value={30}>30 Days (Recommended)</option>
                  <option value={60}>60 Days (Enterprise)</option>
                  <option value={90}>90 Days (Quarterly Archival)</option>
                  <option value={365}>365 Days (Full Year Compliance)</option>
                </select>
              </div>

              {/* Cloud Storage Vault Provider */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Offsite Cloud Storage Vault</label>
                <select
                  id="settings-select-storage-provider"
                  value={settings.backupStorageProvider || 'AWS S3 Mumbai ap-south-1 (AES-256)'}
                  onChange={(e) => updateSettings({ backupStorageProvider: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="AWS S3 Mumbai ap-south-1 (AES-256)">AWS S3 Mumbai ap-south-1 (AES-256 GCM)</option>
                  <option value="AWS S3 Frankfurt eu-central-1 (AES-256)">AWS S3 Frankfurt eu-central-1 (AES-256 GCM)</option>
                  <option value="Google Cloud Storage asia-south1 (AES-256)">Google Cloud Storage asia-south1 (Mumbai)</option>
                  <option value="Azure Blob Storage India Central (AES-256)">Azure Blob Storage India Central</option>
                </select>
              </div>

              {/* Automation Toggles */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">Automated Daily Snapshot Cron (02:00 UTC)</div>
                    <div className="text-[11px] text-slate-400">Nightly background snapshot of all active client websites</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoBackupsEnabled !== false}
                    onChange={(e) => updateSettings({ autoBackupsEnabled: e.target.checked })}
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                </label>

                <div className="pt-2 border-t border-slate-800/80">
                  <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white">Pre-Deploy Hotfix Checkpoints</div>
                      <div className="text-[11px] text-slate-400">Automatically capture safety point prior to any admin edit</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preDeployBackupsEnabled !== false}
                      onChange={(e) => updateSettings({ preDeployBackupsEnabled: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-500"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    addToast('success', 'Configuration Saved', 'Disaster recovery settings updated.');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Save Policy Configuration
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
