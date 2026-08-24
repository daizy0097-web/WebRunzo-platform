import React, { useState } from 'react';
import { Template, Customer } from '../../types';
import { 
  Sparkles, 
  Layers, 
  ArrowRight, 
  ExternalLink, 
  Download, 
  Mail, 
  Check, 
  Compass, 
  Camera, 
  Image as ImageIcon, 
  Award, 
  Calendar,
  Grid,
  Eye,
  FileText
} from 'lucide-react';

interface TemplateProps {
  template: Template;
  customer?: Customer | null;
  onUseTemplate?: () => void;
  onBookingSubmitted?: (msg: string) => void;
}

// ============================================================================
// 1. AURA CREATIVE SHOWCASE (tpl-port-1 / aura-creative)
// Senior UI/UX & 3D Visual Product Designer Portfolio
// ============================================================================
export const AuraCreativeDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [inquirySent, setInquirySent] = useState(false);

  const projects = [
    { id: '1', title: 'Aether Finance OS', category: 'Fintech UI/UX', metrics: '4.2M Active Users • +34% Retention', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', description: 'Redesigned core mobile banking flow with custom micro-interactions and predictive balance analytics.' },
    { id: '2', title: 'Kroma 3D Spatial Canvas', category: '3D WebGL & Interaction', metrics: 'Awwwards Site of the Day', img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80', description: 'Interactive browser-based 3D workspace for hardware engineers and industrial modelers.' },
    { id: '3', title: 'Pulse Health Biometric Watch', category: 'Design System', metrics: '120+ Components Documented', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', description: 'Comprehensive design system tokenized across iOS, Android, and wearable OLED interfaces.' },
  ];

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#0a0a0c] text-zinc-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* Minimalist Designer Nav */}
      <nav className="border-b border-zinc-900 bg-[#0a0a0c]/90 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-xs font-black text-white">
            A
          </div>
          <div>
            <div className="font-bold text-sm text-white">{bizName}</div>
            <div className="text-[10px] text-purple-400 font-mono">Staff Product Designer</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-xs text-zinc-400 font-medium">
          <a href="#work" className="hover:text-white transition">Selected Works</a>
          <a href="#skills" className="hover:text-white transition">Stack & Skills</a>
          <a href="#about" className="hover:text-white transition">About</a>
        </div>

        <a
          href="#contact"
          className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-md shadow-purple-600/30 flex items-center gap-1"
        >
          <span>Get in Touch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 sm:py-28 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Available for Q3/Q4 Advisory & Design Sprints</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
          Crafting intuitive digital interfaces & high-fidelity interactive systems.
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
          8+ years leading design systems and user experience architectures for high-growth tech unicorns and design-forward consumer applications.
        </p>

        {/* Skills Pills */}
        <div className="pt-2 flex flex-wrap gap-2">
          {['Figma Master', 'Design Systems', '3D Spline / Blender', 'React / TypeScript Prototype', 'User Research'].map((s, idx) => (
            <span key={idx} className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-md font-medium">
              {s}
            </span>
          ))}
        </div>
      </header>

      {/* Projects Grid */}
      <section id="work" className="py-12 px-6 max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-baseline border-b border-zinc-900 pb-4">
          <h2 className="text-xl font-bold text-white">Selected Case Studies</h2>
          <span className="text-xs text-zinc-500 font-mono">2023 — 2026</span>
        </div>

        <div className="space-y-8">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="group bg-zinc-900/40 border border-zinc-800/80 hover:border-purple-500/40 rounded-2xl overflow-hidden transition p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
            >
              <div className="space-y-3">
                <span className="text-xs font-mono text-purple-400 font-semibold uppercase">{proj.category}</span>
                <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition">{proj.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{proj.description}</p>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-md inline-block">
                  {proj.metrics}
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedCase(proj.title)}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Inspect Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="h-56 rounded-xl overflow-hidden border border-zinc-800">
                <img src={proj.img} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Case Study Modal Simulator */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 max-w-lg w-full p-6 rounded-2xl space-y-4 text-left">
            <h3 className="text-xl font-bold text-white">{selectedCase} — Case Study Deep Dive</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Detailed prototype walkthrough, user persona interviews, interaction flowcharts, and production token documentation are prepared for presentation.
            </p>
            <div className="bg-zinc-950 p-4 rounded-xl text-xs space-y-2 border border-zinc-800">
              <div className="text-purple-400 font-mono font-bold">Key Project Outcomes:</div>
              <div>• User task completion velocity increased by 42%</div>
              <div>• 0 regression errors across 4 design sprint iterations</div>
            </div>
            <button
              onClick={() => setSelectedCase(null)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-16 px-6 max-w-lg mx-auto text-center space-y-4 border-t border-zinc-900 mt-12">
        <h2 className="text-2xl font-bold text-white">Let’s Collaborate</h2>
        <p className="text-xs text-zinc-400">Looking for a senior product designer to elevate your web or mobile platform? Leave your email below.</p>

        {inquirySent ? (
          <div className="p-4 bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold rounded-xl">
            ✓ Message received! I will reply within 24 hours.
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setInquirySent(true); if (onBookingSubmitted) onBookingSubmitted('Design consultation requested'); }} className="space-y-3">
            <input type="email" required placeholder="your.email@company.com" className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none" />
            <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer">
              Send Collaboration Inquiry
            </button>
          </form>
        )}
      </section>

      <footer className="py-6 text-center text-xs text-zinc-600 border-t border-zinc-900">
        © {new Date().getFullYear()} {bizName}. Designed with precision in Figma & React.
      </footer>
    </div>
  );
};

// ============================================================================
// 2. MINIMALIST ARCHITECT STUDIO (tpl-port-2 / minimalist-architect)
// Monochromatic Modernist Architecture, Spatial Planning & Sustainable Design
// ============================================================================
export const MinimalistArchitectDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [selectedProject, setSelectedProject] = useState(0);
  const [consultRequested, setConsultRequested] = useState(false);

  const projects = [
    { title: 'The Monolith Pavilion', location: 'Kyoto, Japan', area: '4,200 sq. ft.', year: '2025', materials: 'Raw Cast Concrete • Blackened Cedar', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
    { title: 'Cliffside Cantilever Residence', location: 'Big Sur, California', area: '6,800 sq. ft.', year: '2024', materials: 'Weathered Steel • Triple-Glazed Glass', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
    { title: 'Nordic Forest Sanctuary', location: 'Oslo, Norway', area: '3,500 sq. ft.', year: '2025', materials: 'Cross-Laminated Timber • Basalt Stone', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80' },
  ];

  const curr = projects[selectedProject];
  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#141416] text-[#e4e4e7] font-sans tracking-wide">
      {/* Architectural Nav */}
      <nav className="border-b border-zinc-800 px-8 py-5 flex items-center justify-between sticky top-0 z-30 bg-[#141416]/95 backdrop-blur">
        <div className="font-extrabold text-sm uppercase tracking-widest text-white">
          {bizName} <span className="text-zinc-500 font-normal text-xs">/ ARCHITECTS</span>
        </div>

        <div className="hidden sm:flex items-center gap-8 text-xs uppercase tracking-widest text-zinc-400">
          <a href="#projects" className="hover:text-white transition">Selected Works</a>
          <a href="#specs" className="hover:text-white transition">Specifications</a>
          <a href="#consult" className="hover:text-white transition">Contact Studio</a>
        </div>

        <a href="#consult" className="text-xs uppercase tracking-widest font-bold text-white border-b border-white pb-0.5 hover:text-zinc-400 hover:border-zinc-400 transition">
          Inquire
        </a>
      </nav>

      {/* Hero */}
      <header className="px-8 py-20 max-w-5xl mx-auto space-y-6">
        <div className="text-xs uppercase tracking-widest text-zinc-400 font-mono">01 // Architectural Manifest</div>
        <h1 className="text-3xl sm:text-5xl font-extralight text-white leading-tight">
          Modernist Spatial Architecture & Sustainable Environmental Design.
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl font-light leading-relaxed">
          We sculpt serene residential sanctuaries and landmark cultural spaces that merge organically with the landscape.
        </p>
      </header>

      {/* Featured Project Showcase */}
      <section id="projects" className="px-8 py-8 max-w-6xl mx-auto space-y-6">
        <div className="flex gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
          {projects.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedProject(idx)}
              className={`text-xs uppercase tracking-widest px-4 py-2 transition cursor-pointer ${
                selectedProject === idx ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              0{idx + 1} — {p.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 h-[420px] rounded-xl overflow-hidden border border-zinc-800">
            <img src={curr.img} alt={curr.title} className="w-full h-full object-cover" />
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-xl space-y-4 text-xs">
            <div className="text-zinc-500 uppercase tracking-widest font-mono">Project Specifications</div>
            <h3 className="text-xl font-light text-white">{curr.title}</h3>
            
            <div className="space-y-2 border-t border-zinc-800 pt-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">Location:</span>
                <span className="text-zinc-200">{curr.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Interior Floor Area:</span>
                <span className="text-zinc-200">{curr.area}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Completion:</span>
                <span className="text-zinc-200">{curr.year}</span>
              </div>
              <div className="pt-2">
                <div className="text-zinc-500 mb-1">Key Materials:</div>
                <div className="text-zinc-200">{curr.materials}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Section */}
      <section id="consult" className="py-16 px-8 max-w-xl mx-auto text-center space-y-4 border-t border-zinc-800 mt-12">
        <div className="text-xs uppercase tracking-widest text-zinc-500">Studio Engagement</div>
        <h2 className="text-2xl font-light text-white">Commission a Spatial Project</h2>
        <p className="text-xs text-zinc-400 font-light">We accept 4 to 6 private residential commissions annually to ensure undivided partner attention.</p>

        {consultRequested ? (
          <div className="p-4 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-mono">
            ✓ Inquiry dispatched to Principal Architect.
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setConsultRequested(true); if (onBookingSubmitted) onBookingSubmitted('Architectural commission inquired'); }} className="space-y-3 pt-2">
            <input type="text" required placeholder="Client Name / Organization" className="w-full text-xs p-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-500" />
            <input type="email" required placeholder="Contact Email" className="w-full text-xs p-3 bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-500" />
            <button type="submit" className="w-full py-3 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition cursor-pointer">
              Submit Spatial Brief
            </button>
          </form>
        )}
      </section>

      <footer className="py-6 text-center text-xs text-zinc-600 border-t border-zinc-900 font-mono">
        © {new Date().getFullYear()} {bizName}. Tokyo • Zurich • New York.
      </footer>
    </div>
  );
};

// ============================================================================
// 3. LENS & LIGHT PHOTOGRAPHY (tpl-port-3 / lens-light)
// Editorial Fashion, Destination Weddings & Commercial Visual Storytelling
// ============================================================================
export const LensAndLightDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [photoCat, setPhotoCat] = useState<'editorial' | 'weddings' | 'commercial'>('editorial');
  const [bookingSent, setBookingSent] = useState(false);

  const galleries = {
    editorial: [
      { title: 'Vogue Scandinavia Autumn Haute', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80', loc: 'Copenhagen' },
      { title: 'Monochrome Silhouettes Collection', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', loc: 'Paris' },
    ],
    weddings: [
      { title: 'Lake Como Villa Balbiano Ceremony', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', loc: 'Italy' },
      { title: 'Santorini Sunset Aegean Vows', img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80', loc: 'Greece' },
    ],
    commercial: [
      { title: 'Nomad Luxury Luggage Campaign', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80', loc: 'Reykjavik' },
      { title: 'Aura Electric Watch Editorial', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', loc: 'Tokyo' },
    ],
  };

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#080b10] text-slate-100 font-sans">
      {/* Nav */}
      <nav className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-[#080b10]/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-sky-400" />
          <span className="font-extrabold tracking-widest text-sm text-white uppercase">{bizName}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <a href="#gallery" className="hover:text-sky-400 transition hidden sm:inline">Portfolio</a>
          <a href="#packages" className="hover:text-sky-400 transition hidden sm:inline">Packages</a>
          <a href="#book" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg transition">
            Book Shoot
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 py-16 sm:py-24 text-center max-w-4xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest text-sky-400 font-bold">Editorial & Destination Cinematography</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Capturing Raw Emotion & Timeless Light.
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Natural light, cinematic depth, and unscripted human intimacy for high-fashion houses and unforgettable destination celebrations.
        </p>
      </header>

      {/* Gallery Tabs */}
      <section id="gallery" className="px-6 py-8 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-center gap-2">
          {(['editorial', 'weddings', 'commercial'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setPhotoCat(cat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                photoCat === cat ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {galleries[photoCat].map((item, idx) => (
            <div key={idx} className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
              <div className="h-72 overflow-hidden">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 flex justify-between items-center text-xs">
                <span className="font-bold text-white">{item.title}</span>
                <span className="text-sky-400 font-mono">{item.loc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Form */}
      <section id="book" className="py-16 px-6 max-w-md mx-auto text-center space-y-4 border-t border-slate-800">
        <h2 className="text-xl font-bold text-white">Check Shoot Availability</h2>
        <p className="text-xs text-slate-400">Dates for 2026 destination weddings and fashion campaigns are filling quickly.</p>

        {bookingSent ? (
          <div className="p-4 bg-sky-950/60 border border-sky-500/40 text-sky-300 text-xs font-bold rounded-xl">
            ✓ Inquiry dispatched! We will send our complete media kit.
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setBookingSent(true); if (onBookingSubmitted) onBookingSubmitted('Photoshoot booking requested'); }} className="space-y-3">
            <input type="text" required placeholder="Your Name" className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
            <input type="email" required placeholder="Your Email" className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
            <input type="text" placeholder="Shoot Type & Target Dates" className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
            <button type="submit" className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer">
              Request Shoot Availability
            </button>
          </form>
        )}
      </section>

      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        © {new Date().getFullYear()} {bizName}. Worldwide bookings available.
      </footer>
    </div>
  );
};
