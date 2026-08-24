import React, { useState } from 'react';
import { Template, Customer } from '../../types';
import { 
  Sparkles, 
  BookOpen, 
  Podcast, 
  Video, 
  Mail, 
  Check, 
  ArrowRight, 
  Award, 
  TrendingUp, 
  Users,
  Play,
  Heart,
  Download
} from 'lucide-react';

interface TemplateProps {
  template: Template;
  customer?: Customer | null;
  onUseTemplate?: () => void;
  onBookingSubmitted?: (msg: string) => void;
}

// ============================================================================
// 1. THE THOUGHT LEADER (tpl-pb-1 / thought-leader)
// Keynote Speaker, NYT Bestselling Author & Executive Leadership Strategist
// ============================================================================
export const TheThoughtLeaderDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [subEmail, setSubEmail] = useState('');
  const [subbed, setSubbed] = useState(false);
  const [speakingRequested, setSpeakingRequested] = useState(false);

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#0a0c10] text-slate-100 font-sans selection:bg-amber-600 selection:text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 bg-[#0a0c10]/95 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
        <div>
          <span className="font-serif text-lg font-bold text-white tracking-wide">{bizName}</span>
          <div className="text-[10px] text-amber-400 font-mono">Keynote Speaker & Bestselling Author</div>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-xs text-slate-300 font-medium">
          <a href="#books" className="hover:text-amber-400 transition">Books</a>
          <a href="#keynotes" className="hover:text-amber-400 transition">Keynotes</a>
          <a href="#newsletter" className="hover:text-amber-400 transition">Essays</a>
        </div>

        <a href="#speaking" className="bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs px-4 py-2 rounded-xl transition shadow">
          Book Keynote
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
          <Award className="w-3.5 h-3.5" />
          <span>New York Times #1 Bestselling Author & Global Keynote Speaker</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          Redefining Exponential Leadership, AI Governance & High-Stakes Strategy.
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Advisor to Fortune 50 CEOs and heads of state. Keynoting global forums on building antifragile organizations in volatile technological climates.
        </p>

        <div className="pt-2 flex justify-center gap-4">
          <a href="#speaking" className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg">
            Request Speaking Availability
          </a>
          <a href="#newsletter" className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold px-6 py-3 rounded-xl hover:bg-slate-800 transition">
            Join 120k+ Weekly Readers
          </a>
        </div>
      </header>

      {/* Books Showcase */}
      <section id="books" className="py-12 px-6 max-w-4xl mx-auto space-y-6">
        <h2 className="font-serif text-2xl text-white text-center">Bestselling Publications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#121620] border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">The Antifragile Executive (2025)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Over 500,000 copies sold worldwide. Translated into 24 languages.</p>
          </div>

          <div className="bg-[#121620] border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">Compound Clarity: Decision Making</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Named Financial Times Best Business Book of the Year.</p>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section id="newsletter" className="py-16 px-6 max-w-md mx-auto text-center space-y-4 border-t border-slate-800">
        <h2 className="font-serif text-2xl text-white">Sunday Strategic Dispatch</h2>
        <p className="text-xs text-slate-400">Join 120,000+ senior leaders who receive our Sunday deep dive on technology and human strategy.</p>

        {subbed ? (
          <div className="p-4 bg-amber-950/60 border border-amber-500 text-amber-300 text-xs font-bold rounded-xl">
            ✓ Welcome aboard! Your first edition is en route.
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubbed(true); if (onBookingSubmitted) onBookingSubmitted(`Subscribed ${subEmail} to Sunday Dispatch`); }} className="space-y-3">
            <input
              type="email"
              required
              value={subEmail}
              onChange={(e) => setSubEmail(e.target.value)}
              placeholder="Enter your executive email"
              className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition cursor-pointer">
              Subscribe to Sunday Dispatch
            </button>
          </form>
        )}
      </section>

      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        © {new Date().getFullYear()} {bizName}. Represented by Global Speaker Bureau.
      </footer>
    </div>
  );
};

// ============================================================================
// 2. VITALITY COACH (tpl-pb-2 / vitality-coach)
// Longevity, Biohacking, Executive Metabolic Optimization & Sleep
// ============================================================================
export const VitalityCoachDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [assessmentDone, setAssessmentDone] = useState(false);

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#08120d] text-emerald-100 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Nav */}
      <nav className="border-b border-emerald-950 bg-[#08120d]/95 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧬</span>
          <span className="font-bold text-white text-sm uppercase tracking-wider">{bizName}</span>
        </div>

        <a href="#audit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
          Free Bio-Audit
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-3xl mx-auto space-y-5">
        <span className="text-xs uppercase font-mono text-emerald-400 font-bold">Biomarker Optimization • Sleep Architecture</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Extend Your Healthspan. Maximize Daily Cognitive Peak.
        </h1>
        <p className="text-sm text-emerald-300/80 max-w-xl mx-auto leading-relaxed">
          Customized bio-individual protocols integrating deep REM sleep optimization, bloodwork analysis, and zone-2 cardio longevity conditioning.
        </p>
      </header>

      {/* Longevity Audit Tool */}
      <section id="audit" className="py-12 px-6 max-w-md mx-auto text-center space-y-4">
        <div className="bg-[#0f241a] border border-emerald-700/50 p-6 rounded-3xl space-y-3">
          <h3 className="text-lg font-bold text-white">Free Metabolic & Sleep Scorecard</h3>
          <p className="text-xs text-emerald-300/70">Answer 3 questions to receive a personalized biomarker recommendations sheet.</p>

          {assessmentDone ? (
            <div className="p-4 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold rounded-xl">
              ✓ Bio-Score: 84/100 (High Potential). Custom protocol sent!
            </div>
          ) : (
            <button
              onClick={() => { setAssessmentDone(true); if (onBookingSubmitted) onBookingSubmitted('Bio-audit assessment initiated'); }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-950"
            >
              Take 2-Minute Bio-Audit
            </button>
          )}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-emerald-700 border-t border-emerald-950 mt-12">
        © {new Date().getFullYear()} {bizName}. Science-backed longevity.
      </footer>
    </div>
  );
};

// ============================================================================
// 3. THE CREATOR HUB (tpl-pb-3 / creator-hub)
// Multi-Platform Content Creator, Course Academy & Community
// ============================================================================
export const TheCreatorHubDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [courseJoined, setCourseJoined] = useState(false);

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#0d0d12] text-violet-100 font-sans selection:bg-violet-600 selection:text-white">
      {/* Nav */}
      <nav className="border-b border-violet-950 bg-[#0d0d12]/95 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xs">
            ▶
          </div>
          <span className="font-bold text-white text-base">{bizName}</span>
        </div>

        <a href="#masterclass" className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
          Join Masterclass
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-4xl mx-auto space-y-5">
        <span className="text-xs uppercase font-mono text-violet-400 font-bold">2.4M Subscribers across YouTube & Spotify</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Learn the Systems Behind 8-Figure Digital Media Brands.
        </h1>
        <p className="text-sm text-violet-300/80 max-w-xl mx-auto leading-relaxed">
          From solo creator to full-scale content studio. Discover our production workflows, distribution flywheels, and monetization stacks.
        </p>
      </header>

      {/* Masterclass Card */}
      <section id="masterclass" className="py-10 px-6 max-w-md mx-auto">
        <div className="bg-[#171724] border border-violet-700/50 p-6 rounded-3xl text-center space-y-4 shadow-xl">
          <div className="text-xs uppercase font-bold text-violet-400">Cohort 07 Enrollment Open</div>
          <h3 className="text-xl font-bold text-white">Creator Studio Engine ($497)</h3>
          <p className="text-xs text-violet-300/70">6-week intensive cohort with weekly live teardowns and private Notion operating system templates.</p>

          {courseJoined ? (
            <div className="p-4 bg-violet-950 border border-violet-500 text-violet-300 text-xs font-bold rounded-xl">
              ✓ Seat Reserved in Cohort 07! Check your email for Discord access.
            </div>
          ) : (
            <button
              onClick={() => { setCourseJoined(true); if (onBookingSubmitted) onBookingSubmitted('Creator Hub Masterclass seat reserved'); }}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-2xl transition cursor-pointer shadow-lg"
            >
              Enroll in Cohort 07 ($497)
            </button>
          )}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-violet-800 border-t border-violet-950 mt-12">
        © {new Date().getFullYear()} {bizName}. Empowering independent storytellers.
      </footer>
    </div>
  );
};
