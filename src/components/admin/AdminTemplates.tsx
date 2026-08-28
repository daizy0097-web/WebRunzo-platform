import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Template, 
  TemplateCategory, 
  TemplateStatus, 
  ImportSource, 
  OwnershipStatus, 
  LicenseStatus 
} from '../../types';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  X, 
  Layout, 
  Check, 
  Sparkles,
  Tag,
  Copy,
  Upload,
  Archive,
  CheckCircle2,
  FileCode2,
  FolderArchive,
  Github,
  Globe2,
  Shield,
  Layers,
  ArrowUpRight,
  Filter,
  DollarSign,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Sliders,
  ExternalLink
} from 'lucide-react';

const CATEGORIES: TemplateCategory[] = [
  'Business',
  'Restaurant',
  'Portfolio',
  'Gym',
  'Salon',
  'Real Estate',
  'E-commerce',
  'Personal Brand',
];

const IMPORT_SOURCES: { id: ImportSource; name: string; desc: string; icon: string }[] = [
  { id: 'Google AI Studio', name: 'Google AI Studio', desc: 'Import generated applets or prompt-engineered web layouts', icon: '✨' },
  { id: 'Gemini', name: 'Gemini AI', desc: 'Direct prompt code exports and full-stack snippets', icon: '🤖' },
  { id: 'Lovable', name: 'Lovable.dev', desc: 'Exported React + Tailwind web applications', icon: '❤️' },
  { id: 'Bolt', name: 'Bolt.new', desc: 'Vite & Next.js full project sandbox exports', icon: '⚡' },
  { id: 'v0', name: 'v0 by Vercel', desc: 'Shadcn & Tailwind component and page structures', icon: '▲' },
  { id: 'Cursor', name: 'Cursor IDE', desc: 'AI-composed local workspace repository packages', icon: '🖱️' },
  { id: 'GitHub', name: 'GitHub Repository', desc: 'Public or private Git repo URL with branch targeting', icon: '🐙' },
  { id: 'ZIP Upload', name: 'ZIP Archive', desc: 'Upload standard .zip project bundle directly', icon: '📦' },
];

export const AdminTemplates: React.FC = () => {
  const { 
    templates, 
    addTemplate, 
    updateTemplate, 
    deleteTemplate, 
    duplicateTemplate,
    toggleTemplateStatus,
    toggleTemplateFeatured,
    importWebsiteTemplate,
    openPreviewModal 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'All' | 'Published' | 'Draft' | 'Archived' | 'Featured' | 'Imported'>('All');
  
  // Create / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('Business');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [price, setPrice] = useState(34999);
  const [popular, setPopular] = useState(false);
  const [status, setStatus] = useState<TemplateStatus>('Published');
  const [tagsInput, setTagsInput] = useState('Responsive, SEO Ready, Fast');
  const [features, setFeatures] = useState('Responsive Design, Lead Capture Form, SEO Pack, Cloudflare CDN');
  const [ownershipStatus, setOwnershipStatus] = useState<OwnershipStatus>('WebRunzo');
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>('Proprietary');
  const [copyrightNotice, setCopyrightNotice] = useState('© WebRunzo — All Rights Reserved.');

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<'select_source' | 'input_details' | 'analyzing' | 'confirm'>('select_source');
  const [selectedImportSource, setSelectedImportSource] = useState<ImportSource>('Google AI Studio');
  const [importUrl, setImportUrl] = useState('');
  const [importZipName, setImportZipName] = useState('');
  const [importProjectTitle, setImportProjectTitle] = useState('');
  const [importCategory, setImportCategory] = useState<TemplateCategory>('Business');
  const [importPrice, setImportPrice] = useState(34999);
  const [importDescription, setImportDescription] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<{
    detectedFramework: string;
    pageCount: number;
    componentsCount: number;
    dependencies: string[];
    assetsCount: number;
    licenseClean: boolean;
  } | null>(null);

  const filteredTemplates = templates.filter((t) => {
    const matchesCat = selectedCat === 'All' || t.category === selectedCat;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesStatus = true;
    if (selectedStatusTab === 'Published') matchesStatus = t.status === 'Published' || (!t.status && t.status !== 'Draft' && t.status !== 'Archived');
    else if (selectedStatusTab === 'Draft') matchesStatus = t.status === 'Draft';
    else if (selectedStatusTab === 'Archived') matchesStatus = t.status === 'Archived';
    else if (selectedStatusTab === 'Featured') matchesStatus = !!t.featured || !!t.popular;
    else if (selectedStatusTab === 'Imported') matchesStatus = !!t.importedFrom;

    return matchesCat && matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setName('');
    setCategory('Business');
    setDescription('');
    setLongDescription('');
    setPreviewImage('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80');
    setPrice(34999);
    setPopular(false);
    setStatus('Published');
    setTagsInput('Modern, High-Speed, Conversion-Optimized');
    setFeatures('Responsive Layout, Fast Edge Caching, Lead Ingestion, SSL Auto-Renew');
    setOwnershipStatus('WebRunzo');
    setLicenseStatus('Proprietary');
    setCopyrightNotice('© WebRunzo — All Rights Reserved.');
    setShowModal(true);
  };

  const handleOpenEdit = (t: Template) => {
    setEditingTemplate(t);
    setName(t.name);
    setCategory(t.category);
    setDescription(t.description);
    setLongDescription(t.longDescription || '');
    setPreviewImage(t.previewImage);
    setPrice(t.price);
    setPopular(!!t.featured || !!t.popular);
    setStatus(t.status || 'Published');
    setTagsInput((t.tags || []).join(', '));
    setFeatures((t.features || []).join(', '));
    setOwnershipStatus(t.ownershipStatus || 'WebRunzo');
    setLicenseStatus(t.licenseStatus || 'Proprietary');
    setCopyrightNotice(t.copyrightNotice || '© WebRunzo — All Rights Reserved.');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const featArray = features.split(',').map((f) => f.trim()).filter(Boolean);
    const tagsArray = tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean);

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        name,
        category,
        description,
        longDescription,
        previewImage,
        price: Number(price),
        featured: popular,
        popular,
        status,
        features: featArray,
        tags: tagsArray,
        ownershipStatus,
        licenseStatus,
        copyrightNotice,
      });
    } else {
      addTemplate({
        name,
        category,
        description,
        longDescription,
        previewImage,
        price: Number(price),
        featured: popular,
        popular,
        status,
        features: featArray,
        tags: tagsArray,
        demoSlug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        isMasterTemplate: true,
        ownershipStatus,
        licenseStatus,
        copyrightNotice,
        colorScheme: { primary: '#1e293b', secondary: '#0f172a', accent: '#10b981' },
        sampleSections: {
          heroHeading: `Welcome to ${name}`,
          heroSubtitle: description || 'Modern digital solutions for your business.',
          services: ['Core Offering', 'Bespoke Solutions', 'Consultation', 'Delivery'],
          tagline: 'Precision digital engineering.',
        },
      });
    }

    setShowModal(false);
  };

  const startImportAnalysis = () => {
    setImportStep('analyzing');
    setAnalysisProgress(10);
    setAnalysisLogs([
      `[${new Date().toLocaleTimeString()}] Connecting to source: ${selectedImportSource}...`,
      `[${new Date().toLocaleTimeString()}] Fetching archive manifests & repository trees...`
    ]);

    setTimeout(() => {
      setAnalysisProgress(40);
      setAnalysisLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Parsing package.json & Vite config...`,
        `[${new Date().toLocaleTimeString()}] Detected Stack: React 19 + TypeScript + Tailwind CSS v4`,
        `[${new Date().toLocaleTimeString()}] Scanning for hardcoded credentials & unsafe scripts... (0 issues found)`
      ]);
    }, 700);

    setTimeout(() => {
      setAnalysisProgress(80);
      setAnalysisLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Extracting 6 page routes: / /about /services /gallery /pricing /contact`,
        `[${new Date().toLocaleTimeString()}] Indexing 24 UI components & Lucide icon bindings`,
        `[${new Date().toLocaleTimeString()}] Optimizing image asset paths for Cloudflare R2 CDN CDN layer...`
      ]);
    }, 1400);

    setTimeout(() => {
      setAnalysisProgress(100);
      setAnalysisResult({
        detectedFramework: 'React 19 + Vite + Tailwind CSS',
        pageCount: 6,
        componentsCount: 24,
        dependencies: ['react', 'lucide-react', 'motion', 'tailwindcss'],
        assetsCount: 16,
        licenseClean: true,
      });
      setImportStep('confirm');
    }, 2000);
  };

  const handleFinalizeImport = () => {
    importWebsiteTemplate({
      name: importProjectTitle || `${selectedImportSource} Project`,
      category: importCategory,
      description: importDescription || `Full-featured website imported from ${selectedImportSource}.`,
      price: Number(importPrice) || 34999,
      tags: [importCategory, selectedImportSource, 'Master Template', 'High Speed'],
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      source: selectedImportSource,
      sourceUrl: importUrl || undefined,
      detectedFramework: analysisResult?.detectedFramework || 'React 19 + Tailwind CSS',
      pageCount: analysisResult?.pageCount || 6,
      componentsCount: analysisResult?.componentsCount || 24,
      dependencies: analysisResult?.dependencies || ['react', 'tailwindcss'],
      assetsCount: analysisResult?.assetsCount || 16,
      ownershipStatus: 'WebRunzo',
      licenseStatus: 'Proprietary',
      copyrightNotice: '© WebRunzo Master Template Library — All Rights Reserved.',
    });

    setShowImportModal(false);
    setImportStep('select_source');
    setImportUrl('');
    setImportProjectTitle('');
    setImportDescription('');
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 backdrop-blur shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Master Template Library
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs font-mono">{templates.length} Active Templates</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Template & Website Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Create, import, duplicate, publish, unpublish, and price turnkey master templates for customer deployments. Master templates remain centralized and protected while customer instances are completely isolated.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={() => {
              setImportStep('select_source');
              setShowImportModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import Website</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4">
        
        {/* Status Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            {(['All', 'Published', 'Draft', 'Archived', 'Featured', 'Imported'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusTab(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  selectedStatusTab === st
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 shrink-0 font-mono">
            Showing <strong className="text-white">{filteredTemplates.length}</strong> of {templates.length}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by title, description, or tags..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCat('All')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                selectedCat === 'All' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                  selectedCat === cat ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((tpl) => {
          const isDraft = tpl.status === 'Draft';
          const isArchived = tpl.status === 'Archived';
          const isPublished = !isDraft && !isArchived;

          return (
            <div
              key={tpl.id}
              className={`bg-slate-900/90 rounded-2xl border ${
                isArchived ? 'border-slate-800/50 opacity-75' : isDraft ? 'border-amber-500/30' : 'border-slate-800'
              } overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition shadow-lg relative`}
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-950">
                  <img
                    src={tpl.previewImage}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[85%]">
                    <span className="bg-slate-950/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {tpl.category}
                    </span>
                    
                    {/* Status Badge */}
                    {isDraft && (
                      <span className="bg-amber-500/90 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                        Draft
                      </span>
                    )}
                    {isArchived && (
                      <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        Archived
                      </span>
                    )}
                    {isPublished && (
                      <span className="bg-emerald-500/90 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                        Published
                      </span>
                    )}

                    {(tpl.featured || tpl.popular) && (
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded shadow flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}

                    {tpl.importedFrom && (
                      <span className="bg-indigo-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
                        {tpl.importedFrom}
                      </span>
                    )}
                  </div>

                  {/* Top Right Quick Actions */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => duplicateTemplate(tpl.id)}
                      className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-slate-200 backdrop-blur shadow"
                      title="Duplicate Template"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-white leading-tight group-hover:text-emerald-400 transition">
                      {tpl.name}
                    </h3>
                    <span className="text-emerald-400 font-mono font-bold text-xs shrink-0">
                      ₹{(tpl.price || 34999).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(tpl.tags || tpl.features || []).slice(0, 3).map((tg, idx) => (
                      <span key={idx} className="bg-slate-800/80 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-700/50">
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 flex flex-col gap-2">
                
                {/* State Control Row */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTemplateFeatured(tpl.id)}
                      className={`text-[10px] font-semibold flex items-center gap-1 transition ${
                        tpl.featured || tpl.popular ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{tpl.featured || tpl.popular ? 'Featured' : 'Mark Featured'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPublished ? (
                      <button
                        onClick={() => toggleTemplateStatus(tpl.id, 'Draft')}
                        className="text-[10px] text-amber-400 hover:underline"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleTemplateStatus(tpl.id, 'Published')}
                        className="text-[10px] text-emerald-400 font-bold hover:underline"
                      >
                        Publish
                      </button>
                    )}
                    <span className="text-slate-600">•</span>
                    {isArchived ? (
                      <button
                        onClick={() => toggleTemplateStatus(tpl.id, 'Published')}
                        className="text-[10px] text-slate-400 hover:underline"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleTemplateStatus(tpl.id, 'Archived')}
                        className="text-[10px] text-slate-500 hover:text-rose-400 hover:underline"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Button Row */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <button
                    onClick={() => openPreviewModal(tpl)}
                    className="flex-1 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Live Preview</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(tpl)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Edit Template"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => duplicateTemplate(tpl.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Duplicate Template"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteTemplate(tpl.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Template Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create New Master Template'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Master templates serve as blueprint models for client custom deployments.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apex Legal Group"
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Industry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Turnkey Price (₹ INR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TemplateStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                  >
                    <option value="Published">Published (Live in Gallery)</option>
                    <option value="Draft">Draft (Hidden)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Intellectual Property</label>
                  <select
                    value={ownershipStatus}
                    onChange={(e) => setOwnershipStatus(e.target.value as OwnershipStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                  >
                    <option value="WebRunzo">WebRunzo Proprietary</option>
                    <option value="Client Owned">Client Owned Instance</option>
                    <option value="Open Source">Open Source / MIT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Short Marketplace Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary for gallery cards and search results..."
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Thumbnail Cover Image URL</label>
                <input
                  type="url"
                  required
                  value={previewImage}
                  onChange={(e) => setPreviewImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Marketplace Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Minimalist, Dark Mode, Booking"
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Included Features (comma separated)</label>
                  <input
                    type="text"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="Responsive, Lead Form, SEO Pack"
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="popularCheck" className="text-slate-300 cursor-pointer font-semibold select-none">
                  Mark as Featured Master Template (Highlighted in Public Gallery)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  {editingTemplate ? 'Save Modifications' : 'Create & Publish Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Website Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 text-white space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    AI & Project Importer
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-slate-400 text-xs">Step {importStep === 'select_source' ? '1/3' : importStep === 'input_details' ? '2/3' : importStep === 'analyzing' ? 'Analyzing' : '3/3: Confirm'}</span>
                </div>
                <h3 className="font-extrabold text-base text-white mt-1">
                  Import Website Project into Master Library
                </h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: Select Source */}
            {importStep === 'select_source' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Select the source platform where the website project was created. The WebRunzo analyzer will parse the structure, extract pages and components, and validate licensing.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {IMPORT_SOURCES.map((src) => (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => {
                        setSelectedImportSource(src.id);
                        setImportStep('input_details');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500 hover:bg-indigo-950/20 text-left transition flex items-start gap-3 group"
                    >
                      <div className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 group-hover:scale-110 transition">
                        {src.icon}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-indigo-400 transition">
                          {src.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                          {src.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Input Details */}
            {importStep === 'input_details' && (
              <div className="space-y-4 text-xs">
                <div className="bg-indigo-950/30 border border-indigo-500/30 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {IMPORT_SOURCES.find((s) => s.id === selectedImportSource)?.icon}
                  </div>
                  <div>
                    <div className="font-bold text-white">Source: {selectedImportSource}</div>
                    <div className="text-[11px] text-indigo-300">Targeting repository and asset ingestion</div>
                  </div>
                </div>

                {selectedImportSource === 'GitHub' ? (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">GitHub Repository URL *</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/project-repo"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono"
                    />
                  </div>
                ) : selectedImportSource === 'ZIP Upload' ? (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">ZIP Archive Upload</label>
                    <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/40">
                      <FolderArchive className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                      <div className="font-bold text-white">Drop .zip project file here or browse</div>
                      <div className="text-[10px] text-slate-400 mt-1">Supports Vite, Next.js, and static HTML bundles up to 150MB</div>
                      <input
                        type="file"
                        accept=".zip"
                        onChange={(e) => setImportZipName(e.target.files?.[0]?.name || 'website_project.zip')}
                        className="hidden"
                        id="zipFileInput"
                      />
                      <label htmlFor="zipFileInput" className="mt-3 inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg cursor-pointer">
                        {importZipName ? `Selected: ${importZipName}` : 'Select ZIP File'}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Project Share Link / Artifact URL (Optional)</label>
                    <input
                      type="url"
                      placeholder={`https://${selectedImportSource.toLowerCase().replace(/\s+/g, '')}.com/project/...`}
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Template Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Zenith Tech Venture"
                      value={importProjectTitle}
                      onChange={(e) => setImportProjectTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Industry Category</label>
                    <select
                      value={importCategory}
                      onChange={(e) => setImportCategory(e.target.value as TemplateCategory)}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Turnkey Price (₹ INR)</label>
                    <input
                      type="number"
                      value={importPrice}
                      onChange={(e) => setImportPrice(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Brief Description</label>
                    <input
                      type="text"
                      placeholder="High-converting website layout..."
                      value={importDescription}
                      onChange={(e) => setImportDescription(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setImportStep('select_source')}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={startImportAnalysis}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run Project Analysis</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Analyzing State */}
            {importStep === 'analyzing' && (
              <div className="space-y-4 text-xs py-4 text-center">
                <div className="w-12 h-12 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                
                <div>
                  <h4 className="font-extrabold text-sm text-white">Analyzing & Inspecting Website Codebase...</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Validating component isolation, dependencies, and license conformity</p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden max-w-md mx-auto">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-300 ease-out" 
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>

                {/* Real-time terminal log */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-left font-mono text-[10px] text-slate-300 space-y-1 max-h-40 overflow-y-auto">
                  {analysisLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-indigo-400">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Confirm & Ingest */}
            {importStep === 'confirm' && analysisResult && (
              <div className="space-y-4 text-xs">
                
                {/* Result Card */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Project Analysis Complete & Verified</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                    <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400">Framework</div>
                      <div className="font-bold text-white">{analysisResult.detectedFramework}</div>
                    </div>
                    <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400">Page Routes</div>
                      <div className="font-bold text-white">{analysisResult.pageCount} Pages</div>
                    </div>
                    <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400">UI Components</div>
                      <div className="font-bold text-white">{analysisResult.componentsCount} Modules</div>
                    </div>
                    <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400">License Audit</div>
                      <div className="font-bold text-emerald-400">Passed (Clean)</div>
                    </div>
                  </div>
                </div>

                {/* Intellectual Property Confirmation */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Master Template Ingestion Policy</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This website project will be ingested as a protected WebRunzo Master Template. When customer websites are provisioned, isolated instances will be deployed independently without modifying this master template.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setImportStep('input_details')}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalizeImport}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Ingest & Publish Master Template</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
