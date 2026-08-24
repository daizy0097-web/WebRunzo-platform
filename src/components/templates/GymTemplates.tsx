import React, { useState } from 'react';
import { Template, Customer } from '../../types';
import { 
  Dumbbell, 
  Flame, 
  Trophy, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Heart, 
  Zap, 
  ArrowRight,
  ShieldAlert,
  Star
} from 'lucide-react';

interface TemplateProps {
  template: Template;
  customer?: Customer | null;
  onUseTemplate?: () => void;
  onBookingSubmitted?: (msg: string) => void;
}

// ============================================================================
// 1. APEX FITNESS & PERFORMANCE (tpl-gym-1 / apex-fitness)
// High-Octane Athletic Conditioning, Functional HIIT & Coaching
// ============================================================================
export const ApexFitnessDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>('Mon');
  const [passClaimed, setPassClaimed] = useState(false);
  const [passEmail, setPassEmail] = useState('');

  const timetable = {
    Mon: [
      { time: '06:00 AM', name: 'Metabolic Conditioning (MetCon)', coach: 'Coach Marcus', intensity: 'High' },
      { time: '09:00 AM', name: 'Olympic Weightlifting Fundamentals', coach: 'Coach Elena', intensity: 'Med' },
      { time: '17:30 PM', name: 'Apex Functional Strength & Hypertrophy', coach: 'Coach Dave', intensity: 'High' },
      { time: '18:45 PM', name: 'Core & Kinetic Mobility Lab', coach: 'Coach Sarah', intensity: 'Low' },
    ],
    Tue: [
      { time: '06:30 AM', name: 'HIIT Speed & Plyometrics', coach: 'Coach Marcus', intensity: 'Max' },
      { time: '12:00 PM', name: 'Power Hour Express Lunch Burn', coach: 'Coach Dave', intensity: 'High' },
      { time: '18:00 PM', name: 'Barbell Club Deadlift Special', coach: 'Coach Elena', intensity: 'High' },
    ],
    Wed: [
      { time: '06:00 AM', name: 'Metabolic Conditioning (MetCon)', coach: 'Coach Marcus', intensity: 'High' },
      { time: '17:30 PM', name: 'Athletic Conditioning & Agility', coach: 'Coach Sarah', intensity: 'High' },
    ],
    Thu: [
      { time: '07:00 AM', name: 'Functional Kettlebell Flow', coach: 'Coach Elena', intensity: 'Med' },
      { time: '18:00 PM', name: 'Upper Body Armor & Core', coach: 'Coach Dave', intensity: 'High' },
    ],
    Fri: [
      { time: '06:00 AM', name: 'Friday Night Lights Team Throwdown', coach: 'All Coaches', intensity: 'Max' },
      { time: '17:30 PM', name: 'Strength & Conditioning Open Gym', coach: 'Supervised', intensity: 'Med' },
    ],
    Sat: [
      { time: '08:30 AM', name: 'Community Hero Workout & Coffee', coach: 'Coach Marcus', intensity: 'Max' },
      { time: '10:30 AM', name: 'Mobility & Recovery Workshop', coach: 'Coach Sarah', intensity: 'Low' },
    ],
  };

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#0a0d14] text-slate-100 font-sans selection:bg-red-600 selection:text-white">
      {/* Top Banner */}
      <div className="bg-red-600 px-4 py-2 text-center text-xs font-black uppercase tracking-wider text-white">
        ⚡ Limited New Year Intake: First 30 Members Receive a Free 1-on-1 Performance Audit!
      </div>

      {/* Nav */}
      <nav className="bg-[#0f1422] border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-base">
            A
          </div>
          <span className="font-black text-lg tracking-tight uppercase text-white">{bizName}</span>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-300">
          <a href="#schedule" className="hover:text-red-500 transition">Timetable</a>
          <a href="#coaches" className="hover:text-red-500 transition">Coaches</a>
          <a href="#membership" className="hover:text-red-500 transition">Pricing</a>
        </div>

        <a
          href="#claim-pass"
          className="bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase px-4 py-2 rounded-xl transition shadow-lg shadow-red-600/30"
        >
          Free Day Pass
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5" />
          <span>Elite Athletic Conditioning & Strength Facility</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-none">
          Defy Your Genetic Limits. Rebuild Pure Athletic Power.
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          State-of-the-art turf, competition barbells, and science-backed conditioning protocols designed to forge resilient, high-output athletes.
        </p>

        <div className="pt-2 flex justify-center gap-4">
          <a href="#claim-pass" className="bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase px-6 py-3 rounded-xl transition shadow-xl shadow-red-600/40">
            Claim Free 1-Day Pass
          </a>
          <a href="#schedule" className="bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs uppercase px-6 py-3 rounded-xl hover:bg-slate-800 transition">
            View Live Schedule
          </a>
        </div>
      </header>

      {/* Timetable Section */}
      <section id="schedule" className="py-12 px-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs uppercase font-bold text-red-500">Weekly Schedule</span>
            <h2 className="text-2xl font-black text-white uppercase">Class Timetable</h2>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                  selectedDay === d ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {timetable[selectedDay].map((c, idx) => (
            <div key={idx} className="bg-[#111624] border border-slate-800 p-5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-red-400 font-bold">{c.time}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  c.intensity === 'Max' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  Intensity: {c.intensity}
                </span>
              </div>
              <h3 className="font-bold text-white text-base">{c.name}</h3>
              <p className="text-xs text-slate-400">Led by {c.coach}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free Day Pass Form */}
      <section id="claim-pass" className="py-16 px-6 max-w-md mx-auto text-center space-y-4">
        <div className="bg-[#141a2c] border border-red-500/40 p-6 rounded-2xl space-y-4">
          <h2 className="text-2xl font-black text-white uppercase">Claim Your Free VIP Pass</h2>
          <p className="text-xs text-slate-300">Experience our facility, attend any class, and get full locker & sauna access for 24 hours.</p>

          {passClaimed ? (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold rounded-xl">
              ✓ VIP Pass Code #APEX-PASS-88 emailed to {passEmail}! Show at front desk.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setPassClaimed(true); if (onBookingSubmitted) onBookingSubmitted(`VIP Day Pass claimed for ${passEmail}`); }} className="space-y-3">
              <input
                type="email"
                required
                value={passEmail}
                onChange={(e) => setPassEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase rounded-xl transition cursor-pointer shadow-lg shadow-red-600/30">
                Get Instant Free Pass
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900">
        © {new Date().getFullYear()} {bizName}. 24/7 Keycard Entry for Active Members.
      </footer>
    </div>
  );
};

// ============================================================================
// 2. IRONFORGE ATHLETICS CLUB (tpl-gym-2 / ironforge-athletics)
// Hardcore 24/7 Powerlifting, Heavy Barbells & Bodybuilding Sanctuary
// ============================================================================
export const IronForgeAthleticsDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [signupSent, setSignupSent] = useState(false);

  const leaderboard = [
    { rank: 1, name: 'Viktor R.', deadlift: '745 lbs', squat: '620 lbs', bench: '455 lbs' },
    { rank: 2, name: 'Marcus K.', deadlift: '715 lbs', squat: '585 lbs', bench: '430 lbs' },
    { rank: 3, name: 'Elena V.', deadlift: '510 lbs', squat: '425 lbs', bench: '295 lbs' },
  ];

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#0c0a09] text-stone-200 font-sans">
      {/* Nav */}
      <nav className="border-b border-stone-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-[#0c0a09]/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-amber-500 text-black font-black flex items-center justify-center text-sm">
            IF
          </div>
          <span className="font-black text-base uppercase text-white tracking-wider">{bizName}</span>
        </div>

        <a href="#join" className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-2 rounded uppercase tracking-wider">
          Join 24/7 Club
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-4xl mx-auto space-y-6">
        <div className="text-xs uppercase font-mono text-amber-400 font-bold">24/7 Heavy Metal • Calibrated Steel</div>
        <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
          Forged in Iron. Built for Absolute Strength.
        </h1>
        <p className="text-sm text-stone-400 max-w-xl mx-auto">
          No crowds. No unnecessary gimmicks. Just calibrated Eleiko plates, monolifts, chalk buckets, and dedicated strength athletes.
        </p>
      </header>

      {/* Equipment Specs */}
      <section className="py-10 px-6 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="bg-[#171412] p-4 rounded-xl border border-stone-800">
          <div className="text-2xl font-black text-amber-400">12</div>
          <div className="text-xs text-stone-400 mt-1">Deadlift Platforms</div>
        </div>
        <div className="bg-[#171412] p-4 rounded-xl border border-stone-800">
          <div className="text-2xl font-black text-amber-400">150 lbs</div>
          <div className="text-xs text-stone-400 mt-1">Max Dumbbells</div>
        </div>
        <div className="bg-[#171412] p-4 rounded-xl border border-stone-800">
          <div className="text-2xl font-black text-amber-400">6</div>
          <div className="text-xs text-stone-400 mt-1">Competition Benches</div>
        </div>
        <div className="bg-[#171412] p-4 rounded-xl border border-stone-800">
          <div className="text-2xl font-black text-amber-400">24/7</div>
          <div className="text-xs text-stone-400 mt-1">RFID Keycard Access</div>
        </div>
      </section>

      {/* Club Leaderboard */}
      <section className="py-12 px-6 max-w-4xl mx-auto space-y-4">
        <h2 className="text-lg font-black text-white uppercase border-b border-stone-800 pb-2">Member Strength Leaderboard</h2>
        <div className="space-y-2">
          {leaderboard.map((m) => (
            <div key={m.rank} className="bg-[#14110f] border border-stone-800 p-4 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">#{m.rank}</span>
                <span className="font-bold text-white text-sm">{m.name}</span>
              </div>
              <div className="flex gap-4 font-mono text-stone-300 text-[11px]">
                <span>DL: <strong className="text-amber-400">{m.deadlift}</strong></span>
                <span>SQ: <strong className="text-amber-400">{m.squat}</strong></span>
                <span>BP: <strong className="text-amber-400">{m.bench}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join Form */}
      <section id="join" className="py-16 px-6 max-w-md mx-auto text-center space-y-4">
        <div className="bg-[#171412] border border-amber-500/40 p-6 rounded-2xl space-y-3">
          <h3 className="font-black text-lg text-white uppercase">24/7 Keycard Membership ($79/mo)</h3>
          {signupSent ? (
            <div className="p-4 bg-amber-950/60 border border-amber-500 text-amber-300 text-xs font-bold rounded">
              ✓ Membership registered! Pick up your RFID keycard at the front desk.
            </div>
          ) : (
            <button
              onClick={() => { setSignupSent(true); if (onBookingSubmitted) onBookingSubmitted('24/7 IronForge membership initiated'); }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase rounded transition cursor-pointer"
            >
              Sign Up for 24/7 Keycard
            </button>
          )}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-stone-600 border-t border-stone-900">
        © {new Date().getFullYear()} {bizName}. Calibrated steel and iron only.
      </footer>
    </div>
  );
};

// ============================================================================
// 3. ZENITH YOGA & MINDFULNESS (tpl-gym-3 / zenith-yoga)
// Tranquil Studio, Heated Vinyasa Flow, Sound Baths & Retreats
// ============================================================================
export const ZenithYogaDemo: React.FC<TemplateProps> = ({ template, customer, onBookingSubmitted }) => {
  const [passBooked, setPassBooked] = useState(false);

  const classes = [
    { title: 'Morning Botanical Vinyasa', time: '07:30 AM', duration: '60 Min', style: 'Gentle Flow', guide: 'Aria Maya' },
    { title: 'Heated Candlelight Yin & Sound Bath', time: '18:30 PM', duration: '75 Min', style: 'Restorative', guide: 'Master Kaelen' },
    { title: 'Core Power & Kinetic Alignment', time: '12:00 PM', duration: '50 Min', style: 'Dynamic', guide: 'Sora Lin' },
  ];

  const bizName = customer?.customContent?.businessName || customer?.businessName || template.name;

  return (
    <div className="w-full bg-[#0d1408] text-[#d6e2cf] font-sans">
      {/* Nav */}
      <nav className="border-b border-[#1b2b11] px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-[#0d1408]/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-light tracking-widest text-base text-white">{bizName}</span>
        </div>

        <a href="#book" className="bg-[#4d7c0f] hover:bg-[#3f6212] text-white text-xs font-semibold px-4 py-2 rounded-full transition shadow">
          Book Studio Mat
        </a>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 text-center max-w-3xl mx-auto space-y-5">
        <span className="text-xs uppercase tracking-widest text-[#a3e635] font-semibold">Tranquil Sanctuary & Sound Sanctuary</span>
        <h1 className="text-3xl sm:text-5xl font-light text-white leading-tight">
          Restore Harmony, Flexibility & Mental Peace.
        </h1>
        <p className="text-sm text-[#a3b899] max-w-xl mx-auto leading-relaxed">
          Gentle vinyasa flow, heated cedarwood studios, and soothing Tibetan singing bowls led by master teachers.
        </p>
      </header>

      {/* Daily Class List */}
      <section className="py-8 px-6 max-w-4xl mx-auto space-y-4">
        <h2 className="text-lg font-light text-white border-b border-[#1b2b11] pb-2">Today’s Sanctuary Sessions</h2>
        <div className="space-y-3">
          {classes.map((c, idx) => (
            <div key={idx} className="bg-[#131e0b] border border-[#213515] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#a3e635]">
                  <span>{c.time}</span> • <span>{c.duration}</span> • <span>{c.style}</span>
                </div>
                <h3 className="font-normal text-white text-base mt-0.5">{c.title}</h3>
                <p className="text-xs text-[#8a9f80]">Guided by {c.guide}</p>
              </div>
              <button
                onClick={() => { setPassBooked(true); if (onBookingSubmitted) onBookingSubmitted(`Mat reserved for ${c.title}`); }}
                className="bg-[#2a4515] hover:bg-[#36581c] text-[#d9f99d] text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Reserve Mat
              </button>
            </div>
          ))}
        </div>
      </section>

      {passBooked && (
        <div className="fixed bottom-6 right-6 bg-[#1b2b11] border border-[#a3e635]/40 p-4 rounded-2xl shadow-2xl text-xs text-[#ecfccb] z-50">
          ✨ Your mat is reserved! A reminder has been set.
        </div>
      )}

      <footer className="py-6 text-center text-xs text-[#5e7454] border-t border-[#1b2b11] mt-12">
        © {new Date().getFullYear()} {bizName}. Breathe in stillness, exhale tension.
      </footer>
    </div>
  );
};
