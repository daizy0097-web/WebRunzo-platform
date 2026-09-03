import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  Download, 
  Eye, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  HardDrive, 
  AlertTriangle, 
  Check, 
  X, 
  Lock, 
  Database, 
  Code, 
  Image as ImageIcon, 
  Sparkles,
  RefreshCw,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, WebsiteBackupSnapshot } from '../../types';
import { LiveWebsitePreviewFrame } from '../common/LiveWebsitePreviewFrame';

interface Props {
  customer: Customer;
}

export const ClientBackupSection: React.FC<Props> = ({ customer }) => {
  const { 
    backups, 
    triggerInstantBackup, 
    restoreBackupSnapshot, 
    testStagingRestore, 
    templates, 
    addToast 
  } = useApp();

  // Filter backups strictly isolated to this customer
  const clientBackups = useMemo(() => {
    return backups
      .filter((b) => b.customerId === customer.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [backups, customer.id]);

  // States
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedSnapshotForRestore, setSelectedSnapshotForRestore] = useState<WebsiteBackupSnapshot | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Instant Snapshot Modal State
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [customNote, setCustomNote] = useState('');

  // Sandbox Staging Preview State
  const [previewSnapshot, setPreviewSnapshot] = useState<WebsiteBackupSnapshot | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Latest snapshot metrics
  const latestSnapshot = clientBackups[0];
  const totalSnapshotsCount = clientBackups.length;

  // Trigger Instant Snapshot Handler
  const handleCaptureSnapshot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCapturing(true);
    setIsSnapshotModalOpen(false);

    try {
      const tag = customTag.trim() || `v${Math.floor(1 + Math.random() * 3)}.${Math.floor(Math.random() * 9)}.${Math.floor(1 + Math.random() * 9)}-client`;
      const note = customNote.trim() || `Client manual snapshot before updating content. Verified state.`;

      await triggerInstantBackup(customer.id, {
        type: 'Manual On-Demand',
        versionTag: tag,
        notes: note,
        components: {
          databaseState: true,
          codeAssets: true,
          mediaUploads: true,
          sslDnsConfig: true,
        },
      });

      setCustomTag('');
      setCustomNote('');
    } catch (err: any) {
      console.error('Snapshot capture failed:', err);
      addToast('error', 'Snapshot Failed', err.message || 'Could not capture backup.');
    } finally {
      setIsCapturing(false);
    }
  };

  // 1-Click Rollback Handler
  const handleConfirmRestore = async () => {
    if (!selectedSnapshotForRestore) return;
    setIsRestoring(true);

    try {
      await restoreBackupSnapshot(selectedSnapshotForRestore.id, {
        createSafetyCheckpoint: true,
      });
      setIsRestoreModalOpen(false);
      setSelectedSnapshotForRestore(null);
    } catch (err: any) {
      console.error('Restore failed:', err);
      addToast('error', 'Restore Failed', err.message || 'Could not restore snapshot.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Download Manifest Handler
  const handleDownloadManifest = (snapshot: WebsiteBackupSnapshot) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(
        {
          meta: {
            generator: 'WebRunzo Cloud Recovery Engine v4.2',
            exportedAt: new Date().toISOString(),
            tenantId: snapshot.customerId,
            checksum: snapshot.checksum,
          },
          snapshot,
        },
        null,
        2
      )
    )}`;
    const anchor = document.createElement('a');
    anchor.setAttribute('href', jsonString);
    anchor.setAttribute(
      'download',
      `webrunzo-backup-${customer.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${snapshot.versionTag}.json`
    );
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    addToast('success', 'Manifest Downloaded', `Export package for ${snapshot.versionTag} downloaded.`);
  };

  // Simulated customer for snapshot preview
  const previewCustomerData = useMemo<Customer | null>(() => {
    if (!previewSnapshot) return null;
    return {
      ...customer,
      customContent: previewSnapshot.snapshotData.customContentSnapshot || customer.customContent,
      templateId: previewSnapshot.snapshotData.templateIdSnapshot || customer.templateId,
      customDomain: previewSnapshot.snapshotData.customDomain || customer.customDomain,
    };
  }, [previewSnapshot, customer]);

  const previewTemplate = useMemo(() => {
    if (!previewSnapshot) return null;
    return templates.find((t) => t.id === previewSnapshot.snapshotData.templateIdSnapshot) || templates[0];
  }, [previewSnapshot, templates]);

  return (
    <div id="section-client-backups" className="bg-slate-900/90 p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Disaster Recovery & Point-in-Time Snapshots</span>
          </div>
          <h3 className="font-extrabold text-lg text-white mt-1">
            Website Backups & Rollback Ledger
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Automated daily cloud snapshots and point-in-time recovery archives strictly vaulted for {customer.businessName}. 
            Capture on-demand snapshots before making edits or roll back anytime.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-capture-instant-snapshot"
            type="button"
            onClick={() => setIsSnapshotModalOpen(true)}
            disabled={isCapturing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isCapturing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Vaulting Snapshot...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Capture Instant Snapshot</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Snapshot Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-indigo-400" />
            <span>Snapshots in Vault</span>
          </div>
          <div className="text-base font-extrabold text-white mt-1">
            {totalSnapshotsCount} Secured
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
            {latestSnapshot?.sizeFormatted || '24.5 MB'} avg archive size
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>Latest Backup</span>
          </div>
          <div className="text-sm font-extrabold text-white mt-1 truncate">
            {latestSnapshot ? latestSnapshot.timestamp.split(' ')[0] : 'Today'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">
            {latestSnapshot?.versionTag || 'v1.0.0-initial'}
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>Retention Policy</span>
          </div>
          <div className="text-sm font-extrabold text-white mt-1">
            30 Days Immutable
          </div>
          <div className="text-[10px] text-purple-300 mt-0.5">
            AES-256 Offsite Vault
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Restoration Readiness</span>
          </div>
          <div className="text-sm font-extrabold text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Operational</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            1-Click Rollback Enabled
          </div>
        </div>
      </div>

      {/* Snapshots Ledger Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">Backup Archive History</span>
          <span className="text-[11px] text-slate-500 font-mono">
            Strictly isolated to Tenant ID: {customer.id}
          </span>
        </div>

        {clientBackups.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80 space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">No backup snapshots found</p>
            <p className="text-[11px] text-slate-500">
              Click &quot;Capture Instant Snapshot&quot; above to create your first encrypted disaster recovery point.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-3 px-4">Version / Snapshot</th>
                  <th className="py-3 px-3">Date & Timestamp</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Included State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {clientBackups.map((snap) => {
                  return (
                    <tr key={snap.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* Version & Notes */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                            {snap.versionTag}
                          </span>
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                            <Check className="w-2.5 h-2.5" />
                            <span>Verified</span>
                          </span>
                        </div>
                        {snap.notes && (
                          <div className="text-[11px] text-slate-400 font-sans mt-1 max-w-xs truncate" title={snap.notes}>
                            {snap.notes}
                          </div>
                        )}
                        <div className="text-[9px] text-slate-600 font-mono mt-0.5">
                          {snap.checksum}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{snap.timestamp}</span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            snap.type === 'Automated Daily'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : snap.type === 'Manual On-Demand'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {snap.type}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        {snap.sizeFormatted}
                      </td>

                      {/* Components Included */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          {snap.componentsIncluded.databaseState && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-0.5" title="Database & Custom Content">
                              <Database className="w-2.5 h-2.5" />
                              <span>DB</span>
                            </span>
                          )}
                          {snap.componentsIncluded.codeAssets && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5" title="Code Assets & Layouts">
                              <Code className="w-2.5 h-2.5" />
                              <span>Code</span>
                            </span>
                          )}
                          {snap.componentsIncluded.mediaUploads && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-0.5" title="Media & Uploads">
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>Media</span>
                            </span>
                          )}
                          {snap.componentsIncluded.sslDnsConfig && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5" title="SSL & Cloudflare DNS State">
                              <Lock className="w-2.5 h-2.5" />
                              <span>DNS</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Sandbox Preview */}
                          <button
                            type="button"
                            onClick={() => setPreviewSnapshot(snap)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Test Staging Sandbox Preview"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-400" />
                          </button>

                          {/* Download Manifest */}
                          <button
                            type="button"
                            onClick={() => handleDownloadManifest(snap)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Download Manifest Archive"
                          >
                            <Download className="w-3.5 h-3.5 text-purple-400" />
                          </button>

                          {/* 1-Click Rollback */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSnapshotForRestore(snap);
                              setIsRestoreModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            title="Rollback live site to this snapshot"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Rollback</span>
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

      {/* Create Instant Snapshot Modal */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Capture On-Demand Snapshot</h4>
                  <p className="text-[11px] text-slate-400">Vault instant backup for {customer.businessName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSnapshotModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCaptureSnapshot} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Snapshot Version Tag (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. pre-redesign-checkpoint, v2.5.0"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Snapshot Notes & Purpose
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Captured before editing hero text and pricing plan changes."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300">Vault includes:</div>
                <div className="flex items-center gap-3 text-[10px] text-emerald-400">
                  <span>✓ PostgreSQL DB State</span>
                  <span>✓ Template Layout</span>
                  <span>✓ Uploaded Media</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSnapshotModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCapturing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCapturing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Vault...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Create Snapshot</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {isRestoreModalOpen && selectedSnapshotForRestore && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Confirm 1-Click Rollback</h4>
                  <p className="text-[11px] text-slate-400">Restore point {selectedSnapshotForRestore.versionTag}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setSelectedSnapshotForRestore(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2.5">
              <p>
                Are you sure you want to revert <strong className="text-white">{customer.businessName}</strong> to snapshot{' '}
                <span className="font-mono text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded">
                  {selectedSnapshotForRestore.versionTag}
                </span>?
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1 font-mono text-slate-400">
                <div>Snapshot Date: {selectedSnapshotForRestore.timestamp}</div>
                <div>Archive Size: {selectedSnapshotForRestore.sizeFormatted}</div>
                <div>Integrity Hash: {selectedSnapshotForRestore.checksum}</div>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  <strong>Safety First:</strong> An emergency checkpoint of your current live site will be automatically created prior to restoring.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setSelectedSnapshotForRestore(null);
                }}
                disabled={isRestoring}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rolling Back & Flushing CDN...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm Rollback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sandbox Staging Preview Modal */}
      {previewSnapshot && previewCustomerData && previewTemplate && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white">Sandbox Staging Preview</h4>
                    <span className="font-mono text-[10px] bg-slate-800 text-sky-300 px-2 py-0.5 rounded border border-slate-700">
                      {previewSnapshot.versionTag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Isolated snapshot sandbox preview • Stored on {previewSnapshot.storageLocation}
                  </p>
                </div>
              </div>

              {/* Device Selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg transition ${
                    previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop View"
                >
                  <Laptop className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1.5 rounded-lg transition ${
                    previewDevice === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg transition ${
                    previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSnapshotForRestore(previewSnapshot);
                    setPreviewSnapshot(null);
                    setIsRestoreModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore This Version</span>
                </button>
                <button
                  onClick={() => setPreviewSnapshot(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Frame Body */}
            <div className="flex-1 bg-slate-950 p-4 overflow-y-auto flex items-center justify-center">
              <div
                className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-white ${
                  previewDevice === 'mobile'
                    ? 'w-[375px] h-[667px]'
                    : previewDevice === 'tablet'
                    ? 'w-[768px] h-[800px]'
                    : 'w-full h-full'
                }`}
              >
                <LiveWebsitePreviewFrame
                  template={previewTemplate}
                  customer={previewCustomerData}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
