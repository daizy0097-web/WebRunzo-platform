import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Template, TemplateCategory } from '../../types';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Eye, 
  ArrowRight, 
  Layers, 
  Tag, 
  Check, 
  SlidersHorizontal,
  Star
} from 'lucide-react';

const CATEGORIES: (TemplateCategory | 'All')[] = [
  'All',
  'Business',
  'Restaurant',
  'Portfolio',
  'Gym',
  'Salon',
  'Real Estate',
  'E-commerce',
  'Personal Brand',
];

export const TemplateGallery: React.FC = () => {
  const { templates, openPreviewModal, openEnquiryModal } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'name'>('popular');

  const filteredTemplates = useMemo(() => {
    return templates
      .filter((t) => {
        const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
        const matchesSearch =
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return 0;
        }
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [templates, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="templates" className="py-20 bg-slate-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Marketplace Gallery
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore 20 Industry-Optimized Templates
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Every template is fully customizable, touch-responsive, and engineered for high conversion rates in your specific niche.
          </p>
        </div>

        {/* Controls Bar: Search, Category Filters, Sort */}
        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl mb-10 space-y-4">
          
          {/* Top Row: Search & Sort */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by template name, niche, or feature..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-950 text-white placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs p-2 rounded-xl border border-slate-800 bg-slate-950 font-semibold text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="name">Name (A-Z)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-slate-900 p-12 rounded-2xl border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">No templates found</h4>
            <p className="text-xs text-slate-400">
              No results match "{searchQuery}" in {selectedCategory}. Try adjusting your search query or reset filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-indigo-500/60 transition-all flex flex-col group"
              >
                {/* Thumbnail & Badges */}
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <button
                      onClick={() => openPreviewModal(template)}
                      className="bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg border border-slate-700 backdrop-blur transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Live Preview</span>
                    </button>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-slate-950/85 backdrop-blur border border-slate-800 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {template.category}
                    </span>
                    {template.popular && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>Popular</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1 group-hover:text-indigo-400 transition">
                      {template.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {template.description}
                    </p>

                    {/* Features list tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="bg-slate-800/80 text-slate-300 border border-slate-700/60 text-[10px] font-medium px-2 py-0.5 rounded"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openPreviewModal(template)}
                      className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 py-1.5 px-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => openEnquiryModal(template.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/30 transition cursor-pointer"
                    >
                      <span>Use This</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
