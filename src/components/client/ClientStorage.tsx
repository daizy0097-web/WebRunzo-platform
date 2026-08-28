import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HardDrive, 
  Upload, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Code, 
  File, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink,
  ShieldCheck,
  History,
  Layers,
  ArrowUpRight,
  X,
  Lock,
  Zap,
  Info
} from 'lucide-react';
import { FileCategory, CustomerFile } from '../../types';
import { formatBytes, formatGB, canUploadFile } from '../../utils/storageUtils';

export const ClientStorage: React.FC = () => {
  const { 
    currentClientCustomer, 
    activeCustomer, 
    uploadCustomerFile, 
    deleteCustomerFile,
    plans,
    openConciergeModal,
    addToast 
  } = useApp();

  const customer = currentClientCustomer || activeCustomer;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form States
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<FileCategory>('image');
  const [uploadSizeBytes, setUploadSizeBytes] = useState<number>(2.4 * 1024 * 1024); // 2.4 MB default
  const [uploadUrl, setUploadUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-400">
        Customer profile not loaded.
      </div>
    );
  }

  const storage = customer.storage || {
    basePlanLimitGB: 5,
    extraGrantedGB: 0,
    totalUsableLimitGB: 5,
    maxTechnicalLimitGB: 15,
    usedGB: 1.2,
    percentUsed: 24,
    isNearLimit: false,
    isLimitReached: false,
    breakdown: {
      imagesGB: 0.6,
      videosGB: 0.2,
      documentsGB: 0.1,
      appAssetsGB: 0.2,
      databaseGB: 0.1,
    },
    files: [],
    history: [],
  };

  const plan = plans.find((p) => p.id === customer.planId);

  const filteredFiles = (storage.files || []).filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'All' || f.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleSimulatedFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    setIsUploading(true);

    setTimeout(() => {
      const result = uploadCustomerFile(customer.id, {
        name: uploadFileName,
        sizeBytes: Number(uploadSizeBytes),
        category: uploadCategory,
        url: uploadUrl || undefined,
      });

      setIsUploading(false);
      if (result.success) {
        setShowUploadModal(false);
        setUploadFileName('');
        setUploadUrl('');
      }
    }, 600);
  };

  const handleRealFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setUploadSizeBytes(file.size);

    if (file.type.startsWith('image/')) setUploadCategory('image');
    else if (file.type.startsWith('video/')) setUploadCategory('video');
    else if (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('text')) setUploadCategory('document');
    else if (file.type.includes('json') || file.type.includes('javascript') || file.type.includes('css')) setUploadCategory('code');
    else setUploadCategory('other');
  };

  const getCategoryIcon = (cat: FileCategory) => {
    switch (cat) {
      case 'image': return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'video': return <Video className="w-4 h-4 text-purple-400" />;
      case 'document': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'code': return <Code className="w-4 h-4 text-amber-400" />;
      case 'database': return <Database className="w-4 h-4 text-indigo-400" />;
      default: return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 backdrop-blur shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> Supabase Storage & Cloudflare CDN
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs font-mono">Customer Instance: {customer.businessName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Cloud Storage & Media Assets
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage your website images, media assets, documents, and code resources. All assets are distributed across high-speed Cloudflare R2 Edge CDN nodes with automatic WebP compression.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Asset</span>
          </button>

          <button
            onClick={() => openConciergeModal('Request Extra Storage Capacity')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Request Storage Add-on</span>
          </button>
        </div>
      </div>

      {/* Storage Limit Reached or Near Limit Alert */}
      {storage.isLimitReached && (
        <div className="bg-rose-950/40 border border-rose-500/50 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 text-rose-200 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-extrabold text-sm text-white">Storage Capacity Full (100% Limit Reached)</div>
            <div className="mt-1 leading-relaxed text-rose-300">
              Your website storage has reached its maximum allocated limit of <strong>{storage.totalUsableLimitGB} GB</strong>. New file uploads are temporarily paused. You can delete unused files to reclaim space or request an extra storage quota from your admin.
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => openConciergeModal('Storage Limit Reached — Urgent Upgrade')}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Request Instant Storage Boost
              </button>
            </div>
          </div>
        </div>
      )}

      {storage.isNearLimit && !storage.isLimitReached && (
        <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-2xl flex items-start gap-3.5 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-bold text-white">Storage Warning: {storage.percentUsed}% Capacity Used</div>
            <div className="mt-0.5 leading-relaxed text-amber-300">
              You are currently utilizing <strong>{storage.usedGB} GB</strong> of your <strong>{storage.totalUsableLimitGB} GB</strong> allocation. We recommend archiving older media assets or contacting support for an add-on.
            </div>
          </div>
        </div>
      )}

      {/* Storage Quota Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Usable Limit */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Usable Quota</span>
            <HardDrive className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{storage.totalUsableLimitGB} GB</span>
            {storage.extraGrantedGB > 0 && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                +{storage.extraGrantedGB} GB Extra
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400">
            Base Plan ({plan?.name || 'Silver'}): {storage.basePlanLimitGB} GB
          </div>
        </div>

        {/* Currently Used */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Used Storage</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{storage.usedGB} GB</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              storage.percentUsed >= 95 ? 'bg-rose-500/20 text-rose-400' : storage.percentUsed >= 80 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {storage.percentUsed}% Used
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {formatGB(Math.max(0, storage.totalUsableLimitGB - storage.usedGB))} GB Available
          </div>
        </div>

        {/* Maximum Technical Ceiling */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Platform Ceiling</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">15 GB Max</span>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
              Isolated Hard Cap
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            Strict multi-tenant resource guarantee
          </div>
        </div>

        {/* Stored Assets Count */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Indexed Files</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{(storage.files || []).length} Files</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Cloudflare R2 Edge Synced
          </div>
        </div>

      </div>

      {/* Visual Capacity Bar & Breakdown */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Storage Allocation Breakdown</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live consumption across media categories and isolated Supabase database instance.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-300">
            <strong>{storage.usedGB} GB</strong> of <strong>{storage.totalUsableLimitGB} GB</strong> ({storage.percentUsed}%)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
          {storage.breakdown && (
            <>
              {/* Images */}
              <div 
                style={{ width: `${(storage.breakdown.imagesGB / storage.totalUsableLimitGB) * 100}%` }} 
                className="bg-emerald-500 h-full rounded-l transition-all" 
                title={`Images: ${storage.breakdown.imagesGB} GB`}
              />
              {/* Videos */}
              <div 
                style={{ width: `${(storage.breakdown.videosGB / storage.totalUsableLimitGB) * 100}%` }} 
                className="bg-purple-500 h-full transition-all" 
                title={`Videos: ${storage.breakdown.videosGB} GB`}
              />
              {/* Documents */}
              <div 
                style={{ width: `${(storage.breakdown.documentsGB / storage.totalUsableLimitGB) * 100}%` }} 
                className="bg-blue-500 h-full transition-all" 
                title={`Documents: ${storage.breakdown.documentsGB} GB`}
              />
              {/* App Assets */}
              <div 
                style={{ width: `${(storage.breakdown.appAssetsGB / storage.totalUsableLimitGB) * 100}%` }} 
                className="bg-amber-500 h-full transition-all" 
                title={`App Assets: ${storage.breakdown.appAssetsGB} GB`}
              />
              {/* Database */}
              <div 
                style={{ width: `${(storage.breakdown.databaseGB / storage.totalUsableLimitGB) * 100}%` }} 
                className="bg-indigo-500 h-full rounded-r transition-all" 
                title={`Database: ${storage.breakdown.databaseGB} GB`}
              />
            </>
          )}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded bg-emerald-500 shrink-0"></span>
            <div>
              <div className="text-[10px] text-slate-400">Images & WebP</div>
              <div className="text-xs font-bold text-white font-mono">{storage.breakdown?.imagesGB || 0} GB</div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded bg-purple-500 shrink-0"></span>
            <div>
              <div className="text-[10px] text-slate-400">Videos & Media</div>
              <div className="text-xs font-bold text-white font-mono">{storage.breakdown?.videosGB || 0} GB</div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded bg-blue-500 shrink-0"></span>
            <div>
              <div className="text-[10px] text-slate-400">PDFs & Docs</div>
              <div className="text-xs font-bold text-white font-mono">{storage.breakdown?.documentsGB || 0} GB</div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded bg-amber-500 shrink-0"></span>
            <div>
              <div className="text-[10px] text-slate-400">App Bundle & Code</div>
              <div className="text-xs font-bold text-white font-mono">{storage.breakdown?.appAssetsGB || 0} GB</div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded bg-indigo-500 shrink-0"></span>
            <div>
              <div className="text-[10px] text-slate-400">Supabase DB</div>
              <div className="text-xs font-bold text-white font-mono">{storage.breakdown?.databaseGB || 0} GB</div>
            </div>
          </div>

        </div>
      </div>

      {/* File Explorer & Media Assets Manager */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets by file name..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
            {['All', 'image', 'document', 'video', 'code', 'other'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`capitalize px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                  selectedCategoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'All Files' : cat + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Files Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">File Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">File Size</th>
                <th className="py-3.5 px-4">Uploaded Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    <HardDrive className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="text-xs font-semibold text-slate-400">No storage assets found matching criteria.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Upload images, documents, or media files to populate your storage.</p>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                          {getCategoryIcon(file.category)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{file.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{file.mimeType || 'binary/stream'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                        {file.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      {file.sizeFormatted}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {file.uploadedAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Open / Preview Asset"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteCustomerFile(customer.id, file.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition"
                          title="Delete File & Reclaim Space"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Storage Grant History */}
      {storage.history && storage.history.length > 0 && (
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <span>Quota Adjustments & Grant History</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Audit record of administrative storage capacity expansions.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {storage.history.map((hist) => (
              <div key={hist.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${hist.action === 'grant_extra' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <div>
                    <div className="font-semibold text-white">
                      {hist.action === 'grant_extra' ? `+${hist.changeAmountGB} GB Storage Expansion Granted` : `${hist.changeAmountGB} GB Adjustment`}
                    </div>
                    <div className="text-[10px] text-slate-400">{hist.reason}</div>
                  </div>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400">
                  <div>Limit: {hist.newLimitGB} GB</div>
                  <div>{hist.date} by {hist.adminName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white">Upload New Asset</h3>
                <p className="text-[11px] text-slate-400">Assets are verified against your {storage.totalUsableLimitGB} GB quota limit.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulatedFileUpload} className="space-y-4 text-xs">
              
              {/* File Select Zone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/40">
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <div className="font-bold text-white">Drop file here or click to browse</div>
                <div className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, WebP, SVG, PDF, MP4, JSON up to 100MB</div>
                <input
                  type="file"
                  onChange={handleRealFileSelect}
                  className="hidden"
                  id="clientStorageFileInput"
                />
                <label htmlFor="clientStorageFileInput" className="mt-3 inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg cursor-pointer">
                  {uploadFileName ? `Selected: ${uploadFileName}` : 'Select File from Device'}
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Asset Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. hero-banner-highres.webp"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Asset Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as FileCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                  >
                    <option value="image">Image (WebP / PNG)</option>
                    <option value="video">Video / MP4</option>
                    <option value="document">Document / PDF</option>
                    <option value="code">Code / Script</option>
                    <option value="other">Other Asset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estimated Size (MB)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={(uploadSizeBytes / (1024 * 1024)).toFixed(1)}
                    onChange={(e) => setUploadSizeBytes(Number(e.target.value) * 1024 * 1024)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono"
                  />
                </div>
              </div>

              {/* Validation Check Notice */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Quota Impact:</span>
                <span className="font-bold text-white font-mono">
                  +{(uploadSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFileName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Syncing to CDN...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Distribute</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
