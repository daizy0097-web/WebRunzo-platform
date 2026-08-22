import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Template, TemplateCategory } from '../../types';
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
  Tag
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

export const AdminTemplates: React.FC = () => {
  const { 
    templates, 
    addTemplate, 
    updateTemplate, 
    deleteTemplate, 
    openPreviewModal 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('Business');
  const [description, setDescription] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [price, setPrice] = useState(499);
  const [popular, setPopular] = useState(false);
  const [features, setFeatures] = useState('Responsive Design, Booking Engine, SEO Optimization');

  const filteredTemplates = templates.filter((t) => {
    const matchesCat = selectedCat === 'All' || t.category === selectedCat;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setName('');
    setCategory('Business');
    setDescription('');
    setPreviewImage('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80');
    setPrice(499);
    setPopular(false);
    setFeatures('Responsive Design, Lead Capture Form, SEO Pack');
    setShowModal(true);
  };

  const handleOpenEdit = (t: Template) => {
    setEditingTemplate(t);
    setName(t.name);
    setCategory(t.category);
    setDescription(t.description);
    setPreviewImage(t.previewImage);
    setPrice(t.price);
    setPopular(!!t.popular);
    setFeatures(t.features.join(', '));
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const featArray = features.split(',').map((f) => f.trim()).filter(Boolean);

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        name,
        category,
        description,
        previewImage,
        price: Number(price),
        popular,
        features: featArray,
      });
    } else {
      addTemplate({
        name,
        category,
        description,
        previewImage,
        price: Number(price),
        popular,
        features: featArray,
        status: 'Active',
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Template Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure, edit, publish, and price templates available in the WebRunzo public marketplace.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Template</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by title or description..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCat('All')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                selectedCat === 'All' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All ({templates.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-semibold transition ${
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
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition shadow-lg"
          >
            <div>
              <div className="relative h-40 overflow-hidden bg-slate-950">
                <img
                  src={tpl.previewImage}
                  alt={tpl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="bg-slate-950/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {tpl.category}
                  </span>
                  {tpl.popular && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">{tpl.name}</h3>
                  <span className="text-emerald-400 font-mono font-bold text-xs">${tpl.price}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {tpl.features.slice(0, 2).map((f, fIdx) => (
                    <span key={fIdx} className="bg-slate-800 text-slate-400 text-[9px] px-1.5 py-0.5 rounded">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => openPreviewModal(tpl)}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 transition"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Preview</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(tpl)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Edit Template"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteTemplate(tpl.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition"
                  title="Delete Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Template Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">
                {editingTemplate ? 'Edit Template Specification' : 'Add New Template'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Industry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Base Price ($ USD)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={previewImage}
                  onChange={(e) => setPreviewImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Features (comma separated)</label>
                <input
                  type="text"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="rounded border-slate-800 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="popularCheck" className="text-slate-300 cursor-pointer">
                  Mark as Featured / Popular Template
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-md"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
