import React, { useState } from 'react';
import { Template, Customer } from '../../types';
import { 
  Building, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Calculator, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  Download, 
  Phone, 
  Mail, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface TemplateProps {
  template: Template;
  customer?: Customer | null;
  onUseTemplate?: () => void;
  onBookingSubmitted?: (msg: string) => void;
}

// ============================================================================
// 1. PRIME REALTY GROUP (tpl-re-1 / prime-realty)
// High-Converting Residential Brokerage, Property Search & Home Valuation
// ============================================================================
export const PrimeRealtyDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [propertyFilter, setPropertyFilter] = useState<'all' | 'single' | 'condo' | 'luxury'>('all');
  const [valuationAddress, setValuationAddress] = useState('');
  const [valuationSent, setValuationSent] = useState(false);

  const listings = [
    { id: '1', title: 'The Grandview Modern Villa', price: '$2,850,000', beds: 5, baths: 5.5, sqft: '5,400 sq.ft.', type: 'luxury', loc: 'Bel Air, CA', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80' },
    { id: '2', title: 'Skyline Terrace Penthouse', price: '$1,650,000', beds: 3, baths: 3, sqft: '2,900 sq.ft.', type: 'condo', loc: 'Downtown Marina, SF', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80' },
    { id: '3', title: 'Whispering Pines Craftsman', price: '$985,000', beds: 4, baths: 3, sqft: '3,200 sq.ft.', type: 'single', loc: 'Oakridge Hills, WA', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
  ];

  const filtered = propertyFilter === 'all' ? listings : listings.filter(l => l.type === propertyFilter);
  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-slate-950 text-slate-100 font-sans selection:bg-sky-600 selection:text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 bg-slate-950/95 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white text-base">
            P
          </div>
          <div>
            <div className="font-extrabold text-base text-white">{bizName}</div>
            <div className="text-[10px] text-sky-400 font-mono">Premier Residential Brokerage</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#listings" className="hover:text-sky-400 transition">Featured Listings</a>
          <a href="#valuation" className="hover:text-sky-400 transition">Instant Home Value</a>
          <a href="#calculator" className="hover:text-sky-400 transition">Mortgage Estimator</a>
        </div>

        <a href="#valuation" className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-sky-600/30">
          Free Home Valuation
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 sm:py-24 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold">
          <Building className="w-3.5 h-3.5" />
          <span>Over $480M in Luxury Residential Sales Closed</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Discover Premier Residential Estates & Exclusive Off-Market Properties.
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Guiding discerning buyers and sellers with localized transaction analytics, neighborhood intelligence, and bespoke representation.
        </p>
      </header>

      {/* Property Listings */}
      <section id="listings" className="py-12 px-6 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase font-bold text-sky-400">Exclusive Portfolio</span>
            <h2 className="text-2xl font-bold text-white">Featured Properties For Sale</h2>
          </div>
          <div className="flex gap-2">
            {(['all', 'luxury', 'single', 'condo'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPropertyFilter(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                  propertyFilter === t ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-sky-500/50 transition flex flex-col">
              <div className="h-56 relative overflow-hidden">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-sky-400">
                  {item.price}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-white text-base">{item.title}</h3>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{item.loc}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-sky-400" /> {item.beds} Beds</span>
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-sky-400" /> {item.baths} Baths</span>
                  <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-sky-400" /> {item.sqft}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instant Home Valuation Form */}
      <section id="valuation" className="py-16 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase font-bold text-sky-400">Seller Tool</span>
          <h2 className="text-2xl font-bold text-white">What is Your Home Worth in Today's Market?</h2>
          <p className="text-xs text-slate-400">Get an instant, data-backed comparative market analysis prepared by our senior real estate economists.</p>

          {valuationSent ? (
            <div className="p-6 bg-sky-950/80 border border-sky-500/40 text-sky-300 text-xs font-bold rounded-2xl">
              ✓ Valuation report initiated for {valuationAddress}! Check your inbox in 10 minutes.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setValuationSent(true); if (onBookingSubmitted) onBookingSubmitted(`Home valuation requested for ${valuationAddress}`); }} className="space-y-3 pt-2">
              <input
                type="text"
                required
                value={valuationAddress}
                onChange={(e) => setValuationAddress(e.target.value)}
                placeholder="Enter Property Street Address & Zip Code"
                className="w-full text-xs p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button type="submit" className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer">
                Get Instant Property Valuation Report
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        © {new Date().getFullYear()} {bizName}. Equal Housing Opportunity.
      </footer>
    </div>
  );
};

// ============================================================================
// 2. SKYLINE LUXURY ESTATES (tpl-re-2 / skyline-estates)
// Multimillion-Dollar Ultra-Luxury Waterfront Penthouses & Villas
// ============================================================================
export const SkylineLuxuryEstatesDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [tourOpened, setTourOpened] = useState(false);
  const [vipRequested, setVipRequested] = useState(false);

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-amber-600 selection:text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800 bg-[#09090b]/95 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-amber-500 text-black font-black flex items-center justify-center text-xs">
            S
          </div>
          <span className="font-extrabold uppercase tracking-widest text-sm text-white">{bizName}</span>
        </div>

        <a href="#vip" className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase px-4 py-2 rounded transition">
          Private VIP Access
        </a>
      </nav>

      {/* Hero */}
      <header className="px-8 py-24 text-center max-w-4xl mx-auto space-y-6">
        <div className="text-xs uppercase tracking-widest text-amber-400 font-mono">Bespoke Architectural Masterpieces</div>
        <h1 className="text-3xl sm:text-6xl font-light text-white leading-tight">
          Waterfront Penthouses & Rare Architectural Marvels.
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
          Curated private portfolio of eight-figure estates across Monaco, Miami, Aspen, and Dubai for ultra-high-net-worth investors.
        </p>

        <div className="pt-2 flex justify-center gap-4">
          <button
            onClick={() => setTourOpened(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider px-6 py-3 rounded transition cursor-pointer flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Launch 3D Virtual Tour</span>
          </button>
        </div>
      </header>

      {/* 3D Tour Modal Simulator */}
      {tourOpened && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/40 max-w-2xl w-full p-8 rounded-3xl space-y-4 text-center">
            <h3 className="text-2xl font-light text-white">Skyline Penthouse 48 — 3D Spatial Walkthrough</h3>
            <div className="h-64 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 text-xs">
              [ Interactive 360° Photogrammetric Walkthrough Active ]
            </div>
            <button
              onClick={() => setTourOpened(false)}
              className="px-6 py-2 bg-amber-500 text-black font-bold text-xs uppercase rounded transition cursor-pointer"
            >
              Exit Virtual Tour
            </button>
          </div>
        </div>
      )}

      {/* VIP Inquiry */}
      <section id="vip" className="py-16 px-8 max-w-md mx-auto text-center space-y-4 border-t border-zinc-800">
        <h2 className="text-2xl font-light text-white">Private Confidential Showing</h2>
        <p className="text-xs text-zinc-400 font-light">Proof of funds and bilateral NDA required for off-market access.</p>

        {vipRequested ? (
          <div className="p-4 bg-amber-950/60 border border-amber-500 text-amber-300 text-xs font-mono">
            ✓ Private advisor concierge notified.
          </div>
        ) : (
          <button
            onClick={() => { setVipRequested(true); if (onBookingSubmitted) onBookingSubmitted('Skyline VIP showing requested'); }}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded transition cursor-pointer"
          >
            Request Private Showing Concierge
          </button>
        )}
      </section>

      <footer className="py-6 text-center text-xs text-zinc-600 border-t border-zinc-900 font-mono">
        © {new Date().getFullYear()} {bizName}. Confidentiality Guaranteed.
      </footer>
    </div>
  );
};
